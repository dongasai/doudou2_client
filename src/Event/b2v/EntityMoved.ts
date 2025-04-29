/**
 * 实体移动事件
 * 从战斗引擎传递到视图层的实体移动信息
 */
export interface EntityMovedEvent {
    /** 实体ID */
    entityId: string;
    /** 实体类型 */
    entityType: 'hero' | 'bean' | 'crystal';
    /** 当前位置 */
    position: { x: number; y: number };
    /** 移动速度 */
    speed?: number;
    /** 移动方向（弧度） */
    direction?: number;
}
