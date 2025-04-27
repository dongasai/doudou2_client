/**
 * 战斗引擎
 * 作为战斗系统的入口，整合所有子系统
 */

import { logger, LogLevel } from './Logger';
import { BattleManager, BattleState, BattleResult } from './BattleManager';
import { ReplayManager } from './ReplayManager';
import { BattleCommand } from '../../DesignConfig/types/BattleCommand';
import { BattleInitParams } from '../../DesignConfig/types/BattleInitParams';
import { BattleReplayData, ReplayEvent, ReplayState } from '../../DesignConfig/types/BattleReplay';

export class BattleEngine {
  private battleManager: BattleManager;
  private replayManager: ReplayManager;
  private initialized: boolean = false;
  private isReplayMode: boolean = false;

  /**
   * 构造函数
   */
  constructor() {
    // 初始化日志系统
    logger.setLogLevel(LogLevel.INFO);
    logger.setConsoleOutput(true);

    // 创建战斗管理器
    this.battleManager = new BattleManager();

    // 创建回放管理器
    this.replayManager = new ReplayManager(this.battleManager.getEventManager());

    // 设置回放事件回调
    this.replayManager.setEventCallback(this.onReplayEvent.bind(this));

    logger.info('战斗引擎初始化完成');
  }

  /**
   * 初始化战斗
   * @param params 战斗初始化参数
   * @param seed 随机种子（可选）
   * @param recordReplay 是否记录回放（默认为true）
   */
  public initBattle(params: BattleInitParams, seed?: number, recordReplay: boolean = true): void {
    // 获取随机种子（如果未提供）
    const actualSeed = seed !== undefined ? seed : Date.now();

    // 初始化战斗管理器
    this.battleManager.initBattle(params, actualSeed);
    this.initialized = true;
    this.isReplayMode = false;

    // 如果需要记录回放，初始化回放管理器
    if (recordReplay) {
      this.replayManager.startRecording(params, actualSeed);
    }

    logger.info(`战斗初始化完成，随机种子: ${actualSeed}, 记录回放: ${recordReplay}`);
  }

  /**
   * 开始战斗
   */
  public startBattle(): void {
    if (!this.initialized) {
      logger.error('无法开始战斗，尚未初始化');
      return;
    }

    this.battleManager.startBattle();
    logger.info('战斗开始');
  }

  /**
   * 暂停战斗
   */
  public pauseBattle(): void {
    this.battleManager.pauseBattle();
  }

  /**
   * 恢复战斗
   */
  public resumeBattle(): void {
    this.battleManager.resumeBattle();
  }

  /**
   * 停止战斗
   * @param saveReplay 是否保存回放（默认为true）
   * @param saveToFile 是否保存到文件（默认为true）
   * @param customFilename 自定义文件名（可选）
   * @param directory 保存目录（默认为logs/battle_replay/）
   * @returns 回放数据（如果saveReplay为true）
   */
  public stopBattle(
    saveReplay: boolean = true,
    saveToFile: boolean = true,
    customFilename?: string,
    directory: string = 'logs/battle_replay/'
  ): BattleReplayData | null {
    this.battleManager.stopBattle();

    // 如果正在记录回放，停止记录
    if (saveReplay && this.replayManager.getState() === ReplayState.RECORDING) {
      const replayData = this.replayManager.stopRecording();

      // 如果需要保存到文件
      if (saveToFile && replayData) {
        this.replayManager.saveReplayToFile(customFilename, directory);
      }

      logger.info('战斗回放记录已保存');
      return replayData;
    }

    return null;
  }

  /**
   * 重置战斗
   */
  public resetBattle(): void {
    this.battleManager.reset();
    this.initialized = false;
  }

  /**
   * 发送战斗指令
   * @param command 战斗指令
   */
  public sendCommand(command: BattleCommand): void {
    this.battleManager.sendCommand(command);

    // 如果正在记录回放，记录指令
    if (this.replayManager.getState() === ReplayState.RECORDING) {
      this.replayManager.addCommand(command);
    }
  }

  /**
   * 获取战斗状态
   */
  public getBattleState(): BattleState {
    return this.battleManager.getState();
  }

  /**
   * 获取战斗结果
   */
  public getBattleResult(): BattleResult {
    return this.battleManager.getResult();
  }

  /**
   * 获取战斗统计数据
   */
  public getBattleStats(): any {
    return this.battleManager.getBattleStats();
  }

  /**
   * 获取回放数据
   */
  public getReplayData(): BattleReplayData | null {
    if (this.replayManager.getState() === ReplayState.RECORDING) {
      // 如果正在记录，返回当前记录的数据
      return this.replayManager.getReplayData();
    } else {
      // 否则返回战斗管理器中的回放数据
      return this.battleManager.getReplayData();
    }
  }

  /**
   * 加载回放
   * @param replayData 回放数据
   */
  public loadReplay(replayData: BattleReplayData): void {
    // 加载回放数据到战斗管理器
    this.battleManager.loadReplay(replayData);

    // 加载回放数据到回放管理器
    this.replayManager.loadReplay(replayData);

    this.initialized = true;
    this.isReplayMode = true;

    logger.info(`加载回放: ID=${replayData.replayId}, 时长=${replayData.metadata.battleDuration}ms`);
  }

