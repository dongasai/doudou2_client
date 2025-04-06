import { Skill, SkillConfig, SkillEffect } from '../../types/Skill';
import { Stats } from '../../types/Stats';

/**
 * 技能系统
 */
export class SkillSystem {
    private static instance: SkillSystem;
    private skills: Map<string, Skill> = new Map();
    private activeEffects: Map<string, SkillEffect[]> = new Map();

    private constructor() {}

    public static getInstance(): SkillSystem {
        if (!SkillSystem.instance) {
            SkillSystem.instance = new SkillSystem();
        }
        return SkillSystem.instance;
    }

    /**
     * 创建技能实例
     */
    public createSkill(config: SkillConfig): Skill {
        const skill: Skill = {
            config,
            currentCooldown: 0,
            level: 1,
            isAvailable: true
        };
        this.skills.set(config.id, skill);
        return skill;
    }

    /**
     * 检查技能是否可用
     */
    public canCastSkill(skillId: string): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;
        return skill.isAvailable && skill.currentCooldown <= 0;
    }

    /**
     * 施放技能
     */
    public castSkill(
        skillId: string,
        caster: { id: string; stats: Stats; position: { x: number; y: number } },
        targets: { id: string; stats: Stats; position: { x: number; y: number } }[]
    ): void {
        const skill = this.skills.get(skillId);
        if (!skill || !this.canCastSkill(skillId)) return;

        // 开始冷却
        skill.currentCooldown = skill.config.cooldown;
        skill.isAvailable = false;

        // 根据技能类型处理效果
        switch (skill.config.type) {
            case 'damage':
                this.handleDamageSkill(skill, caster, targets);
                break;
            case 'heal':
                this.handleHealSkill(skill, caster, targets);
                break;
            case 'buff':
                this.handleBuffSkill(skill, caster, targets);
                break;
            case 'debuff':
                this.handleDebuffSkill(skill, caster, targets);
                break;
            case 'control':
                this.handleControlSkill(skill, caster, targets);
                break;
        }
    }

    /**
     * 处理伤害技能
     */
    private handleDamageSkill(
        skill: Skill,
        caster: { id: string; stats: Stats },
        targets: { id: string; stats: Stats }[]
    ): void {
        const baseDamage = skill.config.baseDamage;
        if (!baseDamage) return;

        targets.forEach(target => {
            // 计算暴击
            const isCritical = this.rollCritical(skill.config.criticalRate || 0);
            const criticalMult = isCritical ? (skill.config.criticalMultiplier || 1.5) : 1;

            // 计算基础伤害
            let damage = baseDamage * (1 + caster.stats.attack / 100);
            
            // 应用暴击
            damage *= criticalMult;

            // 应用防御减免
            const defenseReduction = target.stats.defense / 200;
            damage *= (1 - defenseReduction);

            // 应用穿透
            if (skill.config.penetration) {
                damage *= (1 + skill.config.penetration);
            }

            // 确保最小伤害为1
            damage = Math.max(1, Math.floor(damage));
        });
    }

    /**
     * 处理治疗技能
     */
    private handleHealSkill(
        skill: Skill,
        caster: { id: string; stats: Stats },
        targets: { id: string; stats: Stats }[]
    ): void {
        const baseHeal = skill.config.baseHeal;
        if (!baseHeal) return;

        targets.forEach(target => {
            // 计算暴击
            const isCritical = this.rollCritical(skill.config.criticalRate || 0);
            const criticalMult = isCritical ? (skill.config.criticalMultiplier || 1.5) : 1;

            // 计算基础治疗量
            let heal = baseHeal * (1 + caster.stats.attack / 150);
            
            // 应用暴击
            heal *= criticalMult;

            // 确保最小治疗为1
            heal = Math.max(1, Math.floor(heal));
        });
    }

    /**
     * 处理增益技能
     */
    private handleBuffSkill(
        skill: Skill,
        caster: { id: string; stats: Stats },
        targets: { id: string; stats: Stats }[]
    ): void {
        if (!skill.config.effectValue || !skill.config.duration) return;

        targets.forEach(target => {
            const effect: SkillEffect = {
                type: 'attack_buff', // 根据具体效果类型设置
                value: skill.config.effectValue || 0,
                duration: skill.config.duration || 0,
                remainingTime: skill.config.duration || 0,
                sourceSkillId: skill.config.id,
                sourceCasterId: caster.id
            };

            // 添加效果
            this.addEffect(target.id, effect);
        });
    }

    /**
     * 处理减益技能
     */
    private handleDebuffSkill(
        skill: Skill,
        caster: { id: string; stats: Stats },
        targets: { id: string; stats: Stats }[]
    ): void {
        if (!skill.config.effectValue || !skill.config.duration) return;

        targets.forEach(target => {
            const effect: SkillEffect = {
                type: 'speed_buff', // 根据具体效果类型设置
                value: -(skill.config.effectValue || 0), // 负值表示减益
                duration: skill.config.duration || 0,
                remainingTime: skill.config.duration || 0,
                sourceSkillId: skill.config.id,
                sourceCasterId: caster.id
            };

            // 添加效果
            this.addEffect(target.id, effect);
        });
    }

    /**
     * 处理控制技能
     */
    private handleControlSkill(
        skill: Skill,
        caster: { id: string; stats: Stats },
        targets: { id: string; stats: Stats }[]
    ): void {
        if (!skill.config.duration) return;

        targets.forEach(target => {
            const effect: SkillEffect = {
                type: 'stun', // 根据具体控制类型设置
                value: 1, // 控制效果通常不需要数值
                duration: skill.config.duration || 0,
                remainingTime: skill.config.duration || 0,
                sourceSkillId: skill.config.id,
                sourceCasterId: caster.id
            };

            // 添加效果
            this.addEffect(target.id, effect);
        });
    }

    /**
     * 添加效果
     */
    private addEffect(targetId: string, effect: SkillEffect): void {
        const effects = this.activeEffects.get(targetId) || [];
        effects.push(effect);
        this.activeEffects.set(targetId, effects);
    }

    /**
     * 更新技能冷却
     */
    public updateCooldowns(deltaTime: number): void {
        for (const skill of this.skills.values()) {
            if (skill.currentCooldown > 0) {
                skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
                if (skill.currentCooldown === 0) {
                    skill.isAvailable = true;
                }
            }
        }
    }

    /**
     * 更新效果持续时间
     */
    public updateEffects(deltaTime: number): void {
        for (const [targetId, effects] of this.activeEffects.entries()) {
            const remainingEffects = effects.filter(effect => {
                effect.remainingTime = Math.max(0, effect.remainingTime - deltaTime);
                return effect.remainingTime > 0;
            });
            
            if (remainingEffects.length > 0) {
                this.activeEffects.set(targetId, remainingEffects);
            } else {
                this.activeEffects.delete(targetId);
            }
        }
    }

    /**
     * 获取目标当前效果
     */
    public getActiveEffects(targetId: string): SkillEffect[] {
        return this.activeEffects.get(targetId) || [];
    }

    /**
     * 判定是否暴击
     */
    private rollCritical(rate: number): boolean {
        return Math.random() < rate;
    }
} 