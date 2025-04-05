import { BattleScene } from '@/scenes/BattleScene';

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
        
        // 注册场景
        this.scene.add('Battle', BattleScene);
        
        // 启动战斗场景
        this.scene.start('Battle');
    }
} 