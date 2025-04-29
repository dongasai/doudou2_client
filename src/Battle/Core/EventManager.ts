/**
 * 事件管理器
 * 负责处理战斗中的事件分发和监听
 * 实现战斗引擎与视图层的解耦
 */

import { logger } from './Logger';
import { EventType, EventDataMap } from '../../Event/EventTypes';

// 事件处理函数类型
export type EventHandler<T = any> = (event: T) => void;

export class EventManager {
  // 事件监听器映射
  private listeners: Map<string, EventHandler[]> = new Map();
  // 事件历史记录
  private eventHistory: Array<{ type: string, data: any, timestamp: number }> = [];
  // 是否记录事件历史
  private recordHistory: boolean = false;
  // 最大历史记录数量
  private maxHistorySize: number = 1000;

  /**
   * 构造函数
   * @param recordHistory 是否记录事件历史
   */
  constructor(recordHistory: boolean = false) {
    this.recordHistory = recordHistory;
    logger.debug(`事件管理器初始化，记录历史: ${recordHistory}`);
  }

  /**
   * 添加事件监听器（使用枚举类型）
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public on<K extends EventType>(eventType: K, handler: EventHandler<EventDataMap[K]>): void;

  /**
   * 添加事件监听器（使用字符串类型，向后兼容）
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public on<T>(eventType: string, handler: EventHandler<T>): void;

  /**
   * 添加事件监听器（实现）
   */
  public on<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const handlers = this.listeners.get(eventType)!;
    if (!handlers.includes(handler)) {
      handlers.push(handler);
      logger.debug(`添加事件监听器: ${eventType}`);
    }
  }

  /**
   * 移除事件监听器（使用枚举类型）
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public off<K extends EventType>(eventType: K, handler: EventHandler<EventDataMap[K]>): void;

  /**
   * 移除事件监听器（使用字符串类型，向后兼容）
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public off<T>(eventType: string, handler: EventHandler<T>): void;

  /**
   * 移除事件监听器（实现）
   */
  public off<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventType)) {
      return;
    }

    const handlers = this.listeners.get(eventType)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      logger.debug(`移除事件监听器: ${eventType}`);
    }

    // 如果没有监听器了，删除该事件类型
    if (handlers.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * 触发事件（使用枚举类型）
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  public emit<K extends EventType>(eventType: K, eventData: EventDataMap[K]): void;

  /**
   * 触发事件（使用字符串类型，向后兼容）
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  public emit<T>(eventType: string, eventData: T): void;

  /**
   * 触发事件（实现）
   */
  public emit<T>(eventType: string, eventData: T): void {
    logger.debug(`触发事件: ${eventType}`);

    // 记录事件历史
    if (this.recordHistory) {
      this.eventHistory.push({
        type: eventType,
        data: eventData,
        timestamp: Date.now()
      });

      // 限制历史记录大小
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    // 如果没有该事件类型的监听器，直接返回
    if (!this.listeners.has(eventType)) {
      return;
    }

    // 调用所有监听器
    const handlers = this.listeners.get(eventType)!;
    for (const handler of handlers) {
      try {
        handler(eventData);
      } catch (error) {
        logger.error(`事件处理器异常: ${eventType}`, error);
      }
    }
  }

  /**
   * 一次性事件监听（使用枚举类型）
   * 事件触发后自动移除监听器
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public once<K extends EventType>(eventType: K, handler: EventHandler<EventDataMap[K]>): void;

  /**
   * 一次性事件监听（使用字符串类型，向后兼容）
   * 事件触发后自动移除监听器
   * @param eventType 事件类型
   * @param handler 事件处理函数
   */
  public once<T>(eventType: string, handler: EventHandler<T>): void;

  /**
   * 一次性事件监听（实现）
   */
  public once<T>(eventType: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (event: T) => {
      // 先移除监听器，再调用处理函数
      this.off(eventType, onceHandler);
      handler(event);
    };

    this.on(eventType, onceHandler);
  }

  /**
   * 移除指定事件类型的所有监听器（使用枚举类型）
   * @param eventType 事件类型
   */
  public removeAllListeners(eventType: EventType): void;

  /**
   * 移除指定事件类型的所有监听器（使用字符串类型，向后兼容）
   * @param eventType 事件类型
   */
  public removeAllListeners(eventType: string): void;

  /**
   * 移除指定事件类型的所有监听器（实现）
   */
  public removeAllListeners(eventType: string): void {
    if (this.listeners.has(eventType)) {
      this.listeners.delete(eventType);
      logger.debug(`移除所有事件监听器: ${eventType}`);
    }
  }

  /**
   * 移除所有事件监听器
   */
  public removeAllEventListeners(): void {
    this.listeners.clear();
    logger.debug('移除所有事件监听器');
  }

  /**
   * 获取事件历史记录
   */
  public getEventHistory(): Array<{ type: string, data: any, timestamp: number }> {
    return [...this.eventHistory];
  }

  /**
   * 清空事件历史记录
   */
  public clearEventHistory(): void {
    this.eventHistory = [];
    logger.debug('清空事件历史记录');
  }

  /**
   * 设置是否记录事件历史
   * @param record 是否记录
   */
  public setRecordHistory(record: boolean): void {
    this.recordHistory = record;
  }

  /**
   * 设置最大历史记录数量
   * @param size 最大数量
   */
  public setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);

    // 如果当前历史记录超过新的最大值，裁剪多余部分
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 获取指定类型的事件监听器数量
   * @param eventType 事件类型
   */
  public listenerCount(eventType: string): number {
    return this.listeners.has(eventType) ? this.listeners.get(eventType)!.length : 0;
  }

  /**
   * 获取所有已注册的事件类型
   */
  public eventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }
}
