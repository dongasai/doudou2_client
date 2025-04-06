import { BattleManager } from '@/core/BattleManager';
import { Hero } from '@/objects/Hero';
import { Crystal } from '@/objects/Crystal';
import { Bean } from '@/objects/Bean';
import { PositionMarker } from '@/objects/PositionMarker';
import { ConfigLoader } from '../core/ConfigLoader';
import { Logger } from '../utils/Logger';
import type { HeroCreatedEvent } from '@/Event/b2v/HeroCreated';
import type { CrystalCreatedEvent } from '@/Event/b2v/CrystalCreated';
import type { BeanSpawnedEvent } from '@/Event/b2v/BeanSpawned';
import type { DamageDealtEvent } from '@/Event/b2v/DamageDealt';
import type { BeanMovedEvent } from '@/Event/b2v/BeanMoved';
import type { HeroDiedEvent } from '@/Event/b2v/HeroDied';
import type { BeanDefeatedEvent } from '@/Event/b2v/BeanDefeated';
import type { GameOverEvent } from '@/Event/b2v/GameOver';

/**
 * 战斗场景
 * 负责战斗的视觉展示、动画效果和用户输入处理
 */
export class BattleScene extends Phaser.Scene {
    // 层级常量
    public static readonly LAYER_BACKGROUND = 0;
    public static readonly LAYER_ENEMY = 1;
    public static readonly LAYER_HERO = 3;
    public static readonly LAYER_CRYSTAL = 4;
    public static readonly LAYER_UI = 5;
    private static readonly UI_EMOJIS = {
        status: {
            pause: '⏸️',
            play: '▶️',
            victory: '🏆',
            defeat: '💔'
        },
        ui: {
            coin: '🪙',
            back: '🔙'
        }
    };

    /** 战斗管理器实例 */
    private battleManager: BattleManager;

    /** 游戏对象映射 */
    private gameObjects = {
        heroes: new Map<string, Hero>(),
        beans: new Map<string, Bean>(),
        crystal: null as Crystal | null
    };

    constructor() {
        super({ key: 'BattleScene' });
        this.battleManager = new BattleManager();
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 监听英雄创建事件
        this.battleManager.on('heroCreated', (data: HeroCreatedEvent) => {
            // 获取英雄数据
            const heroId = parseInt(data.type);
            const heroData = ConfigLoader.getInstance().getHero(heroId);
            const heroName = heroData?.emoji || heroData?.name || `英雄${heroId}`;

            Logger.getInstance('BattleScene').format(`创建英雄`, [
                {key: 'ID', value: data.id},
                {key: '名称', value: heroName},
                {key: '类型', value: data.type},
                {key: '站位', value: `(${data.position.x}, ${data.position.y})`}
            ]);

            // 获取英雄配置数据
            const heroConfig = ConfigLoader.getInstance().getHero(parseInt(data.type));
            if (!heroConfig) {
                Logger.getInstance('BattleScene').error(`找不到英雄配置: ${data.type}`);
                return;
            }

            Logger.getInstance('BattleScene').format(`创建英雄详细数据`, [
                {key: 'ID', value: data.id},
                {key: '名称', value: heroConfig.name},
                {key: '类型', value: data.type},
                {key: '站位', value: `(${data.position.x}, ${data.position.y})`},
                {key: '基础属性', value: `HP=${heroConfig.stats?.hp || 0}, 攻击=${heroConfig.stats?.attack || 0}, 防御=${heroConfig.stats?.defense || 0}`}
            ]);

            const hero = new Hero(
                this,
                parseInt(data.type),
                heroConfig.name,
                data.type,
                data.position,
                {
                    hp: heroConfig.stats?.hp || 0,
                    maxHp: heroConfig.stats?.hp || 0,
                    attack: heroConfig.stats?.attack || 0,
                    defense: heroConfig.stats?.defense || 0,
                    speed: heroConfig.stats?.speed || 0,
                    level: 1,
                    exp: 0,
                    expToNextLevel: 100,
                    gold: 0
                },
                []
            );
            this.gameObjects.heroes.set(data.id, hero);
        });

        // 监听水晶创建事件
        this.battleManager.on('crystalCreated', (data: CrystalCreatedEvent) => {
            this.gameObjects.crystal = new Crystal(this, this.cameras.main.centerX - 10, this.cameras.main.centerY)
               .setDepth(BattleScene.LAYER_CRYSTAL); // 水晶层
        });

        // 监听豆豆生成事件
        this.battleManager.on('beanSpawned', (data: BeanSpawnedEvent) => {
            const bean = new Bean(this, data.position.x, data.position.y)
                .setDepth(BattleScene.LAYER_ENEMY); // 恢复怪物层
            this.gameObjects.beans.set(data.id, bean);
        });

        // 监听伤害事件
        this.battleManager.on('damageDealt', (data: DamageDealtEvent) => {
            let target = null;
            switch(data.targetType) {
                case 'hero':
                    target = this.gameObjects.heroes.get(data.targetId);
                    break;
                case 'bean':
                    target = this.gameObjects.beans.get(data.targetId);
                    break;
                case 'crystal':
                    target = this.gameObjects.crystal;
                    break;
            }
            if (target && 'takeDamage' in target) {
                target.takeDamage(data.damage);
            }
        });

        // 监听实体移动事件
        this.battleManager.on('beanMoved', (data: BeanMovedEvent) => {
            const bean = this.gameObjects.beans.get(data.beanId);
            if (bean) {
                bean.x = data.position.x;
                bean.y = data.position.y;
            }
        });

        // 监听实体死亡事件
        this.battleManager.on('heroDied', (data: HeroDiedEvent) => {
            const hero = this.gameObjects.heroes.get(data.heroId);
            if (hero) {
                hero.destroy();
                this.gameObjects.heroes.delete(data.heroId);
            }
        });

        this.battleManager.on('beanDefeated', (data: BeanDefeatedEvent) => {
            const bean = this.gameObjects.beans.get(data.beanId);
            if (bean) {
                bean.destroy();
                this.gameObjects.beans.delete(data.beanId);
            }
        });

        // 监听游戏结束事件
        this.battleManager.on('gameOver', (data: GameOverEvent) => {
            this.showGameOverScreen(data.victory);
        });
    }

