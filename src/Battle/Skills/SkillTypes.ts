/**
 * 技能系统类型定义
 * 包含技能相关的枚举、接口和类型
 */

import { Entity } from '../Entities/Entity';
import { Vector2D } from '../Types/Vector2D';

// 技能类型
export enum SkillType {
  DAMAGE = 'damage',       // 伤害技能
  HEAL = 'heal',           // 治疗技能
  BUFF = 'buff',           // 增益技能
  DEBUFF = 'debuff',       // 减益技能
  CONTROL = 'control',     // 控制技能
  SUMMON = 'summon',       // 召唤技能
  MOVEMENT = 'movement',   // 移动技能
  SPECIAL = 'special'      // 特殊技能
}

// 目标类型
export enum TargetType {
  SINGLE = 'single',       // 单体目标
  MULTIPLE = 'multiple',   // 多个目标
  AREA = 'area',           // 区域目标
  SELF = 'self',           // 自身
  ALLY = 'ally',           // 友方
  ENEMY = 'enemy'          // 敌方
}

// 技能效果类型
export enum EffectType {
  DAMAGE = 'damage',       // 伤害效果
  HEAL = 'heal',           // 治疗效果
  DOT = 'dot',             // 持续伤害
  HOT = 'hot',             // 持续治疗
  BUFF = 'buff',           // 增益效果
  DEBUFF = 'debuff',       // 减益效果
  CONTROL = 'control',     // 控制效果
  SUMMON = 'summon',       // 召唤效果
  MOVEMENT = 'movement',   // 移动效果
  SPECIAL = 'special'      // 特殊效果
}

// 技能配置接口
export interface SkillConfig {
  id: string;              // 技能ID
  name: string;            // 技能名称
  type: SkillType;         // 技能类型
  targetType: TargetType;  // 目标类型
  cooldown: number;        // 冷却时间（毫秒）
  range?: number;          // 射程（像素）
  duration?: number;       // 持续时间（毫秒）
  baseDamage?: number;     // 基础伤害
  baseHeal?: number;       // 基础治疗
  criticalRate?: number;   // 暴击率
  criticalMultiplier?: number; // 暴击倍率
  cost?: number;           // 消耗（魔法值等）
  areaRadius?: number;     // 区域半径
  maxTargets?: number;     // 最大目标数
  effects?: {              // 技能效果
    [key: string]: {
      type: EffectType;
      value?: number;
      duration?: number;
      interval?: number;
      attribute?: string;
      controlType?: string;
      [key: string]: any;
    }
  };
  [key: string]: any;      // 其他自定义属性
}

// 技能实例接口
export interface Skill {
  config: SkillConfig;     // 技能配置
  owner: Entity;           // 技能拥有者
  level: number;           // 技能等级
  currentCooldown: number; // 当前冷却时间
  lastCastTime: number;    // 上次释放时间
  isAvailable: boolean;    // 是否可用
}

// 技能释放结果
export interface SkillCastResult {
  success: boolean;        // 是否成功释放
  skillId: string;         // 技能ID
  caster: Entity;          // 施法者
  targets: Entity[];       // 目标列表
  position?: Vector2D;     // 目标位置
  effects: {               // 效果列表
    type: EffectType;
    target: Entity;
    value: number;
    isCritical?: boolean;
  }[];
  failReason?: string;     // 失败原因
}

// 技能效果接口
export interface SkillEffect {
  id: string;              // 效果ID
  type: EffectType;        // 效果类型
  source: Entity;          // 效果来源
  target: Entity;          // 效果目标
  skillId: string;         // 技能ID
  value: number;           // 效果值
  duration: number;        // 持续时间
  interval?: number;       // 触发间隔
  lastTickTime: number;    // 上次触发时间
  startTime: number;       // 开始时间
  attribute?: string;      // 影响属性
  controlType?: string;    // 控制类型
  originalValue?: number;  // 原始值
  [key: string]: any;      // 其他属性
}

// 技能效果简略信息
export interface SkillEffectInfo {
  id: string;              // 效果ID
  type: EffectType;        // 效果类型
  sourceId: string;        // 效果来源ID
  skillId: string;         // 技能ID
  value: number;           // 效果值
  duration: number;        // 持续时间
  remainingTime: number;   // 剩余时间
}
