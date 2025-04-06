import type { CharacterBean } from '../types/CharacterBean';
import type { Hero } from '../types/GameHero';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { LevelConfig } from '../types/Level';

/**
 * 配置加载器
 * 负责加载和管理游戏配置
 */
export class ConfigLoader {
    private static instance: ConfigLoader;
    private levels: Map<string, LevelConfig>; // 使用 "chapter-stage" 格式作为key
    private beans: Map<number, CharacterBean>;
    private heroes: Map<number, Hero>;

    private constructor() {
        this.levels = new Map();
        this.beans = new Map();
        this.heroes = new Map();
    }

    /**
     * 获取配置加载器实例
     */
    public static getInstance(): ConfigLoader {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }

    /**
     * 加载所有配置
     */
    public async loadAllConfigs(): Promise<void> {
        console.log('[ConfigLoader] 开始加载所有配置...');
        try {
            await Promise.all([
                this.loadLevels(),
                this.loadBeans(),
                this.loadHeroes()
            ]);
            console.log('[ConfigLoader] 所有配置加载完成');
        } catch (error) {
            console.error('[ConfigLoader] 加载配置失败:', error);
            throw error;
        }
    }

    /**
     * 加载关卡配置
     */
    private async loadLevels(): Promise<void> {
        try {
            const levelsDir = path.join(__dirname, '../../data/level-1');
            const files = await fs.readdir(levelsDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(levelsDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const levelData = JSON.parse(content);
                    const levelId = `level-1-${file.replace('.json', '')}`;

                    // 转换配置格式以匹配LevelConfig类型
                    const levelConfig: LevelConfig = {
                        id: levelId,
                        name: levelData.name || '未命名关卡',
                        description: levelData.description || '无描述',
                        difficulty: levelData.difficulty || 1,
                        crystal: {
                            position: { x: 400, y: 300 },
                            maxHp: levelData.crystal_max_hp || 1000
                        },
                        beanRatios: Object.entries(levelData.bean_ratio || {}).map(([type, weight]) => ({
                            type,
                            weight: Number(weight)
                        })),
                        totalBeans: levelData.total_beans || 10,
                        spawnInterval: levelData.spawn_interval || 2000,
                        attrFactors: levelData.attr_factors || {
                            hp: 1,
                            attack: 1,
                            defense: 1,
                            speed: 1
                        },
                        victoryCondition: {
                            type: levelData.victory_condition?.type || 'allDefeated',
                            value: levelData.victory_condition?.value
                        },
                        defeatCondition: {
                            type: levelData.defeat_condition?.type || 'crystalDestroyed'
                        },
                        background: levelData.background || 'grassland',
                        availableHeroSlots: levelData.available_hero_slots || 1
                    };

                    this.levels.set(levelId, levelConfig);
                }
            }
            console.log('[ConfigLoader] 已加载关卡配置:', Array.from(this.levels.keys()));
        } catch (error) {
            console.error('[ConfigLoader] 加载关卡配置失败:', error);
            throw error;
        }
    }

    /**
     * 加载豆豆配置
     */
    private async loadBeans(): Promise<void> {
        try {
            const beansPath = path.join(__dirname, '../../data/beans.json');
            const content = await fs.readFile(beansPath, 'utf-8');
            const beans = JSON.parse(content) as CharacterBean[];
            
            beans.forEach(bean => {
                this.beans.set(bean.id, bean);
            });
            console.log('[ConfigLoader] 已加载豆豆配置:', Array.from(this.beans.keys()));
        } catch (error) {
            console.error('[ConfigLoader] 加载豆豆配置失败:', error);
            throw error;
        }
    }

    /**
     * 加载英雄配置
     */
    private async loadHeroes(): Promise<void> {
        try {
            const heroesDir = path.join(__dirname, '../../data/heroes');
            const files = await fs.readdir(heroesDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(heroesDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const heroConfig = JSON.parse(content) as Hero;
                    this.heroes.set(heroConfig.id, heroConfig);
                }
            }
            console.log('[ConfigLoader] 已加载英雄配置:', Array.from(this.heroes.keys()));
        } catch (error) {
            console.error('[ConfigLoader] 加载英雄配置失败:', error);
            throw error;
        }
    }

    /**
     * 获取关卡配置
     */
    public getLevel(levelId: string): LevelConfig | undefined {
        return this.levels.get(levelId);
    }

    /**
     * 获取所有关卡配置
     */
    public getAllLevels(): LevelConfig[] {
        return Array.from(this.levels.values());
    }

    /**
     * 获取豆豆配置
     */
    public getBean(beanId: number): CharacterBean | undefined {
        return this.beans.get(beanId);
    }

    /**
     * 获取所有豆豆配置
     */
    public getAllBeans(): CharacterBean[] {
        return Array.from(this.beans.values());
    }

    /**
     * 获取英雄配置
     */
    public getHeroConfig(heroId: number): Hero | undefined {
        return this.heroes.get(heroId);
    }

    /**
     * 获取所有英雄配置
     */
    public getAllHeroConfigs(): Hero[] {
        return Array.from(this.heroes.values());
    }
} 
