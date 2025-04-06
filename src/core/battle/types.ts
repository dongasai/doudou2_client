import type { BaseStats } from '../../types/BaseStats';
import type { Skill } from '../../types/Skill';

/**
 * 战斗中的豆豆实体
 */
export interface BattleBean {
    /** 实例ID */
    id: number;
    /** 豆豆类型 */
    type: string;
    /** 显示名称 */
    name: string;
    /** 当前生命值 */
    currentHp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 战斗属性 */
    stats: BaseStats;
    /** 技能 */
    skill: Skill;
    /** 当前位置 */
    position: {
        x: number;
        y: number;
    };
}

/**
 * 战斗中的英雄实体
 */
export interface BattleHero {
    /** 实例ID */
    id: number;
    /** 英雄类型 */
    type: string;
    /** 显示名称 */
    name: string;
    /** 当前生命值 */
    currentHp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 战斗属性 */
    stats: BaseStats;
    /** 已学习的技能列表 */
    skills: Skill[];
    /** 当前位置 */
    position: {
        x: number;
        y: number;
    };
    /** 当前等级 */
    level: number;
    /** 当前经验值 */
    exp: number;
    /** 持有金币 */
    gold: number;
}

/**
 * 战斗中的水晶实体
 */
export interface BattleCrystal {
    /** 实例ID */
    id: number;
    /** 显示名称 */
    name: string;
    /** 当前生命值 */
    currentHp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 战斗属性 */
    stats: BaseStats;
    /** 当前位置 */
    position: {
        x: number;
        y: number;
    };
    /** 防御加成 */
    defenseBonus: number;
} 