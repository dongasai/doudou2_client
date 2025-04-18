

/**
 * 日志助手类
 * 提供不同级别的日志记录功能，支持控制台和文件输出
 */
class Logger {
    private static instance: Logger;
    private context: string;
    private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
    private filePath: string = './logs/app.log';
    private enableFileLogging: boolean = false;

    private constructor(context: string = 'App') {
        this.context = context;
    }

    /**
     * 获取Logger实例
     * @param context 日志上下文
     * @returns Logger实例
     */
    public static getInstance(context?: string): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(context);
        }
        return Logger.instance;
    }

    /**
     * 设置日志级别
     * @param level 日志级别
     */
    public setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
        this.logLevel = level;
    }

    /**
     * 设置日志文件路径
     * @param path 日志文件路径
     */
    public setFilePath(path: string): void {
        this.filePath = path;
    }

    /**
     * 设置是否启用文件日志
     * @param enabled 是否启用
     */
    public setFileLogging(enabled: boolean): void {
        this.enableFileLogging = enabled;
    }

    /**
     * 调试日志
     * @param message 日志消息
     * @param data 附加数据
     */
    public debug(message: string, data?: any): void {
        if (this.shouldLog('debug')) {
            const logMessage = `[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`;
            console.debug(logMessage, data);
            this.writeToFile(logMessage, data);
        }
    }

    /**
     * 信息日志
     * @param message 日志消息
     * @param data 附加数据
     */
    public info(message: string, data?: any): void {
        if (this.shouldLog('info')) {
            const logMessage = `[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`;
            console.info(logMessage, data);
            this.writeToFile(logMessage, data);
        }
    }

    /**
     * 警告日志
     * @param message 日志消息
     * @param data 附加数据
     */
    public warn(message: string, data?: any): void {
        if (this.shouldLog('warn')) {
            const logMessage = `[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`;
            console.warn(logMessage, data);
            this.writeToFile(logMessage, data);
        }
    }

    /**
     * 错误日志
     * @param message 日志消息
     * @param data 附加数据
     */
    public error(message: string, data?: any): void {
        if (this.shouldLog('error')) {
            const logMessage = `[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`;
            console.error(logMessage, data);
            this.writeToFile(logMessage, data);
        }
    }

    /**
     * 格式化多行日志
     * @param title 日志标题
     * @param items 日志项数组
     */
    public format(title: string, items: {key: string; value: any}[]): void {
        const formatted = items.map(item => `  ${item.key}: ${item.value}`).join('\n');
        this.info(`${title}:\n${formatted}`);
    }

    /**
     * 将日志写入文件
     * @param message 日志消息
     * @param data 附加数据
     */
    private async writeToFile(message: string, data?: any): Promise<void> {
        if (!this.enableFileLogging) return;

        try {
            const fs = await import('fs');
            const path = await import('path');
            const dir = path.dirname(this.filePath);

            // 确保目录存在
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // 写入日志文件
            const logEntry = `${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
            fs.appendFileSync(this.filePath, logEntry, { encoding: 'utf-8' });
        } catch (err) {
            console.error('Failed to write log to file:', err);
        }
    }

    private shouldLog(level: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
}

module.exports = { Logger };
