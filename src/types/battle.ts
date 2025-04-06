import { HeroBaseStats } from './Hero';

/**
 * 英雄战斗数据
 */
export interface HeroData {
    /** 英雄ID */
    id: number;
    /** 英雄类型 */
    type: string;
    /** 英雄名称 */
    name: string;
    /** 当前生命值 */
    health: number;
    /** 最大生命值 */
    maxHealth: number;
    /** 当前属性 */
    stats: HeroBaseStats;
    /** 位置 */
    position: {
        x: number;
        y: number;
    };
}

/**
 * 豆豆战斗数据
 */
export interface BeanData {
    /** 豆豆ID */
    id: number;
    /** 豆豆类型 */
    type: string;
    /** 当前生命值 */
    health: number;
    /** 最大生命值 */
    maxHealth: number;
    /** 攻击力 */
    attack: number;
    /** 防御力 */
    defense: number;
    /** 位置 */
    position: {
        x: number;
        y: number;
    };
}

/**
 * 水晶战斗数据
 */
export interface CrystalData {
    /** 当前生命值 */
    health: number;
    /** 最大生命值 */
    maxHealth: number;
    /** 位置 */
    position: {
        x: number;
        y: number;
    };
}

/**
 * 战斗事件数据
 */
export interface BattleEventData {
    /** 战斗开始事件 */
    battle_started: null;
    /** 战斗暂停事件 */
    battle_paused: null;
    /** 战斗恢复事件 */
    battle_resumed: null;
    /** 伤害事件 */
    damage_dealt: {
        /** 伤害来源ID */
        sourceId: number;
        /** 目标ID */
        targetId: number | 'crystal';
        /** 伤害值 */
        damage: number;
        /** 目标当前生命值 */
        currentHealth: number;
    };
    /** 英雄死亡事件 */
    hero_died: {
        /** 英雄ID */
        heroId: number;
        /** 击杀者ID */
        killerId: number;
    };
    /** 豆豆被击败事件 */
    bean_defeated: {
        /** 豆豆ID */
        beanId: number;
        /** 击杀者ID */
        killerId: number;
    };
    /** 波次完成事件 */
    wave_complete: null;
    /** 游戏结束事件 */
    game_over: {
        /** 是否胜利 */
        victory: boolean;
        /** 结束原因 */
        reason: 'all_heroes_died' | 'crystal_destroyed' | 'victory_condition_met';
    };
} 