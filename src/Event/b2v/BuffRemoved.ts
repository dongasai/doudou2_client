/**
 * Buff移除事件
 * 从战斗引擎传递到视图层的Buff移除信息
 */
export interface BuffRemovedEvent {
    /** 目标实体ID */
    targetId: string;
    /** 目标实体类型 */
    targetType: 'hero' | 'bean' | 'crystal';
    /** Buff类型 */
    buffType: 'attack_buff' | 'defense_buff' | 'speed_buff' | 'dot' | 'hot' | 'shield' | 'reflect';
    /** Buff ID */
    buffId: string;
    /** 移除原因 */
    reason: 'expired' | 'dispelled' | 'death' | 'replaced' | 'other';
}
