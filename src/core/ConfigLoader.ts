import type { CharacterBean } from '../types/CharacterBean';
import type { Hero } from '../types/GameHero';

export interface LevelConfig {
    name: string;
    description: string;
    difficulty: number;
    crystal: {
        maxHp: number;
    };
    beanRatios: {
        type: string;
        weight: number;
    }[];
    totalBeans: number;
    spawnInterval: number;
    attrFactors: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
    };
    victoryCondition: {
        type: string;
    };
    defeatCondition: {
        type: string;
    };
    background: string;
    availableHeroSlots: number;
}

export class ConfigLoader {
    private static instance: ConfigLoader;
    private heroes: Map<number, Hero> = new Map();
    private levels: Map<number, LevelConfig> = new Map();
    private beans: Map<number, CharacterBean> = new Map();

    private constructor() {}

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
                this.loadHeroes(),
                this.loadLevels(),
                this.loadBeans()
            ]);
            console.log('[ConfigLoader] 所有配置加载完成');
        } catch (error) {
            console.error('[ConfigLoader] 加载配置失败:', error);
            throw error;
        }
    }

    private async loadHeroes(): Promise<void> {
        try {
            for (let i = 1; i <= 30; i++) {
                const response = await fetch(`/src/data/heroes/${i}.json`);
                if (response.ok) {
                    const hero = await response.json();
                    this.heroes.set(hero.id, hero);
                }
            }
        } catch (error) {
            console.error('加载英雄配置失败:', error);
        }
    }

    private async loadLevels(): Promise<void> {
        try {
            console.log('[ConfigLoader] 开始加载关卡配置...');
            
            for (let i = 1; i <= 10; i++) {
                const url = `/src/data/level-1/level-1-${i}.json`;
                console.log(`[ConfigLoader] 加载关卡 ${i}: ${url}`);
                
                try {
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        console.error(`[ConfigLoader] 关卡 ${i} 加载失败: HTTP ${response.status}`);
                        continue;
                    }
                    
                    const level = await response.json();
                    this.levels.set(i, level);
                    console.log(`[ConfigLoader] 成功加载关卡 ${i}`, level);
                } catch (error) {
                    console.error(`[ConfigLoader] 关卡 ${i} 加载异常:`, error);
                }
            }
            
            console.log('[ConfigLoader] 关卡配置加载完成');
        } catch (error) {
            console.error('[ConfigLoader] 加载关卡配置失败:', error);
            throw error;
        }
    }

    private async loadBeans(): Promise<void> {
        try {
            const response = await fetch('/src/data/beans.json');
            if (response.ok) {
                const { beans } = await response.json();
            beans.forEach((bean: CharacterBean) => {
                this.beans.set(bean.id, bean);
            });
            }
        } catch (error) {
            console.error('加载豆豆配置失败:', error);
        }
    }

    public getHero(id: number): Hero | undefined {
        return this.heroes.get(id);
    }

    public getAllHeroes(): Hero[] {
        return Array.from(this.heroes.values());
    }

    public getLevel(id: number): LevelConfig | undefined {
        return this.levels.get(id);
    }

    public getAllLevels(): LevelConfig[] {
        return Array.from(this.levels.values());
    }

    public getBean(id: number): CharacterBean | undefined {
        const config = this.beans.get(id);
        if (!config) return undefined;
        
        return config;
    }

    public getAllBeanConfigs(): CharacterBean[] {
        return Array.from(this.beans.values());
    }
} 
