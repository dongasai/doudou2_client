import { BattleUnit, SkillEffect, SkillExecution } from './types/skill';
import { Skill } from '../../types/Skill';
import { EventManager } from '../EventManager';

/**
 * 技能组合系统
 * 负责处理技能的连锁和组合效果
 */
export class SkillComboSystem {
    private static instance: SkillComboSystem;
    private eventManager: EventManager;
    private comboHistory: Map<number, string[]>;  // 单位ID -> 技能历史
    private readonly COMBO_WINDOW = 3;  // 连招窗口期(回合数)

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.comboHistory = new Map();

        // 监听技能释放事件
        this.eventManager.on('skill_cast', (execution: SkillExecution) => {
            this.recordSkill(execution.source, execution.skill);
            this.checkCombo(execution);
        });
    }

    public static getInstance(): SkillComboSystem {
        if (!SkillComboSystem.instance) {
            SkillComboSystem.instance = new SkillComboSystem();
        }
        return SkillComboSystem.instance;
    }

    /**
     * 记录技能使用
     */
    private recordSkill(source: BattleUnit, skill: Skill): void {
        let history = this.comboHistory.get(source.id) || [];
        history.push(skill.name);
        
        // 只保留最近的N个技能记录
        if (history.length > this.COMBO_WINDOW) {
            history = history.slice(-this.COMBO_WINDOW);
        }
        
        this.comboHistory.set(source.id, history);
    }

    /**
     * 检查技能组合
     */
    private checkCombo(execution: SkillExecution): void {
        const history = this.comboHistory.get(execution.source.id);
        if (!history || history.length < 2) return;

        // 检查预定义的组合
        const combo = this.findCombo(history);
        if (combo) {
            this.applyComboEffect(execution, combo);
        }
    }

    /**
     * 查找匹配的技能组合
     */
    private findCombo(history: string[]): SkillCombo | undefined {
        // 这里可以定义一些预设的技能组合
        const PREDEFINED_COMBOS: SkillCombo[] = [
            {
                skills: ['火球术', '烈焰风暴'],
                name: '炎爆连击',
                effects: [
                    {
                        type: 'damage',
                        value: 50,
                        target: 'area',
                        penetration: 0.3
                    },
                    {
                        type: 'debuff',
                        value: 20,
                        target: 'area',
                        duration: 2,
                        defense_reduction: 20
                    }
                ]
            },
            {
                skills: ['盾击', '守护'],
                name: '铁壁反击',
                effects: [
                    {
                        type: 'shield',
                        value: 100,
                        target: 'self',
                        shieldStrength: 0.5
                    },
                    {
                        type: 'damage',
                        value: 30,
                        target: 'single',
                        chainEffect: true
                    }
                ]
            },
            {
                skills: ['快射', '穿云'],
                name: '疾风连射',
                effects: [
                    {
                        type: 'damage',
                        value: 40,
                        target: 'single',
                        chainEffect: true,
                        chainCount: 3
                    },
                    {
                        type: 'buff',
                        value: 30,
                        target: 'self',
                        duration: 2,
                        speed_buff: 30
                    }
                ]
            }
        ];

        // 检查最近的技能序列是否匹配任何预定义组合
        return PREDEFINED_COMBOS.find(combo => 
            this.isSequenceMatch(history.slice(-combo.skills.length), combo.skills)
        );
    }

    /**
     * 检查技能序列是否匹配
     */
    private isSequenceMatch(sequence: string[], pattern: string[]): boolean {
        if (sequence.length !== pattern.length) return false;
        return sequence.every((skill, index) => skill === pattern[index]);
    }

    /**
     * 应用组合技效果
     */
    private applyComboEffect(execution: SkillExecution, combo: SkillCombo): void {
        // 添加组合技效果
        execution.effects.push(...combo.effects);

        // 发送组合技触发事件
        this.eventManager.emit('combo_triggered', {
            source: execution.source,
            combo: combo.name,
            effects: combo.effects
        });

        // 清除已使用的组合技能记录
        this.comboHistory.set(execution.source.id, []);
    }

    /**
     * 更新回合
     */
    public updateTurn(): void {
        // 清理过期的技能记录
        this.comboHistory.clear();
    }
}

/**
 * 技能组合配置接口
 */
interface SkillCombo {
    skills: string[];      // 触发组合所需的技能序列
    name: string;          // 组合技名称
    effects: SkillEffect[]; // 组合技效果
} 