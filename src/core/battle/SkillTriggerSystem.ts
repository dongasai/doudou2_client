import { BattleUnit, SkillEffect, SkillExecution } from './types/skill';
import { Skill } from '../../types/Skill';
import { EventManager } from '../EventManager';
import { SkillManager } from './SkillManager';

/**
 * 技能触发条件系统
 * 负责处理技能的触发条件和自动释放
 */
export class SkillTriggerSystem {
    private static instance: SkillTriggerSystem;
    private eventManager: EventManager;
    private skillManager: SkillManager;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.skillManager = SkillManager.getInstance();

        // 注册事件监听
        this.registerEventListeners();
    }

    public static getInstance(): SkillTriggerSystem {
        if (!SkillTriggerSystem.instance) {
            SkillTriggerSystem.instance = new SkillTriggerSystem();
        }
        return SkillTriggerSystem.instance;
    }

    /**
     * 注册事件监听器
     */
    private registerEventListeners(): void {
        // 监听伤害事件
        this.eventManager.on('damage_dealt', (data: any) => {
            this.checkHealthTrigger(data.target);
            this.checkCounterAttack(data.source, data.target);
        });

        // 监听治疗事件
        this.eventManager.on('heal_applied', (data: any) => {
            this.checkHealTrigger(data.target);
        });

        // 监听buff/debuff事件
        this.eventManager.on('buff_applied', (data: any) => {
            this.checkBuffTrigger(data.target);
        });

        this.eventManager.on('debuff_applied', (data: any) => {
            this.checkDebuffTrigger(data.target);
        });
    }

    /**
     * 检查生命值触发条件
     */
    private checkHealthTrigger(unit: BattleUnit): void {
        const healthPercentage = unit.currentHp / unit.maxHp;

        // 低生命值触发
        if (healthPercentage <= 0.3) {
            this.tryTriggerSkill(unit, 'LOW_HEALTH');
        }

        // 濒死触发
        if (healthPercentage <= 0.1) {
            this.tryTriggerSkill(unit, 'NEAR_DEATH');
        }
    }

    /**
     * 检查反击触发
     */
    private checkCounterAttack(attacker: BattleUnit, defender: BattleUnit): void {
        // 检查是否有反击技能
        this.tryTriggerSkill(defender, 'COUNTER_ATTACK', attacker);
    }

    /**
     * 检查治疗触发
     */
    private checkHealTrigger(unit: BattleUnit): void {
        this.tryTriggerSkill(unit, 'ON_HEAL');
    }

    /**
     * 检查增益效果触发
     */
    private checkBuffTrigger(unit: BattleUnit): void {
        this.tryTriggerSkill(unit, 'ON_BUFF');
    }

    /**
     * 检查减益效果触发
     */
    private checkDebuffTrigger(unit: BattleUnit): void {
        this.tryTriggerSkill(unit, 'ON_DEBUFF');
    }

    /**
     * 尝试触发技能
     */
    private tryTriggerSkill(unit: BattleUnit, triggerType: TriggerType, target?: BattleUnit): void {
        // 获取单位的技能列表
        const skills = this.getUnitSkills(unit);
        
        // 查找符合触发条件的技能
        const triggeredSkill = skills.find(skill => 
            this.checkTriggerCondition(skill, triggerType)
        );

        if (triggeredSkill) {
            // 确定技能目标
            const targets = target ? [target] : this.getDefaultTargets(unit, triggeredSkill);
            
            // 释放技能
            this.skillManager.castSkill(unit, triggeredSkill, targets);
        }
    }

    /**
     * 获取单位的技能列表
     */
    private getUnitSkills(unit: BattleUnit): Skill[] {
        // 这里需要根据实际的数据结构来获取单位的技能列表
        // 暂时返回空数组
        return [];
    }

    /**
     * 检查技能触发条件
     */
    private checkTriggerCondition(skill: Skill, triggerType: TriggerType): boolean {
        // 这里需要根据技能配置来判断是否满足触发条件
        // 暂时返回false
        return false;
    }

    /**
     * 获取默认技能目标
     */
    private getDefaultTargets(source: BattleUnit, skill: Skill): BattleUnit[] {
        // 这里需要根据技能类型和目标类型来选择默认目标
        // 暂时返回空数组
        return [];
    }
}

/**
 * 触发类型
 */
type TriggerType = 
    | 'LOW_HEALTH'     // 低生命值
    | 'NEAR_DEATH'     // 濒死
    | 'COUNTER_ATTACK' // 反击
    | 'ON_HEAL'        // 治疗时
    | 'ON_BUFF'        // 获得增益效果时
    | 'ON_DEBUFF';     // 获得减益效果时 