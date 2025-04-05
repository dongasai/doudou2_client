import type { Skill } from './Skill';

/**
 * 英雄职业类型
 * 定义游戏中英雄的基础职业分类
 */
export type HeroType = '战士' | '法师' | '射手' | '辅助' | '刺客';

/**
 * 技能效果类型
 * 定义技能可以产生的各种效果
 */
export type SkillType = '伤害' | '治疗' | '控制' | '增益' | '减益' | '召唤' | '位移' | '特殊';

/**
 * 基础属性接口
 * 描述战斗单位的基础战斗属性
 */
export interface Stats {
    /** 生命值 - 单位的总血量 */
    hp: number;
    /** 攻击力 - 基础伤害值 */
    attack: number;
    /** 防御力 - 伤害减免值 */
    defense: number;
    /** 速度 - 决定行动顺序 */
    speed: number;
}

/**
 * 战斗状态属性接口
 * 扩展基础属性，包含战斗中的临时状态
 */
export interface BattleStats extends Stats {
    /** 当前等级 */
    level: number;
    /** 当前经验值 */
    exp: number;
    /** 持有金币数 */
    gold: number;
    /** 装备的物品ID列表 */
    equippedItems: string[];
    /** 已学习技能的ID列表 */
    learnedSkills: number[];
}

/**
 * 英雄基础信息接口
 * 描述英雄角色的完整配置
 */
export interface Hero {
    /** 英雄唯一ID */
    id: number;
    /** 英雄名称 */
    name: string;
    /** 英雄表情符号 */
    emoji: string;
    /** 英雄职业类型 */
    type: HeroType;
    /** 成长类型 - 特长型/均衡型 */
    style: '特长型' | '均衡型';
    /** 特长描述 */
    specialty: string;
    /** 拥有的技能列表 */
    skills: Skill[];
    /** 基础属性 */
    stats?: Stats;
    /** 战斗临时状态(可选) */
    battleStats?: BattleStats;
}

/**
 * 英雄列表接口
 * 包含多个英雄的集合
 */
export interface HeroesList {
    /** 英雄数组 */
    heroes: Hero[];
}
