import { AttributeType, EffectType } from './BaseSkillConfig';

/**
 * 基础效果配置
 */
export interface BaseEffect {
    /** 效果类型 */
    type: EffectType;
    /** 持续时间 */
    duration: number;
}

/**
 * 伤害持续效果
 */
export interface DotEffect extends BaseEffect {
    type: 'dot';
    /** 伤害值 */
    damage: number;
    /** 伤害间隔 */
    interval: number;
}

/**
 * 治疗持续效果
 */
export interface HotEffect extends BaseEffect {
    type: 'hot';
    /** 治疗值 */
    heal: number;
    /** 治疗间隔 */
    interval: number;
}

/**
 * 属性增益效果
 */
export interface BuffEffect extends BaseEffect {
    type: 'buff';
    /** 影响的属性 */
    attribute: AttributeType;
    /** 增益值 */
    value: number;
}

/**
 * 属性减益效果
 */
export interface DebuffEffect extends BaseEffect {
    type: 'debuff';
    /** 影响的属性 */
    attribute: AttributeType;
    /** 减益值 */
    value: number;
}

/**
 * 控制效果
 */
export interface ControlEffect extends BaseEffect {
    type: 'control';
    /** 触发概率 */
    chance?: number;
}

/**
 * 效果配置
 */
export type SkillEffect = DotEffect | HotEffect | BuffEffect | DebuffEffect | ControlEffect;

/**
 * 技能效果集合
 */
export interface SkillEffects {
    [key: string]: SkillEffect;
}