    create(data: { level: number; heroes: number[] }) {
        // 打印战斗初始化信息
        const levelData = ConfigLoader.getInstance().getLevel(data.level);
        Logger.getInstance('BattleScene').format(`战斗场景初始化`, [
            {key: '关卡ID', value: data.level},
            {key: '关卡数据', value: JSON.stringify(levelData, null, 2)},
            {key: '英雄ID列表', value: `[${data.heroes.join(', ')}]`}
        ]);

        // 打印每个英雄的详细信息和站位
        data.heroes.forEach((heroId, index) => {
            const heroData = ConfigLoader.getInstance().getHero(heroId);
            Logger.getInstance('BattleScene').format(`英雄${index}`, [
                {key: 'ID', value: heroId},
                {key: '站位', value: index},
                {key: '数据', value: JSON.stringify(heroData, null, 4)}
            ]);
        });

        // 设置背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000)
            .setOrigin(0, 0)
            .setAlpha(0.3);

        // 创建水晶
        this.battleManager.createCrystal({
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY
        });

        // 创建英雄位置
        // 创建并存储站位点坐标
        const positions: {x: number, y: number}[] = [];
        const radius = 80;
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * (Math.PI / 180);
            const x = this.cameras.main.centerX + 5 + Math.cos(angle) * radius;
            const y = this.cameras.main.centerY + 10 + Math.sin(angle) * radius;
            positions.push({x, y});
            new PositionMarker(this, x, y, i);
        }

        // 创建选择的英雄
        Logger.getInstance('BattleScene').debug('Creating heroes with data:', data);
        data.heroes.forEach((heroId, index) => {
            if (index < positions.length) {
                Logger.getInstance('BattleScene').debug(`Creating hero ${index} at position:`, positions[index]);
                this.battleManager.createHero(
                    `hero_${index}`,
                    index
                );
            } else {
                Logger.getInstance('BattleScene').warn(`No position available for hero ${index}`);
            }
        });

        // 根据关卡难度设置豆豆生成
        const spawnConfig = {
            1: { interval: 3000, types: ['normal'] },
            2: { interval: 2500, types: ['normal', 'fast'] },
            3: { interval: 2000, types: ['normal', 'fast', 'strong'] },
            4: { interval: 1500, types: ['normal', 'fast', 'strong', 'boss'] }
        };

        const levelConfig = spawnConfig[data.level as keyof typeof spawnConfig];

        // 设置定时生成豆豆
        this.time.addEvent({
            delay: levelConfig.interval,
            callback: () => this.spawnBean(levelConfig.types),
            callbackScope: this,
            loop: true
        });

        // 设置碰撞检测
        this.setupCollisions();

