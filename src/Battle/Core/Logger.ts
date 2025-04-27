/**
 * 战斗引擎日志系统
 * 负责记录战斗过程中的各种事件和状态变化
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logToConsole: boolean = true;
  private logToFile: boolean = false;
  private logFilePath: string = './battle_log.txt';
  private logs: string[] = [];

  private constructor() {}

  /**
   * 获取日志实例（单例模式）
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 设置是否输出到控制台
   * @param enable 是否启用
   */
  public setConsoleOutput(enable: boolean): void {
    this.logToConsole = enable;
  }

  /**
   * 设置是否写入文件
   * @param enable 是否启用
   * @param filePath 文件路径（可选）
   */
  public setFileOutput(enable: boolean, filePath?: string): void {
    this.logToFile = enable;
    if (filePath) {
      this.logFilePath = filePath;
    }
  }

  /**
   * 记录调试级别日志
   * @param message 日志消息
   * @param data 附加数据（可选）
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息级别日志
   * @param message 日志消息
   * @param data 附加数据（可选）
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告级别日志
   * @param message 日志消息
   * @param data 附加数据（可选）
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误级别日志
   * @param message 日志消息
   * @param data 附加数据（可选）
   */
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 获取所有日志
   */
  public getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * 保存日志到文件
   */
  public saveLogsToFile(): void {
    if (this.logToFile && this.logs.length > 0) {
      // 在实际环境中，这里应该使用文件系统API写入文件
      // 由于浏览器环境限制，这里只是模拟
      console.log(`[Logger] 日志已保存到文件: ${this.logFilePath}`);
      console.log(`[Logger] 日志内容: ${this.logs.join('\n')}`);
    }
  }

  /**
   * 内部日志记录方法
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据（可选）
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    let logMessage = `[${timestamp}] [${levelStr}] ${message}`;
    
    if (data !== undefined) {
      try {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        logMessage += ` - ${dataStr}`;
      } catch (e) {
        logMessage += ` - [无法序列化的数据]`;
      }
    }

    this.logs.push(logMessage);

    if (this.logToConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
      }
    }
  }
}

// 导出单例实例
export const logger = Logger.getInstance();
