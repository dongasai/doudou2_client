import Phaser from 'phaser';
import { LevelConfig } from '@/DesignConfig/Level';
import { DepthLayers } from '@/Constants/DepthLayers';

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

    // 设置按钮深度
    this.setDepth(DepthLayers.UI_INTERACTIVE); // 设置深度为UI交互层

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
    // 创建按钮背景 - 使用更明显的颜色
    const buttonBg = this.scene.add.rectangle(
      0,
      0,
      width,
      height,
      0x444444, // 更亮的灰色背景
      1.0 // 完全不透明
    );
    buttonBg.setStrokeStyle(4, 0xffff00, 1.0); // 更明显的黄色边框
    buttonBg.setDepth(1); // 设置相对深度为1，确保在按钮容器的最底层
    this.add(buttonBg);

    // 从level.id中提取关卡ID，格式为"level-章节ID-关卡ID"
    const idParts = this.level.id.split('-');
    const levelNumber = idParts.length >= 3 ? idParts[2] : '?';

    // 创建关卡标题 - 使用更明显的颜色和描边
    const levelTitle = this.scene.add.text(
      -width/2 + 20, // 左对齐
      -height/2 + 25,
      `关卡 ${levelNumber}`,
      {
        fontSize: '18px', // 增大字体
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3, // 增加描边厚度
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 } // 添加阴影
      }
    );
    levelTitle.setOrigin(0, 0.5); // 左对齐
    levelTitle.setDepth(2); // 设置相对深度为2，确保在按钮背景之上
    this.add(levelTitle);

    // 创建关卡名称 - 使用更明显的颜色和描边
    const levelName = this.scene.add.text(
      0,
      0,
      this.level.name,
      {
        fontSize: '22px', // 增大字体
        fontFamily: 'Arial',
        color: '#ffff00', // 黄色文本
        stroke: '#000000',
        strokeThickness: 3, // 增加描边厚度
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }, // 添加阴影
        wordWrap: { width: width - 40 }, // 减小文本宽度，避免文本溢出
        align: 'center' // 居中对齐
      }
    );
    levelName.setOrigin(0.5, 0.5);
    levelName.setDepth(2); // 设置相对深度为2，确保在按钮背景之上
    this.add(levelName);

    // 创建难度文本 - 使用更明显的颜色
    const difficulty = typeof this.level.difficulty === 'string' ?
      this.level.difficulty :
      '未知';

    const difficultyText = this.scene.add.text(
      width/2 - 20, // 右对齐
      height/2 - 25,
      `难度: ${difficulty}`,
      {
        fontSize: '16px', // 增大字体
        fontFamily: 'Arial',
        color: '#ff6666', // 红色文本
        stroke: '#000000',
        strokeThickness: 2 // 添加描边
      }
    );
    difficultyText.setOrigin(1, 0.5); // 右对齐
    difficultyText.setDepth(2); // 设置相对深度为2，确保在按钮背景之上
    this.add(difficultyText);

    // 设置交互
    buttonBg.setInteractive();

    // 添加点击事件
    buttonBg.on('pointerdown', this.onClick);

    // 添加悬停效果 - 使用更明显的颜色变化
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x666666, 1.0); // 更亮的灰色
      buttonBg.setStrokeStyle(4, 0xff0000, 1.0); // 红色边框

      // 添加闪烁动画，使按钮更加明显
      this.scene.tweens.add({
        targets: buttonBg,
        alpha: 0.7,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x444444, 1.0); // 恢复原来的颜色
      buttonBg.setStrokeStyle(4, 0xffff00, 1.0); // 恢复原来的边框

      // 停止所有针对按钮的动画
      this.scene.tweens.killTweensOf(buttonBg);
      buttonBg.alpha = 1.0; // 恢复完全不透明
    });

    return buttonBg;
  }
}
