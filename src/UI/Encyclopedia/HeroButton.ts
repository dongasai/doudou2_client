import Phaser from 'phaser';
import { Hero } from '@/DesignConfig/GameHero';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 英雄按钮组件
 * 负责显示单个英雄按钮
 */
export class HeroButton extends Phaser.GameObjects.Container {
  private hero: Hero;
  private buttonBg: Phaser.GameObjects.Rectangle;
  private onClick: () => void;
  private heroImage: Phaser.GameObjects.Image | null = null;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param width 按钮宽度
   * @param height 按钮高度
   * @param hero 英雄数据
   * @param onClick 点击回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    hero: Hero,
    onClick: () => void
  ) {
    super(scene, x, y);
    this.hero = hero;
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
    buttonBg.setStrokeStyle(4, 0x00ffff, 1.0); // 青色边框
    buttonBg.setDepth(1); // 设置相对深度为1，确保在按钮容器的最底层
    this.add(buttonBg);

    // 尝试加载英雄图像
    const imageKey = `hero_${this.hero.id}`;
    if (this.scene.textures.exists(imageKey)) {
      this.heroImage = this.scene.add.image(
        -width / 2 + 60, // 左侧位置
        0,
        imageKey
      );
      this.heroImage.setDisplaySize(80, 80); // 设置图像大小
      this.heroImage.setDepth(2); // 设置相对深度为2，确保在按钮背景之上
      this.add(this.heroImage);
    } else {
      // 如果图像不存在，显示表情符号
      const emojiText = this.scene.add.text(
        -width / 2 + 60,
        0,
        this.hero.emoji || '👤',
        {
          fontSize: '48px',
          fontFamily: 'Arial'
        }
      );
      emojiText.setOrigin(0.5, 0.5);
      emojiText.setDepth(2);
      this.add(emojiText);
    }

    // 创建英雄名称
    const heroName = this.scene.add.text(
      0,
      -height / 4,
      this.hero.name,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }
    );
    heroName.setOrigin(0.5, 0.5);
    heroName.setDepth(2);
    this.add(heroName);

    // 创建英雄类型
    const heroType = this.scene.add.text(
      0,
      0,
      `类型: ${this.hero.type}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    heroType.setOrigin(0.5, 0.5);
    heroType.setDepth(2);
    this.add(heroType);

    // 创建英雄特长
    const heroSpecialty = this.scene.add.text(
      0,
      height / 4,
      `特长: ${this.hero.specialty || '无'}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#00ffff',
        stroke: '#000000',
        strokeThickness: 1
      }
    );
    heroSpecialty.setOrigin(0.5, 0.5);
    heroSpecialty.setDepth(2);
    this.add(heroSpecialty);

    // 设置交互
    buttonBg.setInteractive();

    // 添加点击事件
    buttonBg.on('pointerdown', this.onClick);

    // 添加悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x666666, 1.0); // 更亮的灰色
      buttonBg.setStrokeStyle(4, 0xff00ff, 1.0); // 紫色边框

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
      buttonBg.setStrokeStyle(4, 0x00ffff, 1.0); // 恢复原来的边框

      // 停止所有针对按钮的动画
      this.scene.tweens.killTweensOf(buttonBg);
      buttonBg.alpha = 1.0; // 恢复完全不透明
    });

    return buttonBg;
  }
}
