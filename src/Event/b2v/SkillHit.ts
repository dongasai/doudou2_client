/**
 * 技能命中事件
 */
export interface SkillHitEvent {
    /** 技能ID */
    skillId: string;
    /** 施法者ID */
    casterId: string;
    /** 目标ID */
    targetId: string;
    /** 效果类型 */
    effectType: 'damage' | 'heal' | 'buff' | 'debuff';
    /** 效果值 */
    value: number;
    /** 是否暴击 */
    isCritical: boolean;
    /** 命中位置 */
    position: { x: number; y: number };
} 