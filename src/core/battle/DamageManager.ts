import { EventManager } from './EventManager';

/**
 * 伤害管理器
 * 负责处理战斗中的伤害计算和应用
 */
export class DamageManager {
    private static instance: DamageManager;
    private eventManager: EventManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.setupEventListeners();
    }

    public static getInstance(): DamageManager {
        if (!DamageManager.instance) {
            DamageManager.instance = new DamageManager();
        }
        return DamageManager.instance;
    }

    private setupEventListeners() {
        this.eventManager.on('damageRequest', this.handleDamageRequest.bind(this));
    }

    /**
     * 处理伤害请求
     */
    private handleDamageRequest(data: {
        target: any;
        amount: number;
        source: string;
        skillId?: number;
    }) {
        const { target, amount, source, skillId } = data;
        
        // 计算最终伤害
        const finalDamage = this.calculateDamage(amount, target);
        
        // 发出伤害事件
        this.eventManager.emit('damageDealt', {
            target,
            amount: finalDamage,
            source,
            skillId
        });
    }

    /**
     * 计算伤害值
     * 考虑目标防御力和其他减伤效果
     */
    private calculateDamage(baseDamage: number, target: any): number {
        let finalDamage = baseDamage;

        // 如果目标有防御属性
        if (target.defense) {
            // 防御减伤公式：实际伤害 = 基础伤害 * (100 / (100 + 防御))
            finalDamage = baseDamage * (100 / (100 + target.defense));
        }

        // 如果目标有减伤效果
        if (target.damageReduction) {
            finalDamage *= (1 - target.damageReduction);
        }

        // 确保伤害不小于1
        return Math.max(1, Math.round(finalDamage));
    }

    /**
     * 处理伤害
     * @param targetType - 目标类型
     * @param targetId - 目标ID
     * @param damage - 伤害值
     * @param currentHealth - 当前生命值
     * @param defense - 防御力
     */
    public handleDamage(params: {
        targetType: 'hero' | 'bean' | 'crystal',
        targetId: string,
        damage: number,
        currentHealth: number,
        defense?: number
    }): number {
        const { targetType, targetId, damage, currentHealth, defense = 0 } = params;
        
        // 计算实际伤害
        const actualDamage = Math.max(0, damage - defense);
        const newHealth = Math.max(0, currentHealth - actualDamage);

        // 发出伤害事件
        this.eventManager.emit('damageDealt', {
            targetType,
            targetId,
            damage: actualDamage,
            currentHealth: newHealth
        });

        // 如果生命值降为0，发出死亡事件
        if (newHealth <= 0) {
            this.handleDeath(targetType, targetId);
        }

        return newHealth;
    }

    /**
     * 处理死亡
     * @param targetType - 目标类型
     * @param targetId - 目标ID
     */
    private handleDeath(targetType: 'hero' | 'bean' | 'crystal', targetId: string): void {
        switch(targetType) {
            case 'hero':
                this.eventManager.emit('heroDied', { heroId: targetId });
                break;
            case 'bean':
                this.eventManager.emit('beanDefeated', { beanId: targetId });
                break;
            case 'crystal':
                this.eventManager.emit('gameOver', { victory: false });
                break;
        }
    }
} 