import { SkillEffects } from './effect';

/**
 * 技能升级配置
 */
export interface SkillUpgrade {
    /** 升级等级 */
    level: number;
    /** 升级消耗 */
    cost: number;
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
    /** 冷却时间 */
    cooldown?: number;
    /** 持续时间 */
    duration?: number;
    /** 解锁的新效果 */
    effects?: SkillEffects;
}

/**
 * 技能升级列表
 */
export type SkillUpgrades = SkillUpgrade[]; 