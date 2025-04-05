import { BattleScene } from '@/scenes/BattleScene';

/**
 * 站位点标记
 * 用于标识英雄可以站立的位置
 */
export class PositionMarker extends Phaser.GameObjects.Arc {
    private indexText: Phaser.GameObjects.Text;

    constructor(scene: BattleScene, x: number, y: number, index: number) {
        super(scene, x, y, 20, 0, 360, false, 0x00ff00, 0.3);
        scene.add.existing(this);
        this.setDepth(BattleScene.LAYER_UI);
        
        // 添加索引文本
        this.indexText = scene.add.text(x, y, `${index+1}`, {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.indexText.setOrigin(0.5);
        this.indexText.setDepth(BattleScene.LAYER_UI + 1);
    }
}