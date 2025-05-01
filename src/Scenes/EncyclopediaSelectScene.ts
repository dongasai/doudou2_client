import Phaser from 'phaser';

/**
 * 百科选择场景 - 二级页面
 * 选择要查看的百科类型
 */
export class EncyclopediaSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EncyclopediaSelectScene' });
  }

  create() {
    // 创建背景
    this.createBackground();
    
    // 创建标题
    this.createTitle('选择百科类型');
    
    // 创建返回按钮
    this.createBackButton();
    
    // 创建百科选择按钮
    this.createSelectionButtons();
  }

  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const background = this.add.graphics();
    
    // 渐变背景
    const topColor = 0x1a2a3a;
    const bottomColor = 0x4a6a8a;
    const steps = 20;
    
    for (let i = 0; i < steps; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(topColor),
        Phaser.Display.Color.ValueToColor(bottomColor),
        steps,
        i
      );
      background.fillStyle(color.color, 1);
      background.fillRect(0, height * (i / steps), width, height / steps + 1);
    }
  }

  private createTitle(text: string): void {
    const title = this.add.text(
      this.cameras.main.width / 2, 
      100, 
      text,
      {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    title.setOrigin(0.5, 0.5);
  }

  private createBackButton(): void {
    this.add.text(50, 50, '返回', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createSelectionButtons(): void {
    const centerX = this.cameras.main.width / 2;
    const buttonStyle = {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#4a6a8a',
      padding: { left: 20, right: 20, top: 15, bottom: 15 },
      fixedWidth: 300
    };

    // 关卡百科按钮
    this.add.text(centerX, 250, '关卡百科', buttonStyle)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('EncyclopediaLevelsScene');
      });

    // 英雄百科按钮
    this.add.text(centerX, 350, '英雄百科', buttonStyle)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('EncyclopediaHeroesScene');
      });

    // 豆豆百科按钮
    this.add.text(centerX, 450, '豆豆百科', buttonStyle)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('EncyclopediaBeansScene');
      });
  }
}