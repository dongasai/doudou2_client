/**
 * 玩家输入事件
 * 从视图层传递到战斗引擎的玩家输入信息
 */
export interface PlayerInputEvent {
    /** 输入类型 */
    inputType: 'tap' | 'drag' | 'swipe' | 'pinch' | 'button';
    /** 输入位置 */
    position: { x: number; y: number };
    /** 输入目标（如果有） */
    targetId?: string;
    /** 输入时间戳 */
    timestamp: number;
    /** 额外数据 */
    data?: any;
}
