import { GameObject } from '../GameObject';
import { HeroStats } from './HeroStats';
import { HeroLevel } from './HeroLevel';
import { HeroSkill, Skill } from './HeroSkill';
import { EventManager } from '../../battle/EventManager';
import { DamageManager } from '../../battle/DamageManager';

/**
 * 英雄基类
 * 游戏中的英雄单位，具有属性、等级和技能系统
 */
export class Hero extends GameObject {
    private eventManager: EventManager;
    private damageManager: DamageManager;

    /** 英雄ID */
    private id: string;
    /** 英雄名称 */
    public override name: string;

    /** 属性系统 */
    private stats: HeroStats;
    /** 等级系统 */
    private level: HeroLevel;
    /** 技能系统 */
    private skillSystem: HeroSkill;

    /** 血条显示对象 */
    private healthBar!: Phaser.GameObjects.Rectangle;
    /** 血条背景显示对象 */
    private healthBarBg!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, config: {
        id: string;
        name: string;
        type: number;
        stats: {
            maxHp: number;
            attack: number;
            defense: number;
            speed: number;
            range: number;
        }
    }) {
        super(scene, x, y, '🦸');  // 使用英雄emoji作为贴图

        this.eventManager = EventManager.getInstance();
        this.damageManager = DamageManager.getInstance();

        this.id = config.id;
        this.name = config.name;
        this.objectType = config.type;

        // 初始化各个系统
        this.stats = new HeroStats(config.stats);
        this.level = new HeroLevel();
        this.skillSystem = new HeroSkill();

        // 创建血条
        this.createHealthBar();

        // 设置物理属性
        this.setScale(2);
        this.body.setCollideWorldBounds(true);

        // 监听事件
        this.setupEventListeners();
    }

    /**
     * 创建血条
     */
    private createHealthBar(): void {
        const width = 50;
        const height = 6;
        const y = -30;

        this.healthBarBg = this.scene.add.rectangle(0, y, width, height, 0x000000);
        this.healthBar = this.scene.add.rectangle(0, y, width, height, 0x00ff00);

        this.updateHealthBar();
    }

    /**
     * 更新血条显示
     */
    private updateHealthBar(): void {
        const ratio = this.stats.hp / this.stats.maxHp;
        this.healthBar.setScale(ratio, 1);
        this.healthBar.setPosition(this.x - (1 - ratio) * 25, this.y - 30);
        this.healthBarBg.setPosition(this.x, this.y - 30);
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners(): void {
        this.eventManager.on('heroLevelUp', this.onLevelUp.bind(this));
    }

    /**
     * 受到伤害
     */
    public takeDamage(amount: number): void {
        const newHealth = this.damageManager.handleDamage({
            targetType: 'hero',
            targetId: this.id,
            damage: amount,
            currentHealth: this.stats.hp,
            defense: this.stats.defense
        });

        this.stats.hp = newHealth;
        this.updateHealthBar();
    }

    /**
     * 获得经验值
     */
    public gainExperience(amount: number): void {
        if (this.level.addExperience(amount)) {
            // 升级时增加属性
            this.stats.increase({
                maxHp: 20,
                attack: 5,
                defense: 2,
                speed: 1
            });
        }
    }

    /**
     * 学习技能
     */
    public learnSkill(skill: Skill): boolean {
        return this.skillSystem.learnSkill(skill);
    }

    /**
     * 使用技能
     */
    public useSkill(skillId: number): boolean {
        return this.skillSystem.useSkill(skillId);
    }

    /**
     * 等级提升事件处理
     */
    private onLevelUp(data: any): void {
        if (data.level % 3 === 0) {
            // 每3级解锁一个技能槽位
            this.eventManager.emit('skillSlotUnlocked', {
                heroId: this.id,
                level: data.level
            });
        }
    }

    /**
     * 更新
     */
    update(time: number, delta: number): void {
        super.update(time, delta);
        this.skillSystem.updateCooldowns(delta);
        this.updateHealthBar();
    }

    /**
     * 销毁
     */
    destroy(fromScene?: boolean): void {
        this.healthBar.destroy();
        this.healthBarBg.destroy();
        super.destroy(fromScene);
    }
}
