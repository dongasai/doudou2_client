/**
 * 连锁效果配置
 */
export interface ChainEffect {
    /** 最大目标数 */
    maxTargets: number;
    /** 每次连锁的伤害衰减 */
    damageReduction: number;
} 