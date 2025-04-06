import type { SkillConfig } from '../types/Skill';

/**
 * 技能施放事件
 */
export interface SkillCastEvent {
    /** 施法者ID */
    casterId: string;
    /** 技能ID */
    skillId: string;
    /** 目标ID列表 */
    targetIds: string[];
    /** 技能配置 */
    skillConfig: SkillConfig;
    /** 施法位置 */
    position: { x: number; y: number };
} 