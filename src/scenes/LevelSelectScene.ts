import { Scene } from 'phaser';
import { ConfigLoader } from '@/core/ConfigLoader';
// 移除未使用的导入

export class LevelSelectScene extends Scene {
    private selectedLevel: number = 1;
    private configLoader: ConfigLoader;

    private levelEmojis = {
        easy: '🏠',    // 简单
        normal: '🌳',  // 普通
        hard: '🌋',    // 困难
        hell: '❄️'     // 地狱
    };

    constructor() {
        super({ key: 'LevelSelectScene' });
        this.configLoader = ConfigLoader.getInstance();
    }

    create(): void {
        // 尝试从本地存储恢复上次的选择
        const lastLevel = localStorage.getItem('lastSelectedLevel');
        if (lastLevel) {
            this.selectedLevel = parseInt(lastLevel);
        }

        this.showLevelSelect();
    }

    private showLevelSelect(): void {
        this.clearScene();
        
        console.log('开始显示关卡选择界面');
        const levels = this.configLoader.getAllLevels();
        console.log('获取到的关卡数据:', levels);
        
        if (!levels || levels.length === 0) {
            console.error('错误: 没有获取到任何关卡数据');
            return;
        }

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
        console.log('开始创建关卡UI元素');
        levels.forEach((level, index) => {
            const y = 150 + index * 120;
            const button = this.add.container(this.cameras.main.centerX, y);

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

            if (isSelected) {
                bg.setStrokeStyle(2, 0x00ff00);
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
        .on('pointerdown', () => {
            this.scene.start('HeroSelectScene', { selectedLevel: this.selectedLevel });
        });

        // 返回按钮
        this.addBackButton(() => this.scene.start('MainMenuScene'));
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
        this.showLevelSelect();
    }

    private getDifficultyEmoji(difficulty: number): string {
        if (difficulty <= 1.0) return this.levelEmojis.easy;
        if (difficulty <= 1.5) return this.levelEmojis.normal;
        if (difficulty <= 2.0) return this.levelEmojis.hard;
        return this.levelEmojis.hell;
    }
}