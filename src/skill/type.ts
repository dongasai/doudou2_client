/**
 * 技能类型枚举
 */
export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff' | 'control';

/**
 * 目标类型枚举
 */
export type TargetType = 'single' | 'multiple' | 'area' | 'self';

/**
 * 效果类型枚举
 */
export type EffectType = 'dot' | 'hot' | 'buff' | 'debuff' | 'control';

/**
 * 属性类型枚举
 */
export type AttributeType = 'attack' | 'defense' | 'speed' | 'attack_speed' | 'accuracy';

/**
 * 基础效果接口
 */
export interface BaseEffect {
    type: EffectType;
    duration: number;
    value: number;
}

/**
 * 持续伤害效果
 */
export interface DotEffect extends BaseEffect {
    type: 'dot';
}

/**
 * 持续治疗效果
 */
export interface HotEffect extends BaseEffect {
    type: 'hot';
}

/**
 * 增益效果
 */
export interface BuffEffect extends BaseEffect {
    type: 'buff';
    attribute: AttributeType;
}

/**
 * 减益效果
 */
export interface DebuffEffect extends BaseEffect {
    type: 'debuff';
    attribute: AttributeType;
}

/**
 * 控制效果
 */
export interface ControlEffect extends BaseEffect {
    type: 'control';
}

/**
 * 技能效果类型
 */
export type SkillEffect = DotEffect | HotEffect | BuffEffect | DebuffEffect | ControlEffect;

/**
 * 技能升级接口
 */
export interface SkillUpgrade {
    level: number;
    cost: number;
    damage?: number;
    cooldown?: number;
    range?: number;
}

/**
 * 连锁效果接口
 */
export interface ChainEffect {
    maxTargets: number;
    damageReduction: number;
}

/**
 * 技能配置接口
 */
export interface SkillConfig {
    id: string;
    name: string;
    type: SkillType;
    targetType: TargetType;
    description: string;
    range: number;
    cooldown: number;
    level: number;
    maxLevel: number;
    effects?: Record<string, SkillEffect>;
    upgrades?: SkillUpgrade[];
    chainEffect?: ChainEffect;
} 