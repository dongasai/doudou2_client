/**
 * 回放事件总线
 * 用于战斗引擎和UI层之间的通信
 */

import { ReplayState } from '../../DesignConfig/types/BattleReplay';
import { logger } from '../Core/Logger';

// 回放事件类型
export enum ReplayEventType {
  // 状态变化事件
  STATE_CHANGED = 'replay_state_changed',
  // 时间更新事件
  TIME_UPDATED = 'replay_time_updated',
  // 事件触发事件
  EVENT_TRIGGERED = 'replay_event_triggered',
  // 回放加载事件
  REPLAY_LOADED = 'replay_loaded',
  // 回放完成事件
  REPLAY_COMPLETED = 'replay_completed',
  // 回放错误事件
  REPLAY_ERROR = 'replay_error',
  // 回放文件列表更新事件
  FILE_LIST_UPDATED = 'replay_file_list_updated'
}

// 回放事件数据接口
export interface ReplayEventData {
  type: ReplayEventType;
  data: any;
}

// 回放事件监听器类型
export type ReplayEventListener = (data: any) => void;

/**
 * 回放事件总线类
 * 实现发布-订阅模式
 */
export class ReplayEventBus {
  private static instance: ReplayEventBus;
  private listeners: Map<ReplayEventType, ReplayEventListener[]> = new Map();

  /**
   * 私有构造函数，防止直接实例化
   */
  private constructor() {
    // 初始化监听器映射
    Object.values(ReplayEventType).forEach(type => {
      this.listeners.set(type as ReplayEventType, []);
    });
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ReplayEventBus {
    if (!ReplayEventBus.instance) {
      ReplayEventBus.instance = new ReplayEventBus();
    }
    return ReplayEventBus.instance;
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  public on(type: ReplayEventType, listener: ReplayEventListener): void {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
    logger.debug(`添加回放事件监听器: ${type}, 当前监听器数量: ${listeners.length}`);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器函数
   */
  public off(type: ReplayEventType, listener: ReplayEventListener): void {
    const listeners = this.listeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.listeners.set(type, listeners);
      logger.debug(`移除回放事件监听器: ${type}, 当前监听器数量: ${listeners.length}`);
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   */
  public emit(type: ReplayEventType, data: any): void {
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        logger.error(`回放事件监听器执行错误: ${type}`, error);
      }
    });
    logger.debug(`触发回放事件: ${type}, 监听器数量: ${listeners.length}`);
  }

  /**
   * 通知状态变化
   * @param state 回放状态
   */
  public notifyStateChanged(state: ReplayState): void {
    this.emit(ReplayEventType.STATE_CHANGED, { state });
  }

  /**
   * 通知时间更新
   * @param currentTime 当前时间
   * @param totalDuration 总时长
   */
  public notifyTimeUpdated(currentTime: number, totalDuration: number): void {
    this.emit(ReplayEventType.TIME_UPDATED, { currentTime, totalDuration });
  }

  /**
   * 通知事件触发
   * @param event 回放事件
   */
  public notifyEventTriggered(event: any): void {
    this.emit(ReplayEventType.EVENT_TRIGGERED, { event });
  }

  /**
   * 通知回放加载
   * @param replayData 回放数据
   */
  public notifyReplayLoaded(replayData: any): void {
    this.emit(ReplayEventType.REPLAY_LOADED, { replayData });
  }

  /**
   * 通知回放完成
   */
  public notifyReplayCompleted(): void {
    this.emit(ReplayEventType.REPLAY_COMPLETED, {});
  }

  /**
   * 通知回放错误
   * @param error 错误信息
   */
  public notifyReplayError(error: string): void {
    this.emit(ReplayEventType.REPLAY_ERROR, { error });
  }

  /**
   * 通知文件列表更新
   * @param files 文件列表
   */
  public notifyFileListUpdated(files: any[]): void {
    this.emit(ReplayEventType.FILE_LIST_UPDATED, { files });
  }
}

// 导出单例实例
export const replayEventBus = ReplayEventBus.getInstance();
