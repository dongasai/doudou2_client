/**
 * 技能冷却更新事件
 */
export interface SkillCooldownUpdateEvent {
    /** 技能ID */
    skillId: string;
    /** 所属角色ID */
    ownerId: string;
    /** 当前冷却时间(毫秒) */
    currentCooldown: number;
    /** 最大冷却时间(毫秒) */
    maxCooldown: number;
    /** 冷却进度(0-1) */
    progress: number;
} 