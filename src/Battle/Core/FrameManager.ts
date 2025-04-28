/**
 * 帧管理器
 * 负责管理战斗中的逻辑帧和内部帧
 * 逻辑帧：每秒10帧，用于同步游戏状态和处理玩家指令
 * 内部帧：每秒50帧，用于处理高精度的游戏逻辑，如碰撞检测、技能效果等
 */

import { logger } from './Logger';
import { BattleCommand } from '../../DesignConfig/types/BattleCommand';

// 帧率配置
export const LOGIC_FRAME_RATE = 10; // 逻辑帧率（帧/秒）
export const INNER_FRAME_RATE = 50; // 内部帧率（帧/秒）
export const LOGIC_FRAME_INTERVAL = 1000 / LOGIC_FRAME_RATE; // 逻辑帧间隔（毫秒）
export const INNER_FRAME_INTERVAL = 1000 / INNER_FRAME_RATE; // 内部帧间隔（毫秒）
export const INNER_FRAMES_PER_LOGIC_FRAME = INNER_FRAME_RATE / LOGIC_FRAME_RATE; // 每个逻辑帧包含的内部帧数

// 帧类型枚举
export enum FrameType {
  LOGIC = 'logic',
  INNER = 'inner'
}

// 帧更新回调函数类型
export type FrameUpdateCallback = (frameType: FrameType, frameNumber: number, deltaTime: number) => void;

// 指令处理回调函数类型
export type CommandProcessCallback = (commands: BattleCommand[]) => void;

export class FrameManager {
  // 当前逻辑帧号
  private currentLogicFrame: number = 0;
  // 当前内部帧号
  private currentInnerFrame: number = 0;
  // 战斗开始时间（毫秒）
  private battleStartTime: number = 0;
  // 上一帧时间（毫秒）
  private lastFrameTime: number = 0;
  // 累积时间（毫秒）
  private accumulatedTime: number = 0;
  // 是否正在运行
  private running: boolean = false;
  // 是否暂停
  private paused: boolean = false;
  // 帧更新回调函数
  private updateCallback: FrameUpdateCallback | null = null;
  // 指令处理回调函数
  private commandProcessCallback: CommandProcessCallback | null = null;
  // 待处理的指令队列（按帧号分组）
  private pendingCommands: Map<number, BattleCommand[]> = new Map();
  // 已处理的指令历史
  private processedCommands: BattleCommand[] = [];
  // 模拟模式（用于回放）
  private simulationMode: boolean = false;
  // 模拟速度（1.0为正常速度）
  private simulationSpeed: number = 1.0;

  /**
   * 构造函数
   */
  constructor() {
    logger.debug('帧管理器初始化');
  }

  /**
   * 设置帧更新回调函数
   * @param callback 回调函数
   */
  public setUpdateCallback(callback: FrameUpdateCallback): void {
    this.updateCallback = callback;
  }

  /**
   * 设置指令处理回调函数
   * @param callback 回调函数
   */
  public setCommandProcessCallback(callback: CommandProcessCallback): void {
    this.commandProcessCallback = callback;
  }

  /**
   * 启动帧管理器
   */
  public start(): void {
    if (this.running) {
      logger.warn('帧管理器已经在运行中');
      return;
    }

    this.running = true;
    this.paused = false;
    this.battleStartTime = Date.now();
    this.lastFrameTime = this.battleStartTime;
    this.accumulatedTime = 0;
    this.currentLogicFrame = 0;
    this.currentInnerFrame = 0;

    logger.info('帧管理器启动');
    this.tick();
  }

  /**
   * 停止帧管理器
   */
  public stop(): void {
    this.running = false;
    logger.info('帧管理器停止');
  }

  /**
   * 暂停帧管理器
   */
  public pause(): void {
    this.paused = true;
    logger.info('帧管理器暂停');
  }

  /**
   * 恢复帧管理器
   */
  public resume(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    this.lastFrameTime = Date.now();
    logger.info('帧管理器恢复');
    this.tick();
  }

  /**
   * 重置帧管理器
   */
  public reset(): void {
    this.stop();
    this.currentLogicFrame = 0;
    this.currentInnerFrame = 0;
    this.pendingCommands.clear();
    this.processedCommands = [];
    logger.info('帧管理器重置');
  }

