import Phaser from 'phaser';
import { Hero } from '@/DesignConfig/GameHero';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 英雄详情面板组件
 * 负责显示英雄详情弹窗
 */
export class HeroDetailsPanel extends Phaser.GameObjects.Container {
  private hero: Hero;
  private panelWidth: number;
  private panelHeight: number;
  private heroImage: Phaser.GameObjects.Image | null = null;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param hero 英雄数据
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    hero: Hero
  ) {
    super(scene, x, y);
    this.hero = hero;

    // 计算面板尺寸
    this.panelWidth = Math.min(600, scene.cameras.main.width - 40);
    this.panelHeight = Math.min(500, scene.cameras.main.height - 100);

    // 创建面板UI
    this.createPanelUI();

    // 设置面板名称，方便后续查找
    this.setName('heroDetailsPanel');

    // 设置深度层级，确保显示在所有其他UI元素之上
    this.setDepth(DepthLayers.SYSTEM_POPUP);

    // 将容器添加到场景
    scene.add.existing(this);
  }

  /**
   * 创建面板UI
   */
  private createPanelUI(): void {
    // 创建外层边框
    const outerBg = this.scene.add.rectangle(
      0,
      0,
      this.panelWidth + 4,
      this.panelHeight + 4,
      0xffffff,
      0.3
    );
    this.add(outerBg);

    // 创建内层背景
    const bg = this.scene.add.rectangle(
      0,
      0,
      this.panelWidth,
      this.panelHeight,
      0x000000,
      0.95
    );
    bg.setStrokeStyle(1, 0x444444, 0.8);
    this.add(bg);

    // 创建关闭按钮背景
    const closeButtonBg = this.scene.add.circle(
      bg.width / 2 - 25,
      -bg.height / 2 + 25,
      20,
      0xff3333
    );
    closeButtonBg.setInteractive();
    this.add(closeButtonBg);

    // 创建关闭按钮文本
    const closeButton = this.scene.add.text(
      bg.width / 2 - 25,
      -bg.height / 2 + 25,
      'X',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    closeButton.setOrigin(0.5, 0.5);
    this.add(closeButton);

    // 添加关闭按钮的点击事件
    closeButtonBg.on('pointerdown', () => {
      this.destroy();
    });

    // 添加悬停效果
    closeButtonBg.on('pointerover', () => {
      closeButtonBg.setFillStyle(0xff6666);
    });

    closeButtonBg.on('pointerout', () => {
      closeButtonBg.setFillStyle(0xff3333);
    });

    // 创建标题
    const title = this.scene.add.text(
      0,
      -this.panelHeight / 2 + 40,
      this.hero.name,
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }
    );
    title.setOrigin(0.5, 0.5);
    this.add(title);

    // 尝试加载英雄图像
    const imageKey = `hero_${this.hero.id}`;
    if (this.scene.textures.exists(imageKey)) {
      this.heroImage = this.scene.add.image(
        -this.panelWidth / 4,
        -this.panelHeight / 4,
        imageKey
      );
      this.heroImage.setDisplaySize(120, 120);
      this.add(this.heroImage);
    } else {
      // 如果图像不存在，显示表情符号
      const emojiText = this.scene.add.text(
        -this.panelWidth / 4,
        -this.panelHeight / 4,
        this.hero.emoji || '👤',
        {
          fontSize: '72px',
          fontFamily: 'Arial'
        }
      );
      emojiText.setOrigin(0.5, 0.5);
      this.add(emojiText);
    }

    // 创建详情列表
    this.createDetailsList();
  }

  /**
   * 创建详情列表
   */
  private createDetailsList(): void {
    const detailsY = -this.panelHeight / 4;
    const detailsSpacing = 30;
    const leftColumnX = 0;

    // 英雄类型
    const typeText = this.scene.add.text(
      leftColumnX,
      detailsY,
      `类型: ${this.hero.type}`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    typeText.setOrigin(0.5, 0.5);
    this.add(typeText);

    // 英雄特长
    const specialtyText = this.scene.add.text(
      leftColumnX,
      detailsY + detailsSpacing,
      `特长: ${this.hero.specialty || '无'}`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#00ffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    specialtyText.setOrigin(0.5, 0.5);
    this.add(specialtyText);

    // 英雄描述
    const descriptionTitle = this.scene.add.text(
      0,
      detailsY + detailsSpacing * 2,
      '英雄描述:',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    descriptionTitle.setOrigin(0.5, 0.5);
    this.add(descriptionTitle);

    const description = this.scene.add.text(
      0,
      detailsY + detailsSpacing * 3,
      this.hero.description || '暂无描述',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: this.panelWidth - 80 },
        align: 'center'
      }
    );
    description.setOrigin(0.5, 0.5);
    this.add(description);

    // 英雄技能
    this.createSkillsList(0, detailsY + detailsSpacing * 5, detailsSpacing);
  }

  /**
   * 创建技能列表
   * @param x X坐标
   * @param baseY 基础Y坐标
   * @param spacing 间距
   */
  private createSkillsList(x: number, baseY: number, spacing: number): void {
    const skillsTitle = this.scene.add.text(
      x,
      baseY,
      '技能:',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    skillsTitle.setOrigin(0.5, 0.5);
    this.add(skillsTitle);

    if (this.hero.skills && this.hero.skills.length > 0) {
      // 限制显示的技能数量
      const maxSkills = Math.min(this.hero.skills.length, 3);
      for (let i = 0; i < maxSkills; i++) {
        const skill = this.hero.skills[i];
        const skillText = this.scene.add.text(
          x,
          baseY + spacing * (i + 1),
          `• ${skill.name}: ${skill.description}`,
          {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            wordWrap: { width: this.panelWidth - 80 },
            align: 'center'
          }
        );
        skillText.setOrigin(0.5, 0.5);
        this.add(skillText);
      }

      // 如果有更多技能，显示"更多..."
      if (this.hero.skills.length > maxSkills) {
        const moreSkills = this.scene.add.text(
          x,
          baseY + spacing * (maxSkills + 1),
          '• 更多技能...',
          {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'italic'
          }
        );
        moreSkills.setOrigin(0.5, 0.5);
        this.add(moreSkills);
      }
    } else {
      const noSkills = this.scene.add.text(
        x,
        baseY + spacing,
        '• 暂无技能',
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      noSkills.setOrigin(0.5, 0.5);
      this.add(noSkills);
    }
  }
}
