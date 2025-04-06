import { BattleUnit, SkillEffect, SkillExecution } from './types/skill';

/**
 * 效果计算器
 * 负责计算各种技能效果的具体数值
 */
export class EffectCalculator {
    private static instance: EffectCalculator;

    private constructor() {}

    public static getInstance(): EffectCalculator {
        if (!EffectCalculator.instance) {
            EffectCalculator.instance = new EffectCalculator();
        }
        return EffectCalculator.instance;
    }

    /**
     * 计算技能效果
     */
    public calculateEffect(execution: SkillExecution): void {
        execution.effects.forEach(effect => {
            switch (effect.type) {
                case 'damage':
                    effect.value = this.calculateDamage(execution.source, execution.targets[0], effect);
                    break;
                case 'heal':
                    effect.value = this.calculateHeal(execution.source, execution.targets[0], effect);
                    break;
                case 'shield':
                    effect.value = this.calculateShield(execution.source, effect);
                    break;
                case 'buff':
                case 'debuff':
                    effect.value = this.calculateStatModifier(execution.source, effect);
                    break;
                case 'stun':
                case 'slow':
                    // 控制效果不需要计算数值,只需要持续时间
                    break;
                case 'summon':
                    // 召唤效果使用配置的数值
                    break;
            }
        });
    }

    /**
     * 计算伤害值
     */
    private calculateDamage(source: BattleUnit, target: BattleUnit, effect: SkillEffect): number {
        // 基础伤害
        let damage = effect.value * (source.stats.attack / 100);

        // 防御减伤
        const damageReduction = target.stats.defense / (target.stats.defense + 100);
        damage *= (1 - damageReduction);

        // 暴击判定(20%几率)
        if (Math.random() < 0.2) {
            damage *= 1.5;
        }

        // 技能特殊效果
        if (effect.penetration) {
            // 穿透效果,减少目标防御力的影响
            damage *= (1 + effect.penetration);
        }

        if (effect.chainEffect) {
            // 连锁效果,对后续目标伤害递减
            damage *= (1 - 0.2 * (effect.chainCount || 0));
        }

        return Math.max(1, Math.floor(damage));
    }

    /**
     * 计算治疗量
     */
    private calculateHeal(source: BattleUnit, target: BattleUnit, effect: SkillEffect): number {
        // 基础治疗量
        let heal = effect.value * (1 + source.stats.attack / 100);

        // 治疗加成
        if (effect.healingBonus) {
            heal *= (1 + effect.healingBonus);
        }

        // 目标生命值越低,治疗量越高
        const healthPercentage = target.currentHp / target.maxHp;
        if (healthPercentage < 0.3) {
            heal *= 1.5; // 低生命值加成
        }

        return Math.floor(heal);
    }

    /**
     * 计算护盾值
     */
    private calculateShield(source: BattleUnit, effect: SkillEffect): number {
        // 基础护盾值
        let shield = effect.value * (1 + source.stats.defense / 100);

        // 护盾强度加成
        if (effect.shieldStrength) {
            shield *= (1 + effect.shieldStrength);
        }

        return Math.floor(shield);
    }

    /**
     * 计算属性修改值
     */
    private calculateStatModifier(source: BattleUnit, effect: SkillEffect): number {
        // 基础属性修改值
        let modifier = effect.value;

        // 增益/减益效果强度
        if (effect.effectStrength) {
            modifier *= (1 + effect.effectStrength);
        }

        // 根据施法者属性调整
        if (effect.type === 'buff') {
            modifier *= (1 + source.stats.attack / 200);
        } else {
            modifier *= (1 + source.stats.attack / 150);
        }

        return Math.floor(modifier);
    }
} 