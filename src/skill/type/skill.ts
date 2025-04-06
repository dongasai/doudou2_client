import { BaseSkillConfig } from './base';
import { ChainEffect } from './chain';
import { SkillEffects } from './effect';
import { SkillUpgrades } from './upgrade';

/**
 * 完整的技能配置
 */
export interface SkillConfig extends BaseSkillConfig {
    /** 技能效果 */
    effects?: SkillEffects;
    /** 连锁效果 */
    chainEffect?: ChainEffect;
    /** 升级配置 */
    upgrades: SkillUpgrades;
}

/**
 * 技能实例
 */
export interface Skill {
    /** 技能配置 */
    config: SkillConfig;
    /** 当前冷却时间 */
    currentCooldown: number;
    /** 是否可用 */
    isAvailable: boolean;
    /** 当前等级 */
    level: number;
}

/**
 * 技能分类
 */
export type SkillCategory = 'mage' | 'warrior' | 'archer' | 'support' | 'control'; 