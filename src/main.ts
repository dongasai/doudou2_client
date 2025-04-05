import 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { HeroSelectScene } from './scenes/HeroSelectScene';
import { BattleScene } from './scenes/BattleScene';
import { ConfigLoader } from './core/ConfigLoader';

/**
 * 游戏主入口
 */
async function initializeGame() {
    try {
        console.log('正在加载游戏配置...');
        await ConfigLoader.getInstance().loadAllConfigs();
        console.log('游戏配置加载完成');

        // 游戏配置
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 390,  // iPhone 12/13/14 的标准宽度
            height: 844, // iPhone 12/13/14 的标准高度
            parent: 'game',
            backgroundColor: '#000000',
            scene: [MainMenuScene, LevelSelectScene, HeroSelectScene, BattleScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: 'game',
                width: 390,
                height: 844
            }
        };

        // 创建游戏实例
        console.log('正在初始化游戏...');
        const game = new Phaser.Game(config);
        console.log('游戏初始化完成');
        return game;
    } catch (error) {
        console.error('游戏初始化失败:', error);
        throw error;
    }
}

// 启动游戏
initializeGame().catch(error => {
    console.error('游戏启动失败:', error);
    alert('游戏初始化失败，请刷新页面重试');
});
