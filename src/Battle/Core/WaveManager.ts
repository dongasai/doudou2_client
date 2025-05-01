/**
 * 波次管理器
 * 负责管理战斗中的敌人波次生成
 */

import { logger } from './Logger';
import { RandomManager } from './RandomManager';
import { EntityManager } from './EntityManager';
import { EventManager } from './EventManager';
import { Vector2D } from '../Types/Vector2D';
import { EntityType } from '../Entities/Entity';

// 波次配置接口
export interface WaveConfig {
  // 波次ID
  id: string;
  // 波次名称
  name: string;
  // 敌人类型及其权重
  enemyTypes: Array<{
    type: string;
    weight: number;
    // 属性系数
    attrFactors?: {
      hp?: number;
      attack?: number;
      defense?: number;
      speed?: number;
      [key: string]: number | undefined;
    };
  }>;
  // 敌人总数
  totalEnemies: number;
  // 生成间隔（毫秒）
  spawnInterval: number;
  // 波次延迟（毫秒，从上一波结束后开始计时）
  delay?: number;
  // 特殊敌人（如Boss）
  specialEnemies?: Array<{
    type: string;
    count: number;
    spawnTime?: number; // 在波次开始后的第几毫秒生成
  }>;
}

/**
 * 波次信息接口
 * 描述当前波次的状态和进度
 */
export interface WaveInfo {
  /** 当前波次索引（从0开始） */
  index: number;
  /** 当前波次状态（等待中/进行中/已完成） */
  status: WaveStatus;
  /** 当前波次配置（如果没有波次则为null） */
  config: WaveConfig | null;
  /** 已生成敌人数量 */
  spawnedCount: number;
  /** 已击败敌人数量 */
  defeatedCount: number;
  /** 当前波次进度（0-1） */
  progress: number;
  /** 波次开始时间（毫秒） */
  startTime: number;
  /** 波次已进行时间（毫秒） */
  elapsedTime: number;
  /** 波次编号（从1开始，用于显示） */
  number: number;
}

// 波次状态枚举
export enum WaveStatus {
  PENDING = 'pending',   // 等待中
  ACTIVE = 'active',     // 进行中
  COMPLETED = 'completed' // 已完成
}

export class WaveManager {
  private randomManager: RandomManager;
  private entityManager: EntityManager;
  private eventManager: EventManager;

  // 波次配置列表
  private waves: WaveConfig[] = [];
  // 当前波次索引
  private currentWaveIndex: number = -1;
  // 当前波次状态
  private currentWaveStatus: WaveStatus = WaveStatus.PENDING;
  // 当前波次已生成敌人数量
  private spawnedEnemiesCount: number = 0;
  // 当前波次已击败敌人数量
  private defeatedEnemiesCount: number = 0;
  // 上次生成敌人的时间（毫秒）
  private lastSpawnTime: number = 0;
  // 波次开始时间（毫秒）
  private waveStartTime: number = 0;
  // 战斗开始时间（毫秒）
  private battleStartTime: number = 0;
  // 是否自动开始下一波
  private autoNextWave: boolean = false;
  // 中心点位置（通常是水晶位置）
  private centerPosition: Vector2D = { x: 1500, y: 1500 };
  // 生成范围（最小和最大距离）
  private spawnRange: { min: number, max: number } = { min: 500, max: 800 };

  /**
   * 构造函数
   * @param randomManager 随机数管理器
   * @param entityManager 实体管理器
   * @param eventManager 事件管理器
   */
  constructor(
    randomManager: RandomManager,
    entityManager: EntityManager,
    eventManager: EventManager
  ) {
    this.randomManager = randomManager;
    this.entityManager = entityManager;
    this.eventManager = eventManager;

    // 监听敌人死亡事件
    this.eventManager.on('entityDeath', (event) => {
      if (event.entity.getType() === EntityType.BEAN) {
        this.onEnemyDefeated(event.entity.getId());
      }
    });

    logger.debug('波次管理器初始化');
  }

  /**
   * 设置波次配置
   * @param waves 波次配置列表
   */
  public setWaves(waves: WaveConfig[]): void {
    this.waves = [...waves];
    this.currentWaveIndex = -1;
    this.currentWaveStatus = WaveStatus.PENDING;
    logger.info(`设置波次配置，共${waves.length}波`);
  }

  /**
   * 设置中心点位置
   * @param position 位置
   */
  public setCenterPosition(position: Vector2D): void {
    this.centerPosition = { ...position };
  }

  /**
   * 设置生成范围
   * @param min 最小距离
   * @param max 最大距离
   */
  public setSpawnRange(min: number, max: number): void {
    this.spawnRange = { min, max };
  }

