/**
 * 回放事件定义
 * 定义回放系统中使用的事件类型和数据结构
 */

import { ReplayState } from '@/DesignConfig';

// 回放事件类型
export enum ReplayEventType {
  // 回放状态变化
  STATE_CHANGED = 'replay_state_changed',
  // 回放时间更新
  TIME_UPDATED = 'replay_time_updated',
  // 回放事件触发
  EVENT_TRIGGERED = 'replay_event_triggered',
  // 回放加载完成
  REPLAY_LOADED = 'replay_loaded',
  // 回放完成
  REPLAY_COMPLETED = 'replay_completed',
  // 回放错误
  REPLAY_ERROR = 'replay_error',
  // 回放文件列表更新
  FILE_LIST_UPDATED = 'replay_file_list_updated',
  // 回放速度变化
  SPEED_CHANGED = 'replay_speed_changed',
  // 回放跳转
  SEEK = 'replay_seek'
}

// 回放状态变化事件数据
export interface ReplayStateChangedEvent {
  state: ReplayState;
  previousState?: ReplayState;
}

// 回放时间更新事件数据
export interface ReplayTimeUpdatedEvent {
  currentTime: number;
  totalDuration: number;
  currentFrame: number;
  maxFrame: number;
  progress: number; // 0-100
}

// 回放事件触发事件数据
export interface ReplayEventTriggeredEvent {
  event: any;
  time: number;
  frame: number;
}

// 回放加载完成事件数据
export interface ReplayLoadedEvent {
  replayData: any;
  totalDuration: number;
  eventsCount: number;
  commandsCount: number;
}

// 回放完成事件数据
export interface ReplayCompletedEvent {
  duration: number;
  result: string;
}

// 回放错误事件数据
export interface ReplayErrorEvent {
  error: string;
  code?: number;
}

// 回放文件列表更新事件数据
export interface ReplayFileListUpdatedEvent {
  files: any[];
}

// 回放速度变化事件数据
export interface ReplaySpeedChangedEvent {
  speed: number;
  previousSpeed: number;
}

// 回放跳转事件数据
export interface ReplaySeekEvent {
  time: number;
  frame: number;
  seekType: 'time' | 'frame';
}
