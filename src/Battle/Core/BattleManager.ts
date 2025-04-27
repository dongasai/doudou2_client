/**
 * 战斗管理器
 * 负责整体战斗流程控制，协调各个子系统
 */

import { logger } from './Logger';
import { FrameManager, FrameType } from './FrameManager';
import { EntityManager } from './EntityManager';
import { EventManager } from './EventManager';
import { DamageManager } from './DamageManager';
import { SkillManager } from './SkillManager';
import { WaveManager } from './WaveManager';
import { RandomManager } from './RandomManager';
import { BattleCommand, CastSkillCommand, ChangePositionCommand, LearnSkillCommand, UseItemCommand } from '../../DesignConfig/types/BattleCommand';
import { BattleInitParams } from '../../DesignConfig/types/BattleInitParams';
import { BattleReplayData } from '../../DesignConfig/types/BattleReplay';
import { Entity, EntityType } from '../Entities/Entity';
import { Vector2D } from '../Types/Vector2D';
import { Hero } from '../Entities/Hero';
import { Bean } from '../Entities/Bean';
import { Crystal } from '../Entities/Crystal';

// 战斗状态枚举
export enum BattleState {
  IDLE = 'idle',           // 空闲状态
  INITIALIZING = 'initializing', // 初始化中
  RUNNING = 'running',     // 运行中
  PAUSED = 'paused',       // 暂停
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed'        // 失败
}

// 战斗结果枚举
export enum BattleResult {
  NONE = 'none',           // 无结果
  VICTORY = 'victory',     // 胜利
  DEFEAT = 'defeat'        // 失败
}

export class BattleManager {
  // 子系统
  private frameManager: FrameManager;
  private entityManager: EntityManager;
  private eventManager: EventManager;
  private damageManager: DamageManager;
  private skillManager: SkillManager;
  private waveManager: WaveManager;
  private randomManager: RandomManager;

  // 战斗状态
  private state: BattleState = BattleState.IDLE;
  private result: BattleResult = BattleResult.NONE;

  // 战斗配置
  private battleParams: BattleInitParams | null = null;
  private randomSeed: number = 0;

  // 战斗数据
  private heroes: Map<string, Hero> = new Map();
  private crystal: Crystal | null = null;
  private beans: Map<string, Bean> = new Map();

  // 回放数据
  private replayData: BattleReplayData | null = null;
  private isReplayMode: boolean = false;

  // 战斗统计
  private battleStartTime: number = 0;
  private battleEndTime: number = 0;
  private totalDamageDealt: number = 0;
  private totalDamageTaken: number = 0;
  private totalEnemiesDefeated: number = 0;

  /**
   * 构造函数
   */
  constructor() {
    // 创建事件管理器（需要先创建，因为其他管理器依赖它）
    this.eventManager = new EventManager(true);

    // 创建随机数管理器
    this.randomSeed = Date.now();
    this.randomManager = new RandomManager(this.randomSeed);

    // 创建帧管理器
    this.frameManager = new FrameManager();
    this.frameManager.setUpdateCallback(this.onFrameUpdate.bind(this));
    this.frameManager.setCommandProcessCallback(this.processCommands.bind(this));

    // 创建实体管理器
    this.entityManager = new EntityManager();

    // 创建伤害管理器
    this.damageManager = new DamageManager(this.randomManager, this.eventManager);

    // 创建技能管理器
    this.skillManager = new SkillManager(
      this.entityManager,
      this.eventManager,
      this.damageManager,
      this.randomManager
    );

    // 创建波次管理器
    this.waveManager = new WaveManager(
      this.randomManager,
      this.entityManager,
      this.eventManager
    );

    // 注册事件监听
    this.registerEventListeners();

    logger.info('战斗管理器初始化完成');
  }

