import { ConfigLoader } from './ConfigLoader';
import { WaveManager } from './battle/WaveManager';
import type { CharacterBean } from '../types/CharacterBean';
import type { Crystal } from '../types/Crystal';
import { Hero } from '../objects/Hero';
import type { HeroCreatedEvent } from '../EV_Event/HeroCreated';
import type { CrystalCreatedEvent } from '../EV_Event/CrystalCreated';
import type { BeanSpawnedEvent } from '../EV_Event/BeanSpawned';
import type { BeanMovedEvent } from '../EV_Event/BeanMoved';
import type { DamageDealtEvent } from '../EV_Event/DamageDealt';
import type { HeroDiedEvent } from '../EV_Event/HeroDied';
import type { BeanDefeatedEvent } from '../EV_Event/BeanDefeated';
import type { GameOverEvent } from '../EV_Event/GameOver';

/**
 * 战斗管理器
 * 负责处理战斗的核心逻辑，与展示层分离
 */
export class BattleManager {
    /** 当前波次 */
    private wave: number = 0;
    /** 当前关卡 */
    private level: number = 1;
    /** 当前章节 */
    private chapter: number = 1;
    /** 战斗状态 */
    private battleState: 'prepare' | 'fighting' | 'pause' | 'victory' | 'defeat' = 'prepare';
    /** 战斗数据 */
    private battleData = {
        heroes: new Map<string, Hero>(),
        beans: new Map<string, CharacterBean>(),
        crystal: null as Crystal | null
    };

    /** 事件监听器 */
    private eventListeners = new Map<string, Function[]>();

    constructor() {
        console.log('战斗引擎初始化');
        this.init();
    }

    /**
     * 初始化战斗管理器
     */
    private init() {
        // 初始化战斗数据
        this.resetBattleData();

        // 监听豆豆生成事件
        const waveManager = WaveManager.getInstance();
        waveManager.on('spawnBean', (data: {
            id: string;
            config: CharacterBean;
            position: Position;
        }) => {
            this.addBean(data.id, data.config, data.position);
        });
    }

    /**
     * 重置战斗数据
     */
    private resetBattleData() {
        this.battleData.heroes.clear();
        this.battleData.beans.clear();
        this.battleData.crystal = null;
        this.wave = 0;
        this.battleState = 'prepare';
    }

    /**
     * 创建英雄
     * @param id - 英雄ID (格式: "hero_{index}")
     * @param positionIndex - 站位索引 (0-4)
     */
    public createHero(id: string, positionIndex: number): Hero | null {
        // 从ID中提取英雄类型
        const heroId = parseInt(id.replace('hero_', ''));
        if (isNaN(heroId)) {
            console.error('无效的英雄ID格式');
            return null;
        }
        
        // 计算英雄位置 (使用固定坐标)
        const radius = 80;
        const angle = (positionIndex * 72) * (Math.PI / 180);
        const position = {
            x: 400 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius
        };
        
        console.log(`创建英雄: ID=${id}, 站位=${positionIndex}`);
        const heroConfig = ConfigLoader.getInstance().getHero(heroId);
        
        if (!heroConfig || !heroConfig.stats) {
            console.error(`找不到英雄配置或缺少stats: ${heroId}`);
            return null;
        }

        const hero = new Hero(
            null as any, // 临时传递null作为scene参数
            heroId,
            heroConfig.name,
            heroConfig.type,
            position,
            {
                hp: heroConfig.stats.hp,
                maxHp: heroConfig.stats.hp,
                attack: heroConfig.stats.attack,
                defense: heroConfig.stats.defense,
                speed: heroConfig.stats.speed,
                level: 1,
                exp: 0,
                expToNextLevel: 100,
                gold: 0
            },
            heroConfig.skills || []
        );
        this.battleData.heroes.set(id, hero);
        this.emit('heroCreated', {
            id,
            type: heroConfig.type,
            position
        });
        return hero;
    }

    /**
     * 创建水晶
     * @param position - 水晶位置
     */
    public createCrystal(position: Position): Crystal {
        const crystalData: Crystal = {
            id: 1,
            name: '核心水晶',
            positionIndex: 0,
            stats: {
                hp: 1000,
                attack: 0,
                defense: 100,
                speed: 0,
                currentHP: 1000,
                maxHP: 1000
            },
            status: 'normal',
            defenseBonus: 0
        };
        this.battleData.crystal = crystalData;
        this.emit('crystalCreated', {
            position
        });
        return crystalData;
    }

    /**
     * 生成豆豆
     * @param types - 允许的豆豆类型
     * @param centerX - 场景中心X坐标
     * @param centerY - 场景中心Y坐标
     */
    public spawnBeans(types: string[], centerX: number, centerY: number): void {
        WaveManager.getInstance().spawnBeans(types, centerX, centerY);
    }

