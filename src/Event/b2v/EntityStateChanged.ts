/**
 * 实体状态变化事件
 * 从战斗引擎传递到视图层的实体状态变化信息
 */
export interface EntityStateChangedEvent {
    /** 实体ID */
    entityId: string;
    /** 实体类型 */
    entityType: 'hero' | 'bean' | 'crystal';
    /** 新状态 */
    state: string;
    /** 状态变化原因 */
    reason?: string;
    /** 状态持续时间（毫秒，如果有） */
    duration?: number;
}