  /**
   * 初始化战斗
   * @param params 战斗初始化参数
   * @param seed 随机种子（可选）
   */
  public initBattle(params: BattleInitParams, seed?: number): void {
    if (this.state !== BattleState.IDLE) {
      logger.warn(`无法初始化战斗，当前状态: ${this.state}`);
      return;
    }

    this.state = BattleState.INITIALIZING;
    this.battleParams = params;

    // 设置随机种子
    if (seed !== undefined) {
      this.randomSeed = seed;
      this.randomManager.reset(seed);
    } else {
      this.randomSeed = Date.now();
      this.randomManager.reset(this.randomSeed);
    }

    logger.info(`初始化战斗，随机种子: ${this.randomSeed}`);

    // 清空现有数据
    this.reset();

    // 创建水晶
    this.createCrystal(params.crystal);

    // 创建英雄
    for (const player of params.players) {
      this.createHero(player.hero.id, player.id, player.hero.stats, player.hero.position);
    }

    // 加载关卡配置
    this.loadLevelConfig(params.level.chapter, params.level.stage);

    // 初始化回放数据
    this.initReplayData();

    this.state = BattleState.IDLE;
    logger.info('战斗初始化完成');
  }

  /**
   * 开始战斗
   */
  public startBattle(): void {
    if (this.state !== BattleState.IDLE) {
      logger.warn(`无法开始战斗，当前状态: ${this.state}`);
      return;
    }

    this.state = BattleState.RUNNING;
    this.result = BattleResult.NONE;
    this.battleStartTime = Date.now();

    // 启动帧管理器
    this.frameManager.start();

    // 启动波次管理器
    this.waveManager.startBattle();

    logger.info('战斗开始');

    // 触发战斗开始事件
    this.eventManager.emit('battleStart', {
      time: this.battleStartTime,
      params: this.battleParams,
      seed: this.randomSeed
    });
  }

  /**
   * 暂停战斗
   */
  public pauseBattle(): void {
    if (this.state !== BattleState.RUNNING) {
      return;
    }

    this.state = BattleState.PAUSED;
    this.frameManager.pause();

    logger.info('战斗暂停');

    // 触发战斗暂停事件
    this.eventManager.emit('battlePause', {
      time: Date.now()
    });
  }

  /**
   * 恢复战斗
   */
  public resumeBattle(): void {
    if (this.state !== BattleState.PAUSED) {
      return;
    }

    this.state = BattleState.RUNNING;
    this.frameManager.resume();

    logger.info('战斗恢复');

    // 触发战斗恢复事件
    this.eventManager.emit('battleResume', {
      time: Date.now()
    });
  }

  /**
   * 停止战斗
   */
  public stopBattle(): void {
    if (this.state !== BattleState.RUNNING && this.state !== BattleState.PAUSED) {
      return;
    }

    this.frameManager.stop();
    this.state = BattleState.COMPLETED;
    this.battleEndTime = Date.now();

    // 完成回放数据
    this.finalizeReplayData();

    logger.info('战斗停止');

    // 触发战斗结束事件
    this.eventManager.emit('battleEnd', {
      time: this.battleEndTime,
      result: this.result,
      duration: this.battleEndTime - this.battleStartTime,
      stats: this.getBattleStats()
    });
  }

  /**
   * 重置战斗
   */
  public reset(): void {
    // 停止帧管理器
    this.frameManager.stop();
    this.frameManager.reset();

    // 清空实体
    this.entityManager.clearAllEntities();

    // 清空效果
    this.skillManager.clearAllEffects();

    // 重置数据
    this.heroes.clear();
    this.beans.clear();
    this.crystal = null;

    // 重置状态
    this.state = BattleState.IDLE;
    this.result = BattleResult.NONE;
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.totalEnemiesDefeated = 0;

    logger.info('战斗重置');
  }

  /**
   * 获取战斗状态
   */
  public getState(): BattleState {
    return this.state;
  }

  /**
   * 获取战斗结果
   */
  public getResult(): BattleResult {
    return this.result;
  }

  /**
   * 获取回放数据
   */
  public getReplayData(): BattleReplayData | null {
    return this.replayData;
  }

  /**
   * 获取事件管理器
   */
  public getEventManager(): EventManager {
    return this.eventManager;
  }

  /**
   * 加载回放
   * @param replayData 回放数据
   */
  public loadReplay(replayData: BattleReplayData): void {
    if (this.state !== BattleState.IDLE) {
      logger.warn(`无法加载回放，当前状态: ${this.state}`);
      return;
    }

    this.isReplayMode = true;
    this.replayData = replayData;

    // 初始化战斗
    this.initBattle(replayData.initParams, replayData.randomSeed);

    // 加载所有指令
    this.frameManager.addCommands(replayData.commands);

    // 设置模拟模式
    this.frameManager.setSimulationMode(true, 1.0);

    logger.info('回放加载完成');
  }