    /**
     * 添加豆豆到战斗数据
     * @param id - 豆豆ID
     * @param config - 豆豆配置
     * @param position - 生成位置
     */
    public addBean(id: string, config: CharacterBean, position: Position): CharacterBean {
        const beanData: CharacterBean = {
            ...config,
            position
        };

        this.battleData.beans.set(id, beanData);
        this.emit('beanSpawned', {
            id,
            config,
            position
        });
        return beanData;
    }

    /**
     * 处理伤害
     * @param targetType - 目标类型
     * @param targetId - 目标ID
     * @param damage - 伤害值
     */
    public handleDamage(targetType: 'hero' | 'bean' | 'crystal', targetId: string, damage: number): void {
        let target: any = null;
        
        switch(targetType) {
            case 'hero':
                target = this.battleData.heroes.get(targetId);
                break;
            case 'bean':
                target = this.battleData.beans.get(targetId);
                break;
            case 'crystal':
                target = this.battleData.crystal;
                break;
        }

        if (target) {
            target.health = Math.max(0, target.health - damage);
            this.emit('damageDealt', { targetType, targetId, damage, currentHealth: target.health });

            if (target.health <= 0) {
                this.handleDeath(targetType, targetId);
            }
        }
    }

    /**
     * 处理死亡
     * @param targetType - 目标类型
     * @param targetId - 目标ID
     */
    private handleDeath(targetType: 'hero' | 'bean' | 'crystal', targetId: string): void {
        switch(targetType) {
            case 'hero':
                this.battleData.heroes.delete(targetId);
                this.emit('heroDied', { heroId: targetId });
                break;
            case 'bean':
                this.battleData.beans.delete(targetId);
                this.emit('beanDefeated', { beanId: targetId });
                break;
            case 'crystal':
                this.battleState = 'defeat';
                this.emit('gameOver', { victory: false });
                break;
        }
    }

    /**
     * 更新战斗
     * @param deltaTime - 时间增量
     */
    public update(deltaTime: number): void {
        if (this.battleState !== 'fighting') return;

        // 更新所有实体的位置和状态
        this.updateEntities(deltaTime);
        
        // 检查胜利条件
        this.checkVictoryCondition();
    }

    /**
     * 更新所有实体
     * @param deltaTime - 时间增量
     */
    private updateEntities(deltaTime: number): void {
        // 更新豆豆移动
        for (const [id, bean] of this.battleData.beans) {
            if (this.battleData.crystal) {
                // 计算豆豆朝向水晶的移动
                const center = { x: 400, y: 300 };
                const direction = this.calculateDirection(
                    bean.position,
                    center
                );
                
                // 更新豆豆位置
                // 豆豆向固定中心点(400,300)移动
                const centerX = 400;
                const centerY = 300;
                const dx = centerX - bean.position.x;
                const dy = centerY - bean.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = bean.stats.speed * deltaTime;
                
                if (distance > speed) {
                    bean.position.x += (dx / distance) * speed;
                    bean.position.y += (dy / distance) * speed;
                } else {
                    bean.position.x = centerX;
                    bean.position.y = centerY;
                }
                
                this.emit('beanMoved', { beanId: id, position: bean.position });
            }
        }
    }

    /**
     * 计算方向向量
     */
    private calculateDirection(from: Position, to: Position): Position {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        return {
            x: dx / length,
            y: dy / length
        };
    }

    /**
     * 检查胜利条件
     */
    private checkVictoryCondition(): void {
        if (this.battleData.beans.size === 0 && this.wave >= 10) {
            this.battleState = 'victory';
            this.emit('gameOver', { victory: true });
        }
    }

    /**
     * 注册事件监听器
     */
    public on(event: 'heroCreated', callback: (data: HeroCreatedEvent) => void): void;
    public on(event: 'crystalCreated', callback: (data: CrystalCreatedEvent) => void): void;
    public on(event: 'beanSpawned', callback: (data: BeanSpawnedEvent) => void): void;
    public on(event: 'beanMoved', callback: (data: BeanMovedEvent) => void): void;
    public on(event: 'damageDealt', callback: (data: DamageDealtEvent) => void): void;
    public on(event: 'heroDied', callback: (data: HeroDiedEvent) => void): void;
    public on(event: 'beanDefeated', callback: (data: BeanDefeatedEvent) => void): void;
    public on(event: 'gameOver', callback: (data: GameOverEvent) => void): void;
    public on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }

    /**
     * 触发事件
     */
    private emit(event: 'heroCreated', data: HeroCreatedEvent): void;
    private emit(event: 'crystalCreated', data: CrystalCreatedEvent): void;
    private emit(event: 'beanSpawned', data: BeanSpawnedEvent): void;
    private emit(event: 'beanMoved', data: BeanMovedEvent): void;
    private emit(event: 'damageDealt', data: DamageDealtEvent): void;
    private emit(event: 'heroDied', data: HeroDiedEvent): void;
    private emit(event: 'beanDefeated', data: BeanDefeatedEvent): void;
    private emit(event: 'gameOver', data: GameOverEvent): void;
    private emit(event: string, data: any): void {
        const callbacks = this.eventListeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}

import { Position } from '../types/Position';