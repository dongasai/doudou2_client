import { EventManager } from '../../core/battle/EventManager';
import { DamageManager } from '../../core/battle/DamageManager';
import { ConfigLoader } from '../../core/ConfigLoader';

export interface Skill {
    id: number;
    name: string;
    type: string;
    damage?: number;
    cooldown: number;
    range?: number;
    duration?: number;
    effects?: {
        slow?: number;
        stun?: number;
        heal?: number;
        defense_buff?: number;
        attack_buff?: number;
        speed_buff?: number;
    };
}

/**
 * 英雄技能系统
 * 管理英雄的技能列表、冷却和释放
 */
export class HeroSkill {
    private eventManager: EventManager;
    private damageManager: DamageManager;
    private configLoader: ConfigLoader;

    /** 已学习的技能列表 */
    private skills: Map<number, Skill> = new Map();
    /** 技能冷却时间记录 */
    private cooldowns: Map<number, number> = new Map();

    constructor(heroId: number) {
        this.eventManager = EventManager.getInstance();
        this.damageManager = DamageManager.getInstance();
        this.configLoader = ConfigLoader.getInstance();
        
        // 加载英雄技能
        this.loadHeroSkills(heroId);
    }

    /**
     * 加载英雄技能
     */
    private loadHeroSkills(heroId: number) {
        const heroConfig = this.configLoader.getHeroConfig(heroId);
        if (!heroConfig) return;

        heroConfig.skills.forEach((skill: Skill) => {
            this.skills.set(skill.id, skill);
            this.cooldowns.set(skill.id, 0);
        });
    }

    /**
     * 释放技能
     * @param skillId - 技能ID
     * @param target - 目标位置或对象
     * @returns 是否成功释放
     */
    public castSkill(skillId: number, target: any): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;

        // 检查冷却
        const currentCooldown = this.cooldowns.get(skillId) || 0;
        if (currentCooldown > 0) return false;

        // 应用技能效果
        this.applySkillEffects(skill, target);

        // 设置冷却
        this.cooldowns.set(skillId, skill.cooldown);

        // 触发技能释放事件
        this.eventManager.emit('skillCast', {
            skillId,
            skill,
            target
        });

        return true;
    }

    /**
     * 应用技能效果
     */
    private applySkillEffects(skill: Skill, target: any) {
        // 处理伤害
        if (skill.damage) {
            this.eventManager.emit('damageRequest', {
                target,
                amount: skill.damage,
                source: 'skill',
                skillId: skill.id
            });
        }

        // 处理效果
        if (skill.effects) {
            if (skill.effects.slow) {
                this.applySlowEffect(target, skill.effects.slow, skill.duration);
            }
            if (skill.effects.stun) {
                this.applyStunEffect(target, skill.effects.stun);
            }
            if (skill.effects.heal) {
                this.applyHealEffect(target, skill.effects.heal);
            }
            // ... 其他效果
        }
    }

    /**
     * 更新技能冷却
     * @param deltaTime - 时间增量(秒)
     */
    public update(deltaTime: number) {
        for (const [skillId, cooldown] of this.cooldowns) {
            if (cooldown > 0) {
                this.cooldowns.set(skillId, Math.max(0, cooldown - deltaTime));
            }
        }
    }

    /**
     * 获取技能冷却状态
     */
    public getCooldowns(): Map<number, number> {
        return new Map(this.cooldowns);
    }

    /**
     * 获取已学习的技能列表
     */
    public getSkills(): Map<number, Skill> {
        return new Map(this.skills);
    }

    // 效果应用方法
    private applySlowEffect(target: any, amount: number, duration: number = 1) {
        this.eventManager.emit('effectApplied', {
            type: 'slow',
            target,
            amount,
            duration
        });
    }

    private applyStunEffect(target: any, duration: number) {
        this.eventManager.emit('effectApplied', {
            type: 'stun',
            target,
            duration
        });
    }

    private applyHealEffect(target: any, amount: number) {
        this.eventManager.emit('effectApplied', {
            type: 'heal',
            target,
            amount
        });
    }
} 