  /**
   * 设置回放速度
   * @param speed 速度（1.0为正常速度）
   */
  public setReplaySpeed(speed: number): void {
    if (!this.isReplayMode) {
      return;
    }

    this.frameManager.setSimulationMode(true, speed);
  }

  /**
   * 发送战斗指令
   * @param command 战斗指令
   */
  public sendCommand(command: BattleCommand): void {
    if (this.state !== BattleState.RUNNING) {
      logger.warn(`无法发送指令，当前状态: ${this.state}`);
      return;
    }

    // 设置指令帧号（如果未指定）
    if (command.frame <= this.frameManager.getCurrentLogicFrame()) {
      command.frame = this.frameManager.getCurrentLogicFrame() + 1;
    }

    // 添加到帧管理器
    this.frameManager.addCommand(command);

    logger.debug(`发送指令: 类型=${command.type}, 帧号=${command.frame}, 玩家=${command.playerId}`);
  }

  /**
   * 获取战斗统计数据
   */
  public getBattleStats(): any {
    const duration = this.battleEndTime > 0
      ? this.battleEndTime - this.battleStartTime
      : Date.now() - this.battleStartTime;

    return {
      duration,
      totalDamageDealt: this.totalDamageDealt,
      totalDamageTaken: this.totalDamageTaken,
      totalEnemiesDefeated: this.totalEnemiesDefeated,
      currentWave: this.waveManager.getCurrentWaveInfo(),
      heroStats: Array.from(this.heroes.values()).map(hero => ({
        id: hero.getId(),
        name: hero.getName(),
        level: hero.getStat('level'),
        hp: hero.getStat('hp'),
        maxHp: hero.getStat('maxHp'),
        mp: hero.getStat('mp'),
        maxMp: hero.getStat('maxMp'),
        position: hero.getPosition()
      })),
      crystalStats: this.crystal ? {
        hp: this.crystal.getStat('hp'),
        maxHp: this.crystal.getStat('maxHp')
      } : null
    };
  }

  /**
   * 帧更新回调
   * @param frameType 帧类型
   * @param frameNumber 帧号
   * @param deltaTime 时间增量（毫秒）
   */
  private onFrameUpdate(frameType: FrameType, frameNumber: number, deltaTime: number): void {
    const currentTime = Date.now();

    // 更新实体
    this.entityManager.updateAllEntities(deltaTime, frameNumber);

    // 更新技能
    this.skillManager.update(deltaTime, currentTime);

    // 更新波次
    if (frameType === FrameType.LOGIC) {
      this.waveManager.update(currentTime);
    }

    // 检查胜负条件
    this.checkBattleResult();
  }

  /**
   * 处理战斗指令
   * @param commands 指令列表
   */
  private processCommands(commands: BattleCommand[]): void {
    for (const command of commands) {
      switch (command.type) {
        case 'castSkill':
          this.processCastSkillCommand(command as CastSkillCommand);
          break;

        case 'learnSkill':
          this.processLearnSkillCommand(command as LearnSkillCommand);
          break;

        case 'changePosition':
          this.processChangePositionCommand(command as ChangePositionCommand);
          break;

        case 'useItem':
          this.processUseItemCommand(command as UseItemCommand);
          break;
      }
    }
  }

  /**
   * 处理施放技能指令
   * @param command 指令
   */
  private processCastSkillCommand(command: CastSkillCommand): void {
    const { heroId, skillId, targetType, targetId, targetPos } = command.data;

    // 查找英雄
    let hero: Hero | undefined;
    for (const h of this.heroes.values()) {
      if (h.getId() === `hero_${heroId}`) {
        hero = h;
        break;
      }
    }

    if (!hero) {
      logger.warn(`施放技能失败: 找不到英雄 ${heroId}`);
      return;
    }

    // 查找目标
    let target: Entity | undefined;
    if (targetId !== undefined) {
      if (targetType === 'enemy') {
        target = this.entityManager.getEntity(`bean_${targetId}`);
      } else if (targetType === 'ally') {
        target = this.entityManager.getEntity(`hero_${targetId}`);
      }
    }

    // 转换目标位置
    let position: Vector2D | undefined;
    if (targetPos !== undefined) {
      // 这里简化处理，实际应该根据游戏坐标系统转换
      position = { x: targetPos, y: targetPos };
    }

    // 施放技能
    this.skillManager.castSkill(
      hero,
      `skill_${skillId}`,
      target?.getId(),
      position
    );
  }

