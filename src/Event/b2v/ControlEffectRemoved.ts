/**
 * 控制效果移除事件
 * 从战斗引擎传递到视图层的控制效果移除信息
 */
export interface ControlEffectRemovedEvent {
    /** 目标实体ID */
    targetId: string;
    /** 目标实体类型 */
    targetType: 'hero' | 'bean' | 'crystal';
    /** 控制类型 */
    controlType: 'stun' | 'silence' | 'root' | 'slow' | 'fear' | 'charm';
    /** 控制效果ID */
    effectId: string;
    /** 移除原因 */
    reason: 'expired' | 'dispelled' | 'death' | 'other';
}
