/**
 * 治疗技能生成约束接口
 * 仅包含技能生成所需的fixedParams和adjustableParams
 */
export interface HealSkill {
    /* 固定参数(必选) */
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /* 可调整参数(可选) */
    /** 治疗量 */
    healAmount?: number;
    /** 作用范围(像素) */
    range?: number;
    /** 持续时间(毫秒) */
    duration?: number;
    /** 持续治疗量 */
    hotAmount?: number;

    /* 核心参数 */
    /** 技能唯一标识 */
    id: string;
}