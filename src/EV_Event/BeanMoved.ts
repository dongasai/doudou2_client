import { Position } from '../types/Position';

/**
 * 豆豆移动事件
 */
export interface BeanMovedEvent {
    /** 豆豆ID */
    beanId: string;
    /** 豆豆位置 */
    position: Position;
}