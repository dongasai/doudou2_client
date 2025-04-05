import { GameObject } from './GameObject';
import { Skill } from '@/types/Skill';

export class Hero extends GameObject {
    private static readonly EMOJIS = {
        effects: {
            explosion: '💥',
            sparkle: '✨',
            heal: '💚',
            shield: '🛡️'
        },
        heroes: {
            '战士': '⚔️',
            '法师': '🔮',
            '射手': '🏹',
            '辅助': '💖',
            '刺客': '🗡️'
        },
        skills: {
            attack: '⚔️',
            heal: '💖',
            shield: '🛡️',
            buff: '⬆️',
            debuff: '⬇️',
            special: '✨'
        }
    };

    public id: number = 0;
    public battleStats: any = {};
    private skills: Skill[] = [];
    private currentLevel: number = 1;
    private experience: number = 0;
    private health: number = 100;
    private maxHealth: number = 100;
    private stats = {
        attack: 10,
        defense: 5,
        speed: 5
    };
    private healthBar!: Phaser.GameObjects.Rectangle;
    private healthBarBg!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
        const emoji = Hero.EMOJIS.heroes[type as keyof typeof Hero.EMOJIS.heroes] || '👤';
        super(scene, x, y, emoji);
        
        this.objectType = type;
        
        // 设置物理属性
        this.setScale(1.5);
        if (this.body) {
            this.body.setCollideWorldBounds(true);
        }
        
        // 创建血条
        this.createHealthBar();
    }

    private createHealthBar(): void {
        const width = 50;
        const height = 6;
        const padding = 2;
        
        // 创建血条背景
        this.healthBarBg = this.scene.add.rectangle(
            this.x,
            this.y - 30,
            width,
            height,
            0x000000,
            0.8
        );
        
        // 创建血条
        this.healthBar = this.scene.add.rectangle(
            this.x - width/2 + padding,
            this.y - 30,
            width - padding * 2,
            height - padding * 2,
            0x00ff00
        );
        this.healthBar.setOrigin(0, 0.5);
    }

    public takeDamage(damage: number): void {
        this.health = Math.max(0, this.health - Math.max(0, damage - this.stats.defense));
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
        const width = this.healthBarBg.width - 4;
        this.healthBar.width = width * healthPercentage;
    }

    private showDamageNumber(damage: number): void {
        const text = this.scene.add.text(
            this.x,
            this.y - 40,
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
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        // 显示受击特效
        const hitEmoji = this.scene.add.text(
            this.x,
            this.y,
            Hero.EMOJIS.effects.explosion,
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

    public castSkill(skillType: string): void {
        const skillEmoji = Hero.EMOJIS.skills[skillType as keyof typeof Hero.EMOJIS.skills] || '✨';
        const skillEffect = this.scene.add.text(
            this.x,
            this.y,
            skillEmoji,
            { fontSize: '32px' }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: skillEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => skillEffect.destroy()
        });
    }

    public heal(amount: number) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    public gainExperience(amount: number) {
        this.experience += amount;
        const requiredExp = this.currentLevel * 100;  // 简单的等级经验计算

        if (this.experience >= requiredExp) {
            this.levelUp();
        }
    }

    private levelUp() {
        this.currentLevel++;
        this.experience = 0;

        // 提升属性
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.stats.attack += 5;
        this.stats.defense += 2;
        this.stats.speed += 1;

        // 显示升级效果
        this.showLevelUpEffect();
    }

    private showLevelUpEffect() {
        // 创建一个升级特效
        const levelUpText = this.scene.add.text(
            this.x,
            this.y - 50,
            'LEVEL UP!',
            { fontSize: '24px', color: '#ffff00' }
        );

        // 让文字向上飘动并消失
        this.scene.tweens.add({
            targets: levelUpText,
            y: this.y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => levelUpText.destroy()
        });
    }

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
            Hero.EMOJIS.effects.sparkle,
            { fontSize: '32px' }
        ).setOrigin(0.5);

        this.scene.tweens.add({
            targets: effectEmoji,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => effectEmoji.destroy()
        });
    }

    public setPosition(x: number, y: number): this {
        super.setPosition(x, y);
        
        // 更新血条位置
        if (this.healthBar && this.healthBarBg) {
            this.healthBarBg.setPosition(x, y - 30);
            this.healthBar.setPosition(x - this.healthBarBg.width/2 + 2, y - 30);
        }
        
        return this;
    }

    public destroy(): void {
        // 清理血条
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.healthBarBg) {
            this.healthBarBg.destroy();
        }
        
        super.destroy();
    }

    update(): void {
        // 可以在这里添加更新逻辑
    }

    // 技能相关方法
    public learnSkill(skill: Skill) {
        if (this.skills.length < 4) {
            this.skills.push(skill);
        }
    }

    public useSkill(index: number) {
        if (index >= 0 && index < this.skills.length) {
            const skill = this.skills[index];
            // TODO: 实现技能效果
            console.log(`${this.name} 使用技能: ${skill.name}`);
        }
    }
} 