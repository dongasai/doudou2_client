/**
 * 游戏暂停/恢复事件
 * 从视图层传递到战斗引擎的游戏流程控制命令
 */
export interface GamePauseResumeEvent {
    /** 操作类型 */
    action: 'pause' | 'resume';
    /** 操作原因 */
    reason: 'user_request' | 'system' | 'menu' | 'background' | 'other';
    /** 操作时间戳 */
    timestamp: number;
}
