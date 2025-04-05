/**
 * 战斗事件管理器
 * 负责处理战斗中的事件分发和监听
 */
export class EventManager {
    private static instance: EventManager;
    private eventListeners = new Map<string, Function[]>();

    private constructor() {}

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    /**
     * 添加事件监听器
     * @param event - 事件名称
     * @param callback - 回调函数
     */
    public on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    /**
     * 移除事件监听器
     * @param event - 事件名称
     * @param callback - 回调函数
     */
    public off(event: string, callback: Function): void {
        const callbacks = this.eventListeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param event - 事件名称
     * @param data - 事件数据
     */
    public emit(event: string, data: any): void {
        const callbacks = this.eventListeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    /**
     * 清除所有事件监听器
     */
    public clear(): void {
        this.eventListeners.clear();
    }
} 