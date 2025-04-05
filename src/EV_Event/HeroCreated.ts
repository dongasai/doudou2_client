import { Position } from '../types/Position';

/**
 * 英雄创建事件
 */
export interface HeroCreatedEvent {
    /** 英雄ID */
    id: string;
    /** 英雄类型 */
    type: string;
    /** 英雄位置 */
    position: Position;
}