/**
 * 实体属性变化事件
 * 从战斗引擎传递到视图层的实体属性变化信息
 */
export interface EntityStatsChangedEvent {
    /** 实体ID */
    entityId: string;
    /** 实体类型 */
    entityType: 'hero' | 'bean' | 'crystal';
    /** 变化的属性 */
    changedStats: {
        /** 当前生命值 */
        hp?: number;
        /** 最大生命值 */
        maxHp?: number;
        /** 攻击力 */
        attack?: number;
        /** 防御力 */
        defense?: number;
        /** 速度 */
        speed?: number;
        /** 其他属性 */
        [key: string]: number | undefined;
    };
    /** 变化原因 */
    reason?: string;
}
