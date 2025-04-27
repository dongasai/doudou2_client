/**
 * 战斗回放管理器
 * 负责记录和回放战斗过程
 */

import { logger } from './Logger';
import { BattleInitParams } from '../../DesignConfig/types/BattleInitParams';
import { BattleCommand } from '../../DesignConfig/types/BattleCommand';
import { BattleReplayData } from '../../DesignConfig/types/BattleReplay';
import { EventManager } from './EventManager';
import { ReplayEventType } from '../Events/ReplayEvents';

// 回放状态枚举
export enum ReplayState {
  IDLE = 'idle',           // 空闲状态
  RECORDING = 'recording', // 记录中
  PLAYING = 'playing',     // 播放中
  PAUSED = 'paused',       // 暂停
  COMPLETED = 'completed'  // 已完成
}

// 回放事件类型
export interface ReplayEvent {
  type: string;            // 事件类型
  frame: number;           // 事件发生的帧号
  time: number;            // 事件发生的时间（毫秒）
  data: any;               // 事件数据
}

export class ReplayManager {
  // 回放状态
  private state: ReplayState = ReplayState.IDLE;
  // 事件管理器
  private eventManager: EventManager;
  // 当前回放数据
  private replayData: BattleReplayData | null = null;
  // 记录的事件列表
  private events: ReplayEvent[] = [];
  // 记录开始时间
  private recordStartTime: number = 0;
  // 回放开始时间
  private playbackStartTime: number = 0;
  // 回放速度（1.0为正常速度）
  private playbackSpeed: number = 1.0;
  // 回放当前帧
  private currentFrame: number = 0;
  // 回放当前时间
  private currentTime: number = 0;
  // 回放暂停时间点
  private pauseTime: number = 0;
  // 回放事件回调
  private eventCallback: ((event: ReplayEvent) => void) | null = null;
  // 回放状态回调
  private stateCallback: ((state: ReplayState) => void) | null = null;
  // 回放完成回调
  private completionCallback: (() => void) | null = null;

  /**
   * 构造函数
   * @param eventManager 事件管理器
   */
  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;

    // 注册事件监听
    this.registerEventListeners();

