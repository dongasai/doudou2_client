import { EventManager } from '../EventManager';
import { BattleUnit, SkillEffect, SkillExecution, SkillState, TargetType } from './types/skill';
import { Skill } from '../../types/Skill';
import { TargetSelector } from './TargetSelector';
import { EffectCalculator } from './EffectCalculator';
import { EffectApplier } from './EffectApplier';

/**
 * 技能管理器
 * 负责管理技能的释放、效果计算和状态更新
 */
export class SkillManager {
    private static instance: SkillManager;
    private eventManager: EventManager;
    private skillStates: Map<number, Map<string, SkillState>>;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.skillStates = new Map();
    }

    public static getInstance(): SkillManager {
        if (!SkillManager.instance) {
            SkillManager.instance = new SkillManager();
        }
        return SkillManager.instance;
    }

    /**
     * 初始化单位的技能状态
     * @param unit 战斗单位
     * @param skills 技能列表
     */
    public initSkillStates(unit: BattleUnit, skills: Skill[]): void {
        const unitSkillStates = new Map<string, SkillState>();
        
        skills.forEach(skill => {
            unitSkillStates.set(skill.name, {
                cooldown: 0,
                isAvailable: true,
                activeEffects: []
            });
        });

        this.skillStates.set(unit.id, unitSkillStates);
    }

    /**
     * 释放技能
     * @param source 技能来源
     * @param skill 技能配置
     * @param targets 技能目标
     */
    public castSkill(source: BattleUnit, skill: Skill, targets: BattleUnit[]): void {
        const skillState = this.getSkillState(source.id, skill.name);
        if (!skillState || !skillState.isAvailable) {
            console.log(`技能 ${skill.name} 不可用`);
            return;
        }

        // 创建技能执行数据
        const execution: SkillExecution = {
            source,
            targets,
            skill,
            effects: this.createSkillEffects(skill)
        };

        // 计算技能效果
        this.calculateEffects(execution);

        // 应用技能效果
        this.applyEffects(execution);

        // 更新技能状态
        this.updateSkillState(source.id, skill);

        // 发出技能释放事件
        this.eventManager.emit('skill_cast', execution);
    }

    /**
     * 创建技能效果
     * @param skill 技能配置
     */
    private createSkillEffects(skill: Skill): SkillEffect[] {
        const effects: SkillEffect[] = [];

        // 根据技能类型创建对应效果
        switch (skill.type) {
            case '伤害':
                effects.push({
                    type: 'damage',
                    value: skill.damage || 0,
                    target: this.convertTargetType(skill)
                });
                break;
            case '治疗':
                effects.push({
                    type: 'heal',
                    value: skill.heal || 0,
                    target: this.convertTargetType(skill)
                });
                break;
            case '控制':
                if (skill.stun) {
                    effects.push({
                        type: 'stun',
                        value: skill.stun,
                        duration: skill.duration || 1,
                        target: this.convertTargetType(skill)
                    });
                }
                if (skill.slow) {
                    effects.push({
                        type: 'slow',
                        value: skill.slow,
                        duration: skill.duration || 1,
                        target: this.convertTargetType(skill)
                    });
                }
                break;
            case '增益':
                if (skill.defense_buff) {
                    effects.push({
                        type: 'buff',
                        value: skill.defense_buff,
                        duration: skill.duration || 1,
                        target: this.convertTargetType(skill)
                    });
                }
                if (skill.attack_buff) {
                    effects.push({
                        type: 'buff',
                        value: skill.attack_buff,
                        duration: skill.duration || 1,
                        target: this.convertTargetType(skill)
                    });
                }
                break;
            case '减益':
                effects.push({
                    type: 'debuff',
                    value: skill.damage || 0,
                    duration: skill.duration || 1,
                    target: this.convertTargetType(skill)
                });
                break;
            case '召唤':
                if (skill.summon_count) {
                    effects.push({
                        type: 'summon',
                        value: skill.summon_count,
                        target: 'self'
                    });
                }
                break;
        }

        return effects;
    }

    /**
     * 转换目标类型
     * @param skill 技能配置
     */
    private convertTargetType(skill: Skill): TargetType {
        return TargetSelector.getInstance().getTargetType(skill);
    }

    /**
     * 计算技能效果
     * @param execution 技能执行数据
     */
    private calculateEffects(execution: SkillExecution): void {
        EffectCalculator.getInstance().calculateEffect(execution);
    }

    /**
     * 应用技能效果
     * @param execution 技能执行数据
     */
    private applyEffects(execution: SkillExecution): void {
        EffectApplier.getInstance().applyEffect(execution);
    }

    /**
     * 添加持续效果
     * @param unitId 单位ID
     * @param effect 效果
     */
    private addActiveEffect(unitId: number, effect: SkillEffect): void {
        const unitSkillStates = this.skillStates.get(unitId);
        if (!unitSkillStates) return;

        // 遍历所有技能状态
        unitSkillStates.forEach(state => {
            if (effect.duration) {
                state.activeEffects.push({
                    effect,
                    remainingDuration: effect.duration
                });
            }
        });
    }

    /**
     * 更新技能状态
     * @param unitId 单位ID
     * @param skill 技能
     */
    private updateSkillState(unitId: number, skill: Skill): void {
        const skillState = this.getSkillState(unitId, skill.name);
        if (!skillState) return;

        // 设置冷却时间
        skillState.cooldown = skill.cooldown;
        skillState.isAvailable = false;
    }

    /**
     * 获取技能状态
     * @param unitId 单位ID
     * @param skillName 技能名称
     */
    private getSkillState(unitId: number, skillName: string): SkillState | undefined {
        const unitSkillStates = this.skillStates.get(unitId);
        if (!unitSkillStates) return undefined;
        return unitSkillStates.get(skillName);
    }

    /**
     * 更新回合
     */
    public updateTurn(): void {
        // 更新所有单位的技能状态
        this.skillStates.forEach(unitSkillStates => {
            unitSkillStates.forEach(state => {
                // 更新冷却时间
                if (state.cooldown > 0) {
                    state.cooldown--;
                    if (state.cooldown === 0) {
                        state.isAvailable = true;
                    }
                }

                // 更新持续效果
                state.activeEffects = state.activeEffects.filter(activeEffect => {
                    activeEffect.remainingDuration--;
                    return activeEffect.remainingDuration > 0;
                });
            });
        });
    }

    /**
     * 清理单位的技能状态
     * @param unitId 单位ID
     */
    public clearSkillStates(unitId: number): void {
        this.skillStates.delete(unitId);
    }
} 