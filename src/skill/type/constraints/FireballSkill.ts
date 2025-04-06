/**
 * 火球术技能生成约束接口
 * 仅包含技能生成所需的fixedParams和adjustableParams
 */
export interface FireballSkill {
    /* 固定参数(必选) */
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /* 可调整参数(可选) */
    /** 射程范围 */
    range?: number;
    /** 基础伤害值 */
    baseDamage?: number;
    /** 燃烧伤害值 */
    burnDamage?: number;
    /** 燃烧持续时间(毫秒) */
    burnDuration?: number;

    /* 核心参数 */
    /** 技能唯一标识 */
    id: string;
}