  /**
   * 添加战斗指令
   * @param command 战斗指令
   */
  public addCommand(command: BattleCommand): void {
    // 确保指令帧号大于当前帧号
    if (command.frame <= this.currentLogicFrame) {
      logger.warn(`指令帧号(${command.frame})小于或等于当前帧号(${this.currentLogicFrame})，无法添加`);
      return;
    }

    // 获取该帧的指令列表，如果不存在则创建
    let frameCommands = this.pendingCommands.get(command.frame);
    if (!frameCommands) {
      frameCommands = [];
      this.pendingCommands.set(command.frame, frameCommands);
    }

    // 添加指令
    frameCommands.push(command);
    logger.debug(`添加指令: 帧号=${command.frame}, 类型=${command.type}, 玩家=${command.playerId}`);
  }

  /**
   * 批量添加战斗指令
   * @param commands 战斗指令数组
   */
  public addCommands(commands: BattleCommand[]): void {
    for (const command of commands) {
      this.addCommand(command);
    }
  }

  /**
   * 获取当前逻辑帧号
   */
  public getCurrentLogicFrame(): number {
    return this.currentLogicFrame;
  }

  /**
   * 获取当前内部帧号
   */
  public getCurrentInnerFrame(): number {
    return this.currentInnerFrame;
  }

  /**
   * 获取战斗运行时间（毫秒）
   */
  public getBattleRuntime(): number {
    return Date.now() - this.battleStartTime;
  }

  /**
   * 获取已处理的指令历史
   */
  public getProcessedCommands(): BattleCommand[] {
    return [...this.processedCommands];
  }

  /**
   * 设置模拟模式（用于回放）
   * @param enabled 是否启用
   * @param speed 模拟速度（1.0为正常速度）
   */
  public setSimulationMode(enabled: boolean, speed: number = 1.0): void {
    this.simulationMode = enabled;
    this.simulationSpeed = Math.max(0.1, Math.min(10.0, speed));
    logger.info(`模拟模式: ${enabled ? '启用' : '禁用'}, 速度: ${this.simulationSpeed}x`);
  }

  /**
   * 帧循环
   */
  private tick(): void {
    if (!this.running || this.paused) {
      return;
    }
    // console.log('tick 帧循环 ')
    // 计算时间增量
    const currentTime = Date.now();
    let deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 在模拟模式下调整时间增量
    if (this.simulationMode) {
      deltaTime *= this.simulationSpeed;
    }

    // 累积时间
    this.accumulatedTime += deltaTime;

    // 处理内部帧
    while (this.accumulatedTime >= INNER_FRAME_INTERVAL) {
      this.accumulatedTime -= INNER_FRAME_INTERVAL;
      this.currentInnerFrame++;

      // 检查是否需要处理逻辑帧
      const isLogicFrame = this.currentInnerFrame % INNER_FRAMES_PER_LOGIC_FRAME === 0;
      if (isLogicFrame) {
        this.currentLogicFrame++;
        this.processLogicFrame();
      }

      // 调用帧更新回调
      if (this.updateCallback) {
        const frameType = isLogicFrame ? FrameType.LOGIC : FrameType.INNER;
        const frameNumber = isLogicFrame ? this.currentLogicFrame : this.currentInnerFrame;
        this.updateCallback(frameType, frameNumber, INNER_FRAME_INTERVAL);
      }
    }

    // 继续下一帧
    requestAnimationFrame(() => this.tick());
  }

  /**
   * 处理逻辑帧
   */
  private processLogicFrame(): void {
    // 处理当前帧的指令
    const commands = this.pendingCommands.get(this.currentLogicFrame) || [];
    if (commands.length > 0) {
      logger.debug(`处理帧${this.currentLogicFrame}的指令，数量: ${commands.length}`);

      // 调用指令处理回调
      if (this.commandProcessCallback) {
        this.commandProcessCallback(commands);
      }

      // 将处理过的指令添加到历史记录
      this.processedCommands.push(...commands);

      // 从待处理队列中移除
      this.pendingCommands.delete(this.currentLogicFrame);
    }
  }
}
