/**
 * 实体创建事件
 * 从战斗引擎传递到视图层的实体创建信息
 */
export interface EntityCreatedEvent {
    /* 实体ID */
    id:string;
    /** 实体类型 */
    entityType: 'hero' | 'bean' | 'crystal';
    /** 实体位置 */
    position: { x: number; y: number };
    /** 实体属性 */
    stats: {
        /** 当前生命值 */
        hp: number;
        /** 最大生命值 */
        maxHp: number;
        /** 攻击力 */
        attack?: number;
        /** 防御力 */
        defense?: number;
        /** 速度 */
        speed?: number;
        /** 其他属性 */
        [key: string]: number | undefined;
    };
    /** 实体名称（可选） */
    name?: string;
    /** 实体外观（可选） */
    appearance?: string;
    /** 表情符号（可选，用于豆豆等实体） */
    emoji: string;
    // 英雄ID
    heroId?: number;
    // 豆豆ID
    beanId?: number;
}
