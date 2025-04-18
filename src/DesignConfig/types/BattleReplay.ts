import type { BattleInitParams } from './BattleInitParams';
import type { BattleCommand } from './BattleCommand';

/**
 * 战斗回放数据接口
 * 描述完整战斗回放所需的全部数据
 */
export interface BattleReplayData {
  /** 回放唯一ID */
  replayId: string;
  
  /** 随机种子(确保战斗过程可重现) */
  randomSeed: number;
  
  /** 初始战斗参数 */
  initParams: BattleInitParams;
  
  /** 指令序列 */
  commands: BattleCommand[];
  
  /** 元数据 */
  metadata: {
    /** 战斗时长(毫秒) */
    battleDuration: number;
    /** 章节 */
    chapter: number;
    /** 关卡 */
    stage: number;
    /** 参与玩家列表 */
    players: string[];
  };
}

/**
 * 回放控制选项
 */
export interface ReplayOptions {
  /** 播放速度(0.5-4倍) */
  speed: number;
  /** 是否显示操作标记 */
  showCommands: boolean;
  /** 视角跟随 */
  followTarget?: 'hero' | 'crystal' | 'bean';
}