import { EventManager } from './EventManager';
import { DamageManager } from './DamageManager';
import { WaveManager } from './WaveManager';
import { ConfigLoader } from '../ConfigLoader';
import { Position, HeroData, BeanData, CrystalData } from '../../types/battle';

/**
 * 战斗管理器
 * 负责整体战斗流程控制
 */
export class BattleManager {
    private static instance: BattleManager;
    private eventManager: EventManager;
    private damageManager: DamageManager;
    private waveManager: WaveManager;
    private configLoader: ConfigLoader;

    /** 战斗状态 */
    private battleState: 'prepare' | 'fighting' | 'pause' | 'victory' | 'defeat' = 'prepare';
    
    /** 战斗数据 */
    private battleData = {
        heroes: new Map<string, HeroData>(),
        beans: new Map<string, BeanData>(),
        crystal: null as CrystalData | null
    };

    private constructor() {
        this.eventManager = EventManager.getInstance();
        this.damageManager = DamageManager.getInstance();
        this.waveManager = WaveManager.getInstance();
        this.configLoader = ConfigLoader.getInstance();
        this.init();
    }

    public static getInstance(): BattleManager {
        if (!BattleManager.instance) {
            BattleManager.instance = new BattleManager();
        }
        return BattleManager.instance;
    }

    /**
     * 初始化战斗管理器
     */
    private init() {
        this.resetBattleData();
        this.setupEventListeners();
    }

    /**
     * 重置战斗数据
     */
    private resetBattleData() {
        this.battleData.heroes.clear();
        this.battleData.beans.clear();
        this.battleData.crystal = null;
        this.waveManager.reset();
        this.battleState = 'prepare';
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners() {
        this.eventManager.on('damageDealt', this.onDamageDealt.bind(this));
        this.eventManager.on('heroDied', this.onHeroDied.bind(this));
        this.eventManager.on('beanDefeated', this.onBeanDefeated.bind(this));
        this.eventManager.on('gameOver', this.onGameOver.bind(this));
    }

    /**
     * 开始战斗
     */
    public startBattle() {
        if (this.battleState !== 'prepare') return;
        
        this.battleState = 'fighting';
        this.waveManager.startNewWave();
        this.eventManager.emit('battleStart', {});
    }

    /**
     * 暂停战斗
     */
    public pauseBattle() {
        if (this.battleState !== 'fighting') return;
        
        this.battleState = 'pause';
        this.eventManager.emit('battlePause', {});
    }

    /**
     * 继续战斗
     */
    public resumeBattle() {
        if (this.battleState !== 'pause') return;
        
        this.battleState = 'fighting';
        this.eventManager.emit('battleResume', {});
    }

    /**
     * 创建英雄
     */
    public createHero(heroId: number, position: Position): string {
        const config = this.configLoader.getHeroConfig(heroId);
        if (!config) throw new Error(`未找到英雄配置: ${heroId}`);

        const id = `hero_${Date.now()}`;
        const heroData: HeroData = {
            id,
            type: heroId,
            position,
            health: config.baseHealth,
            maxHealth: config.baseHealth,
            level: 1,
            experience: 0
        };

        this.battleData.heroes.set(id, heroData);
        this.eventManager.emit('heroCreated', heroData);
        return id;
    }

    /**
     * 创建水晶
     */
    public createCrystal(position: Position): void {
        const crystalData: CrystalData = {
            position,
            health: 1000,
            maxHealth: 1000
        };
        this.battleData.crystal = crystalData;
        this.eventManager.emit('crystalCreated', crystalData);
    }

    // 事件处理方法
    private onDamageDealt(data: any) {
        const { targetType, targetId, currentHealth } = data;
        if (targetType === 'hero') {
            const hero = this.battleData.heroes.get(targetId);
            if (hero) hero.health = currentHealth;
        } else if (targetType === 'bean') {
            const bean = this.battleData.beans.get(targetId);
            if (bean) bean.health = currentHealth;
        } else if (targetType === 'crystal' && this.battleData.crystal) {
            this.battleData.crystal.health = currentHealth;
        }
    }

    private onHeroDied(data: any) {
        const { heroId } = data;
        this.battleData.heroes.delete(heroId);
        this.checkGameOver();
    }

    private onBeanDefeated(data: any) {
        const { beanId } = data;
        this.battleData.beans.delete(beanId);
        this.checkWaveComplete();
    }

    private onGameOver(data: any) {
        this.battleState = data.victory ? 'victory' : 'defeat';
    }

    /**
     * 检查波次是否完成
     */
    private checkWaveComplete() {
        if (this.battleData.beans.size === 0) {
            this.waveManager.startNewWave();
        }
    }

    /**
     * 检查游戏是否结束
     */
    private checkGameOver() {
        if (this.battleData.heroes.size === 0) {
            this.eventManager.emit('gameOver', { victory: false });
        }
    }

    /**
     * 获取战斗状态
     */
    public getBattleState() {
        return {
            state: this.battleState,
            wave: this.waveManager.getCurrentWaveInfo(),
            heroes: Array.from(this.battleData.heroes.values()),
            beans: Array.from(this.battleData.beans.values()),
            crystal: this.battleData.crystal
        };
    }
} 