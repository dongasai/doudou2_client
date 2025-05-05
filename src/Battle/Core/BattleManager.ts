/**
 * 战斗管理器
 * 负责整体战斗流程控制，协调各个子系统
 */

import { logger } from './Logger';
import { FrameManager, FrameType } from './FrameManager';
import { EntityManager } from './EntityManager';
import { EventManager } from './EventManager';
import { DamageManager } from './DamageManager';
import { SkillManager } from './SkillManager'; // 使用兼容层
import { WaveManager } from './WaveManager';
import { RandomManager } from './RandomManager';
import { HeroAI } from '../AI/HeroAI';
import { AttackCommand, BattleCommand, CastSkillCommand, ChangePositionCommand, LearnSkillCommand, UseItemCommand } from '@/DesignConfig';
import { BattleInitParams } from '@/DesignConfig';
import { BattleReplayData } from '@/DesignConfig';
import { Entity, EntityType, EntityStats } from '../Entities/Entity';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';
import { Hero } from '../Entities/Hero';
import { Bean, BeanType, BeanState } from '../Entities/Bean';
import { Crystal } from '../Entities/Crystal';
import {ConfigManager} from "@/Managers/ConfigManager";
import {
  BattleStartEventData,
  BattlePauseEventData,
  BattleResumeEventData,
  BattleEndEventData,
  GameOverEventData,
  EntityCreatedEventData,
  EntityDeathEventData,
  DamageDealtEventData,
  EnemySpawnEventData,
  WaveStartEventData,
  WaveProgressEventData,
  WaveCompletedEventData,
  AllWavesCompletedEventData
} from '../Types/EventData';
import { EventType } from '@/Event/EventTypes';
import { BattleParamsService } from '@/services/BattleParamsService';

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
  private heroAI: HeroAI;

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

    // 创建英雄AI
    this.heroAI = new HeroAI(this.entityManager);
    logger.info('英雄AI初始化完成');

    // 注册事件监听
    this.registerEventListeners();

    // 注册波次管理器事件监听
    this.registerWaveManagerEvents();

    logger.info('战斗管理器初始化完成');
  }

  /**
   * 注册波次管理器事件监听
   * 这是一个关键方法，用于监听波次管理器发出的事件，并创建相应的豆豆实体
   */
  private registerWaveManagerEvents(): void {
    // 监听敌人生成事件
    this.eventManager.on(EventType.ENEMY_SPAWN, (data: EnemySpawnEventData) => {
      this.createBeanFromWaveManager(
        data.type,
        data.position,
        data.attrFactors,
        data.isSpecial,
        data.waveIndex,
        data.beanId // 传递豆豆ID
      );
    });

    // 监听波次开始事件
    this.eventManager.on(EventType.WAVE_START, (data: WaveStartEventData) => {
      logger.info(`波次开始: 第${data.waveIndex + 1}波 - ${data.waveName}`);
    });

    // 监听波次进度事件
    this.eventManager.on(EventType.WAVE_PROGRESS, (data: WaveProgressEventData) => {
      logger.debug(`波次进度: 第${data.waveIndex + 1}波, 进度=${Math.floor(data.progress * 100)}%`);
    });

    // 监听波次完成事件
    this.eventManager.on(EventType.WAVE_COMPLETED, (data: WaveCompletedEventData) => {
      logger.info(`波次完成: 第${data.waveIndex + 1}波 - ${data.waveName}, 用时: ${data.duration}ms`);
    });

    // 监听所有波次完成事件
    this.eventManager.on(EventType.ALL_WAVES_COMPLETED, (data: AllWavesCompletedEventData) => {
      logger.info(`所有波次完成，总波次: ${data.totalWaves}, 总用时: ${data.totalDuration || '未知'}ms`);
    });
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
    const battleStartData: BattleStartEventData = {
      time: this.battleStartTime,
      params: this.battleParams,
      seed: this.randomSeed
    };
    this.eventManager.emit(EventType.BATTLE_START, battleStartData);
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
    const battlePauseData: BattlePauseEventData = {
      time: Date.now()
    };
    this.eventManager.emit(EventType.BATTLE_PAUSE, battlePauseData);
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
    const battleResumeData: BattleResumeEventData = {
      time: Date.now()
    };
    this.eventManager.emit(EventType.BATTLE_RESUME, battleResumeData);
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
    const battleEndData: BattleEndEventData = {
      time: this.battleEndTime,
      result: this.result,
      duration: this.battleEndTime - this.battleStartTime,
      stats: this.getBattleStats()
    };
    this.eventManager.emit(EventType.BATTLE_END, battleEndData);
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
   * 获取波次管理器
   */
  public getWaveManager() {
    return this.waveManager;
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
   * @returns 战斗统计数据
   */
  public getBattleStats(): import('../Types/BattleStats').BattleStats {
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
        heroId: hero.getHeroId(),
        name: hero.getName(),
        level: hero.getStat('level'),
        hp: hero.getStat('hp') ?? 0,
        maxHp: hero.getStat('maxHp') ?? 100,
        mp: hero.getStat('mp') ?? 0,
        maxMp: hero.getStat('maxMp') ?? 100,
        position: hero.getPosition()
      })),
      crystalStats: this.crystal ? {
        hp: this.crystal.getStat('hp') ?? 1000,
        maxHp: this.crystal.getStat('maxHp') ?? 1000
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

    // 更新实体，传递事件管理器以便触发实体移动事件
    this.entityManager.updateAllEntities(deltaTime, frameNumber, this.eventManager);

    // 更新技能
    this.skillManager.update(deltaTime, currentTime);

    // 更新波次
    if (frameType === FrameType.LOGIC) {
      this.waveManager.update(currentTime);

      // 更新英雄AI（每个逻辑帧更新一次）
      this.updateHeroAI();
    }

    // 检查胜负条件
    this.checkBattleResult();
  }

  /**
   * 更新英雄AI
   * 为没有目标的英雄自动选择目标
   */
  private updateHeroAI(): void {
    // 如果战斗暂停或已结束，不更新AI
    if (this.state !== BattleState.RUNNING) {
      return;
    }

    // 遍历所有英雄
    for (const hero of this.heroes.values()) {
      // 如果英雄存活，确保设置了伤害管理器和实体管理器，然后更新AI
      if (hero.isAlive()) {
        // 确保英雄设置了伤害管理器和实体管理器
        hero.setDamageManager(this.damageManager);
        hero.setEntityManager(this.entityManager);

        // 更新AI
        this.heroAI.update(hero);
      }
    }
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

        case 'attack':
          this.processAttackCommand(command as AttackCommand);
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
   * 处理攻击指令
   * @param command 指令
   */
  private processAttackCommand(command: AttackCommand): void {
    const { heroId, targetId } = command.data;
    // 检查是否是设置持续攻击目标的命令
    const setAsTarget = (command.data as any).setAsTarget === true;

    // 查找英雄
    let hero: Hero | undefined;
    for (const h of this.heroes.values()) {
      if (h.getId() === `hero_${heroId}`) {
        hero = h;
        break;
      }
    }

    if (!hero) {
      logger.warn(`攻击失败: 找不到英雄 ${heroId}`);
      return;
    }

    // 始终设置伤害管理器和实体管理器，确保英雄可以正常攻击
    hero.setDamageManager(this.damageManager);
    hero.setEntityManager(this.entityManager);

    // 查找目标豆豆
    // 如果targetId是-1，则使用完整的豆豆ID
    const targetBeanId = targetId === -1 ? (command.data as any).fullBeanId : `bean_${targetId}`;

    // 如果没有提供完整ID，尝试查找所有豆豆
    let targetBean = this.entityManager.getEntity(targetBeanId);

    // 如果找不到目标豆豆，尝试直接使用传入的ID
    if (!targetBean && (command.data as any).fullBeanId) {
      targetBean = this.entityManager.getEntity((command.data as any).fullBeanId);
    }

    // 如果仍然找不到，记录警告并返回
    if (!targetBean) {
      logger.warn(`攻击失败: 找不到目标豆豆 ${targetBeanId}`);
      return;
    }

    logger.info(`找到目标豆豆: ${targetBean.getId()}`);

    // 记录豆豆位置和英雄位置，用于调试
    logger.debug(`豆豆位置: ${JSON.stringify(targetBean.getPosition())}, 英雄位置: ${JSON.stringify(hero.getPosition())}`);

    // 计算距离
    const distance = Vector2DUtils.distance(hero.getPosition(), targetBean.getPosition());
    logger.debug(`英雄到豆豆的距离: ${distance}, 英雄攻击范围: ${hero.getAttackRange()}`);


    // 设置攻击目标
    hero.setTargetId(targetBeanId);

    // 如果只是设置目标，不执行攻击，直接返回
    if (setAsTarget) {
      logger.info(`英雄${heroId}设置攻击目标为豆豆${targetBean.getId()}`);
      return;
    }

    // 尝试攻击目标
    const attackResult = hero.attackTarget(targetBean.getId());

    if (attackResult.success) {
      logger.info(`英雄${heroId}攻击豆豆${targetBean.getId()}成功，造成${attackResult.damage}点伤害`);

      // 触发伤害事件，确保UI能够显示伤害效果
      this.eventManager.emit('damageDealt', {
        sourceId: hero.getId(),
        targetId: targetBean.getId(),
        damage: attackResult.damage || 0,
        isCritical: false
      });

      // 如果豆豆死亡，触发死亡事件
      if (!targetBean.isAlive()) {
        logger.info(`豆豆${targetBean.getId()}已被击杀，触发死亡事件`);

        // 触发实体死亡事件（使用EventType常量）
        this.eventManager.emit(EventType.ENTITY_DEATH, {
          entityId: targetBean.getId(),
          killerId: hero.getId()
        });

        // 同时触发字符串版本的事件，确保兼容性
        this.eventManager.emit('entityDeath', {
          entityId: targetBean.getId(),
          killerId: hero.getId()
        });
      }
    } else {
      logger.warn(`英雄${heroId}攻击豆豆${targetBean.getId()}失败: ${attackResult.message}`);
    }
  }

  /**
   * 创建水晶
   * @param crystalConfig 水晶配置
   */
  private createCrystal(crystalConfig: any): void {
    // 记录水晶配置
    logger.debug(`水晶配置: ${JSON.stringify(crystalConfig)}`);

    // 确保水晶配置中有正确的HP值
    const maxHp = crystalConfig.maxHp || crystalConfig.maxHP || crystalConfig.stats?.maxHp || crystalConfig.stats?.maxHP || 1000;

    // 创建水晶实体
    this.crystal = new Crystal(
      'crystal_1',
      '水晶',
      { x: 1500, y: 1500 },
      {
        hp: maxHp,
        maxHp: maxHp,
        defense: 50, // 添加防御属性
        magicDefense: 50 // 添加魔法防御属性
      },
      this.frameManager.getCurrentLogicFrame()
    );

    // 验证水晶状态
    logger.info(`水晶创建后状态: HP=${this.crystal.getStat('hp')}/${this.crystal.getStat('maxHp')}, 防御=${this.crystal.getStat('defense')}`);

    // 添加到实体管理器
    this.entityManager.addEntity(this.crystal);

    // 设置波次管理器的中心点
    this.waveManager.setCenterPosition({ x: 1500, y: 1500 });

    // 设置豆豆生成范围，确保豆豆生成在离水晶足够远的位置
    this.waveManager.setSpawnRange(800, 1200);

    logger.info(`创建水晶: HP=${maxHp}, ID=${this.crystal.getId()}`);

    // 触发水晶创建事件
    this.eventManager.emit('crystalCreated', {
      id: this.crystal.getId(),
      position: this.crystal.getPosition(),
      maxHp: this.crystal.getStat('maxHp'),
      hp: this.crystal.getStat('hp')
    });

    // 同时触发通用实体创建事件，确保视图层能正确显示水晶
    const entityCreatedData: EntityCreatedEventData = {
      id: this.crystal.getId(),
      type: EntityType.CRYSTAL,
      entityType: 'crystal',
      position: this.crystal.getPosition(),
      stats: this.crystal.getStats()
    };
    this.eventManager.emit(EventType.ENTITY_CREATED, entityCreatedData);

    // 设置水晶的伤害冷却时间为较短的值，确保能够连续受到伤害
    if (this.crystal.setDamageCooldown) {
      this.crystal.setDamageCooldown(200); // 设置为200毫秒
      logger.debug(`设置水晶伤害冷却时间为200毫秒`);
    }

    // 设置水晶的事件管理器
    if (this.crystal.setEventManager) {
      this.crystal.setEventManager(this.eventManager);
      logger.debug(`设置水晶事件管理器`);
    }
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

    // 设置伤害管理器和实体管理器
    hero.setDamageManager(this.damageManager);
    hero.setEntityManager(this.entityManager);

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

    // 同时触发通用实体创建事件，确保视图层能正确显示英雄
    const entityCreatedData: EntityCreatedEventData = {
      id: hero.getId(),
      type: EntityType.HERO,
      entityType: 'hero',
      position: hero.getPosition(),
      stats: hero.getStats()
    };
    this.eventManager.emit(EventType.ENTITY_CREATED, entityCreatedData);
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
    // 从配置表加载关卡数据
    logger.info(`加载关卡配置: 章节=${chapter}, 关卡=${stage}`);

    try {
      // 尝试从BattleParamsService获取关卡配置
      const levelConfig = this.getLevelConfigFromService(chapter, stage);

      if (levelConfig && levelConfig.waves) {
        // 使用从配置表获取的波次数据
        logger.info(`成功从配置表加载关卡${chapter}-${stage}的波次数据`);
        this.waveManager.setWaves(levelConfig.waves);
      } else {
        // 如果找不到配置，使用默认配置
        logger.warn(`未找到关卡${chapter}-${stage}的配置，使用默认配置`);
        this.setDefaultWaves();
      }
    } catch (error) {
      // 出错时使用默认配置
      logger.error(`加载关卡配置出错: ${error}，使用默认配置`);
      this.setDefaultWaves();
    }
  }

  /**
   * 从服务获取关卡配置
   * @param chapter 章节
   * @param stage 关卡
   * @returns 关卡配置
   */
  private getLevelConfigFromService(chapter: number, stage: number): any {
    try {
      // 构造关卡ID
      const levelId = `level-${chapter}-${stage}`;

      // 从BattleParamsService获取关卡数据
      const levelData = BattleParamsService.getLevelData(levelId);

      if (!levelData) {
        logger.warn(`未找到关卡数据: ${levelId}`);
        return null;
      }

      // 将关卡数据转换为波次配置
      const waves = this.convertLevelDataToWaves(levelData);

      return {
        waves: waves
      };
    } catch (error) {
      logger.error(`获取关卡配置失败: ${error}`);
      return null;
    }
  }

  /**
   * 将关卡数据转换为波次配置
   * @param levelData 关卡数据
   * @returns 波次配置
   */
  private convertLevelDataToWaves(levelData: any): any[] {
    // 如果关卡数据中已经有波次配置，直接返回
    if (levelData.waves && Array.isArray(levelData.waves)) {
      return levelData.waves;
    }

    // 获取波次数量，默认为3波，如果配置了waveCount则使用配置的值
    const waveCount = levelData.waveCount || 3;
    const totalBeans = levelData.totalBeans || 30;

    // 计算每波的豆豆数量
    const beansPerWave = Math.ceil(totalBeans / waveCount);

    // 创建波次配置数组
    const waves = [];

    // 生成每一波的配置
    for (let i = 0; i < waveCount; i++) {
      // 计算当前波次的豆豆数量
      let currentWaveEnemies = beansPerWave;
      if (i === waveCount - 1) {
        // 最后一波调整数量，确保总数正确
        currentWaveEnemies = totalBeans - beansPerWave * (waveCount - 1);
      }

      // 创建波次配置，保持简单，不添加额外数据
      const wave: any = {
        id: `wave_${i + 1}`,
        name: `第${i + 1}波`,
        enemyTypes: levelData.beanRatios.map((ratio: any) => ({
          type: ratio.type,
          weight: ratio.weight
        })),
        totalEnemies: currentWaveEnemies,
        spawnInterval: levelData.spawnInterval || 1000,
        delay: i === 0 ? 0 : 3000 // 第一波没有延迟，后续波次有3秒延迟
      };

      waves.push(wave);
    }

    logger.info(`根据waveCount=${waveCount}生成了${waves.length}波配置`);
    return waves;
  }

  /**
   * 设置默认波次配置
   */
  private setDefaultWaves(): void {
    // 设置默认波次配置
    this.waveManager.setWaves([
      {
        id: 'wave_1',
        name: '第一波',
        enemyTypes: [
          { type: BeanType.RAGE, weight: 3 },
          { type: BeanType.POISON, weight: 1 }
        ],
        totalEnemies: 10,
        spawnInterval: 1000
      },
      {
        id: 'wave_2',
        name: '第二波',
        enemyTypes: [
          { type: BeanType.RAGE, weight: 2 },
          { type: BeanType.POISON, weight: 2 },
          { type: BeanType.FAST, weight: 1 }
        ],
        totalEnemies: 15,
        spawnInterval: 800,
        delay: 3000
      },
      {
        id: 'wave_3',
        name: '第三波',
        enemyTypes: [
          { type: BeanType.RAGE, weight: 1 },
          { type: BeanType.POISON, weight: 2 },
          { type: BeanType.FAST, weight: 2 }
        ],
        totalEnemies: 20,
        spawnInterval: 700,
        delay: 3000,
        specialEnemies: [
          { type: BeanType.ARMORED, count: 1, spawnTime: 10000 }
        ]
      }
    ]);
  }

  /**
   * 将中文豆豆名称映射到BeanType枚举
   * @param chineseName 中文豆豆名称
   * @returns 对应的BeanType枚举值，如果找不到则返回NORMAL
   */
  private mapChineseNameToBeanType(chineseName: string): BeanType {
    // 中文名称到BeanType的映射表
    const nameToTypeMap: { [key: string]: BeanType } = {
      '普通豆': BeanType.NORMAL,
      '快速豆': BeanType.FAST,
      '强壮豆': BeanType.STRONG,
      '毒豆': BeanType.POISON,
      '炸弹豆': BeanType.EXPLOSIVE,
      '冰霜豆': BeanType.FROST,
      '铁甲豆': BeanType.ARMORED,
      '暴躁豆': BeanType.RAGE,
      '狂暴豆': BeanType.RAGE,  // 同时支持"暴躁豆"和"狂暴豆"映射到RAGE
      'BOSS豆': BeanType.BOSS,
      'Boss豆': BeanType.BOSS
    };

    // 查找映射
    return nameToTypeMap[chineseName] || BeanType.NORMAL;
  }

  /**
   * 从波次管理器创建豆豆
   * @param beanType 豆豆类型
   * @param position 位置
   * @param attrFactors 属性系数
   * @param isSpecial 是否特殊敌人
   * @param waveIndex 波次索引
   * @param beanId 豆豆ID（可选，如果不提供则自动生成）
   */
  private createBeanFromWaveManager(
    beanType: string,
    position: Vector2D,
    attrFactors: { [key: string]: number | undefined } = {},
    isSpecial: boolean = false,
    waveIndex: number = 0,
    beanId: string
  ): void {
    try {
      // 将字符串类型转换为BeanType枚举
      let beanTypeEnum: BeanType;

      // 处理不同类型的beanType
      if (typeof beanType === 'number') {
        // 如果是数字ID，从ConfigManager获取对应的豆豆配置
        try {
          const configManager = ConfigManager.getInstance();
          const beanConfig = configManager.getBeanConfigById(beanType);

          // 根据豆豆名称映射到BeanType
          beanTypeEnum = this.mapChineseNameToBeanType(beanConfig.name);
          logger.debug(`根据豆豆ID ${beanType} 获取到豆豆类型 ${beanTypeEnum}`);
        } catch (error) {
          logger.warn(`无法根据ID获取豆豆类型: ${beanType}，使用默认类型NORMAL`);
          beanTypeEnum = BeanType.NORMAL;
        }
      } else if (typeof beanType === 'string') {
        if (beanType in BeanType) {
          // 如果是枚举键名（如'RAGE'），直接使用
          beanTypeEnum = BeanType[beanType as keyof typeof BeanType];
        } else if (Object.values(BeanType).includes(beanType as BeanType)) {
          // 如果是枚举值（如'rage'），直接使用
          beanTypeEnum = beanType as BeanType;
        } else {
          // 尝试从中文名称映射
          beanTypeEnum = this.mapChineseNameToBeanType(beanType);

          // 如果映射失败，记录警告并使用默认值
          if (beanTypeEnum === BeanType.NORMAL && beanType !== '普通豆') {
            logger.warn(`未知的豆豆类型: ${beanType}，使用默认类型NORMAL`);
          }
        }
      } else {
        // 如果已经是BeanType枚举，直接使用
        beanTypeEnum = beanType as BeanType;
      }

      // 使用传入的ID或生成唯一ID
      const finalBeanId =  `bean_${waveIndex + 1}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // 获取基础属性
      const baseStats = this.getBeanBaseStats(beanTypeEnum);

      // 应用属性系数
      const stats = this.applyAttrFactors(baseStats, attrFactors);

      // 获取豆豆名称
      const beanName = this.getBeanName(beanTypeEnum);

      // 获取豆豆参数
      const moveSpeed = this.getBeanMoveSpeed(beanTypeEnum, attrFactors.speed);
      const attackRange = this.getBeanAttackRange(beanTypeEnum);
      const attackInterval = this.getBeanAttackInterval(beanTypeEnum);

      // 创建豆豆实体
      const bean = new Bean(
        finalBeanId,
        beanName,
        position,
        stats,
        this.frameManager.getCurrentLogicFrame(),
        beanTypeEnum,
        moveSpeed,
        attackRange,
        attackInterval,
        isSpecial,
        waveIndex
      );

      // 设置豆豆目标为水晶
      if (this.crystal) {
        bean.setTarget(this.crystal.getId());
        bean.setState(BeanState.MOVE); // 设置为移动状态，让豆豆开始移动
        logger.debug(`豆豆${bean.getId()}设置目标为水晶${this.crystal.getId()}，状态为${bean.getState()}`);
      } else {
        logger.warn(`豆豆${bean.getId()}无法设置目标，水晶不存在`);
      }

      // 设置伤害管理器
      if (bean.setDamageManager) {
        bean.setDamageManager(this.damageManager);
        logger.debug(`为豆豆${bean.getId()}设置伤害管理器`);
      }

      // 设置实体管理器
      if (bean.setEntityManager) {
        bean.setEntityManager(this.entityManager);
        logger.debug(`为豆豆${bean.getId()}设置实体管理器`);
      }

      // 添加到实体管理器
      this.entityManager.addEntity(bean);

      // 添加到豆豆映射
      this.beans.set(bean.getId(), bean);

      logger.info(`创建豆豆: 类型=${beanTypeEnum}, ID=${finalBeanId}, 位置=(${position.x}, ${position.y}), 特殊=${isSpecial}`);

      // 获取豆豆的emoji
      let beanEmoji = '🟢'; // 默认emoji
      try {
        // 尝试从ConfigManager获取豆豆配置
        let b =ConfigManager.getInstance().getBeanConfigById(Number(beanId))
        // @ts-ignore
        beanEmoji =b.emoji
      } catch (error) {
        logger.error(`获取豆豆emoji失败: ${error}`);
      }

      // 触发豆豆创建事件
      const entityCreatedData: EntityCreatedEventData = {
        id: bean.getId(),
        type: EntityType.BEAN,
        // 添加entityType字段，确保与EntityCreatedEvent接口兼容
        entityType: 'bean',
        position: bean.getPosition(),
        stats: bean.getStats(),
        // 添加emoji字段
        emoji: beanEmoji
      };
      this.eventManager.emit(EventType.ENTITY_CREATED, entityCreatedData);
    } catch (error) {
      logger.error(`创建豆豆失败: ${error}`);
    }
  }

  /**
   * 获取豆豆基础属性
   * @param beanType 豆豆类型
   * @returns 基础属性
   */
  private getBeanBaseStats(beanType: BeanType): EntityStats {
    // 根据豆豆类型返回不同的基础属性
    // 这里应该从配置表读取，目前简化处理
    switch (beanType) {
      case BeanType.NORMAL:
        return {
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          speed: 40
        };
      case BeanType.FAST:
        return {
          hp: 80,
          maxHp: 80,
          attack: 8,
          defense: 3,
          speed: 60
        };
      case BeanType.STRONG:
        return {
          hp: 150,
          maxHp: 150,
          attack: 15,
          defense: 8,
          speed: 35
        };
      case BeanType.POISON:
        return {
          hp: 90,
          maxHp: 90,
          attack: 12,
          defense: 4,
          speed: 45
        };
      case BeanType.EXPLOSIVE:
        return {
          hp: 70,
          maxHp: 70,
          attack: 25,
          defense: 2,
          speed: 50
        };
      case BeanType.FROST:
        return {
          hp: 110,
          maxHp: 110,
          attack: 10,
          defense: 7,
          speed: 40
        };
      case BeanType.ARMORED:
        return {
          hp: 200,
          maxHp: 200,
          attack: 12,
          defense: 20,
          speed: 30
        };
      case BeanType.RAGE:
        return {
          hp: 120,
          maxHp: 120,
          attack: 18,
          defense: 6,
          speed: 45
        };
      case BeanType.BOSS:
        return {
          hp: 500,
          maxHp: 500,
          attack: 30,
          defense: 15,
          speed: 35
        };
      default:
        return {
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          speed: 40
        };
    }
  }

  /**
   * 应用属性系数
   * @param baseStats 基础属性
   * @param attrFactors 属性系数
   * @returns 应用系数后的属性
   */
  private applyAttrFactors(
    baseStats: EntityStats,
    attrFactors: { [key: string]: number | undefined } = {}
  ): EntityStats {
    const result: EntityStats = { ...baseStats };

    // 应用HP系数
    if (attrFactors.hp !== undefined) {
      result.hp = Math.floor(result.hp * attrFactors.hp);
      result.maxHp = Math.floor(result.maxHp * attrFactors.hp);
    }

    // 应用攻击系数
    if (attrFactors.attack !== undefined && result.attack !== undefined) {
      result.attack = Math.floor(result.attack * attrFactors.attack);
    }

    // 应用防御系数
    if (attrFactors.defense !== undefined && result.defense !== undefined) {
      result.defense = Math.floor(result.defense * attrFactors.defense);
    }

    // 应用速度系数
    if (attrFactors.speed !== undefined && result.speed !== undefined) {
      result.speed = Math.floor(result.speed * attrFactors.speed);
    }

    return result;
  }

  /**
   * 获取豆豆名称
   * @param beanType 豆豆类型
   * @returns 豆豆名称
   */
  private getBeanName(beanType: BeanType): string {
    // 根据豆豆类型返回不同的名称
    switch (beanType) {
      case BeanType.NORMAL:
        return '普通豆';
      case BeanType.FAST:
        return '快速豆';
      case BeanType.STRONG:
        return '强壮豆';
      case BeanType.POISON:
        return '毒豆';
      case BeanType.EXPLOSIVE:
        return '炸弹豆';
      case BeanType.FROST:
        return '冰霜豆';
      case BeanType.ARMORED:
        return '铁甲豆';
      case BeanType.RAGE:
        return '暴躁豆';
      case BeanType.BOSS:
        return 'BOSS豆';
      default:
        return '未知豆';
    }
  }

  /**
   * 获取豆豆移动速度
   * @param beanType 豆豆类型
   * @param speedFactor 速度系数
   * @returns 移动速度
   */
  private getBeanMoveSpeed(beanType: BeanType, speedFactor?: number): number {
    // 基础移动速度
    let baseSpeed: number;

    switch (beanType) {
      case BeanType.FAST:
        baseSpeed = 70;
        break;
      case BeanType.ARMORED:
        baseSpeed = 30;
        break;
      case BeanType.BOSS:
        baseSpeed = 40;
        break;
      default:
        baseSpeed = 50;
    }

    // 应用速度系数
    if (speedFactor !== undefined) {
      baseSpeed = Math.floor(baseSpeed * speedFactor);
    }

    // 添加一些随机性
    return baseSpeed + Math.random() * 10;
  }

  /**
   * 获取豆豆攻击范围
   * @param beanType 豆豆类型
   * @returns 攻击范围
   */
  private getBeanAttackRange(beanType: BeanType): number {
    // 根据豆豆类型返回不同的攻击范围
    switch (beanType) {
      case BeanType.POISON:
      case BeanType.FROST:
        return 150; // 远程攻击
      case BeanType.EXPLOSIVE:
        return 50;  // 爆炸范围小
      case BeanType.BOSS:
        return 120; // BOSS攻击范围大
      default:
        return 100; // 默认攻击范围
    }
  }

  /**
   * 获取豆豆攻击间隔
   * @param beanType 豆豆类型
   * @returns 攻击间隔（毫秒）
   */
  private getBeanAttackInterval(beanType: BeanType): number {
    // 根据豆豆类型返回不同的攻击间隔
    switch (beanType) {
      case BeanType.FAST:
        return 800;  // 快速豆攻击间隔短
      case BeanType.STRONG:
      case BeanType.ARMORED:
        return 1500; // 强壮豆和铁甲豆攻击间隔长
      case BeanType.BOSS:
        return 2000; // BOSS攻击间隔长但伤害高
      default:
        return 1000; // 默认攻击间隔
    }
  }

  /**
   * 创建测试豆豆
   * 用于测试，直接创建一些豆豆
   * 注意：此方法已废弃，保留仅供参考
   * @deprecated 使用波次管理器生成豆豆
   */
  private createTestBeans(): void {
    logger.warn('createTestBeans方法已废弃，请使用波次管理器生成豆豆');
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
    const gameOverData: GameOverEventData = {
      result: this.result,
      time: this.battleEndTime,
      duration: this.battleEndTime - this.battleStartTime,
      stats: this.getBattleStats()
    };
    this.eventManager.emit(EventType.GAME_OVER, gameOverData);
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
   * 更新水晶状态
   * @param hp 当前生命值
   * @param maxHp 最大生命值
   */
  public updateCrystalStats(hp: number, maxHp: number): void {
    if (!this.crystal) {
      logger.warn('无法更新水晶状态，水晶不存在');
      return;
    }

    // 记录原始值，用于日志
    const oldHp = this.crystal.getStat('hp');
    const oldMaxHp = this.crystal.getStat('maxHp');

    // 更新水晶状态
    this.crystal.setStat('hp', hp);
    this.crystal.setStat('maxHp', maxHp);

    logger.info(`水晶状态更新: HP=${oldHp}->${hp}/${maxHp}`);
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 监听伤害事件
    this.eventManager.on(EventType.DAMAGE_DEALT, (event: DamageDealtEventData) => {
      if (event.source && this.heroes.has(event.source.id)) {
        // 英雄造成伤害
        this.totalDamageDealt += event.actualAmount;
      }

      if (event.target && this.heroes.has(event.target.id)) {
        // 英雄受到伤害
        this.totalDamageTaken += event.actualAmount;
      }
    });

    // 监听实体死亡事件
    this.eventManager.on(EventType.ENTITY_DEATH, (event: EntityDeathEventData) => {
      if (event.entity.type === EntityType.BEAN) {
        // 敌人被击败
        this.totalEnemiesDefeated++;

        // 记录日志
        logger.info(`敌人被击败: ID=${event.entity.id}, 位置=(${event.entity.position.x}, ${event.entity.position.y})`);
      }
    });

    // 监听实体属性变化事件
    this.eventManager.on('entityStatsChanged', (event: any) => {
      // 如果是水晶，更新水晶状态
      if (event.entityId.startsWith('crystal_') && event.changedStats) {
        const hp = event.changedStats.hp;
        const maxHp = event.changedStats.maxHp;

        if (hp !== undefined && maxHp !== undefined) {
          this.updateCrystalStats(hp, maxHp);
        }
      }
    });
  }
}
