/**
 * 战斗统计数据接口
 * 描述战斗过程中的统计信息
 */

import { Vector2D } from './Vector2D';

/**
 * 英雄状态数据
 */
export interface HeroStats {
  /** 英雄ID */
  id: string;
  /** 英雄名称 */
  name: string;
  /** 英雄等级 */
  level?: number;
  /** 当前生命值 */
  hp: number;
  /** 最大生命值 */
  maxHp: number;
  /** 当前魔法值 */
  mp?: number;
  /** 最大魔法值 */
  maxMp?: number;
  /** 英雄位置 */
  position: Vector2D;
}

/**
 * 水晶统计数据
 */
export interface CrystalStats {
  /** 当前生命值 */
  hp: number;
  /** 最大生命值 */
  maxHp: number;
  /** 位置 */
  position?: Vector2D;
}

/**
 * 豆豆统计数据
 */
export interface BeanStats {
  /** 豆豆ID */
  id: string;
  /** 豆豆名称 */
  name?: string;
  /** 豆豆类型 */
  type?: string;
  /** 当前生命值 */
  hp: number;
  /** 最大生命值 */
  maxHp: number;
  /** 豆豆位置 */
  position: Vector2D;
}

/**
 * 波次信息
 */
export interface WaveInfo {
  /** 波次编号 */
  number: number;
  /** 波次名称 */
  name?: string;
  /** 波次进度 (0-1) */
  progress: number;
  /** 波次开始时间 */
  startTime?: number;
  /** 波次持续时间 */
  duration?: number;
}

/**
 * 战斗统计数据
 */
export interface BattleStats {
  /** 战斗持续时间 (毫秒) */
  duration: number;
  /** 总伤害输出 */
  totalDamageDealt: number;
  /** 总伤害承受 */
  totalDamageTaken: number;
  /** 击败的敌人数量 */
  totalEnemiesDefeated: number;
  /** 当前波次信息 */
  currentWave?: WaveInfo;
  /** 英雄统计数据 */
  heroStats: HeroStats[];
  /** 水晶统计数据 */
  crystalStats: CrystalStats | null;
  /** 豆豆统计数据 */
  beanStats?: BeanStats[];
}