    logger.debug('回放管理器初始化');
  }

  /**
   * 开始记录战斗
   * @param initParams 战斗初始化参数
   * @param randomSeed 随机种子
   */
  public startRecording(initParams: BattleInitParams, randomSeed: number): void {
    if (this.state !== ReplayState.IDLE) {
      logger.warn(`无法开始记录，当前状态: ${this.state}`);
      return;
    }

    // 创建新的回放数据
    this.replayData = {
      replayId: `replay_${Date.now()}`,
      randomSeed: randomSeed,
      initParams: initParams,
      commands: [],
      events: [],
      metadata: {
        recordTime: Date.now(),
        battleDuration: 0,
        chapter: initParams.level.chapter,
        stage: initParams.level.stage,
        players: initParams.players.map(p => p.id),
        version: '1.0.0'
      }
    };

    // 清空事件列表
    this.events = [];

    // 记录开始时间
    this.recordStartTime = Date.now();

    // 更新状态
    this.state = ReplayState.RECORDING;

    logger.info('开始记录战斗回放');
  }

  /**
   * 停止记录战斗
   * @returns 回放数据
   */
  public stopRecording(): BattleReplayData | null {
    if (this.state !== ReplayState.RECORDING) {
      logger.warn(`无法停止记录，当前状态: ${this.state}`);
      return null;
    }

    if (!this.replayData) {
      logger.error('回放数据不存在');
      return null;
    }

    // 计算战斗持续时间
    const battleDuration = Date.now() - this.recordStartTime;

    // 更新回放数据
    this.replayData.metadata.battleDuration = battleDuration;
    this.replayData.events = [...this.events];

    // 更新状态
    this.state = ReplayState.IDLE;

    logger.info(`停止记录战斗回放，持续时间: ${battleDuration}ms, 事件数: ${this.events.length}`);

    return this.replayData;
  }

  /**
   * 添加指令到回放
   * @param command 战斗指令
   */
  public addCommand(command: BattleCommand): void {
    if (this.state !== ReplayState.RECORDING || !this.replayData) {
      return;
    }

    // 添加指令到回放数据
    this.replayData.commands.push(command);

    logger.debug(`记录指令: ${command.type}, 帧号: ${command.frame}`);
  }

  /**
   * 添加事件到回放
   * @param eventType 事件类型
   * @param eventData 事件数据
   * @param frame 帧号
   * @param time 时间（毫秒）
   */
  public addEvent(eventType: string, eventData: any, frame: number, time: number): void {
    if (this.state !== ReplayState.RECORDING) {
      return;
    }

    // 创建事件对象
    const event: ReplayEvent = {
      type: eventType,
      frame: frame,
      time: time,
      data: eventData
    };

    // 添加到事件列表
    this.events.push(event);

    logger.debug(`记录事件: ${eventType}, 帧号: ${frame}, 时间: ${time}ms`);
  }

  /**
   * 加载回放数据
   * @param replayData 回放数据
   */
  public loadReplay(replayData: BattleReplayData): void {
    if (this.state !== ReplayState.IDLE) {
      logger.warn(`无法加载回放，当前状态: ${this.state}`);
      return;
    }

    this.replayData = replayData;
    this.events = replayData.events || [];
    this.currentFrame = 0;
    this.currentTime = 0;

    // 发布回放加载事件
    this.eventManager.emit(ReplayEventType.REPLAY_LOADED, {
      replayData: this.replayData,
      totalDuration: this.getTotalDuration(),
      eventsCount: this.events.length,
      commandsCount: this.replayData.commands?.length || 0
    });

    logger.info(`加载回放数据: ID=${replayData.replayId}, 事件数: ${this.events.length}`);
  }

  /**
   * 从文件加载回放数据
   * @param filePath 文件路径
   * @returns 是否成功加载
   */
  public loadReplayFromFile(filePath: string): boolean {
    if (this.state !== ReplayState.IDLE) {
      logger.warn(`无法加载回放，当前状态: ${this.state}`);
      return false;
    }

    try {
      const fs = require('fs');
      const zlib = require('zlib');

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        logger.error(`回放文件不存在: ${filePath}`);
        return false;
      }

      // 读取文件内容
      const fileContent = fs.readFileSync(filePath);

      // 判断是否是压缩文件
      const isCompressed = filePath.endsWith('.gz');

      let replayData: BattleReplayData;

      if (isCompressed) {
        // 解压缩数据
        const decompressedData = zlib.gunzipSync(fileContent).toString();
        replayData = JSON.parse(decompressedData);
        logger.debug(`解压缩回放数据: 压缩大小=${fileContent.length} 字节, 解压后大小=${decompressedData.length} 字节`);
      } else {
        // 直接解析JSON
        replayData = JSON.parse(fileContent.toString());
      }

      // 加载回放数据
      this.loadReplay(replayData);

      logger.info(`从文件加载回放数据成功: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`加载回放文件失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取回放文件列表
   * @param directory 目录路径（默认为logs/battle_replay/）
   * @returns 回放文件列表
   */
  public getReplayFileList(directory: string = 'logs/battle_replay/'): any[] {
    try {
      const fs = require('fs');
      const path = require('path');

      // 检查目录是否存在
      if (!fs.existsSync(directory)) {
        logger.warn(`回放目录不存在: ${directory}`);
        return [];
      }

      // 获取目录中的所有文件
      const files = fs.readdirSync(directory)
        .filter((file: string) =>
          (file.startsWith('replay-') && (file.endsWith('.json') || file.endsWith('.json.gz'))) ||
          file.endsWith('.meta.json')
        );

      // 解析元数据文件
      const metaFiles = files.filter((file: string) => file.endsWith('.meta.json'));
      const replayFiles = files.filter((file: string) => !file.endsWith('.meta.json'));

      // 构建回放文件列表
      const replayList: any[] = [];

      // 首先处理有元数据的文件
      for (const metaFile of metaFiles) {
        try {
          const metaFilePath = path.join(directory, metaFile);
          const metaContent = fs.readFileSync(metaFilePath, 'utf8');
          const metadata = JSON.parse(metaContent);

          // 查找对应的回放文件
          const baseFileName = metaFile.replace('.meta.json', '');
          const replayFile = replayFiles.find((file: string) => file.startsWith(baseFileName));

          if (replayFile) {
            const replayFilePath = path.join(directory, replayFile);
            const stats = fs.statSync(replayFilePath);

            replayList.push({
              id: metadata.replayId,
              filename: replayFile,
              path: replayFilePath,
              metadata: metadata,
              size: stats.size,
              mtime: stats.mtime
            });
          }
        } catch (e) {
          logger.warn(`解析元数据文件失败: ${metaFile}, 错误: ${e}`);
        }
      }

      // 处理没有元数据的文件
      for (const replayFile of replayFiles) {
        // 检查是否已经处理过
        const alreadyProcessed = replayList.some(item => item.filename === replayFile);
        if (alreadyProcessed) continue;

        const replayFilePath = path.join(directory, replayFile);
        const stats = fs.statSync(replayFilePath);

        replayList.push({
          id: null,
          filename: replayFile,
          path: replayFilePath,
          metadata: null,
          size: stats.size,
          mtime: stats.mtime
        });
      }

      // 按修改时间排序，最新的在前面
      replayList.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // 发布文件列表更新事件
      this.eventManager.emit(ReplayEventType.FILE_LIST_UPDATED, {
        files: replayList
      });

      return replayList;
    } catch (error) {
      logger.error(`获取回放文件列表失败: ${error}`);
      return [];
    }
  }

  /**
   * 开始回放
   */
  public startPlayback(): void {
    if (this.state !== ReplayState.IDLE && this.state !== ReplayState.PAUSED) {
      logger.warn(`无法开始回放，当前状态: ${this.state}`);
      return;
    }

    if (!this.replayData) {
      logger.error('回放数据不存在');
      return;
    }

    if (this.state === ReplayState.PAUSED) {
      // 恢复回放
      this.resumePlayback();
      return;
    }

    // 重置回放状态
    this.currentFrame = 0;
    this.currentTime = 0;
    this.playbackStartTime = Date.now();

    // 保存之前的状态
    const previousState = this.state;

    // 更新状态
    this.state = ReplayState.PLAYING;

    // 触发状态回调
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }

    // 发布状态变化事件
    this.eventManager.emit(ReplayEventType.STATE_CHANGED, {
      state: this.state,
      previousState
    });

    logger.info('开始回放');

    // 开始回放循环
    this.playbackLoop();
  }

  /**
   * 暂停回放
   */
  public pausePlayback(): void {
    if (this.state !== ReplayState.PLAYING) {
      return;
    }

    // 记录暂停时间
    this.pauseTime = Date.now();

    // 保存之前的状态
    const previousState = this.state;

    // 更新状态
    this.state = ReplayState.PAUSED;

    // 触发状态回调
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }

    // 发布状态变化事件
    this.eventManager.emit(ReplayEventType.STATE_CHANGED, {
      state: this.state,
      previousState
    });

    logger.info('暂停回放');
  }

  /**
   * 恢复回放
   */
  public resumePlayback(): void {
    if (this.state !== ReplayState.PAUSED) {
      return;
    }

    // 调整开始时间，考虑暂停的时间
    const pauseDuration = Date.now() - this.pauseTime;
    this.playbackStartTime += pauseDuration;

    // 保存之前的状态
    const previousState = this.state;

    // 更新状态
    this.state = ReplayState.PLAYING;

    // 触发状态回调
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }

    // 发布状态变化事件
    this.eventManager.emit(ReplayEventType.STATE_CHANGED, {
      state: this.state,
      previousState
    });

    logger.info('恢复回放');

    // 继续回放循环
    this.playbackLoop();
  }

  /**
   * 停止回放
   */
  public stopPlayback(): void {
    if (this.state !== ReplayState.PLAYING && this.state !== ReplayState.PAUSED) {
      return;
    }

    // 保存之前的状态
    const previousState = this.state;

    // 更新状态
    this.state = ReplayState.IDLE;

    // 触发状态回调
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }

    // 发布状态变化事件
    this.eventManager.emit(ReplayEventType.STATE_CHANGED, {
      state: this.state,
      previousState
    });

    logger.info('停止回放');
  }

  /**
   * 设置回放速度
   * @param speed 速度（1.0为正常速度）
   */
  public setPlaybackSpeed(speed: number): void {
    const previousSpeed = this.playbackSpeed;
    this.playbackSpeed = Math.max(0.1, Math.min(10.0, speed));

    // 发布速度变化事件
    this.eventManager.emit(ReplayEventType.SPEED_CHANGED, {
      speed: this.playbackSpeed,
      previousSpeed
    });

    logger.info(`设置回放速度: ${this.playbackSpeed}x`);
  }

  /**
   * 跳转到指定时间
   * @param time 时间（毫秒）
   */
  public seekToTime(time: number): void {
    if (this.state !== ReplayState.PLAYING && this.state !== ReplayState.PAUSED) {
      return;
    }

    // 限制时间范围
    time = Math.max(0, Math.min(time, this.getTotalDuration()));

    // 更新当前时间
    this.currentTime = time;

    // 调整开始时间
    this.playbackStartTime = Date.now() - (time / this.playbackSpeed);

    // 查找对应的帧
    this.currentFrame = this.findFrameAtTime(time);

    // 发布跳转事件
    this.eventManager.emit(ReplayEventType.SEEK, {
      time: this.currentTime,
      frame: this.currentFrame,
      seekType: 'time'
    });

    // 发布时间更新事件
    this.eventManager.emit(ReplayEventType.TIME_UPDATED, {
      currentTime: this.currentTime,
      totalDuration: this.getTotalDuration(),
      currentFrame: this.currentFrame,
      maxFrame: this.getMaxFrame(),
      progress: (this.currentTime / this.getTotalDuration()) * 100
    });

    logger.info(`跳转到时间: ${time}ms, 帧: ${this.currentFrame}`);
  }

  /**
   * 跳转到指定帧
   * @param frame 帧号
   */
  public seekToFrame(frame: number): void {
    if (this.state !== ReplayState.PLAYING && this.state !== ReplayState.PAUSED) {
      return;
    }

    // 限制帧范围
    frame = Math.max(0, Math.min(frame, this.getMaxFrame()));

    // 更新当前帧
    this.currentFrame = frame;

    // 查找对应的时间
    this.currentTime = this.findTimeAtFrame(frame);

    // 调整开始时间
    this.playbackStartTime = Date.now() - (this.currentTime / this.playbackSpeed);

    // 发布跳转事件
    this.eventManager.emit(ReplayEventType.SEEK, {
      time: this.currentTime,
      frame: this.currentFrame,
      seekType: 'frame'
    });

    // 发布时间更新事件
    this.eventManager.emit(ReplayEventType.TIME_UPDATED, {
      currentTime: this.currentTime,
      totalDuration: this.getTotalDuration(),
      currentFrame: this.currentFrame,
      maxFrame: this.getMaxFrame(),
      progress: (this.currentTime / this.getTotalDuration()) * 100
    });

    logger.info(`跳转到帧: ${frame}, 时间: ${this.currentTime}ms`);
  }

  /**
   * 获取当前回放状态
   */
  public getState(): ReplayState {
    return this.state;
  }

  /**
   * 获取当前回放数据
   */
  public getReplayData(): BattleReplayData | null {
    return this.replayData;
  }

  /**
   * 获取当前帧
   */
  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * 获取当前时间
   */
  public getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * 获取总时长
   */
  public getTotalDuration(): number {
    if (!this.replayData) {
      return 0;
    }

    return this.replayData.metadata.battleDuration;
  }

  /**
   * 获取最大帧号
   */
  public getMaxFrame(): number {
    if (this.events.length === 0) {
      return 0;
    }

    return Math.max(...this.events.map(e => e.frame));
  }

  /**
   * 设置事件回调
   * @param callback 回调函数
   */
  public setEventCallback(callback: (event: ReplayEvent) => void): void {
    this.eventCallback = callback;
  }

  /**
   * 设置状态回调
   * @param callback 回调函数
   */
  public setStateCallback(callback: (state: ReplayState) => void): void {
    this.stateCallback = callback;
  }

  /**
   * 设置完成回调
   * @param callback 回调函数
   */
  public setCompletionCallback(callback: () => void): void {
    this.completionCallback = callback;
  }

  /**
   * 保存回放数据到文件
   * @param customFilename 自定义文件名（可选）
   * @param directory 保存目录（默认为logs/battle_replay/）
   * @param compress 是否压缩数据（默认为true）
   */
  public saveReplayToFile(
    customFilename?: string,
    directory: string = 'logs/battle_replay/',
    compress: boolean = true
  ): boolean {
    if (!this.replayData) {
      logger.error('回放数据不存在');
      return false;
    }

    try {
      // 确保目录存在
      const fs = require('fs');
      const path = require('path');
      const zlib = require('zlib');

      // 创建目录（如果不存在）
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        logger.debug(`创建目录: ${directory}`);
      }

      // 生成文件名
      let filename: string;
      if (customFilename) {
        filename = customFilename;
        if (!filename.endsWith('.json') && !filename.endsWith('.gz')) {
          filename += compress ? '.json.gz' : '.json';
        }
      } else {
        // 格式: replay-年-月-日-时-分-秒-毫秒.json[.gz]
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        filename = `replay-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}${compress ? '.json.gz' : '.json'}`;
      }

      // 完整的文件路径
      const filePath = path.join(directory, filename);

      // 将回放数据转换为JSON字符串
      const replayJson = JSON.stringify(this.replayData);

      if (compress) {
        // 压缩数据
        const compressedData = zlib.gzipSync(replayJson);

        // 写入压缩文件
        fs.writeFileSync(filePath, compressedData);

        logger.info(`压缩回放数据已保存到文件: ${filePath}`);
        logger.debug(`原始数据大小: ${replayJson.length} 字节, 压缩后大小: ${compressedData.length} 字节, 压缩率: ${((1 - compressedData.length / replayJson.length) * 100).toFixed(2)}%`);
      } else {
        // 写入未压缩文件
        fs.writeFileSync(filePath, replayJson);

        logger.info(`回放数据已保存到文件: ${filePath}`);
        logger.debug(`回放数据大小: ${replayJson.length} 字节`);
      }

      // 保存一个元数据文件，记录回放的基本信息
      const metadataFilePath = path.join(directory, path.basename(filePath, path.extname(filePath)) + '.meta.json');
      const metadata = {
        replayId: this.replayData.replayId,
        recordTime: this.replayData.metadata.recordTime || Date.now(),
        battleDuration: this.replayData.metadata.battleDuration || 0,
        chapter: this.replayData.metadata.chapter || 1,
        stage: this.replayData.metadata.stage || 1,
        players: this.replayData.metadata.players || [],
        result: this.replayData.metadata.result || 'unknown',
        version: this.replayData.metadata.version || '1.0.0',
        eventsCount: this.replayData.events?.length || 0,
        commandsCount: this.replayData.commands?.length || 0,
        compressed: compress
      };
      fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));

      return true;
    } catch (error) {
      logger.error('保存回放数据失败', error);
      return false;
    }
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 监听战斗事件
    this.eventManager.on('battleStart', (data) => {
      if (this.state === ReplayState.RECORDING) {
        this.addEvent('battleStart', data, 0, 0);
      }
    });

    this.eventManager.on('battleEnd', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('battleEnd', data, 0, time);
      }
    });

    this.eventManager.on('entityDeath', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('entityDeath', data, 0, time);
      }
    });

    this.eventManager.on('damageDealt', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('damageDealt', data, 0, time);
      }
    });

    this.eventManager.on('skillCast', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('skillCast', data, 0, time);
      }
    });

    this.eventManager.on('waveStart', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('waveStart', data, 0, time);
      }
    });

    this.eventManager.on('waveCompleted', (data) => {
      if (this.state === ReplayState.RECORDING) {
        const time = Date.now() - this.recordStartTime;
        this.addEvent('waveCompleted', data, 0, time);
      }
    });
  }

  /**
   * 回放循环
   */
  private playbackLoop(): void {
    if (this.state !== ReplayState.PLAYING) {
      return;
    }

    // 计算当前时间
    const elapsedRealTime = Date.now() - this.playbackStartTime;
    this.currentTime = elapsedRealTime * this.playbackSpeed;

    // 检查是否结束
    if (this.currentTime >= this.getTotalDuration()) {
      this.completePlayback();
      return;
    }

    // 处理当前时间点的事件
    this.processEventsAtCurrentTime();

    // 发布时间更新事件
    this.eventManager.emit(ReplayEventType.TIME_UPDATED, {
      currentTime: this.currentTime,
      totalDuration: this.getTotalDuration(),
      currentFrame: this.currentFrame,
      maxFrame: this.getMaxFrame(),
      progress: (this.currentTime / this.getTotalDuration()) * 100
    });

    // 继续下一帧
    requestAnimationFrame(() => this.playbackLoop());
  }

  /**
   * 处理当前时间点的事件
   */
  private processEventsAtCurrentTime(): void {
    // 查找当前时间点应该触发的事件
    const eventsToTrigger = this.events.filter(event => {
      // 事件时间在当前时间和上一帧时间之间
      return event.time <= this.currentTime && event.time > this.currentTime - 100 * this.playbackSpeed;
    });

    // 触发事件
    for (const event of eventsToTrigger) {
      if (this.eventCallback) {
        this.eventCallback(event);
      }

      // 发布事件触发事件
      this.eventManager.emit(ReplayEventType.EVENT_TRIGGERED, {
        event: event,
        time: this.currentTime,
        frame: this.currentFrame
      });

      logger.debug(`触发回放事件: ${event.type}, 时间: ${event.time}ms`);
    }

    // 更新当前帧
    this.currentFrame = this.findFrameAtTime(this.currentTime);
  }

  /**
   * 完成回放
   */
  private completePlayback(): void {
    // 保存之前的状态
    const previousState = this.state;

    // 更新状态
    this.state = ReplayState.COMPLETED;

    // 触发状态回调
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }

    // 触发完成回调
    if (this.completionCallback) {
      this.completionCallback();
    }

    // 发布状态变化事件
    this.eventManager.emit(ReplayEventType.STATE_CHANGED, {
      state: this.state,
      previousState
    });

    // 发布回放完成事件
    this.eventManager.emit(ReplayEventType.REPLAY_COMPLETED, {
      duration: this.getTotalDuration(),
      result: this.replayData?.metadata?.result || 'unknown'
    });

    logger.info('回放完成');
  }

  /**
   * 查找指定时间对应的帧
   * @param time 时间（毫秒）
   */
  private findFrameAtTime(time: number): number {
    if (this.events.length === 0) {
      return 0;
    }

    // 查找最接近但不超过指定时间的事件
    let closestEvent = this.events[0];

    for (const event of this.events) {
      if (event.time <= time && event.time > closestEvent.time) {
        closestEvent = event;
      }
    }

    return closestEvent.frame;
  }

  /**
   * 查找指定帧对应的时间
   * @param frame 帧号
   */
  private findTimeAtFrame(frame: number): number {
    if (this.events.length === 0) {
      return 0;
    }

    // 查找最接近但不超过指定帧的事件
    let closestEvent = this.events[0];

    for (const event of this.events) {
      if (event.frame <= frame && event.frame > closestEvent.frame) {
        closestEvent = event;
      }
    }

    return closestEvent.time;
  }
}
