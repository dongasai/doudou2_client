import { Scene } from 'phaser';
import { ConfigLoader } from '@/core/ConfigLoader';
import { HeroType } from '@/types/GameHero';

interface HeroSelectData {
    selectedLevel: number;
}

export class HeroSelectScene extends Scene {
    private selectedHeroes: number[] = [];
    private selectedLevel: number = 1;
    private configLoader: ConfigLoader;

    private heroTypeEmojis: Record<HeroType, string> = {
        '战士': '⚔️',
        '法师': '🔮',
        '射手': '🏹',
        '辅助': '💖',
        '刺客': '🗡️'
    };

    constructor() {
        super({ key: 'HeroSelectScene' });
        this.configLoader = ConfigLoader.getInstance();
    }

    init(data: HeroSelectData): void {
        this.selectedLevel = data.selectedLevel || 1;
        
        // 尝试从本地存储恢复上次的选择
        const lastHeroes = localStorage.getItem('lastSelectedHeroes');
        if (lastHeroes) {
            this.selectedHeroes = JSON.parse(lastHeroes);
        } else if (this.selectedHeroes.length === 0) {
            // 如果没有上次选择的英雄，默认选择第一个
            const heroes = this.configLoader.getAllHeroes();
            if (heroes.length > 0) {
                this.selectedHeroes = [heroes[0].id];
            }
        }
    }

    create(): void {
        this.showHeroSelect();
    }

    private showHeroSelect(): void {
        this.clearScene();

        // 标题
        this.add.text(
            this.cameras.main.centerX,
            50,
            '选择英雄 👥',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        ).setOrigin(0.5);

        // 英雄列表
        const heroes = this.configLoader.getAllHeroes();
        heroes.forEach((hero, index) => {
            const y = 150 + index * 120;
            const button = this.add.container(this.cameras.main.centerX, y);

            const isSelected = this.selectedHeroes.includes(hero.id);
            const bgColor = isSelected ? 0x4CAF50 : 0x333333;
            const bgAlpha = isSelected ? 0.8 : 0.3;

            const bg = this.add.rectangle(0, 0, 300, 100, bgColor, bgAlpha)
                .setInteractive()
                .on('pointerover', () => {
                    if (!isSelected) {
                        bg.setFillStyle(0x4CAF50, 0.5);
                    }
                })
                .on('pointerout', () => {
                    if (!isSelected) {
                        bg.setFillStyle(0x333333, 0.3);
                    }
                })
                .on('pointerdown', () => this.toggleHero(hero.id));
            
            const emoji = this.add.text(-120, 0, this.heroTypeEmojis[hero.type as HeroType], { fontSize: '40px' })
                .setOrigin(0.5);
            
            const name = this.add.text(-50, -15, `${hero.name} (${hero.type})`, {
                fontSize: '24px',
                color: isSelected ? '#ffffff' : '#cccccc',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            });
            
            const description = this.add.text(-50, 15, hero.specialty, {
                fontSize: '16px',
                color: isSelected ? '#ffffff' : '#aaaaaa',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            });

            button.add([bg, emoji, name, description]);

            if (isSelected) {
                bg.setStrokeStyle(2, 0x00ff00);
                const indicator = this.add.text(120, 0, '✓', {
                    fontSize: '32px',
                    color: '#00ff00'
                }).setOrigin(0.5);
                button.add(indicator);
            }
        });

        // 开始游戏按钮
        const startButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            '开始游戏 ▶️',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 30, y: 15 },
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.startBattle());

        // 返回按钮
        this.addBackButton(() => this.scene.start('LevelSelectScene'));
    }

    private clearScene(): void {
        this.children.removeAll();
    }

    private addBackButton(callback: () => void): void {
        this.add.text(
            50,
            50,
            '◀️ 返回',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        )
        .setInteractive()
        .on('pointerdown', callback);
    }

    private toggleHero(heroId: number): void {
        const level = this.configLoader.getLevel(this.selectedLevel);
        if (!level) return;

        const index = this.selectedHeroes.indexOf(heroId);
        if (index === -1 && this.selectedHeroes.length < level.availableHeroSlots) {
            this.selectedHeroes.push(heroId);
        } else if (index !== -1) {
            this.selectedHeroes.splice(index, 1);
        }
        this.showHeroSelect();
    }

    private startBattle(): void {
        const level = this.configLoader.getLevel(this.selectedLevel);
        if (!level) return;

        if (this.selectedHeroes.length === 0) {
            // 显示提示：至少选择一个英雄
            const text = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.height - 150,
                '⚠️ 请至少选择一个英雄',
                {
                    fontSize: '20px',
                    color: '#ff0000',
                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
                }
            ).setOrigin(0.5);

            this.time.delayedCall(2000, () => text.destroy());
            return;
        }

        // 保存选择到本地存储
        localStorage.setItem('lastSelectedLevel', this.selectedLevel.toString());
        localStorage.setItem('lastSelectedHeroes', JSON.stringify(this.selectedHeroes));

        // 启动战斗场景
        this.scene.start('BattleScene', {
            level: this.selectedLevel,
            heroes: this.selectedHeroes
        });
    }
}