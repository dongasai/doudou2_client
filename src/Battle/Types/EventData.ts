/**
 * 事件数据类型定义
 * 定义所有事件的数据结构
 */

import { BattleResult } from '../Core/BattleManager';
import { EntityStats } from '../Entities/Entity';
import { Vector2D } from './Vector2D';
import { BattleInitParams } from '../../DesignConfig/BattleInitParams';
import { BeanState } from '../Entities/Bean';
import { CrystalState } from '../Entities/Crystal';
import { EffectType, ControlType } from '../../SkillKernel/type';

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
  /** 实体类型字符串（用于视图层） */
  entityType?: string;
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

/**
 * 实体移动事件数据
 */
export interface EntityMovedEventData {
  /** 实体ID */
  entityId: string;
  /** 实体类型 */
  entityType: string;
  /** 原始位置 */
  fromPosition: Vector2D;
  /** 目标位置 */
  toPosition: Vector2D;
  /** 移动速度 */
  speed: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 实体状态变化事件数据
 */
export interface EntityStateChangedEventData {
  /** 实体ID */
  entityId: string;
  /** 实体类型 */
  entityType: string;
  /** 原始状态 */
  fromState: string;
  /** 新状态 */
  toState: string;
  /** 状态变化原因 */
  reason?: string;
  /** 事件发生时间 */
  time: number;
}

/**
 * 豆豆状态变化事件数据
 */
export interface BeanStateChangedEventData extends EntityStateChangedEventData {
  /** 原始状态 */
  fromState: BeanState;
  /** 新状态 */
  toState: BeanState;
}

/**
 * 水晶状态变化事件数据
 */
export interface CrystalStateChangedEventData extends EntityStateChangedEventData {
  /** 原始状态 */
  fromState: CrystalState;
  /** 新状态 */
  toState: CrystalState;
  /** 当前生命值百分比 */
  healthPercentage: number;
}

/**
 * 实体属性变化事件数据
 */
export interface EntityStatsChangedEventData {
  /** 实体ID */
  entityId: string;
  /** 实体类型 */
  entityType: string;
  /** 变化的属性 */
  changedStats: Partial<EntityStats>;
  /** 变化原因 */
  reason?: string;
  /** 事件发生时间 */
  time: number;
}

/**
 * 技能冷却更新事件数据
 */
export interface SkillCooldownUpdateEventData {
  /** 拥有者ID */
  ownerId: string;
  /** 技能ID */
  skillId: string;
  /** 当前冷却时间（毫秒） */
  currentCooldown: number;
  /** 最大冷却时间（毫秒） */
  maxCooldown: number;
  /** 冷却进度（0-1） */
  progress: number;
  /** 是否可用 */
  isReady: boolean;
  /** 事件发生时间 */
  time: number;
}

/**
 * Buff应用事件数据
 */
export interface BuffAppliedEventData {
  /** 目标实体ID */
  targetId: string;
  /** 目标实体类型 */
  targetType: string;
  /** 来源实体ID */
  sourceId?: string;
  /** Buff ID */
  buffId: string;
  /** Buff类型 */
  buffType: EffectType;
  /** 持续时间（毫秒） */
  duration: number;
  /** 效果值 */
  value: number;
  /** 是否可叠加 */
  isStackable: boolean;
  /** 叠加层数 */
  stacks: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * Buff移除事件数据
 */
export interface BuffRemovedEventData {
  /** 目标实体ID */
  targetId: string;
  /** 目标实体类型 */
  targetType: string;
  /** Buff ID */
  buffId: string;
  /** Buff类型 */
  buffType: EffectType;
  /** 移除原因 */
  reason: 'expired' | 'dispelled' | 'death' | 'replaced' | 'other';
  /** 事件发生时间 */
  time: number;
}

/**
 * 控制效果应用事件数据
 */
export interface ControlEffectAppliedEventData {
  /** 目标实体ID */
  targetId: string;
  /** 目标实体类型 */
  targetType: string;
  /** 来源实体ID */
  sourceId?: string;
  /** 控制效果ID */
  effectId: string;
  /** 控制类型 */
  controlType: ControlType;
  /** 持续时间（毫秒） */
  duration: number;
  /** 事件发生时间 */
  time: number;
}

/**
 * 控制效果移除事件数据
 */
export interface ControlEffectRemovedEventData {
  /** 目标实体ID */
  targetId: string;
  /** 目标实体类型 */
  targetType: string;
  /** 控制效果ID */
  effectId: string;
  /** 控制类型 */
  controlType: ControlType;
  /** 移除原因 */
  reason: 'expired' | 'dispelled' | 'death' | 'other';
  /** 事件发生时间 */
  time: number;
}
