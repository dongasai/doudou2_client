/**
 * 技能效果应用事件
 */
export interface SkillEffectAppliedEvent {
    /** 目标ID */
    targetId: string;
    /** 效果类型 */
    effectType: 'stun' | 'slow' | 'attack_buff' | 'defense_buff' | 'speed_buff' | 'dot' | 'hot';
    /** 效果持续时间(毫秒) */
    duration: number;
    /** 效果值 */
    value: number;
    /** 效果来源技能ID */
    sourceSkillId: string;
    /** 效果来源角色ID */
    sourceCasterId: string;
    /** 效果图标 */
    effectEmoji: string;
} 