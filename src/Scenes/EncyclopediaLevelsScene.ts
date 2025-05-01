import Phaser from 'phaser';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 百科视图场景 - 关卡页面
 */
export class EncyclopediaLevelsScene extends Phaser.Scene {
  // 返回按钮
  private backButton!: Phaser.GameObjects.Text;
  // 下一页按钮
  private nextButton!: Phaser.GameObjects.Text;
  // 配置管理器
  private configManager: ConfigManager = ConfigManager.getInstance();

  constructor() {
    super({ key: 'EncyclopediaLevelsScene' });
  }

  preload(): void {
    // 加载关卡缩略图
    this.load.image('level_1', 'assets/images/levels/level_1.png');
    this.load.image('level_2', 'assets/images/levels/level_2.png');
    this.load.image('level_3', 'assets/images/levels/level_3.png');
    this.load.image('level_4', 'assets/images/levels/level_4.png');
    this.load.image('level_5', 'assets/images/levels/level_5.png');
  }

  create(): void {
    // 创建背景
    this.createBackground();
    
    // 创建标题
    this.createTitle('关卡百科');
    
    // 创建返回按钮
    this.createBackButton();
    
    // 创建下一页按钮
    this.createNextButton('英雄百科', 'EncyclopediaHeroesScene');
    
    // 创建关卡列表
    this.createLevelsList();
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
      50, 
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
    this.backButton = this.add.text(50, 50, '返回', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    }).setInteractive();
    
    this.backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createNextButton(text: string, sceneKey: string): void {
    this.nextButton = this.add.text(
      this.cameras.main.width - 150, 
      50, 
      text,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { left: 15, right: 15, top: 10, bottom: 10 }
      }
    ).setInteractive();
    
    this.nextButton.on('pointerdown', () => {
      this.scene.start(sceneKey);
    });
  }

  private createLevelsList(): void {
    // 创建关卡列表内容
    const levels = this.configManager.getLevelsConfig();
    
    // 实现关卡列表布局...
    // 这里添加具体的关卡列表创建逻辑
    // 可以复用原LevelsTab.ts中的部分代码
  }
}