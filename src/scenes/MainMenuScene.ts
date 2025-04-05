import { Scene } from 'phaser';

export class MainMenuScene extends Scene {
    private emojis: Phaser.GameObjects.Text[] = [];

    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create(): void {
        // 创建标题
        const title = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.2, // 调整到屏幕顶部20%位置
            '豆豆大作战 🎮',
            {
                fontSize: '40px', // 减小字体大小
                color: '#ffffff',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        ).setOrigin(0.5);

        // 创建开始按钮
        const startButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.45,
            '选择关卡 🎯',
            {
                fontSize: '28px', // 减小字体大小
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 30, y: 15 }, // 增加按钮内边距
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        // 添加快速开始按钮
        const quickStartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height * 0.6,
            '快速开始 ⚡️',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#2196F3',
                padding: { x: 30, y: 15 },
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        // 添加按钮悬停效果
        this.addButtonHoverEffect(startButton, '#4CAF50');
        this.addButtonHoverEffect(quickStartButton, '#2196F3');

        // 添加点击事件
        startButton.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });

        quickStartButton.on('pointerdown', () => {
            this.quickStart();
        });

        // 添加版本号
        this.add.text(
            10,
            this.cameras.main.height - 40,
            'v1.0.0 🎯',
            {
                fontSize: '14px', // 减小字体大小
                color: '#999999',
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }
        );

        // 添加装饰性 Emoji
        this.createEmojiDecorations();
    }

    private addButtonHoverEffect(button: Phaser.GameObjects.Text, bgColor: string): void {
        button.on('pointerover', () => {
            button.setStyle({ color: bgColor, backgroundColor: '#ffffff' });
        });

        button.on('pointerout', () => {
            button.setStyle({ color: '#ffffff', backgroundColor: bgColor });
        });
    }

    private quickStart(): void {
        // 获取上次的选择
        const lastLevel = localStorage.getItem('lastSelectedLevel');
        const lastHeroes = localStorage.getItem('lastSelectedHeroes');

        if (!lastLevel || !lastHeroes) {
            // 如果没有上次的选择记录，显示提示并跳转到选择界面
            const text = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.height * 0.7,
                '⚠️ 请先完成一次游戏',
                {
                    fontSize: '20px',
                    color: '#ff0000',
                    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
                }
            ).setOrigin(0.5);

            this.time.delayedCall(2000, () => {
                text.destroy();
                this.scene.start('LevelSelectScene');
            });
            return;
        }

        // 直接开始战斗
        this.scene.start('BattleScene', {
            level: parseInt(lastLevel),
            heroes: JSON.parse(lastHeroes)
        });
    }

    private createEmojiDecorations(): void {
        const decorativeEmojis = ['🎮', '🎯', '🎪', '✨', '🌟', '💫', '🎲', '🎨'];
        
        for (let i = 0; i < 15; i++) { // 减少装饰性emoji的数量
            const x = Phaser.Math.Between(20, this.cameras.main.width - 20); // 添加边距
            const y = Phaser.Math.Between(20, this.cameras.main.height - 20); // 添加边距
            const emoji = decorativeEmojis[Phaser.Math.Between(0, decorativeEmojis.length - 1)];
            
            const emojiText = this.add.text(x, y, emoji, {
                fontSize: '20px' // 减小emoji大小
            }).setAlpha(0.3);
            
            this.emojis.push(emojiText);
            
            // 添加浮动动画
            this.tweens.add({
                targets: emojiText,
                y: y - 15, // 减小浮动距离
                alpha: 0.1,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }
    }
} 