  /**
   * 设置是否自动开始下一波
   * @param auto 是否自动
   */
  public setAutoNextWave(auto: boolean): void {
    this.autoNextWave = auto;
  }

  /**
   * 开始战斗
   */
  public startBattle(): void {
    this.battleStartTime = Date.now();
    logger.info('战斗开始');

    // 触发战斗开始事件
    this.eventManager.emit('battleStart', {
      time: this.battleStartTime,
      totalWaves: this.waves.length
    });

    // 开始第一波
    this.startNextWave();
  }

  /**
   * 开始下一波
   */
  public startNextWave(): void {
    // 检查是否还有下一波
    if (this.currentWaveIndex + 1 >= this.waves.length) {
      logger.info('已经是最后一波');

      // 触发所有波次完成事件
      this.eventManager.emit('allWavesCompleted', {
        time: Date.now(),
        totalWaves: this.waves.length
      });

      return;
    }

    // 更新波次索引和状态
    this.currentWaveIndex++;
    this.currentWaveStatus = WaveStatus.ACTIVE;
    this.spawnedEnemiesCount = 0;
    this.defeatedEnemiesCount = 0;
    this.waveStartTime = Date.now();
    this.lastSpawnTime = this.waveStartTime;

    const wave = this.waves[this.currentWaveIndex];
    logger.info(`开始第${this.currentWaveIndex + 1}波: ${wave.name}`);

    // 触发波次开始事件
    this.eventManager.emit('waveStart', {
      waveIndex: this.currentWaveIndex,
      waveName: wave.name,
      totalEnemies: wave.totalEnemies,
      time: this.waveStartTime
    });
  }

  /**
   * 更新波次状态
   * @param currentTime 当前时间（毫秒）
   */
  public update(currentTime: number): void {
    // 如果没有正在进行的波次，直接返回
    if (this.currentWaveStatus !== WaveStatus.ACTIVE) {
      return;
    }

    const wave = this.waves[this.currentWaveIndex];

    // 检查是否需要生成敌人
    if (this.spawnedEnemiesCount < wave.totalEnemies) {
      const timeSinceLastSpawn = currentTime - this.lastSpawnTime;

      if (timeSinceLastSpawn >= wave.spawnInterval) {
        this.spawnEnemy();
        this.lastSpawnTime = currentTime;
      }
    }

    // 检查特殊敌人生成
    if (wave.specialEnemies) {
      const waveElapsedTime = currentTime - this.waveStartTime;

      for (const specialEnemy of wave.specialEnemies) {
        // 如果指定了生成时间，并且时间已到
        if (specialEnemy.spawnTime !== undefined &&
            waveElapsedTime >= specialEnemy.spawnTime) {
          // 移除已处理的特殊敌人，避免重复生成
          const index = wave.specialEnemies.indexOf(specialEnemy);
          if (index !== -1) {
            wave.specialEnemies.splice(index, 1);

            // 生成特殊敌人
            for (let i = 0; i < specialEnemy.count; i++) {
              this.spawnSpecialEnemy(specialEnemy.type);
            }
          }
        }
      }
    }

    // 检查波次是否完成
    if (this.spawnedEnemiesCount >= wave.totalEnemies &&
        this.defeatedEnemiesCount >= wave.totalEnemies) {
      this.completeCurrentWave();
    }
  }

  /**
   * 获取当前波次信息
   * @returns 当前波次的详细信息
   */
  public getCurrentWaveInfo(): WaveInfo {
    const config = this.currentWaveIndex >= 0 && this.currentWaveIndex < this.waves.length
      ? this.waves[this.currentWaveIndex]
      : null;

    const totalEnemies = config ? config.totalEnemies : 0;
    const progress = totalEnemies > 0 ? this.defeatedEnemiesCount / totalEnemies : 0;
    const currentTime = Date.now();
    const elapsedTime = this.waveStartTime > 0 ? currentTime - this.waveStartTime : 0;

    return {
      index: this.currentWaveIndex,
      status: this.currentWaveStatus,
      config,
      spawnedCount: this.spawnedEnemiesCount,
      defeatedCount: this.defeatedEnemiesCount,
      progress,
      startTime: this.waveStartTime,
      elapsedTime,
      number: this.currentWaveIndex + 1 // 波次编号从1开始
    };
  }

  /**
   * 获取总波次数
   */
  public getTotalWaves(): number {
    return this.waves.length;
  }

  /**
   * 获取战斗进行时间（毫秒）
   */
  public getBattleElapsedTime(): number {
    return Date.now() - this.battleStartTime;
  }

