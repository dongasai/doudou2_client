/**
 * 移动命令事件
 * 从视图层传递到战斗引擎的移动命令
 */
export interface MoveCommandEvent {
    /** 实体ID */
    entityId: string;
    /** 目标位置 */
    targetPosition: { x: number; y: number };
    /** 是否立即移动 */
    immediate: boolean;
    /** 移动速度（可选，默认使用实体速度） */
    speed?: number;
    /** 命令时间戳 */
    timestamp: number;
}
