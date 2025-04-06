import { BaseStats } from './BaseStats';

export interface ItemsList {
  items: ShopItem[];
}

/**
 * 关卡配置类型定义
 */
export interface ShopItem {
  /** 物品ID */
  id: string;
  /** 物品名称 */
  name: string;
  /** 物品类型 */
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  /** 物品效果 */
  effect: {
    /** 影响的属性 */
    stat: keyof BaseStats;
    /** 增加值 */
    value: number;
  };
  /** 价格 */
  price: number;
}

export interface LevelUpOption {
  /** 选项ID */
  id: string;
  /** 选项名称 */
  name: string;
  /** 选项效果 */
  effect: {
    /** 影响的属性 */
    stat: keyof BaseStats;
    /** 增加值 */
    value: number;
  };
}

/**
 * 关卡配置类型定义
 */
export interface LevelConfig {
  /** 关卡唯一标识符 */
  id: string;
  /** 关卡名称 */
  name: string;
  /** 关卡描述 */
  description: string;
  /** 难度系数(1.0为基础难度) */
  difficulty: number;
  
  /** 水晶配置 */
  crystal: {
    /** 水晶位置(固定中央) */
    position: { x: 400; y: 300 };
    /** 最大生命值 */
    maxHp: number;
  };

  /** 豆豆生成比例配置 */
  beanRatios: Array<{
    /** 豆豆类型 */
    type: string;
    /** 生成权重 */
    weight: number;
  }>;

  /** 豆豆总生成数量 */
  totalBeans: number;
  /** 生成间隔(毫秒) */
  spawnInterval: number;

  /** 属性系数 */
  attrFactors: {
    /** 生命值系数 */
    hp: number;
    /** 攻击力系数 */
    attack: number;
    /** 防御力系数 */
    defense: number;
    /** 速度系数 */
    speed: number;
  };

  /** 胜利条件类型 */
  victoryCondition: {
    type: 'allDefeated' | 'bossDefeated' | 'timeSurvived';
    /** 要求值(如存活时间秒数) */
    value?: number;
  };

  /** 失败条件类型 */
  defeatCondition: {
    type: 'crystalDestroyed' | 'heroesDefeated';
  };

  /** 背景类型 */
  background: 'grassland' | 'boss' | 'snowfield' | 'volcano' | 'night' | 'ruins' | 'hell';
  /** 可用英雄槽位数量 */
  availableHeroSlots: number;
}

/**
 * 关卡索引类型定义
 */
export interface LevelIndex {
  levels: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: number;
    background: string;
    availableHeroSlots: number;
    victoryCondition: string;
    defeatCondition: string;
  }>;
  byDifficulty: {[key: string]: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: number;
  }>};
  byBackground: {[key: string]: Array<{
    id: string;
    name: string;
    description: string;
    background: string;
  }>};
  byVictoryCondition: {[key: string]: Array<{
    id: string;
    name: string;
    description: string;
    victoryCondition: string;
  }>};
}

/**
 * 关卡章节配置
 */
export interface ChapterConfig {
  /** 章节名称 */
  name: string;
  /** 章节序号 */
  index: number;
  /** 包含的关卡 */
  levels: LevelConfig[];
}
