/**
 * 控制效果应用事件
 * 从战斗引擎传递到视图层的控制效果应用信息
 */
export interface ControlEffectAppliedEvent {
    /** 目标实体ID */
    targetId: string;
    /** 目标实体类型 */
    targetType: 'hero' | 'bean' | 'crystal';
    /** 控制类型 */
    controlType: 'stun' | 'silence' | 'root' | 'slow' | 'fear' | 'charm';
    /** 控制持续时间（毫秒） */
    duration: number;
    /** 控制来源技能ID */
    sourceSkillId?: string;
    /** 控制来源实体ID */
    sourceEntityId?: string;
    /** 控制效果图标 */
    effectEmoji: string;
}
