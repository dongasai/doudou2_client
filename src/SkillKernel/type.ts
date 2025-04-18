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
export type EffectType = 
    | 'dot'      // 持续伤害
    | 'hot'      // 持续治疗
    | 'buff'     // 增益效果
    | 'debuff'   // 减益效果
    | 'control'  // 控制效果
    | 'shield'   // 护盾效果
    | 'reflect'  // 伤害反弹
    | 'vampire'  // 吸血效果
    | 'taunt'    // 嘲讽效果
    | 'stealth'; // 隐身效果

/**
 * 属性类型枚举
 */
export type AttributeType = 'attack' | 'defense' | 'speed' | 'attack_speed' | 'accuracy';

/**
 * 控制类型枚举
 */
export type ControlType = 
    | 'stun'     // 眩晕
    | 'silence'  // 沉默
    | 'root'     // 定身
    | 'slow'     // 减速
    | 'fear'     // 恐惧
    | 'charm';   // 魅惑

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
    damageType?: 'physical' | 'magical' | 'pure';
    interval?: number; // 伤害间隔，默认为1秒
}

/**
 * 持续治疗效果
 */
export interface HotEffect extends BaseEffect {
    type: 'hot';
    interval?: number; // 治疗间隔，默认为1秒
}

/**
 * 增益效果
 */
export interface BuffEffect extends BaseEffect {
    type: 'buff';
    attribute: AttributeType;
    isPercentage?: boolean; // 是否为百分比加成
}

/**
 * 减益效果
 */
export interface DebuffEffect extends BaseEffect {
    type: 'debuff';
    attribute: AttributeType;
    isPercentage?: boolean; // 是否为百分比减益
}

/**
 * 控制效果
 */
export interface ControlEffect extends BaseEffect {
    type: 'control';
    controlType: ControlType;
    resistance?: number; // 控制抗性减免
}

/**
 * 护盾效果
 */
export interface ShieldEffect extends BaseEffect {
    type: 'shield';
    absorb: number; // 护盾值
    damageTypes?: Array<'physical' | 'magical' | 'pure'>; // 可以吸收的伤害类型
}

/**
 * 伤害反弹效果
 */
export interface ReflectEffect extends BaseEffect {
    type: 'reflect';
    percentage: number; // 反弹伤害百分比
    maxReflect?: number; // 最大反弹伤害
}

/**
 * 吸血效果
 */
export interface VampireEffect extends BaseEffect {
    type: 'vampire';
    percentage: number; // 吸血百分比
    maxHeal?: number; // 单次最大吸血量
}

/**
 * 嘲讽效果
 */
export interface TauntEffect extends BaseEffect {
    type: 'taunt';
    radius?: number; // 嘲讽范围
}

/**
 * 隐身效果
 */
export interface StealthEffect extends BaseEffect {
    type: 'stealth';
    revealDistance?: number; // 被发现距离
    canAttack?: boolean; // 是否可以在隐身状态下攻击
}

/**
 * 技能效果类型
 */
export type SkillEffect = 
    | DotEffect 
    | HotEffect 
    | BuffEffect 
    | DebuffEffect 
    | ControlEffect 
    | ShieldEffect 
    | ReflectEffect 
    | VampireEffect 
    | TauntEffect 
    | StealthEffect;

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