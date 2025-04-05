import type { BattleStats } from './GameHero';
import type { Crystal } from './Crystal';

/**
 * 战斗初始化参数接口
 * 描述启动战斗引擎所需的全部配置
 */
export interface BattleInitParams {
  // 核心防御目标
  crystal: Crystal;
  
  // 玩家配置(1-5人)
  players: {
    id: string;         // 玩家唯一ID
    name: string;       // 玩家昵称
    hero: {
      id: number;       // 英雄ID(1-30)
      stats: BattleStats;
      position: number; // 固定站位(1-5)
    };
  }[];
  
  // 关卡配置
  level: {
    chapter: number;    // 章节(1-10)
    stage: number;      // 关卡(1-10)
  };
}