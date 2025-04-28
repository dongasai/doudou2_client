/**
 * 事件数据类型定义
 * 定义所有事件的数据结构
 */

import { BattleResult } from '../Core/BattleManager';
import { EntityStats } from '../Entities/Entity';
import { Vector2D } from './Vector2D';
import { BattleInitParams } from '../../DesignConfig/types/BattleInitParams';

/**
 * 战斗开始事件数据
 */
export interface BattleStartEventData {
  /** 事件发生时间 */
  time: number;
  /** 战斗初始化参数 */
  params: BattleInitParams | null;
  /** 随机种子 */
  seed: number;
}

/**
 * 战斗暂停事件数据
 */
export interface BattlePauseEventData {
  /** 事件发生时间 */
  time: number;
}

/**
 * 战斗恢复事件数据
 */
export interface BattleResumeEventData {
  /** 事件发生时间 */
  time: number;
}

/**
 * 战斗结束事件数据
 */
export interface BattleEndEventData {
  /** 事件发生时间 */
  time: number;
  /** 战斗结果 */
  result: BattleResult;
  /** 战斗持续时间 */
  duration: number;
  /** 战斗统计数据 */
  stats: any;
}

/**
 * 游戏结束事件数据
 */
export interface GameOverEventData {
  /** 战斗结果 */
  result: BattleResult;
  /** 事件发生时间 */
  time: number;
  /** 战斗持续时间 */
  duration: number;
  /** 战斗统计数据 */
  stats: any;
}

/**
 * 实体创建事件数据
 */
export interface EntityCreatedEventData {
  /** 实体ID */
  id: string;
  /** 实体类型 */
  type: string;
  /** 实体位置 */
  position: Vector2D;
  /** 实体属性 */
  stats: EntityStats;
}

/**
 * 实体死亡事件数据
 */
export interface EntityDeathEventData {
  /** 死亡的实体 */
  entity: {
    id: string;
    type: string;
    position: Vector2D;
  };
  /** 击杀者ID（可选） */
  killerId?: string;
  /** 事件发生时间 */
  time: number;
}

/**
 * 伤害事件数据
 */
export interface DamageDealtEventData {
  /** 伤害来源 */
  source?: {
    id: string;
    type: string;
  };
  /** 伤害目标 */
  target: {
    id: string;
    type: string;
  };
  /** 原始伤害量 */
  originalAmount: number;
  /** 实际伤害量 */
  actualAmount: number;
  /** 伤害类型 */
  damageType: string;
  /** 是否暴击 */
  isCritical: boolean;
  /** 事件发生时间 */
  time: number;
}

/**
 * 敌人生成事件数据
 */
export interface EnemySpawnEventData {
  /** 敌人类型 */
  type: string;
  /** 生成位置 */
  position: Vector2D;
  /** 属性系数 */
  attrFactors: { [key: string]: number | undefined };
  /** 是否特殊敌人 */
  isSpecial: boolean;
  /** 波次索引 */
  waveIndex: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 波次开始事件数据
 */
export interface WaveStartEventData {
  /** 波次索引 */
  waveIndex: number;
  /** 波次名称 */
  waveName: string;
  /** 敌人总数 */
  totalEnemies: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 波次进度事件数据
 */
export interface WaveProgressEventData {
  /** 波次索引 */
  waveIndex: number;
  /** 已生成敌人数量 */
  spawnedCount: number;
  /** 已击败敌人数量 */
  defeatedCount: number;
  /** 敌人总数 */
  totalEnemies: number;
  /** 进度（0-1） */
  progress: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 波次完成事件数据
 */
export interface WaveCompletedEventData {
  /** 波次索引 */
  waveIndex: number;
  /** 波次名称 */
  waveName: string;
  /** 持续时间 */
  duration: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 所有波次完成事件数据
 */
export interface AllWavesCompletedEventData {
  /** 事件发生时间 */
  time: number;
  /** 总波次数 */
  totalWaves: number;
  /** 总持续时间 */
  totalDuration?: number;
}

/**
 * 技能施放事件数据
 */
export interface SkillCastEventData {
  /** 施放者ID */
  casterId: string;
  /** 技能ID */
  skillId: string;
  /** 目标ID（可选） */
  targetId?: string;
  /** 目标位置（可选） */
  targetPosition?: Vector2D;
  /** 事件发生时间 */
  time: number;
}

/**
 * 技能效果事件数据
 */
export interface SkillEffectEventData {
  /** 技能ID */
  skillId: string;
  /** 效果类型 */
  effectType: string;
  /** 效果位置 */
  position: Vector2D;
  /** 影响的实体IDs */
  affectedEntityIds: string[];
  /** 事件发生时间 */
  time: number;
}