  /**
   * 开始回放
   */
  public startReplay(): void {
    if (!this.isReplayMode) {
      logger.warn('不在回放模式，无法开始回放');
      return;
    }

    // 开始回放
    this.replayManager.startPlayback();

    logger.info('开始回放');
  }

  /**
   * 暂停回放
   */
  public pauseReplay(): void {
    if (!this.isReplayMode) {
      return;
    }

    this.replayManager.pausePlayback();
  }

  /**
   * 恢复回放
   */
  public resumeReplay(): void {
    if (!this.isReplayMode) {
      return;
    }

    this.replayManager.resumePlayback();
  }

  /**
   * 停止回放
   */
  public stopReplay(): void {
    if (!this.isReplayMode) {
      return;
    }

    this.replayManager.stopPlayback();
  }

  /**
   * 设置回放速度
   * @param speed 速度（1.0为正常速度）
   */
  public setReplaySpeed(speed: number): void {
    if (this.isReplayMode) {
      this.replayManager.setPlaybackSpeed(speed);
    } else {
      this.battleManager.setReplaySpeed(speed);
    }
  }

  /**
   * 跳转到指定时间
   * @param time 时间（毫秒）
   */
  public seekToTime(time: number): void {
    if (!this.isReplayMode) {
      return;
    }

    this.replayManager.seekToTime(time);
  }

  /**
   * 跳转到指定帧
   * @param frame 帧号
   */
  public seekToFrame(frame: number): void {
    if (!this.isReplayMode) {
      return;
    }

    this.replayManager.seekToFrame(frame);
  }

  /**
   * 获取回放状态
   */
  public getReplayState(): ReplayState {
    return this.replayManager.getState();
  }

  /**
   * 获取回放当前时间
   */
  public getReplayCurrentTime(): number {
    return this.replayManager.getCurrentTime();
  }

  /**
   * 获取回放总时长
   */
  public getReplayTotalDuration(): number {
    return this.replayManager.getTotalDuration();
  }

  /**
   * 设置回放事件回调
   * @param callback 回调函数
   */
  public setReplayEventCallback(callback: (event: ReplayEvent) => void): void {
    this.replayManager.setEventCallback(callback);
  }

  /**
   * 设置回放状态回调
   * @param callback 回调函数
   */
  public setReplayStateCallback(callback: (state: ReplayState) => void): void {
    this.replayManager.setStateCallback(callback);
  }

  /**
   * 保存回放数据到文件
   * @param filename 文件名
   */
  public saveReplayToFile(filename?: string): boolean {
    return this.replayManager.saveReplayToFile(filename);
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  public setLogLevel(level: LogLevel): void {
    logger.setLogLevel(level);
  }

  /**
   * 设置日志输出到控制台
   * @param enable 是否启用
   */
  public setConsoleLog(enable: boolean): void {
    logger.setConsoleOutput(enable);
  }

  /**
   * 设置日志输出到文件
   * @param enable 是否启用
   * @param filePath 文件路径（可选）
   */
  public setFileLog(enable: boolean, filePath?: string): void {
    logger.setFileOutput(enable, filePath);
  }

  /**
   * 保存日志到文件
   */
  public saveLogsToFile(): void {
    logger.saveLogsToFile();
  }

  /**
   * 处理回放事件
   * @param event 回放事件
   */
  private onReplayEvent(event: ReplayEvent): void {
    // 根据事件类型处理不同的事件
    switch (event.type) {
      case 'battleStart':
        logger.info(`回放事件: 战斗开始, 时间: ${event.time}ms`);
        break;

      case 'battleEnd':
        logger.info(`回放事件: 战斗结束, 时间: ${event.time}ms, 结果: ${event.data?.result || '未知'}`);
        break;

      case 'entityDeath':
        logger.debug(`回放事件: 实体死亡, 时间: ${event.time}ms, ID: ${event.data?.entity?.id || '未知'}`);
        break;

      case 'damageDealt':
        logger.debug(`回放事件: 伤害, 时间: ${event.time}ms, 数量: ${event.data?.amount || 0}`);
        break;

      case 'skillCast':
        logger.debug(`回放事件: 技能释放, 时间: ${event.time}ms, 技能: ${event.data?.skillId || '未知'}`);
        break;

      case 'waveStart':
        logger.info(`回放事件: 波次开始, 时间: ${event.time}ms, 波次: ${(event.data?.waveIndex || 0) + 1}`);
        break;

      case 'waveCompleted':
        logger.info(`回放事件: 波次完成, 时间: ${event.time}ms, 波次: ${(event.data?.waveIndex || 0) + 1}`);
        break;

      default:
        logger.debug(`回放事件: ${event.type}, 时间: ${event.time}ms`);
        break;
    }
  }
}

// 导出单例实例
export const battleEngine = new BattleEngine();
