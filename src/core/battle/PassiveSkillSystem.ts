import { BattleUnit, SkillEffect } from './types/skill';
import { Skill } from '../../types/Skill';
import { EventManager } from '../EventManager';

/**
 * 被动技能系统
 * 负责管理和触发单位的被动技能
 */
export class PassiveSkillSystem {
    private static instance: PassiveSkillSystem;
    private eventManager: EventManager;
    private passiveEffects: Map<number, PassiveEffect[]>;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.passiveEffects = new Map();

        // 注册事件监听
        this.registerEventListeners();
    }

    public static getInstance(): PassiveSkillSystem {
        if (!PassiveSkillSystem.instance) {
            PassiveSkillSystem.instance = new PassiveSkillSystem();
        }
        return PassiveSkillSystem.instance;
    }

    /**
     * 注册事件监听器
     */
    private registerEventListeners(): void {
        // 监听伤害事件
        this.eventManager.on('damage_dealt', (data: any) => {
            this.applyPassiveEffects(data.source, 'ON_DEAL_DAMAGE');
            this.applyPassiveEffects(data.target, 'ON_TAKE_DAMAGE');
        });

        // 监听治疗事件
        this.eventManager.on('heal_applied', (data: any) => {
            this.applyPassiveEffects(data.target, 'ON_HEAL');
        });

        // 监听击杀事件
        this.eventManager.on('hero_died', (heroId: number) => {
            this.applyPassiveEffects({ id: heroId } as BattleUnit, 'ON_DEATH');
        });

        this.eventManager.on('bean_defeated', (beanId: number) => {
            this.applyPassiveEffects({ id: beanId } as BattleUnit, 'ON_KILL');
        });
    }

    /**
     * 初始化单位的被动技能
     */
    public initPassiveSkills(unit: BattleUnit, skills: Skill[]): void {
        const passiveSkills = skills.filter(skill => this.isPassiveSkill(skill));
        const effects = passiveSkills.map(skill => this.createPassiveEffect(skill));
        this.passiveEffects.set(unit.id, effects);

        // 立即应用永久效果
        effects.forEach(effect => {
            if (effect.timing === 'PERMANENT') {
                this.applyPassiveEffect(unit, effect);
            }
        });
    }

    /**
     * 判断是否为被动技能
     */
    private isPassiveSkill(skill: Skill): boolean {
        // 这里需要根据技能配置来判断是否为被动技能
        // 暂时返回false
        return false;
    }

    /**
     * 创建被动效果
     */
    private createPassiveEffect(skill: Skill): PassiveEffect {
        // 这里需要根据技能配置创建对应的被动效果
        // 暂时返回一个示例效果
        return {
            name: skill.name,
            timing: 'PERMANENT',
            condition: () => true,
            effects: []
        };
    }

    /**
     * 应用被动效果
     */
    private applyPassiveEffects(unit: BattleUnit, timing: PassiveTiming): void {
        const effects = this.passiveEffects.get(unit.id);
        if (!effects) return;

        effects.forEach(effect => {
            if (effect.timing === timing && effect.condition()) {
                this.applyPassiveEffect(unit, effect);
            }
        });
    }

    /**
     * 应用单个被动效果
     */
    private applyPassiveEffect(unit: BattleUnit, passive: PassiveEffect): void {
        passive.effects.forEach(effect => {
            switch (effect.type) {
                case 'buff':
                    this.applyStatBuff(unit, effect);
                    break;
                case 'heal':
                    this.applyHealEffect(unit, effect);
                    break;
                case 'shield':
                    this.applyShieldEffect(unit, effect);
                    break;
                // 可以添加更多效果类型的处理
            }
        });

        // 发送被动技能触发事件
        this.eventManager.emit('passive_triggered', {
            unit,
            passive: passive.name,
            effects: passive.effects
        });
    }

    /**
     * 应用属性增益
     */
    private applyStatBuff(unit: BattleUnit, effect: SkillEffect): void {
        if (effect.attack_buff) {
            unit.stats.attack += effect.attack_buff;
        }
        if (effect.defense_buff) {
            unit.stats.defense += effect.defense_buff;
        }
        if (effect.speed_buff) {
            unit.stats.speed += effect.speed_buff;
        }
    }

    /**
     * 应用治疗效果
     */
    private applyHealEffect(unit: BattleUnit, effect: SkillEffect): void {
        const healAmount = effect.value;
        unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healAmount);
    }

    /**
     * 应用护盾效果
     */
    private applyShieldEffect(unit: BattleUnit, effect: SkillEffect): void {
        if (!unit.shield) {
            unit.shield = 0;
        }
        unit.shield += effect.value;
    }

    /**
     * 清理单位的被动效果
     */
    public clearPassiveEffects(unitId: number): void {
        this.passiveEffects.delete(unitId);
    }

    /**
     * 更新回合
     */
    public updateTurn(): void {
        // 更新所有单位的被动效果
        this.passiveEffects.forEach((effects, unitId) => {
            effects.forEach(effect => {
                if (effect.timing === 'ON_TURN_START') {
                    this.applyPassiveEffects({ id: unitId } as BattleUnit, 'ON_TURN_START');
                }
            });
        });
    }
}

/**
 * 被动效果触发时机
 */
type PassiveTiming = 
    | 'PERMANENT'      // 永久效果
    | 'ON_TURN_START'  // 回合开始时
    | 'ON_DEAL_DAMAGE' // 造成伤害时
    | 'ON_TAKE_DAMAGE' // 受到伤害时
    | 'ON_HEAL'        // 受到治疗时
    | 'ON_KILL'        // 击杀目标时
    | 'ON_DEATH';      // 死亡时

/**
 * 被动效果接口
 */
interface PassiveEffect {
    name: string;                 // 效果名称
    timing: PassiveTiming;        // 触发时机
    condition: () => boolean;     // 触发条件
    effects: SkillEffect[];       // 效果列表
} 