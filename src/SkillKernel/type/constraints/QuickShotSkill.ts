/**
 * 快速射击技能详细配置接口
 */
export interface QuickShotSkill {
    /** 冷却时间(毫秒) */
    cooldown: number;
    /** 技能消耗 */
    cost: number;

    /** 基础伤害值 */
    baseDamage?: number;
    /** 暴击概率(0-1) */
    criticalRate?: number;
    /** 暴击伤害倍率 */
    criticalMultiplier?: number;
    /** 有效射程 */
    range?: number;

    /** 技能唯一标识 */
    id: string;
}