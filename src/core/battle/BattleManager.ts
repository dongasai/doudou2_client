import { EventManager } from '../EventManager';
import { ConfigLoader } from '../ConfigLoader';
import { WaveManager } from './WaveManager';
import { DamageManager } from './DamageManager';
import { Hero } from '../../types/GameHero';
import { LevelConfig } from '../../types/Level';
import { BattleHero, BattleBean, BattleCrystal } from './types';
import { BaseStats } from '../../types/BaseStats';

/**
 * 战斗管理器
 * 负责控制整个战斗流程
 */
export class BattleManager {
    private static instance: BattleManager;
    private eventManager: EventManager;
    private configLoader: ConfigLoader;
    private waveManager: WaveManager;
    private damageManager: DamageManager;
    private currentLevel: string = '';
    private heroes: Map<number, BattleHero>;
    private beans: Map<number, BattleBean>;
    private crystal: BattleCrystal | null;
    private isPaused: boolean;

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.configLoader = ConfigLoader.getInstance();
        this.waveManager = WaveManager.getInstance();
        this.damageManager = DamageManager.getInstance();
        this.heroes = new Map();
        this.beans = new Map();
        this.crystal = null;
        this.isPaused = false;
        this.setupEventListeners();
    }

    public static getInstance(): BattleManager {
        if (!BattleManager.instance) {
            BattleManager.instance = new BattleManager();
        }
        return BattleManager.instance;
    }

    private setupEventListeners(): void {
        this.eventManager.on('damage_dealt', (data: any) => {
            console.log('Damage dealt:', data);
            // 处理伤害事件
            this.damageManager.handleDamage(data);
        });

        this.eventManager.on('hero_died', (heroId: number) => {
            console.log('Hero died:', heroId);
            this.heroes.delete(heroId);
            this.checkGameOver();
        });

        this.eventManager.on('bean_defeated', (beanId: number) => {
            console.log('Bean defeated:', beanId);
            this.beans.delete(beanId);
            this.checkWaveComplete();
        });

        this.eventManager.on('bean_spawned', (bean: BattleBean) => {
            console.log('Bean spawned:', bean);
            this.beans.set(bean.id, bean);
        });
    }

    public async initBattle(level: string, heroId: number): Promise<void> {
        this.currentLevel = level;
        await this.configLoader.loadAllConfigs();

        const levelConfig = this.configLoader.getLevel(level);
        const heroConfig = this.configLoader.getHeroConfig(heroId);

        if (!levelConfig || !heroConfig) {
            throw new Error('Invalid level or hero configuration');
        }

        this.resetBattleData();
        this.createHero(heroConfig);
        this.createCrystal(levelConfig);
        this.waveManager.init(level);

        console.log('Battle initialized with:', {
            level: levelConfig,
            hero: heroConfig,
            crystal: this.crystal
        });
    }

    private resetBattleData(): void {
        this.heroes.clear();
        this.beans.clear();
        this.crystal = null;
        this.isPaused = false;
    }

    private createHero(config: Hero): void {
        const battleHero: BattleHero = {
            id: config.id,
            type: config.type,
            name: config.name,
            currentHp: config.stats?.hp || 100,
            maxHp: config.stats?.hp || 100,
            stats: config.stats || {
                hp: 100,
                attack: 10,
                defense: 5,
                speed: 5
            },
            skills: config.skills || [],
            position: {
                x: 400,
                y: 300
            },
            level: 1,
            exp: 0,
            gold: 0
        };
        this.heroes.set(config.id, battleHero);
    }

    private createCrystal(config: LevelConfig): void {
        const baseStats: BaseStats = {
            hp: config.crystal.maxHp,
            attack: 0,
            defense: config.attrFactors.defense,
            speed: 0
        };

        this.crystal = {
            id: 1,
            name: '主水晶',
            currentHp: config.crystal.maxHp,
            maxHp: config.crystal.maxHp,
            stats: baseStats,
            position: config.crystal.position,
            defenseBonus: 0
        };
    }

    public startBattle(): void {
        console.log('Battle started');
        this.isPaused = false;
        this.waveManager.start();
        this.eventManager.emit('battle_started', null);
    }

    public pauseBattle(): void {
        console.log('Battle paused');
        this.isPaused = true;
        this.waveManager.pause();
        this.eventManager.emit('battle_paused', null);
    }

    public resumeBattle(): void {
        console.log('Battle resumed');
        this.isPaused = false;
        this.waveManager.resume();
        this.eventManager.emit('battle_resumed', null);
    }

    private checkWaveComplete(): void {
        if (this.beans.size === 0) {
            console.log('Wave complete');
            this.eventManager.emit('wave_complete', null);
            // 可以在这里添加关卡完成的逻辑
        }
    }

    private checkGameOver(): void {
        if (this.heroes.size === 0 || (this.crystal && this.crystal.currentHp <= 0)) {
            console.log('Game over');
            this.eventManager.emit('game_over', {
                victory: false,
                reason: this.heroes.size === 0 ? 'all_heroes_died' : 'crystal_destroyed'
            });
        }
    }

    public getHeroes(): BattleHero[] {
        return Array.from(this.heroes.values());
    }

    public getBeans(): BattleBean[] {
        return Array.from(this.beans.values());
    }

    public getCrystal(): BattleCrystal | null {
        return this.crystal;
    }

    public getCurrentLevel(): string {
        return this.currentLevel;
    }

    public isPausedState(): boolean {
        return this.isPaused;
    }
} 