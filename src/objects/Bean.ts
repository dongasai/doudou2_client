/// <reference types="phaser" />

import * as Phaser from 'phaser';
import { GameObject } from './GameObject';

/**
 * 豆豆类
 * 作为游戏中的基础敌人单位，从四面八方攻击水晶
 * 具有生命值、伤害值和移动速度属性
 */
export class Bean extends GameObject {
    private static readonly EMOJIS = {
        types: {
            normal: '🟤',
            fast: '🟡',
            strong: '🔴',
            boss: '⚫'
        },
        effects: {
            explosion: '💥',
            sparkle: '✨'
        }
    };

    private healthBar!: Phaser.GameObjects.Rectangle;
    private healthBarBg!: Phaser.GameObjects.Rectangle;
    private healthBarContainer!: Phaser.GameObjects.Container;
    public type: string;
    private health: number;
    private maxHealth: number;
    private damage: number;
    private speed: number;

    /**
     * 创建一个新的豆豆实例
     * @param scene - 游戏场景实例
     * @param x - 初始X坐标
     * @param y - 初始Y坐标
     * @param type - 豆豆类型
     */
    constructor(scene: Phaser.Scene, x: number, y: number, beanConfig?: any) {
        const type = beanConfig?.type || 'normal';
        const emoji = Bean.EMOJIS.types[type as keyof typeof Bean.EMOJIS.types] || Bean.EMOJIS.types.normal;
        super(scene, x, y, emoji);
        
        this.type = type;
        
        // 从配置加载属性，如果没有配置则使用默认值
        this.maxHealth = beanConfig?.stats?.hp || 100;
        this.health = this.maxHealth;
        this.damage = beanConfig?.stats?.attack || 10;
        this.speed = beanConfig?.stats?.speed || 100;
        
        // 如果是boss类型，调整大小
        if (type === 'boss') {
            this.setScale(2);
        }
        
        // 设置物理属性
        if (this.body) {
            this.body.setCollideWorldBounds(true);
        }
        
        // 创建血条
        this.createHealthBar();
    }

    private createHealthBar(): void {
        const width = 40;
        const height = 4;
        const padding = 1;
        
        // 创建容器
        this.healthBarContainer = this.scene.add.container(this.x, this.y - 20);
        
        // 创建血条背景
        this.healthBarBg = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0x000000,
            0.8
        );
        
        // 创建血条
        this.healthBar = this.scene.add.rectangle(
            -width/2 + padding,
            0,
            width - padding * 2,
            height - padding * 2,
            0xff0000
        );
        this.healthBar.setOrigin(0, 0.5);
        
        // 将血条和背景添加到容器
        this.healthBarContainer.add([this.healthBarBg, this.healthBar]);
    }

    /**
     * 豆豆受到伤害的处理方法
     * @param damage - 受到的伤害值
     */
    public takeDamage(damage: number): void {
        this.health = Math.max(0, this.health - damage);
        this.updateHealthBar();
        
        // 显示伤害数字
        this.showDamageNumber(damage);
        
        // 显示受击效果
        this.showHitEffect();
        
        if (this.health <= 0) {
            this.die();
        }
    }

    private updateHealthBar(): void {
        const healthPercentage = this.health / this.maxHealth;
        const width = this.healthBarBg.width - 2;
        this.healthBar.width = width * healthPercentage;
    }

    private showDamageNumber(damage: number): void {
        const text = this.scene.add.text(
            this.x,
            this.y - 30,
            `-${damage}`,
            {
                fontSize: '16px',
                color: '#ff0000'
            }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    private showHitEffect(): void {
        // 闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        // 显示受击特效
        const hitEmoji = this.scene.add.text(
            this.x,
            this.y,
            Bean.EMOJIS.effects.explosion,
            { fontSize: '24px' }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: hitEmoji,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => hitEmoji.destroy()
        });
    }

    /**
     * 豆豆死亡时的处理方法
     * 播放死亡动画并发出死亡事件
     */
    private die(): void {
        // 死亡动画
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => this.destroy()
        });

        // 显示特效
        const effectEmoji = this.scene.add.text(
            this.x,
            this.y,
            Bean.EMOJIS.effects.sparkle,
            { fontSize: '32px' }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: effectEmoji,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => effectEmoji.destroy()
        });

        // 发出豆豆被击败的事件，携带位置和经验值信息
        this.scene.events.emit('beanDefeated', {
            x: this.x,
            y: this.y,
            experience: 10  // 击败豆豆获得的经验值
        });
    }

    /**
     * 每帧更新时的处理方法
     * 主要用于控制豆豆的移动速度
     */
    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            // 计算当前速度
            const velocity = this.body.velocity;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            
            // 如果速度超过上限，则等比例缩小
            if (speed > this.speed) {
                const scale = this.speed / speed;
                this.body.velocity.x *= scale;
                this.body.velocity.y *= scale;
            }
        }
    }

    /**
     * 获取豆豆的攻击伤害值
     * @returns 豆豆的攻击伤害值
     */
    public getDamage(): number {
        return this.damage;
    }

    public getSpeed(): number {
        return this.speed;
    }

    // 重写setPosition方法以更新血条位置
    setPosition(x: number, y: number): this {
        super.setPosition(x, y);
        if (this.healthBarContainer) {
            this.healthBarContainer.setPosition(x, y - 20);
        }
        return this;
    }

    // 重写destroy方法以清理容器
    destroy(fromScene?: boolean) {
        if (this.healthBarContainer) {
            this.healthBarContainer.destroy();
        }
        super.destroy(fromScene);
    }
} 