  /**
   * 生成普通敌人
   */
  private spawnEnemy(): void {
    const wave = this.waves[this.currentWaveIndex];

    // 根据权重随机选择敌人类型
    const enemyTypes = wave.enemyTypes.map(e => e.type);
    const weights = wave.enemyTypes.map(e => e.weight);
    const selectedType = this.randomManager.weightedRandom(enemyTypes, weights);

    // 获取属性系数
    const attrFactors = wave.enemyTypes.find(e => e.type === selectedType)?.attrFactors || {};

    // 生成敌人
    this.spawnEnemyOfType(selectedType, attrFactors);

    // 更新计数
    this.spawnedEnemiesCount++;
  }

  /**
   * 生成特殊敌人
   * @param type 敌人类型
   */
  private spawnSpecialEnemy(type: string): void {
    // 特殊敌人通常有更高的属性系数
    const attrFactors = {
      hp: 2.0,
      attack: 1.5,
      defense: 1.5,
      speed: 1.2
    };

    // 生成敌人
    this.spawnEnemyOfType(type, attrFactors, true);

    // 更新计数（特殊敌人也计入总数）
    this.spawnedEnemiesCount++;
  }

  /**
   * 生成指定类型的敌人
   * @param type 敌人类型
   * @param attrFactors 属性系数
   * @param isSpecial 是否特殊敌人
   */
  private spawnEnemyOfType(
    type: string,
    attrFactors: { [key: string]: number | undefined } = {},
    isSpecial: boolean = false
  ): void {
    // 生成随机位置（在中心点周围的环形区域）
    const spawnPosition = this.generateRandomSpawnPosition();

    // 触发敌人生成事件
    this.eventManager.emit('enemySpawn', {
      type,
      position: spawnPosition,
      attrFactors,
      isSpecial,
      waveIndex: this.currentWaveIndex
    });

    logger.debug(`生成敌人: 类型=${type}, 位置=(${spawnPosition.x},${spawnPosition.y}), 特殊=${isSpecial}`);
  }

  /**
   * 生成随机生成位置
   */
  private generateRandomSpawnPosition(): Vector2D {
    // 随机角度（0-2π）
    const angle = this.randomManager.randomFloat(0, Math.PI * 2);

    // 随机距离（在指定范围内）
    const distance = this.randomManager.randomFloat(this.spawnRange.min, this.spawnRange.max);

    // 计算坐标
    const x = this.centerPosition.x + Math.cos(angle) * distance;
    const y = this.centerPosition.y + Math.sin(angle) * distance;

    return { x, y };
  }

  /**
   * 敌人被击败回调
   * @param enemyId 敌人ID
   */
  private onEnemyDefeated(enemyId: string): void {
    // 更新计数
    this.defeatedEnemiesCount++;

    const wave = this.waves[this.currentWaveIndex];
    logger.debug(`敌人被击败: ID=${enemyId}, 进度=${this.defeatedEnemiesCount}/${wave.totalEnemies}`);

    // 触发进度更新事件
    this.eventManager.emit('waveProgress', {
      waveIndex: this.currentWaveIndex,
      spawnedCount: this.spawnedEnemiesCount,
      defeatedCount: this.defeatedEnemiesCount,
      totalEnemies: wave.totalEnemies,
      progress: this.defeatedEnemiesCount / wave.totalEnemies
    });

    // 检查波次是否完成
    if (this.spawnedEnemiesCount >= wave.totalEnemies &&
        this.defeatedEnemiesCount >= wave.totalEnemies) {
      this.completeCurrentWave();
    }
  }

  /**
   * 完成当前波次
   */
  private completeCurrentWave(): void {
    // 更新状态
    this.currentWaveStatus = WaveStatus.COMPLETED;

    const wave = this.waves[this.currentWaveIndex];
    const waveEndTime = Date.now();
    const waveDuration = waveEndTime - this.waveStartTime;

    logger.info(`完成第${this.currentWaveIndex + 1}波: ${wave.name}, 用时: ${waveDuration}ms`);

    // 触发波次完成事件
    this.eventManager.emit('waveCompleted', {
      waveIndex: this.currentWaveIndex,
      waveName: wave.name,
      duration: waveDuration,
      time: waveEndTime
    });

    // 检查是否是最后一波
    const isLastWave = this.currentWaveIndex === this.waves.length - 1;

    if (isLastWave) {
      // 触发所有波次完成事件
      this.eventManager.emit('allWavesCompleted', {
        time: waveEndTime,
        totalWaves: this.waves.length,
        totalDuration: waveEndTime - this.battleStartTime
      });
    } else if (this.autoNextWave) {
      // 自动开始下一波（可能有延迟）
      const nextWave = this.waves[this.currentWaveIndex + 1];
      const delay = nextWave.delay || 3000; // 默认3秒延迟

      logger.debug(`将在${delay}ms后开始下一波`);

      // 使用setTimeout模拟延迟
      setTimeout(() => {
        this.startNextWave();
      }, delay);
    }
  }
}
