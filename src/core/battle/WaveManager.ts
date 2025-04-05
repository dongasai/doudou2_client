import { EventManager } from './EventManager';
import { ConfigLoader } from '../ConfigLoader';

/**
 * 波次管理器
 * 负责管理战斗中的敌人波次生成
 */
export class WaveManager {
    private static instance: WaveManager;
    private eventManager: EventManager;
    private configLoader: ConfigLoader;
    
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
} 