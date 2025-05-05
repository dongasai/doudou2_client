/**
 * 英雄目标变化事件
 * 当英雄的攻击目标发生变化时触发，用于通知视图层显示选中效果
 */
export interface HeroTargetChangedEvent {
    /** 英雄ID */
    heroId: string;
    /** 新目标ID */
    targetId: string | null;
    /** 目标类型（如果有目标） */
    targetType?: 'bean' | 'crystal';
    /** 变化时间戳 */
    timestamp: number;
}
