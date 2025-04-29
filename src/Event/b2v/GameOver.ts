/**
 * 游戏结束事件
 */
export interface GameOverEvent {
    /** 是否胜利 */
    victory: boolean;
    /** 游戏结果 */
    result: 'victory' | 'defeat' | 'none';
    /** 游戏持续时间（毫秒） */
    duration?: number;
    /** 游戏统计数据 */
    stats?: any;
}