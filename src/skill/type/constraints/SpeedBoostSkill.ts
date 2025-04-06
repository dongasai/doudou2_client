/**
 * 速度提升技能生成约束接口
 * 仅包含技能生成所需的fixedParams和adjustableParams
 */
export interface SpeedBoostSkill {
    /* 固定参数(必选) */
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /* 可调整参数(可选) */
    /** 作用范围(像素) */
    range?: number;
    /** 速度提升值(百分比) */
    speedBoost?: number;
    /** 持续时间(毫秒) */
    duration?: number;
    /** 移动速度提升值(百分比) */
    moveSpeedBoost?: number;

    /* 核心参数 */
    /** 技能唯一标识 */
    id: string;
}