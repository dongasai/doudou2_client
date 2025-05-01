import type { BattleInitParams } from './BattleInitParams';
import type { BattleCommand } from './BattleCommand';

/**
 * 回放事件接口
 * 描述战斗过程中的关键事件
 */
export interface ReplayEvent {
  /** 事件类型 */
  type: string;

  /** 事件发生的帧号 */
  frame: number;

  /** 事件发生的时间（毫秒） */
  time: number;

  /** 事件数据 */
  data: any;
}

/**
 * 回放元数据接口
 * 描述回放的附加信息
 */
export interface ReplayMetadata {
  /** 记录时间戳 */
  recordTime?: number;

  /** 战斗时长(毫秒) */
  battleDuration: number;

  /** 章节 */
  chapter: number;

  /** 关卡 */
  stage: number;

  /** 参与玩家列表 */
  players: string[];

  /** 回放版本 */
  version?: string;

  /** 战斗结果 */
  result?: string;

  /** 战斗得分 */
  score?: number;

  /** 其他自定义元数据 */
  [key: string]: any;
}

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

  /** 事件序列 */
  events?: ReplayEvent[];

  /** 元数据 */
  metadata: ReplayMetadata;
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

/**
 * 回放状态枚举
 */
export enum ReplayState {
  IDLE = 'idle',           // 空闲状态
  RECORDING = 'recording', // 记录中
  PLAYING = 'playing',     // 播放中
  PAUSED = 'paused',       // 暂停
  COMPLETED = 'completed'  // 已完成
}