  /**
   * 处理学习技能指令
   * @param command 指令
   */
  private processLearnSkillCommand(command: LearnSkillCommand): void {
    const { heroId, skillId } = command.data;

    // 查找英雄
    let hero: Hero | undefined;
    for (const h of this.heroes.values()) {
      if (h.getId() === `hero_${heroId}`) {
        hero = h;
        break;
      }
    }

    if (!hero) {
      logger.warn(`学习技能失败: 找不到英雄 ${heroId}`);
      return;
    }

    // 学习技能（简化处理）
    hero.learnSkill(skillId);

    logger.debug(`英雄${heroId}学习技能${skillId}`);
  }

  /**
   * 处理更换位置指令
   * @param command 指令
   */
  private processChangePositionCommand(command: ChangePositionCommand): void {
    const { heroId, newPos } = command.data;

    // 查找英雄
    let hero: Hero | undefined;
    for (const h of this.heroes.values()) {
      if (h.getId() === `hero_${heroId}`) {
        hero = h;
        break;
      }
    }

    if (!hero) {
      logger.warn(`更换位置失败: 找不到英雄 ${heroId}`);
      return;
    }

    // 更换位置（简化处理）
    hero.changePosition(newPos);

    logger.debug(`英雄${heroId}更换位置到${newPos}`);
  }

  /**
   * 处理使用道具指令
   * @param command 指令
   */
  private processUseItemCommand(command: UseItemCommand): void {
    const { itemId, target } = command.data;

    // 简化处理，实际应该有更复杂的道具系统
    logger.debug(`使用道具${itemId}，目标: ${target}`);
  }

  /**
   * 创建水晶
   * @param crystalConfig 水晶配置
   */
  private createCrystal(crystalConfig: any): void {
    // 创建水晶实体
    this.crystal = new Crystal(
      'crystal_1',
      '水晶',
      { x: 1500, y: 1500 },
      {
        hp: crystalConfig.maxHp,
        maxHp: crystalConfig.maxHp
      },
      this.frameManager.getCurrentLogicFrame()
    );

    // 添加到实体管理器
    this.entityManager.addEntity(this.crystal);

    // 设置波次管理器的中心点
    this.waveManager.setCenterPosition({ x: 1500, y: 1500 });

    logger.info(`创建水晶: HP=${crystalConfig.maxHp}`);

    // 触发水晶创建事件
    this.eventManager.emit('crystalCreated', {
      id: this.crystal.getId(),
      position: this.crystal.getPosition(),
      maxHp: this.crystal.getStat('maxHp')
    });
  }

  /**
   * 创建英雄
   * @param heroId 英雄ID
   * @param playerId 玩家ID
   * @param stats 属性
   * @param position 位置
   */
  private createHero(heroId: number, playerId: string, stats: any, position: number): void {
    // 计算英雄位置（简化处理）
    const heroPosition = this.calculateHeroPosition(position);

    // 创建英雄实体
    const hero = new Hero(
      `hero_${heroId}`,
      `英雄${heroId}`,
      heroPosition,
      {
        ...stats,
        hp: stats.hp || 100,
        maxHp: stats.maxHp || stats.hp || 100,
        mp: stats.mp || 100,
        maxMp: stats.maxMp || stats.mp || 100
      },
      this.frameManager.getCurrentLogicFrame(),
      playerId,
      heroId
    );

    // 添加到实体管理器
    this.entityManager.addEntity(hero);

    // 添加到英雄映射
    this.heroes.set(hero.getId(), hero);

    logger.info(`创建英雄: ID=${heroId}, 玩家=${playerId}, 位置=${position}`);

    // 触发英雄创建事件
    this.eventManager.emit('heroCreated', {
      id: hero.getId(),
      heroId,
      playerId,
      position: hero.getPosition(),
      stats: hero.getStats()
    });
  }

  /**
   * 计算英雄位置
   * @param positionIndex 位置索引（1-5）
   * @returns 坐标
   */
  private calculateHeroPosition(positionIndex: number): Vector2D {
    // 简化处理，实际应该根据游戏坐标系统计算
    const baseX = 1500;
    const baseY = 1500;
    const radius = 100;

    // 计算角度（均匀分布在半圆上）
    const angle = Math.PI * (0.5 + (positionIndex - 1) / 4);

    return {
      x: baseX + Math.cos(angle) * radius,
      y: baseY + Math.sin(angle) * radius
    };
  }

