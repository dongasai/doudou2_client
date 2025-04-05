import { EventManager } from './EventManager';
import { ConfigLoader } from '../ConfigLoader';
import type { BeanConfig } from '../../types/Beans';

/**
 * 波次管理器
 * 负责管理战斗中的敌人波次生成
 */
export class WaveManager {
    private static instance: WaveManager;
    private eventManager: EventManager;
    private configLoader: ConfigLoader;
    private eventListeners = new Map<string, Function[]>();
    
    /** 当前波次 */
    private currentWave: number = 0;
    /** 当前关卡 */
    private currentLevel: number = 1;
    /** 当前章节 */
    private currentChapter: number = 1;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.configLoader = ConfigLoader.getInstance();
    }

    public static getInstance(): WaveManager {
        if (!WaveManager.instance) {
            WaveManager.instance = new WaveManager();
        }
        return WaveManager.instance;
    }

    /**
     * 开始新的波次
     */
    public startNewWave(): void {
        this.currentWave++;
        
        // 获取当前波次的配置
        const waveConfig = this.getWaveConfig();
        
        // 发出波次开始事件
        this.eventManager.emit('waveStart', {
            wave: this.currentWave,
            level: this.currentLevel,
            chapter: this.currentChapter,
            config: waveConfig
        });
    }

    /**
     * 获取当前波次配置
     */
    private getWaveConfig() {
        // TODO: 从配置加载器获取波次配置
        return {
            beanCount: Math.min(5 + this.currentWave * 2, 20),
            beanTypes: this.getBeanTypes(),
            interval: Math.max(2000 - this.currentWave * 100, 500)
        };
    }

    /**
     * 获取当前波次可用的豆豆类型
     */
    private getBeanTypes(): number[] {
        const allBeans = this.configLoader.getAllBeanConfigs();
        // 根据当前波次解锁不同类型的豆豆
        return allBeans
            .filter(bean => bean.unlockWave <= this.currentWave)
            .map(bean => bean.id);
    }

    /**
     * 重置波次
     */
    public reset(): void {
        this.currentWave = 0;
        this.eventManager.emit('waveReset', {});
    }

    /**
     * 获取当前波次信息
     */
    public getCurrentWaveInfo() {
        return {
            wave: this.currentWave,
            level: this.currentLevel,
            chapter: this.currentChapter
        };
    }

    /**
     * 注册事件监听器
     */
    public on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    /**
     * 触发事件
     */
    private emit(event: string, data: any): void {
        const callbacks = this.eventListeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    /**
     * 生成豆豆
     * @param types - 允许的豆豆类型
     * @param centerX - 场景中心X坐标
     * @param centerY - 场景中心Y坐标
     */
    public spawnBeans(types: string[], centerX: number, centerY: number): void {
        // 获取所有豆豆配置
        const allBeans = this.configLoader.getAllBeanConfigs();
        // 过滤出当前关卡允许的类型
        const availableBeans = allBeans.filter((bean: BeanConfig) => types.includes(bean.type));
        if (availableBeans.length === 0) return;

        // 随机选择一个豆豆配置
        const beanConfig = availableBeans[Phaser.Math.Between(0, availableBeans.length - 1)];
        
        const angle = Phaser.Math.Between(0, 360);
        const distance = 400;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        this.eventManager.emit('spawnBean', {
            id: `bean_${Date.now()}`,
            config: this.configLoader.getBean(beanConfig.id)!,
            position: { x, y }
        });
    }

} 