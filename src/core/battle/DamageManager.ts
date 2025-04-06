import { EventManager, DamageEventData } from '../EventManager';
import { BattleHero, BattleBean } from './types';

/**
 * 伤害管理器
 * 负责处理战斗中的伤害计算和效果
 */
export class DamageManager {
    private static instance: DamageManager;
    private eventManager: EventManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
    }

    public static getInstance(): DamageManager {
        if (!DamageManager.instance) {
            DamageManager.instance = new DamageManager();
        }
        return DamageManager.instance;
    }

    /**
     * 处理伤害事件
     * @param data 伤害事件数据
     */
    public handleDamage(data: DamageEventData): void {
        const { source, target, damage, isCritical } = data;

        // 计算实际伤害
        const actualDamage = this.calculateDamage(source, target, damage, isCritical);

        // 应用伤害
        this.applyDamage(target, actualDamage);

        // 检查目标是否死亡
        this.checkDeath(target);
    }

    /**
     * 计算实际伤害
     * @param source 伤害来源
     * @param target 伤害目标
     * @param baseDamage 基础伤害
     * @param isCritical 是否暴击
     */
    private calculateDamage(
        source: BattleHero | BattleBean,
        target: BattleHero | BattleBean,
        baseDamage: number,
        isCritical: boolean
    ): number {
        // 基础伤害计算
        let damage = baseDamage * (source.stats.attack / 100);

        // 防御减伤
        const damageReduction = target.stats.defense / (target.stats.defense + 100);
        damage *= (1 - damageReduction);

        // 暴击加成
        if (isCritical) {
            damage *= 1.5;
        }

        // 确保伤害至少为1
        return Math.max(1, Math.floor(damage));
    }

    /**
     * 应用伤害到目标
     * @param target 伤害目标
     * @param damage 伤害值
     */
    private applyDamage(target: BattleHero | BattleBean, damage: number): void {
        target.currentHp = Math.max(0, target.currentHp - damage);
    }

    /**
     * 检查目标是否死亡
     * @param target 检查目标
     */
    private checkDeath(target: BattleHero | BattleBean): void {
        if (target.currentHp <= 0) {
            // 根据目标类型触发不同的死亡事件
            if (this.isHero(target)) {
                this.eventManager.emit('hero_died', target.id);
            } else {
                this.eventManager.emit('bean_defeated', target.id);
            }
        }
    }

    /**
     * 判断目标是否为英雄
     * @param target 判断目标
     */
    private isHero(target: BattleHero | BattleBean): target is BattleHero {
        return 'level' in target;
    }
} 