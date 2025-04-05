import type { CharacterBean } from '../types/CharacterBean';

/**
 * 豆豆生成事件
 */
export interface BeanSpawnedEvent {
    /** 豆豆配置 */
    config: CharacterBean;
    /** 豆豆位置 */
    position: { x: number; y: number };
    /** 豆豆ID */
    id: string;
}