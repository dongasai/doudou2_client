import { BaseStats } from './BaseStats';



/**
 * 关卡配置类型定义
 */
export interface Stage {
  /** 关卡唯一标识符 */
  id: string;
  /** 关卡名称 */
  name: string;
  /** 关卡描述 */
  description: string;
  
  /** 水晶配置 */
  crystal: {
    /** 水晶位置(固定中央) */
    position: { x: 1500; y: 1500 };
    /** 最大生命值 */
    maxHp: number;
  };

  /** 豆豆生成比例配置 */
  beanRatios: Array<{
    /** 豆豆类型 */
    type: string;
    /** 生成权重 */
    weight: number;
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
  }>;

  /** 豆豆总生成数量 */
  totalBeans: number;
  /** 生成间隔(毫秒) */
  spawnInterval: number;



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
  
  
}