  /**
   * 加载关卡配置
   * @param chapter 章节
   * @param stage 关卡
   */
  private loadLevelConfig(chapter: number, stage: number): void {
    // 简化处理，实际应该从配置文件加载
    logger.info(`加载关卡配置: 章节=${chapter}, 关卡=${stage}`);

    // 设置波次配置（示例）
    this.waveManager.setWaves([
      {
        id: 'wave_1',
        name: '第一波',
        enemyTypes: [
          { type: '普通豆', weight: 3 },
          { type: '快速豆', weight: 1 }
        ],
        totalEnemies: 10,
        spawnInterval: 1000
      },
      {
        id: 'wave_2',
        name: '第二波',
        enemyTypes: [
          { type: '普通豆', weight: 2 },
          { type: '快速豆', weight: 2 },
          { type: '强壮豆', weight: 1 }
        ],
        totalEnemies: 15,
        spawnInterval: 800,
        delay: 3000
      },
      {
        id: 'wave_3',
        name: '第三波',
        enemyTypes: [
          { type: '普通豆', weight: 1 },
          { type: '快速豆', weight: 2 },
          { type: '强壮豆', weight: 2 }
        ],
        totalEnemies: 20,
        spawnInterval: 700,
        delay: 3000,
        specialEnemies: [
          { type: 'BOSS豆', count: 1, spawnTime: 10000 }
        ]
      }
    ]);
  }

  /**
   * 检查战斗结果
   */
  private checkBattleResult(): void {
    // 如果已经有结果，直接返回
    if (this.result !== BattleResult.NONE) {
      return;
    }

    // 检查失败条件：水晶被摧毁
    if (this.crystal && !this.crystal.isAlive()) {
      this.result = BattleResult.DEFEAT;
      this.endBattle();
      return;
    }

    // 检查胜利条件：所有波次完成
    const waveInfo = this.waveManager.getCurrentWaveInfo();
    if (waveInfo.index === this.waveManager.getTotalWaves() - 1 &&
        waveInfo.status === 'completed') {
      this.result = BattleResult.VICTORY;
      this.endBattle();
      return;
    }
  }

  /**
   * 结束战斗
   */
  private endBattle(): void {
    this.stopBattle();

    logger.info(`战斗结束，结果: ${this.result}`);

    // 触发游戏结束事件
    this.eventManager.emit('gameOver', {
      result: this.result,
      time: this.battleEndTime,
      duration: this.battleEndTime - this.battleStartTime,
      stats: this.getBattleStats()
    });
  }

  /**
   * 初始化回放数据
   */
  private initReplayData(): void {
    if (!this.battleParams) {
      return;
    }

    this.replayData = {
      replayId: `replay_${Date.now()}`,
      randomSeed: this.randomSeed,
      initParams: this.battleParams,
      commands: [],
      metadata: {
        battleDuration: 0,
        chapter: this.battleParams.level.chapter,
        stage: this.battleParams.level.stage,
        players: this.battleParams.players.map(p => p.id)
      }
    };
  }

  /**
   * 完成回放数据
   */
  private finalizeReplayData(): void {
    if (!this.replayData) {
      return;
    }

    // 更新指令列表
    this.replayData.commands = this.frameManager.getProcessedCommands();

    // 更新元数据
    this.replayData.metadata.battleDuration = this.battleEndTime - this.battleStartTime;

    logger.debug(`回放数据完成，指令数: ${this.replayData.commands.length}`);
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 监听伤害事件
    this.eventManager.on('damageDealt', (event) => {
      if (event.source && this.heroes.has(event.source.getId())) {
        // 英雄造成伤害
        this.totalDamageDealt += event.actualAmount;
      }

      if (event.target && this.heroes.has(event.target.getId())) {
        // 英雄受到伤害
        this.totalDamageTaken += event.actualAmount;
      }
    });

    // 监听实体死亡事件
    this.eventManager.on('entityDeath', (event) => {
      if (event.entity.getType() === EntityType.BEAN) {
        // 敌人被击败
        this.totalEnemiesDefeated++;
      }
    });
  }
}
