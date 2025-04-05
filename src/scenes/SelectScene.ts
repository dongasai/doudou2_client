import { Scene } from 'phaser';
import { ConfigLoader } from '@/core/ConfigLoader';
import { Hero, HeroType } from '@/types/GameHero';
import { LevelConfig } from '@/types/Level';

export class SelectScene extends Scene {
    private selectedHeroes: number[] = [];
    private selectedLevel: number = 1;
    private currentPage: 'level' | 'hero' = 'level';
    private configLoader: ConfigLoader;

    private heroTypeEmojis: Record<HeroType, string> = {
        '战士': '⚔️',
        '法师': '🔮',
        '射手': '🏹',
        '辅助': '💖',
        '刺客': '🗡️'
    };

    private levelEmojis = {
        easy: '🏠',    // 简单
        normal: '🌳',  // 普通
        hard: '🌋',    // 困难
        hell: '❄️'     // 地狱
    };

    constructor() {
        super({ key: 'SelectScene' });
        this.configLoader = ConfigLoader.getInstance();
    }

    create(): void {
        // 尝试从本地存储恢复上次的选择
        const lastLevel = localStorage.getItem('lastSelectedLevel');
        const lastHeroes = localStorage.getItem('lastSelectedHeroes');
        
        if (lastLevel) {
            this.selectedLevel = parseInt(lastLevel);
        }
        
        if (lastHeroes) {
            this.selectedHeroes = JSON.parse(lastHeroes);
        } else if (this.selectedHeroes.length === 0) {
            // 如果没有上次选择的英雄，默认选择第一个
            const heroes = this.configLoader.getAllHeroes();
            if (heroes.length > 0) {
                this.selectedHeroes = [heroes[0].id];
            }
        }
        
        this.showLevelSelect();
    }

    private showLevelSelect(): void {
        this.currentPage = 'level';
        this.clearScene();

        // 标题
        this.add.text(
            this.cameras.main.centerX,
            50,
            '选择关卡 🎯',
            {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        ).setOrigin(0.5);

        // 关卡列表
        const levels = this.configLoader.getAllLevels();
        levels.forEach((level, index) => {
            const y = 150 + index * 120;
            const button = this.add.container(this.cameras.main.centerX, y);

            // 根据是否选中设置背景颜色
            const isSelected = index + 1 === this.selectedLevel;
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
                .on('pointerdown', () => this.selectLevel(index + 1));
            
            // 根据难度选择表情
            const difficultyEmoji = this.getDifficultyEmoji(level.difficulty);
            const emoji = this.add.text(-120, 0, difficultyEmoji, { fontSize: '40px' })
                .setOrigin(0.5);
            
            const name = this.add.text(-50, -15, level.name, {
                fontSize: '24px',
                color: isSelected ? '#ffffff' : '#cccccc',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            });
            
            const difficulty = this.add.text(-50, 15, `难度: ${level.difficulty.toFixed(1)}`, {
                fontSize: '16px',
                color: isSelected ? '#ffffff' : '#aaaaaa',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            });

            button.add([bg, emoji, name, difficulty]);

            // 选中效果
            if (isSelected) {
                bg.setStrokeStyle(2, 0x00ff00);
                // 添加选中指示器
                const indicator = this.add.text(120, 0, '✓', {
                    fontSize: '32px',
                    color: '#00ff00'
                }).setOrigin(0.5);
                button.add(indicator);
            }
        });

        // 下一步按钮
        const nextButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            '下一步 ▶️',
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
        .on('pointerdown', () => this.showHeroSelect());

        // 返回按钮
        this.addBackButton(() => this.scene.start('MainMenuScene'));
    }

    private showHeroSelect(): void {
        this.currentPage = 'hero';
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

            // 选中效果
            if (isSelected) {
                bg.setStrokeStyle(2, 0x00ff00);
                // 添加选中指示器
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
        this.addBackButton(() => this.showLevelSelect());
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

    private selectLevel(levelId: number): void {
        this.selectedLevel = levelId;
        this.showLevelSelect(); // 刷新显示
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
        this.showHeroSelect(); // 刷新显示
    }

    private getDifficultyEmoji(difficulty: number): string {
        if (difficulty <= 1.0) return this.levelEmojis.easy;
        if (difficulty <= 1.5) return this.levelEmojis.normal;
        if (difficulty <= 2.0) return this.levelEmojis.hard;
        return this.levelEmojis.hell;
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

        // 启动战斗场景，传递选择的关卡和英雄信息
        this.scene.start('BattleScene', {
            level: this.selectedLevel,
            heroes: this.selectedHeroes
        });
    }
} 