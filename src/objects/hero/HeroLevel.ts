import { EventManager } from '../../core/battle/EventManager';

/**
 * 英雄等级系统
 * 管理英雄的等级、经验值和升级
 */
export class HeroLevel {
    private eventManager: EventManager;

    private level: number = 1;
    private experience: number = 0;
    private maxLevel: number = 10;

    constructor() {
        this.eventManager = EventManager.getInstance();
    }

    /**
     * 获取当前等级
     */
    public getLevel(): number {
        return this.level;
    }

    /**
     * 获取当前经验值
     */
    public getExperience(): number {
        return this.experience;
    }

    /**
     * 获取升级所需经验值
     */
    public getRequiredExperience(): number {
        // 升级经验公式：100 * level * (level + 1) / 2
        return 100 * this.level * (this.level + 1) / 2;
    }

    /**
     * 增加经验值
     */
    public addExperience(amount: number) {
        if (this.level >= this.maxLevel) return;

        this.experience += amount;
        const required = this.getRequiredExperience();

        // 检查是否可以升级
        while (this.experience >= required && this.level < this.maxLevel) {
            this.experience -= required;
            this.levelUp();
        }

        // 确保经验值不超过上限
        if (this.level >= this.maxLevel) {
            this.experience = 0;
        }

        // 触发经验值变化事件
        this.eventManager.emit('experienceChanged', {
            level: this.level,
            experience: this.experience,
            required: this.getRequiredExperience()
        });
    }

    /**
     * 升级
     */
    private levelUp() {
        this.level++;

        // 触发升级事件
        this.eventManager.emit('levelUp', {
            level: this.level,
            skillPoints: 1 // 每次升级获得1个技能点
        });
    }

    /**
     * 获取等级进度（0-1）
     */
    public getLevelProgress(): number {
        return this.experience / this.getRequiredExperience();
    }
} 