import { BattleScene } from '../scenes/BattleScene';
/**
 * 水晶类
 * 作为游戏中的核心防守目标
 * 具有生命值和血条显示，需要被英雄保护
 */
export class Crystal extends Phaser.GameObjects.Text {
    private static readonly EMOJIS = {
        crystal: '💎',
        effects: {
            explosion: '💥',
            sparkle: '✨',
            shield: '🛡️'
        }
    };

    /** 水晶的最大生命值 */
    private maxHealth: number = 1000;
    /** 水晶的当前生命值 */
    private health: number = 1000;
    /** 水晶的血量文本显示 */
    private healthText!: Phaser.GameObjects.Text;
    private shieldActive: boolean = false;

    /**
     * 创建一个新的水晶实例
     * @param scene - 游戏场景实例
     * @param x - 初始X坐标
     * @param y - 初始Y坐标
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
       super(scene, x, y, Crystal.EMOJIS.crystal, { fontSize: '30px' });
       scene.add.existing(this);
       
       // 设置层级和物理属性
       this.setDepth(BattleScene.LAYER_CRYSTAL)
           .setScale(1.0);            // 30px字体 * 1.0 = 30px大小

        // 创建血条
        this.createHealthBar();
        
    }

    /**
     * 创建水晶的血条显示
     * 包括血条背景和血条前景
     */
    private createHealthBar(): void {
        // 创建血量文本显示 (100/100 格式)
        this.healthText = this.scene.add.text(
            -100, // 临时位置，将在update中调整
            -40,  // 临时位置，将在update中调整
            `${this.health}/${this.maxHealth}`,
            {
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
    }

    /**
     * 水晶受到伤害的处理方法
     * @param amount - 受到的伤害值
     */
    public takeDamage(damage: number): void {
        if (this.shieldActive) {
            damage *= 0.5; // 护盾激活时减少50%伤害
        }
        
        this.health = Math.max(0, this.health - damage);
        this.updateHealthBar();
        
        // 显示伤害数字
        this.showDamageNumber(damage);
        
        // 显示受击效果
        this.showHitEffect();
        
        // 在血量低时激活护盾
        if (this.health < this.maxHealth * 0.3 && !this.shieldActive) {
            this.activateShield();
        }

        // 检查是否被摧毁
        if (this.health <= 0) {
            this.destroy();
            // 触发游戏结束事件（失败）
            this.scene.events.emit('gameOver', false);
        }
    }

    /**
     * 更新血条显示
     * 根据当前生命值比例调整血条长度
     */
    private updateHealthBar(): void {
        // 更新血量文本
        this.healthText.setText(`${this.health}/${this.maxHealth}`);
    }

    private showDamageNumber(damage: number): void {
        const text = this.scene.add.text(
            this.x,
            this.y - 50,
            `-${damage}`,
            {
                fontSize: '20px',
                color: '#ff0000'
            }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    private showHitEffect(): void {
        // 闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 100,
            yoyo: true
        });

        // 显示受击特效
        const hitEmoji = this.scene.add.text(
            this.x,
            this.y,
            Crystal.EMOJIS.effects.explosion,
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

    private activateShield(): void {
        this.shieldActive = true;
        
        // 显示护盾效果
        const shield = this.scene.add.text(
            this.x,
            this.y,
            Crystal.EMOJIS.effects.shield,
            { fontSize: '48px' }
        ).setOrigin(0.5);
        
        // 护盾动画
        this.scene.tweens.add({
            targets: shield,
            alpha: 0.7,
            scale: 1.2,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 每帧更新时的处理方法
     * 主要用于更新血条位置
     */
    update() {
        // 更新血量文本位置 (暂停按钮左侧)
        this.healthText.setPosition(
            this.scene.cameras.main.width - 150, // 屏幕右侧偏移
            30 // 顶部偏移
        );
    }

    /**
     * 销毁水晶及其相关对象
     * 包括血条和血条背景
     */
    public destroy(): void {
        // 清理血量文本
        if (this.healthText) {
            this.healthText.destroy();
        }
        
        super.destroy();
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public setPosition(x: number, y: number): this {
        super.setPosition(x, y);
        return this;
    }
} 