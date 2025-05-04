import Phaser from 'phaser';
import { BeanButton } from './BeanButton';
import { CharacterBean } from '@/DesignConfig/CharacterBean';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 豆豆类型面板组件
 * 负责显示单个豆豆类型及其豆豆
 */
export class BeanTypePanel extends Phaser.GameObjects.Container {
  private beanType: string;
  private beans: CharacterBean[];
  private scrollAreaWidth: number;
  private onBeanSelect: (bean: CharacterBean) => void;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param beanType 豆豆类型
   * @param beans 豆豆数据
   * @param scrollAreaWidth 滚动区域宽度
   * @param onBeanSelect 豆豆选择回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    beanType: string,
    beans: CharacterBean[],
    scrollAreaWidth: number,
    onBeanSelect: (bean: CharacterBean) => void
  ) {
    super(scene, x, y);
    this.beanType = beanType;
    this.beans = beans;
    this.scrollAreaWidth = scrollAreaWidth;
    this.onBeanSelect = onBeanSelect;

    // 创建豆豆类型UI
    this.createBeanTypeUI();

    // 将容器添加到场景
    scene.add.existing(this);
  }

  /**
   * 创建豆豆类型UI
   */
  private createBeanTypeUI(): void {
    const padding = 20;

    // 添加调试边框
    const debugBorder = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth,
      this.getHeight(),
      0x0000ff,
      0.1
    );
    debugBorder.setStrokeStyle(2, 0x0000ff, 0.5);
    debugBorder.setDepth(1);
    this.add(debugBorder);

    // 创建豆豆类型标题背景
    const typeTitleBg = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth - 40,
      50,
      0x663300, // 棕色背景
      1.0
    );
    typeTitleBg.setStrokeStyle(3, 0xffffff, 1.0);
    typeTitleBg.setDepth(2);
    this.add(typeTitleBg);

    // 设置面板深度
    this.setDepth(DepthLayers.UI_PANEL);

    // 添加闪烁动画
    this.scene.tweens.add({
      targets: typeTitleBg,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // 创建豆豆类型标题
    const typeTitle = this.scene.add.text(
      0,
      0,
      `${this.beanType} 豆豆`,
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }
    );
    typeTitle.setOrigin(0.5, 0.5);
    typeTitle.setDepth(3);
    this.add(typeTitle);

    // 获取该类型的豆豆
    const typeBeans = this.beans.filter(bean => bean.type === this.beanType);

    // 如果没有豆豆，显示一个提示
    if (typeBeans.length === 0) {
      const noBeansText = this.scene.add.text(
        0,
        50,
        '该类型暂无豆豆',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#cccccc',
          fontStyle: 'italic'
        }
      );
      noBeansText.setOrigin(0.5, 0.5);
      this.add(noBeansText);
      return;
    }

    // 创建豆豆按钮
    const buttonsPerRow = 1; // 每行只显示1个按钮
    const buttonSpacingY = 40; // 按钮垂直间距
    const availableWidth = this.scrollAreaWidth - (padding * 2);
    const buttonWidth = Math.min(availableWidth * 0.9, 350);
    const buttonHeight = 140;

    for (let i = 0; i < typeBeans.length; i++) {
      const bean = typeBeans[i];
      const row = i;

      // 计算按钮位置
      const x = 0; // 居中
      const y = 100 + row * (buttonHeight + buttonSpacingY);

      // 创建豆豆按钮
      const beanButton = new BeanButton(
        this.scene,
        x,
        y,
        buttonWidth,
        buttonHeight,
        bean,
        () => this.onBeanSelect(bean)
      );

      this.add(beanButton);
    }
  }

  /**
   * 获取面板高度
   * @returns 面板高度
   */
  public getHeight(): number {
    // 获取该类型的豆豆
    const typeBeans = this.beans.filter(bean => bean.type === this.beanType);

    const buttonsPerRow = 1;
    const buttonHeight = 140;
    const buttonSpacingY = 40;
    const rowCount = typeBeans.length;

    // 如果没有豆豆，返回基础高度
    if (typeBeans.length === 0) {
      return 100;
    }

    // 返回面板总高度
    return 100 + rowCount * (buttonHeight + buttonSpacingY) + 50;
  }
}
