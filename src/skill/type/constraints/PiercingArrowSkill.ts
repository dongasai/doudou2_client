/**
 * 穿透箭技能生成约束接口
 * 仅包含技能生成所需的fixedParams和adjustableParams
 */
export interface PiercingArrowSkill {
    /* 固定参数(必选) */
    /** 冷却回合数 */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /* 可调整参数(可选) */
    /** 攻击范围 */ 
    range?: number;
    /** 最大连锁目标数 */
    maxTargets?: number;
    /** 流血伤害值 */
    bleedValue?: number;

    /* 核心参数 */
    /** 技能唯一标识 */
    id: string;
}