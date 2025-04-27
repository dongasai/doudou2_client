/**
 * 战斗引擎
 * 作为战斗系统的入口，整合所有子系统
 */

import { logger, LogLevel } from './Logger';
import { BattleManager, BattleState, BattleResult } from './BattleManager';
import { BattleCommand } from '../../DesignConfig/types/BattleCommand';
import { BattleInitParams } from '../../DesignConfig/types/BattleInitParams';
import { BattleReplayData } from '../../DesignConfig/types/BattleReplay';

export class BattleEngine {
  private battleManager: BattleManager;
  private initialized: boolean = false;

  /**
   * 构造函数
   */
  constructor() {
    // 初始化日志系统
    logger.setLogLevel(LogLevel.INFO);
    logger.setConsoleOutput(true);
    
    // 创建战斗管理器
    this.battleManager = new BattleManager();
    
    logger.info('战斗引擎初始化完成');
  }

  /**
   * 初始化战斗
   * @param params 战斗初始化参数
   * @param seed 随机种子（可选）
   */
  public initBattle(params: BattleInitParams, seed?: number): void {
    this.battleManager.initBattle(params, seed);
    this.initialized = true;
    logger.info('战斗初始化完成');
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
   */
  public stopBattle(): void {
    this.battleManager.stopBattle();
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
    return this.battleManager.getReplayData();
  }

  /**
   * 加载回放
   * @param replayData 回放数据
   */
  public loadReplay(replayData: BattleReplayData): void {
    this.battleManager.loadReplay(replayData);
    this.initialized = true;
  }

  /**
   * 设置回放速度
   * @param speed 速度（1.0为正常速度）
   */
  public setReplaySpeed(speed: number): void {
    this.battleManager.setReplaySpeed(speed);
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
}

// 导出单例实例
export const battleEngine = new BattleEngine();
