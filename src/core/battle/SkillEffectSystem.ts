import { Skill } from '../../types/Skill';
import { Stats } from '../../types/Stats';
import { EventManager } from '../EventManager';

/**
 * 技能效果系统
 * 负责处理技能效果的实际执行
 */
export class SkillEffectSystem {
    private static instance: SkillEffectSystem;
    private eventManager: EventManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
    }

    public static getInstance(): SkillEffectSystem {
        if (!SkillEffectSystem.instance) {
            SkillEffectSystem.instance = new SkillEffectSystem();
        }
        return SkillEffectSystem.instance;
    }

    /**
     * 执行技能效果
     */
    public executeSkillEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        switch (skill.type) {
            case '伤害':
                this.executeDamageEffect(skill, caster, targets);
                break;
            case '治疗':
                this.executeHealEffect(skill, caster, targets);
                break;
            case '控制':
                this.executeControlEffect(skill, caster, targets);
                break;
            case '增益':
                this.executeBuffEffect(skill, caster, targets);
                break;
            case '减益':
                this.executeDebuffEffect(skill, caster, targets);
                break;
            default:
                console.warn(`未实现的技能类型: ${skill.type}`);
        }
    }

    /**
     * 执行伤害效果
     */
    private executeDamageEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        targets.forEach(target => {
            let damage = this.calculateDamage(skill, caster, target);
            
            // 处理穿透效果
            if (skill.penetration) {
                damage *= (1 + skill.penetration);
            }

            // 处理连锁效果
            if (skill.chain_effect && targets.length > 1) {
                damage *= 0.7; // 连锁伤害降低30%
            }

            // 触发伤害事件
            this.eventManager.emit('damage_dealt', {
                casterId: caster.id,
                targetId: target.id,
                skillId: skill.id,
                damage: damage
            });
        });
    }

    /**
     * 执行治疗效果
     */
    private executeHealEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        targets.forEach(target => {
            const healAmount = this.calculateHeal(skill, caster);
            
            this.eventManager.emit('heal_applied', {
                casterId: caster.id,
                targetId: target.id,
                skillId: skill.id,
                heal: healAmount
            });
        });
    }

    /**
     * 执行控制效果
     */
    private executeControlEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        targets.forEach(target => {
            if (skill.stun) {
                this.eventManager.emit('control_applied', {
                    type: 'stun',
                    casterId: caster.id,
                    targetId: target.id,
                    skillId: skill.id,
                    duration: skill.stun
                });
            }

            if (skill.slow) {
                this.eventManager.emit('control_applied', {
                    type: 'slow',
                    casterId: caster.id,
                    targetId: target.id,
                    skillId: skill.id,
                    value: skill.slow,
                    duration: skill.duration || 0
                });
            }
        });
    }

    /**
     * 执行增益效果
     */
    private executeBuffEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        targets.forEach(target => {
            const buffs: Record<string, number> = {};
            
            if (skill.defense_buff) buffs.defense = skill.defense_buff;
            if (skill.attack_buff) buffs.attack = skill.attack_buff;
            if (skill.speed_buff) buffs.speed = skill.speed_buff;
            
            this.eventManager.emit('buff_applied', {
                casterId: caster.id,
                targetId: target.id,
                skillId: skill.id,
                buffs,
                duration: skill.duration || 0
            });
        });
    }

    /**
     * 执行减益效果
     */
    private executeDebuffEffect(
        skill: Skill,
        caster: { id: number; stats: Stats },
        targets: { id: number; stats: Stats }[]
    ): void {
        targets.forEach(target => {
            const debuffs: Record<string, number> = {};
            
            // 将增益值转换为减益值
            if (skill.defense_buff) debuffs.defense = -skill.defense_buff;
            if (skill.attack_buff) debuffs.attack = -skill.attack_buff;
            if (skill.speed_buff) debuffs.speed = -skill.speed_buff;
            
            this.eventManager.emit('debuff_applied', {
                casterId: caster.id,
                targetId: target.id,
                skillId: skill.id,
                debuffs,
                duration: skill.duration || 0
            });
        });
    }

    /**
     * 计算实际伤害值
     */
    private calculateDamage(
        skill: Skill,
        caster: { stats: Stats },
        target: { stats: Stats }
    ): number {
        const baseDamage = skill.damage || 0;
        const attackModifier = caster.stats.attack / 100;
        const defenseModifier = target.stats.defense / 200;
        
        return Math.max(0, baseDamage * (1 + attackModifier) * (1 - defenseModifier));
    }

    /**
     * 计算实际治疗值
     */
    private calculateHeal(
        skill: Skill,
        caster: { stats: Stats }
    ): number {
        const baseHeal = skill.heal || 0;
        const attackModifier = caster.stats.attack / 150;
        
        return baseHeal * (1 + attackModifier);
    }
} 