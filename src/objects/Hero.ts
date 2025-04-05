import Phaser from 'phaser';
import { Skill } from '@/types/Skill';
import type { Position } from '@/types/Position';
import { Logger } from '@/utils/Logger';

interface HeroStats {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    level: number;
    exp: number;
    expToNextLevel: number;
    gold: number;
}

export class Hero extends Phaser.GameObjects.Sprite {
    public readonly id: number;
    public readonly name: string;
    public readonly type: string;
    public position: Position;
    public stats: HeroStats;
    public skills: Skill[];
    public equippedItems: any[];

    constructor(
        scene: Phaser.Scene,
        id: number,
        name: string,
        type: string,
        position: Position,
        stats: Partial<HeroStats> = {},
        skills: Skill[] = []
    ) {
        super(scene, position.x, position.y, 'hero');
        this.id = id;
        this.name = name;
        this.type = type;
        this.position = position;
        this.skills = skills;
        this.equippedItems = [];

        this.stats = {
            hp: stats.hp ?? 100,
            maxHp: stats.maxHp ?? 100,
            attack: stats.attack ?? 10,
            defense: stats.defense ?? 5,
            speed: stats.speed ?? 5,
            level: stats.level ?? 1,
            exp: stats.exp ?? 0,
            expToNextLevel: stats.expToNextLevel ?? 100,
            gold: stats.gold ?? 0
        };

        Logger.getInstance('Hero').format('创建英雄', [
            {key: '名称', value: name},
            {key: 'ID', value: id},
            {key: '类型', value: type},
            {key: '位置', value: `(${position.x}, ${position.y})`}
        ]);
        Logger.getInstance('Hero').format('初始属性', [
            {key: 'HP', value: `${this.stats.hp}/${this.stats.maxHp}`},
            {key: '攻击', value: this.stats.attack},
            {key: '防御', value: this.stats.defense}
        ]);
    }

    public takeDamage(damage: number): number {
        const actualDamage = Math.max(0, damage - this.stats.defense);
        this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

        Logger.getInstance('Hero').format(`${this.name} 受到伤害`, [
            {key: '原始伤害', value: damage},
            {key: '减免后伤害', value: actualDamage},
            {key: '剩余HP', value: `${this.stats.hp}/${this.stats.maxHp}`}
        ]);

        if (this.stats.hp <= 0) {
            this.die();
        }

        return actualDamage;
    }

    public heal(amount: number): void {
        const oldHp = this.stats.hp;
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
        const healed = this.stats.hp - oldHp;

        Logger.getInstance('Hero').format(`${this.name} 恢复HP`, [
            {key: '恢复量', value: `+${healed}`},
            {key: '当前HP', value: `${this.stats.hp}/${this.stats.maxHp}`}
        ]);
    }

    public gainExperience(amount: number): boolean {
        this.stats.exp += amount;
        Logger.getInstance('Hero').format(`${this.name} 获得经验`, [
            {key: '经验值', value: `+${amount}`},
            {key: '当前经验', value: `${this.stats.exp}/${this.stats.expToNextLevel}`}
        ]);

        if (this.stats.exp >= this.stats.expToNextLevel) {
            this.levelUp();
            return true;
        }
        return false;
    }

    private levelUp(): void {
        this.stats.level++;
        this.stats.exp -= this.stats.expToNextLevel;
        this.stats.expToNextLevel = Math.floor(this.stats.expToNextLevel * 1.5);

        this.stats.maxHp += 20;
        this.stats.hp = this.stats.maxHp;
        this.stats.attack += 5;
        this.stats.defense += 2;
        this.stats.speed += 1;

        Logger.getInstance('Hero').format(`${this.name} 升级`, [
            {key: '新等级', value: this.stats.level},
            {key: 'HP', value: `${this.stats.hp}/${this.stats.maxHp}`},
            {key: '攻击', value: this.stats.attack},
            {key: '防御', value: this.stats.defense}
        ]);
    }

    private die(): void {
        Logger.getInstance('Hero').info(`${this.name} 已死亡`);
    }

    public useSkill(skillId: string): boolean {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) {
            Logger.getInstance('Hero').warn(`${this.name} 尝试使用不存在的技能: ${skillId}`);
            return false;
        }

        Logger.getInstance('Hero').info(`${this.name} 使用技能: ${skill.name}`);
        return true;
    }

    public learnSkill(skill: Skill): void {
        if (this.skills.some(s => s.id === skill.id)) {
            Logger.getInstance('Hero').info(`${this.name} 已经学会了技能: ${skill.name}`);
            return;
        }

        this.skills.push(skill);
        Logger.getInstance('Hero').info(`${this.name} 学会了新技能: ${skill.name}`);
    }

    public update(): void {
        // 可以在这里添加每帧更新的逻辑
    }

    public destroy(): void {
        super.destroy();
    }
}