        // 添加UI
        this.createUI();
    }

    /**
     * 设置碰撞检测
     */
    private setupCollisions(): void {
        // 设置英雄和豆豆的碰撞
        const heroSprites = Array.from(this.gameObjects.heroes.values());
        const beanSprites = Array.from(this.gameObjects.beans.values());

        this.physics.add.collider(
            heroSprites as unknown as Phaser.GameObjects.GameObject[],
            beanSprites as unknown as Phaser.GameObjects.GameObject[],
            (obj1, obj2) => {
                const hero = obj1 as unknown as Hero;
                const bean = obj2 as unknown as Bean;
                this.handleHeroBeanCollision(hero, bean);
            }
        );

        // 设置水晶和豆豆的碰撞
        if (this.gameObjects.crystal) {
            // 创建一个不可见的物理区域来处理水晶的碰撞
            const crystalHitArea = this.add.rectangle(
                this.gameObjects.crystal.x,
                this.gameObjects.crystal.y,
                50,
                50,
                0x000000,
                0
            );
            this.physics.add.existing(crystalHitArea, true);

            this.physics.add.collider(
                crystalHitArea,
                beanSprites as unknown as Phaser.GameObjects.GameObject[],
                (obj1, obj2) => {
                    const bean = obj2 as unknown as Bean;
                    this.handleCrystalBeanCollision(this.gameObjects.crystal!, bean);
                }
            );
        }
    }

    /**
     * 处理英雄和豆豆的碰撞
     */
    private handleHeroBeanCollision(hero: Hero, bean: Bean): void {
        const heroId = Array.from(this.gameObjects.heroes.entries())
            .find(([_, h]) => h === hero)?.[0];
        const beanId = Array.from(this.gameObjects.beans.entries())
            .find(([_, b]) => b === bean)?.[0];

        if (heroId && beanId) {
            this.battleManager.handleDamage('bean', beanId, 20); // 英雄攻击豆豆
            this.battleManager.handleDamage('hero', heroId, bean.getDamage()); // 豆豆反击英雄
        }
    }

    /**
     * 处理水晶和豆豆的碰撞
     */
    private handleCrystalBeanCollision(crystal: Crystal, bean: Bean): void {
        const beanId = Array.from(this.gameObjects.beans.entries())
            .find(([_, b]) => b === bean)?.[0];

        if (beanId) {
            this.battleManager.handleDamage('crystal', 'crystal', bean.getDamage());
            this.battleManager.handleDamage('bean', beanId, 1000); // 豆豆碰到水晶后消失
        }
    }

    /**
     * 生成豆豆
     */
    private spawnBean(types: string[]): void {
        this.battleManager.spawnBeans(
            types,
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );
    }

    /**
     * 创建UI界面
     */
    private createUI(): void {
        // 添加暂停按钮
        const pauseButton = this.add.text(
            this.cameras.main.width - 50,
            20,
            BattleScene.UI_EMOJIS.status.pause,
            { fontSize: '32px' }
        );
        pauseButton.setDepth(BattleScene.LAYER_UI);
        pauseButton.setInteractive();
        pauseButton.on('pointerdown', () => {
            // TODO: 实现暂停功能
        });

        // 添加得分显示
        const scoreText = this.add.text(
            20,
            20,
            `${BattleScene.UI_EMOJIS.ui.coin} 0`,
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        scoreText.setDepth(BattleScene.LAYER_UI);
    }

    /**
     * 显示游戏结束画面
     */
    private showGameOverScreen(victory: boolean): void {
        const emoji = victory ? BattleScene.UI_EMOJIS.status.victory : BattleScene.UI_EMOJIS.status.defeat;
        const text = victory ? '胜利！' : '失败！';
        const color = victory ? '#00ff00' : '#ff0000';

        const container = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);

        container.add(this.add.text(0, -50, emoji, { fontSize: '64px' }).setOrigin(0.5));
        container.add(this.add.text(0, 50, text, {
            fontSize: '48px',
            color: color,
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
        }).setOrigin(0.5));

        // 添加返回按钮
        const backButton = this.add.text(0, 150, `${BattleScene.UI_EMOJIS.ui.back} 返回主菜单`, {
            fontSize: '24px',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 },
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        container.add(backButton);
    }

    update(time: number, delta: number): void {
        // 更新战斗管理器
        this.battleManager.update(delta / 1000); // 转换为秒

        // 更新所有游戏对象
        for (const hero of this.gameObjects.heroes.values()) {
            hero.update();
        }
        for (const bean of this.gameObjects.beans.values()) {
            bean.update();
        }
        if (this.gameObjects.crystal) {
            this.gameObjects.crystal.update();
        }
    }
}
