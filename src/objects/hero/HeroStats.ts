import { ConfigLoader } from '../../core/ConfigLoader';
import { EventManager } from '../../battle/EventManager';

/**
 * 英雄属性系统
 * 管理英雄的各项属性和状态
 */
export class HeroStats {
    private eventManager: EventManager;
    private configLoader: ConfigLoader;

    // 基础属性
    private maxHealth: number;
    private currentHealth: number;
    private attack: number;
    private defense: number;
    private speed: number;
    private range: number;

    // 状态修饰
    private speedMultiplier: number = 1;
    private canMove: boolean = true;
    private canAttack: boolean = true;

    constructor(heroId: number) {
        this.eventManager = EventManager.getInstance();
        this.configLoader = ConfigLoader.getInstance();

        // 从配置加载基础属性
        const config = this.configLoader.getHeroConfig(heroId);
        if (!config) throw new Error(`未找到英雄配置: ${heroId}`);

        this.maxHealth = config.baseStats.maxHp;
        this.currentHealth = this.maxHealth;
        this.attack = config.baseStats.attack;
        this.defense = config.baseStats.defense;
        this.speed = config.baseStats.speed;
        this.range = config.baseStats.range;
    }

    // 生命值相关
    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public takeDamage(amount: number) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);

        this.eventManager.emit('heroHealthChanged', {
            currentHealth: this.currentHealth,
            maxHealth: this.maxHealth
        });

        if (this.currentHealth <= 0) {
            this.eventManager.emit('heroDied', {});
        }
    }

    public heal(amount: number) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);

        this.eventManager.emit('heroHealthChanged', {
            currentHealth: this.currentHealth,
            maxHealth: this.maxHealth
        });
    }

    // 攻击相关
    public getAttack(): number {
        return this.attack;
    }

    public getDefense(): number {
        return this.defense;
    }

    // 速度相关
    public getSpeed(): number {
        return this.speed * this.speedMultiplier;
    }

    public setSpeedMultiplier(multiplier: number) {
        this.speedMultiplier = multiplier;
    }

    // 状态控制
    public setCanMove(value: boolean) {
        this.canMove = value;
    }

    public setCanAttack(value: boolean) {
        this.canAttack = value;
    }

    public canPerformAction(): boolean {
        return this.canMove && this.canAttack;
    }

    // 攻击范围
    public getRange(): number {
        return this.range;
    }
}
