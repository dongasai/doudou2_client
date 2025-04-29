/**
 * Buff应用事件
 * 从战斗引擎传递到视图层的Buff应用信息
 */
export interface BuffAppliedEvent {
    /** 目标实体ID */
    targetId: string;
    /** 目标实体类型 */
    targetType: 'hero' | 'bean' | 'crystal';
    /** Buff类型 */
    buffType: 'attack_buff' | 'defense_buff' | 'speed_buff' | 'dot' | 'hot' | 'shield' | 'reflect';
    /** Buff持续时间（毫秒） */
    duration: number;
    /** Buff效果值 */
    value: number;
    /** Buff来源技能ID */
    sourceSkillId?: string;
    /** Buff来源实体ID */
    sourceEntityId?: string;
    /** Buff图标 */
    buffEmoji: string;
    /** 是否可叠加 */
    isStackable: boolean;
    /** 叠加层数 */
    stacks: number;
}
