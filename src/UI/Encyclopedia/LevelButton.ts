import Phaser from 'phaser';
import { LevelConfig } from '@/DesignConfig/Level';

/**
 * 关卡按钮组件
 * 负责显示单个关卡按钮
 */
export class LevelButton extends Phaser.GameObjects.Container {
  private level: LevelConfig;
  private buttonBg: Phaser.GameObjects.Rectangle;
  private onClick: () => void;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param width 按钮宽度
   * @param height 按钮高度
   * @param level 关卡数据
   * @param onClick 点击回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    level: LevelConfig,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.level = level;
    this.onClick = onClick;

    // 创建按钮UI
    this.buttonBg = this.createButtonUI(width, height);

    // 将容器添加到场景
    scene.add.existing(this);
  }

  /**
   * 创建按钮UI
   * @param width 按钮宽度
   * @param height 按钮高度
   * @returns 按钮背景对象
   */
  private createButtonUI(width: number, height: number): Phaser.GameObjects.Rectangle {
    // 创建按钮背景
    const buttonBg = this.scene.add.rectangle(
      0,
      0,
      width,
      height,
      0x333333,
      0.95
    );
    buttonBg.setStrokeStyle(3, 0xffffff, 0.9);
    this.add(buttonBg);

    // 从level.id中提取关卡ID，格式为"level-章节ID-关卡ID"
    const idParts = this.level.id.split('-');
    const levelNumber = idParts.length >= 3 ? idParts[2] : '?';

    // 创建关卡标题
    const levelTitle = this.scene.add.text(
      0,
      -height/2 + 25,
      `关卡 ${levelNumber}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1
      }
    );
    levelTitle.setOrigin(0.5, 0.5);
    this.add(levelTitle);

    // 创建关卡名称
    const levelName = this.scene.add.text(
      0,
      0,
      this.level.name,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
        wordWrap: { width: width - 20 }
      }
    );
    levelName.setOrigin(0.5, 0.5);
    this.add(levelName);

    // 创建难度文本
    const difficulty = typeof this.level.difficulty === 'string' ?
      this.level.difficulty :
      '未知';

    const difficultyText = this.scene.add.text(
      0,
      height/2 - 25,
      `难度: ${difficulty}`,
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }
    );
    difficultyText.setOrigin(0.5, 0.5);
    this.add(difficultyText);

    // 设置交互
    buttonBg.setInteractive();

    // 添加点击事件
    buttonBg.on('pointerdown', this.onClick);

    // 添加悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x555555, 0.95);
      buttonBg.setStrokeStyle(3, 0xaaaaff, 1.0);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x333333, 0.95);
      buttonBg.setStrokeStyle(3, 0xffffff, 0.9);
    });

    return buttonBg;
  }
}
