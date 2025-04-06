import { EventManager } from '../EventManager';
import { ConfigLoader } from '../ConfigLoader';
import { CharacterBean } from '../../types/CharacterBean';
import { LevelConfig } from '../../types/Level';
import { BattleBean } from './types';

/**
 * 波次管理器
 * 负责控制怪物的生成和波次进度
 */
export class WaveManager {
    private static instance: WaveManager;
    private eventManager: EventManager;
    private configLoader: ConfigLoader;
    private currentLevel: string = '';
    private levelConfig: LevelConfig | null = null;
    private spawnInterval: NodeJS.Timeout | null = null;
    private beansSpawned: number = 0;
    private isPaused: boolean = false;

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

    public init(level: string): void {
        this.currentLevel = level;
        const config = this.configLoader.getLevel(level);
        if (!config) {
            throw new Error(`Invalid level configuration for level ${level}`);
        }
        this.levelConfig = config;
        this.beansSpawned = 0;
        this.isPaused = false;
    }

    public start(): void {
        if (!this.levelConfig) {
            throw new Error('Level configuration not initialized');
        }

        this.spawnInterval = setInterval(() => {
            if (this.isPaused) return;
            if (this.beansSpawned >= this.levelConfig!.totalBeans) {
                this.stop();
                return;
            }
            this.spawnBean();
        }, this.levelConfig.spawnInterval * 1000);
    }

    private spawnBean(): void {
        if (!this.levelConfig) return;

        const beanTypes = this.levelConfig.beanRatios.map(ratio => ratio.type);
        const weights = this.levelConfig.beanRatios.map(ratio => ratio.weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedType = beanTypes[0];
        for (let i = 0; i < weights.length; i++) {
            if (random <= weights[i]) {
                selectedType = beanTypes[i];
                break;
            }
            random -= weights[i];
        }

        const beanConfig = this.configLoader.getBean(1); // 暂时使用ID为1的豆豆配置

        if (!beanConfig) {
            console.error(`No bean configuration found`);
            return;
        }

        const battleBean: BattleBean = {
            id: Date.now(), // 临时使用时间戳作为ID
            type: selectedType,
            name: beanConfig.name,
            currentHp: beanConfig.stats.hp,
            maxHp: beanConfig.stats.hp,
            stats: beanConfig.stats,
            skill: beanConfig.skill,
            position: this.generateRandomPosition()
        };

        this.beansSpawned++;
        this.eventManager.emit('bean_spawned', battleBean);
    }

    private generateRandomPosition(): { x: number, y: number } {
        // 生成一个在屏幕边缘的随机位置
        const radius = 500; // 假设这是游戏区域的半径
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle) * radius + 400, // 400是假设的屏幕中心x坐标
            y: Math.sin(angle) * radius + 300  // 300是假设的屏幕中心y坐标
        };
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
    }

    public stop(): void {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
    }

    public getProgress(): number {
        if (!this.levelConfig) return 0;
        return this.beansSpawned / this.levelConfig.totalBeans;
    }
} 