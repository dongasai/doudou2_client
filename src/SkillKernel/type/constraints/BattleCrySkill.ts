/**
 * 战吼技能生成约束接口
 * 仅包含技能生成所需的fixedParams和adjustableParams
 */
export interface BattleCrySkill {
    /* 固定参数(必选) */
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /* 可调整参数(可选) */
    /** 作用范围(坐标单位) */
    range?: number;
    /** 攻击力提升值 */
    attackBoost?: number;
    /** 防御力提升值 */
    defenseBoost?: number;
    /** 持续时间(毫秒) */
    duration?: number;

    /* 核心参数 */
    /** 技能唯一标识 */
    id: string;
}