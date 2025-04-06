import { BattleUnit, SkillEffect, SkillExecution } from './types/skill';
import { EventManager } from '../EventManager';

/**
 * 效果应用器
 * 负责将计算好的效果应用到目标单位上
 */
export class EffectApplier {
    private static instance: EffectApplier;
    private eventManager: EventManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
    }

    public static getInstance(): EffectApplier {
        if (!EffectApplier.instance) {
            EffectApplier.instance = new EffectApplier();
        }
        return EffectApplier.instance;
    }

    /**
     * 应用技能效果
     */
    public applyEffect(execution: SkillExecution): void {
        execution.effects.forEach(effect => {
            execution.targets.forEach(target => {
                this.applyEffectToTarget(effect, target, execution.source);
            });
        });
    }

    /**
     * 将效果应用到目标上
     */
    private applyEffectToTarget(effect: SkillEffect, target: BattleUnit, source: BattleUnit): void {
        switch (effect.type) {
            case 'damage':
                this.applyDamage(effect, target, source);
                break;
            case 'heal':
                this.applyHeal(effect, target);
                break;
            case 'shield':
                this.applyShield(effect, target);
                break;
            case 'stun':
                this.applyStun(effect, target);
                break;
            case 'slow':
                this.applySlow(effect, target);
                break;
            case 'buff':
                this.applyBuff(effect, target);
                break;
            case 'debuff':
                this.applyDebuff(effect, target);
                break;
            case 'summon':
                this.applySummon(effect, source);
                break;
            case 'move':
                this.applyMove(effect, target);
                break;
        }
    }

    /**
     * 应用伤害效果
     */
    private applyDamage(effect: SkillEffect, target: BattleUnit, source: BattleUnit): void {
        // 应用伤害
        const oldHp = target.currentHp;
        target.currentHp = Math.max(0, target.currentHp - effect.value);

        // 发送伤害事件
        this.eventManager.emit('damage_dealt', {
            source,
            target,
            damage: effect.value,
            remainingHp: target.currentHp
        });

        // 检查死亡
        if (target.currentHp === 0) {
            this.handleUnitDeath(target);
        }

        // 特殊效果处理
        if (effect.lifeSteal && source.currentHp > 0) {
            // 生命偷取
            const healAmount = Math.floor(effect.value * effect.lifeSteal);
            source.currentHp = Math.min(source.maxHp, source.currentHp + healAmount);
        }
    }

    /**
     * 应用治疗效果
     */
    private applyHeal(effect: SkillEffect, target: BattleUnit): void {
        const oldHp = target.currentHp;
        target.currentHp = Math.min(target.maxHp, target.currentHp + effect.value);

        // 发送治疗事件
        this.eventManager.emit('heal_applied', {
            target,
            amount: target.currentHp - oldHp
        });
    }

    /**
     * 应用护盾效果
     */
    private applyShield(effect: SkillEffect, target: BattleUnit): void {
        if (!target.shield) {
            target.shield = 0;
        }
        target.shield += effect.value;

        // 发送护盾事件
        this.eventManager.emit('shield_applied', {
            target,
            amount: effect.value
        });
    }

    /**
     * 应用眩晕效果
     */
    private applyStun(effect: SkillEffect, target: BattleUnit): void {
        target.isStunned = true;
        target.stunDuration = effect.duration || 1;

        // 发送眩晕事件
        this.eventManager.emit('stun_applied', {
            target,
            duration: target.stunDuration
        });
    }

    /**
     * 应用减速效果
     */
    private applySlow(effect: SkillEffect, target: BattleUnit): void {
        target.moveSpeed *= (1 - effect.value);
        target.slowDuration = effect.duration || 1;

        // 发送减速事件
        this.eventManager.emit('slow_applied', {
            target,
            amount: effect.value,
            duration: target.slowDuration
        });
    }

    /**
     * 应用增益效果
     */
    private applyBuff(effect: SkillEffect, target: BattleUnit): void {
        // 根据效果类型应用不同的属性加成
        if (effect.attack_buff) {
            target.stats.attack += effect.attack_buff;
        }
        if (effect.defense_buff) {
            target.stats.defense += effect.defense_buff;
        }
        if (effect.speed_buff) {
            target.stats.speed += effect.speed_buff;
        }

        // 发送增益事件
        this.eventManager.emit('buff_applied', {
            target,
            effect
        });
    }

    /**
     * 应用减益效果
     */
    private applyDebuff(effect: SkillEffect, target: BattleUnit): void {
        // 根据效果类型应用不同的属性减益
        if (effect.attack_reduction) {
            target.stats.attack -= effect.attack_reduction;
        }
        if (effect.defense_reduction) {
            target.stats.defense -= effect.defense_reduction;
        }
        if (effect.speed_reduction) {
            target.stats.speed -= effect.speed_reduction;
        }

        // 发送减益事件
        this.eventManager.emit('debuff_applied', {
            target,
            effect
        });
    }

    /**
     * 应用召唤效果
     */
    private applySummon(effect: SkillEffect, source: BattleUnit): void {
        // 发送召唤事件
        this.eventManager.emit('summon_requested', {
            source,
            count: effect.value
        });
    }

    /**
     * 应用位移效果
     */
    private applyMove(effect: SkillEffect, target: BattleUnit): void {
        if (effect.position) {
            target.position = effect.position;
        }

        // 发送位移事件
        this.eventManager.emit('unit_moved', {
            target,
            position: target.position
        });
    }

    /**
     * 处理单位死亡
     */
    private handleUnitDeath(target: BattleUnit): void {
        // 发送死亡事件
        if ('isHero' in target) {
            this.eventManager.emit('hero_died', target.id);
        } else {
            this.eventManager.emit('bean_defeated', target.id);
        }

        // 处理死亡特效
        if (target.onDeath) {
            target.onDeath();
        }
    }
} 