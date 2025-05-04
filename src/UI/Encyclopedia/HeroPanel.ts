import Phaser from 'phaser';
import { HeroButton } from './HeroButton';
import { Hero } from '@/DesignConfig/GameHero';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 英雄面板组件
 * 负责显示单个英雄类型及其英雄
 */
export class HeroPanel extends Phaser.GameObjects.Container {
  private heroType: string;
  private heroes: Hero[];
  private scrollAreaWidth: number;
  private onHeroSelect: (hero: Hero) => void;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param heroType 英雄类型
   * @param heroes 英雄数据
   * @param scrollAreaWidth 滚动区域宽度
   * @param onHeroSelect 英雄选择回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    heroType: string,
    heroes: Hero[],
    scrollAreaWidth: number,
    onHeroSelect: (hero: Hero) => void
  ) {
    super(scene, x, y);
    this.heroType = heroType;
    this.heroes = heroes;
    this.scrollAreaWidth = scrollAreaWidth;
    this.onHeroSelect = onHeroSelect;

    // 创建英雄类型UI
    this.createHeroTypeUI();

    // 将容器添加到场景
    scene.add.existing(this);
  }

  /**
   * 创建英雄类型UI
   */
  private createHeroTypeUI(): void {
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

    // 创建英雄类型标题背景
    const typeTitleBg = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth - 40,
      50,
      0x006600, // 绿色背景
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

    // 创建英雄类型标题
    const typeTitle = this.scene.add.text(
      0,
      0,
      `${this.heroType} 英雄`,
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

    // 获取该类型的英雄
    const typeHeroes = this.heroes.filter(hero => hero.type === this.heroType);

    // 如果没有英雄，显示一个提示
    if (typeHeroes.length === 0) {
      const noHeroesText = this.scene.add.text(
        0,
        50,
        '该类型暂无英雄',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#cccccc',
          fontStyle: 'italic'
        }
      );
      noHeroesText.setOrigin(0.5, 0.5);
      this.add(noHeroesText);
      return;
    }

    // 创建英雄按钮
    const buttonsPerRow = 1; // 每行只显示1个按钮
    const buttonSpacingY = 40; // 按钮垂直间距
    const availableWidth = this.scrollAreaWidth - (padding * 2);
    const buttonWidth = Math.min(availableWidth * 0.9, 350);
    const buttonHeight = 140;

    for (let i = 0; i < typeHeroes.length; i++) {
      const hero = typeHeroes[i];
      const row = i;

      // 计算按钮位置
      const x = 0; // 居中
      const y = 100 + row * (buttonHeight + buttonSpacingY);

      // 创建英雄按钮
      const heroButton = new HeroButton(
        this.scene,
        x,
        y,
        buttonWidth,
        buttonHeight,
        hero,
        () => this.onHeroSelect(hero)
      );

      this.add(heroButton);
    }
  }

  /**
   * 获取面板高度
   * @returns 面板高度
   */
  public getHeight(): number {
    // 获取该类型的英雄
    const typeHeroes = this.heroes.filter(hero => hero.type === this.heroType);

    const buttonsPerRow = 1;
    const buttonHeight = 140;
    const buttonSpacingY = 40;
    const rowCount = typeHeroes.length;

    // 如果没有英雄，返回基础高度
    if (typeHeroes.length === 0) {
      return 100;
    }

    // 返回面板总高度
    return 100 + rowCount * (buttonHeight + buttonSpacingY) + 50;
  }
}
