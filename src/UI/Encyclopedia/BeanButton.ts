import Phaser from 'phaser';
import { CharacterBean } from '@/DesignConfig/CharacterBean';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 豆豆按钮组件
 * 负责显示单个豆豆按钮
 */
export class BeanButton extends Phaser.GameObjects.Container {
  private bean: CharacterBean;
  private buttonBg: Phaser.GameObjects.Rectangle;
  private onClick: () => void;
  private beanImage: Phaser.GameObjects.Image | null = null;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param width 按钮宽度
   * @param height 按钮高度
   * @param bean 豆豆数据
   * @param onClick 点击回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    bean: CharacterBean,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.bean = bean;
    this.onClick = onClick;

    // 创建按钮UI
    this.buttonBg = this.createButtonUI(width, height);

    // 设置按钮深度
    this.setDepth(DepthLayers.UI_INTERACTIVE);

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
      0x444444, // 深灰色背景
      1.0 // 完全不透明
    );
    buttonBg.setStrokeStyle(4, 0xff9900, 1.0); // 橙色边框
    buttonBg.setDepth(1); // 设置相对深度为1，确保在按钮容器的最底层
    this.add(buttonBg);

    // 尝试加载豆豆图像
    const imageKey = `bean_${this.bean.id}`;
    if (this.scene.textures.exists(imageKey)) {
      this.beanImage = this.scene.add.image(
        -width / 2 + 60, // 左侧位置
        0,
        imageKey
      );
      this.beanImage.setDisplaySize(80, 80); // 设置图像大小
      this.beanImage.setDepth(2); // 设置相对深度为2，确保在按钮背景之上
      this.add(this.beanImage);
    } else {
      // 如果图像不存在，显示表情符号
      const emojiText = this.scene.add.text(
        -width / 2 + 60,
        0,
        this.bean.emoji || '🟢',
        {
          fontSize: '60px', // 增大字体大小
          fontFamily: 'Arial',
          shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 } // 添加阴影效果
        }
      );
      emojiText.setOrigin(0.5, 0.5);
      emojiText.setDepth(2);

      // 添加缩放动画，使表情符号更加生动
      this.scene.tweens.add({
        targets: emojiText,
        scale: { from: 0.9, to: 1.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });

      this.add(emojiText);
    }

    // 创建豆豆名称
    const beanName = this.scene.add.text(
      0,
      -height / 4,
      this.bean.name,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }
    );
    beanName.setOrigin(0.5, 0.5);
    beanName.setDepth(2);
    this.add(beanName);

    // 创建豆豆类型
    const beanType = this.scene.add.text(
      0,
      0,
      `类型: ${this.bean.type}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff9900',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    beanType.setOrigin(0.5, 0.5);
    beanType.setDepth(2);
    this.add(beanType);

    // 创建豆豆属性
    const beanStats = this.scene.add.text(
      0,
      height / 4,
      `攻击: ${this.bean.stats?.attack || 0} | 防御: ${this.bean.stats?.defense || 0}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ff00ff',
        stroke: '#000000',
        strokeThickness: 1
      }
    );
    beanStats.setOrigin(0.5, 0.5);
    beanStats.setDepth(2);
    this.add(beanStats);

    // 设置交互
    buttonBg.setInteractive();

    // 添加点击事件
    buttonBg.on('pointerdown', this.onClick);

    // 添加悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x666666, 1.0); // 更亮的灰色
      buttonBg.setStrokeStyle(4, 0xffff00, 1.0); // 黄色边框

      // 添加闪烁动画
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
      buttonBg.setStrokeStyle(4, 0xff9900, 1.0); // 恢复原来的边框

      // 停止所有针对按钮的动画
      this.scene.tweens.killTweensOf(buttonBg);
      buttonBg.alpha = 1.0; // 恢复完全不透明
    });

    return buttonBg;
  }
}
