import { BattleBean, BattleHero } from '../battle/types';

/**
 * 战斗事件类型定义
 */
export type BattleEventType =
    | 'battle_started'
    | 'battle_paused'
    | 'battle_resumed'
    | 'damage_dealt'
    | 'hero_died'
    | 'bean_defeated'
    | 'bean_spawned'
    | 'wave_complete'
    | 'game_over';

/**
 * 伤害事件数据
 */
export interface DamageEventData {
    /** 伤害来源 */
    source: BattleHero | BattleBean;
    /** 伤害目标 */
    target: BattleHero | BattleBean;
    /** 伤害值 */
    damage: number;
    /** 是否暴击 */
    isCritical: boolean;
}

/**
 * 游戏结束事件数据
 */
export interface GameOverEventData {
    /** 是否胜利 */
    victory: boolean;
    /** 结束原因 */
    reason: 'all_heroes_died' | 'crystal_destroyed' | 'all_beans_defeated';
}

/**
 * 事件管理器
 * 负责管理游戏中的事件派发和监听
 */
export class EventManager {
    private static instance: EventManager;
    private listeners: Map<BattleEventType, Function[]>;

    private constructor() {
        this.listeners = new Map();
    }

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    /**
     * 注册事件监听器
     * @param event 事件类型
     * @param callback 回调函数
     */
    public on(event: BattleEventType, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    /**
     * 移除事件监听器
     * @param event 事件类型
     * @param callback 回调函数
     */
    public off(event: BattleEventType, callback: Function): void {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event)!;
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * 触发事件
     * @param event 事件类型
     * @param data 事件数据
     */
    public emit(event: BattleEventType, data: any): void {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event)!;
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * 清除所有事件监听器
     */
    public clear(): void {
        this.listeners.clear();
    }
}
