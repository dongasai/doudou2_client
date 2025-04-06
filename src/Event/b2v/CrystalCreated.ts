import { Position } from '../types/Position';

/**
 * 水晶创建事件
 */
export interface CrystalCreatedEvent {
    /** 水晶位置 */
    position: Position;
}