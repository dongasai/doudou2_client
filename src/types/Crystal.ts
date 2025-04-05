import type { BaseStats } from './BaseStats';

/**
 * 水晶防御状态
 */
type DefenseStatus = 'normal' | 'damaged' | 'critical' | 'destroyed';

/**
 * 水晶对象接口
 * 描述游戏中的核心防御目标
 */
interface Crystal {
  /** 水晶ID */
  id: number;
  /** 显示名称 */
  name: string;
  /** 基础属性 */
  stats: BaseStats & {
    /** 当前血量 */
    currentHP: number;
    /** 最大血量 */
    maxHP: number;
  };
  /** 防御状态 */
  status: DefenseStatus;
  /** 位置索引(对应英雄站位中心) */
  positionIndex: number;
  /** 防御加成效果 */
  defenseBonus: number;
}

export type { Crystal, DefenseStatus };