/**
 * 豆豆效果接口
 */
export interface BeanEffect {
  /** 效果名称 */
  name: string;
  /** 效果描述 */
  description: string;
  /** 效果类型 */
  type: string;
  /** 效果值 */
  value?: number;
  /** 效果持续时间（毫秒） */
  duration?: number;
}

/**
 * 豆豆基础信息接口
 */
export interface Bean {
  /** 豆豆唯一ID */
  id: number;
  /** 豆豆名称 */
  name: string;
  /** 豆豆表情符号 */
  emoji: string;
  /** 豆豆类型 */
  type: string;
  /** 豆豆稀有度 */
  rarity?: string;
  /** 豆豆描述 */
  description?: string;
  /** 豆豆效果列表 */
  effects?: BeanEffect[];
  /** 豆豆属性 */
  stats?: {
    /** 生命值 */
    hp: number;
    /** 攻击力 */
    attack: number;
    /** 防御力 */
    defense: number;
    /** 速度 */
    speed: number;
  };
}
