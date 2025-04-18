/**
 * 技能类型
 */
export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff' | 'control';

/**
 * 目标类型
 */
export type TargetType = 'single' | 'multiple' | 'area' | 'self';

/**
 * 效果类型
 */
export type EffectType = 'dot' | 'hot' | 'buff' | 'debuff' | 'control';

/**
 * 属性类型
 */
export type AttributeType = 'attack' | 'defense' | 'speed' | 'attack_speed' | 'accuracy';

/**
 * 基础技能配置
 */
export interface BaseSkillConfig {
    /** 技能ID */
    id: string;
    /** 技能名称 */
    name: string;
    /** 技能类型 */
    type: SkillType;
    /** 目标类型 */
    targetType: TargetType;
    /** 技能范围 */
    range: number;
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 持续时间(毫秒) */
    duration?: number;
    /** 基础伤害 */
    baseDamage?: number;
    /** 基础治疗 */
    baseHeal?: number;
    /** 效果值 */
    effectValue?: number;
    /** 暴击率 */
    criticalRate?: number;
    /** 暴击倍率 */
    criticalMultiplier?: number;
    /** 穿透值 */
    penetration?: number;
    /** 技能图标 */
    emoji: string;
    /** 技能描述 */
    description: string;
    /** 当前等级 */
    level: number;
    /** 最大等级 */
    maxLevel: number;
} 