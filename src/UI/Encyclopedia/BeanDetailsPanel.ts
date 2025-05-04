import Phaser from 'phaser';
import { CharacterBean } from '@/DesignConfig/CharacterBean';
import { DepthLayers } from '@/Constants/DepthLayers';


/**
 * 豆豆详情面板组件
 * 负责显示豆豆详情弹窗
 */
export class BeanDetailsPanel extends Phaser.GameObjects.Container {
  private bean: CharacterBean;
  private panelWidth: number;
  private panelHeight: number;
  private beanImage: Phaser.GameObjects.Image | null = null;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param bean 豆豆数据
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bean: CharacterBean
  ) {
    super(scene, x, y);
    this.bean = bean;

    // 计算面板尺寸
    this.panelWidth = Math.min(600, scene.cameras.main.width - 40);
    this.panelHeight = Math.min(500, scene.cameras.main.height - 100);

    // 创建面板UI
    this.createPanelUI();

    // 设置面板名称，方便后续查找
    this.setName('beanDetailsPanel');

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

    // 创建标题容器
    const titleContainer = this.scene.add.container(0, -this.panelHeight / 2 + 40);

    // 创建标题文本
    const title = this.scene.add.text(
      0,
      0,
      this.bean.name,
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
    titleContainer.add(title);

    // 创建标题旁边的emoji
    const titleEmoji = this.scene.add.text(
      title.width / 2 + 20,
      0,
      this.bean.emoji || '🟢',
      {
        fontSize: '32px',
        fontFamily: 'Arial'
      }
    );
    titleEmoji.setOrigin(0, 0.5);
    titleContainer.add(titleEmoji);

    this.add(titleContainer);

    // 尝试加载豆豆图像
    const imageKey = `bean_${this.bean.id}`;
    if (this.scene.textures.exists(imageKey)) {
      this.beanImage = this.scene.add.image(
        -this.panelWidth / 4,
        -this.panelHeight / 4,
        imageKey
      );
      this.beanImage.setDisplaySize(120, 120);
      this.add(this.beanImage);
    } else {
      // 如果图像不存在，显示表情符号
      const emojiContainer = this.scene.add.container(-this.panelWidth / 4, -this.panelHeight / 4);

      // 创建表情符号背景
      const emojiBg = this.scene.add.circle(0, 0, 60, 0x333333, 0.7);
      emojiBg.setStrokeStyle(3, 0xffffff, 0.5);
      emojiContainer.add(emojiBg);

      // 创建表情符号文本
      const emojiText = this.scene.add.text(
        0,
        0,
        this.bean.emoji || '🟢',
        {
          fontSize: '80px', // 增大字体大小
          fontFamily: 'Arial',
          shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 } // 添加阴影效果
        }
      );
      emojiText.setOrigin(0.5, 0.5);
      emojiContainer.add(emojiText);

      // 添加发光效果
      const glowFx = this.scene.add.circle(0, 0, 70, 0xffffff, 0.2);
      emojiContainer.add(glowFx);

      // 添加动画效果
      this.scene.tweens.add({
        targets: emojiText,
        scale: { from: 0.9, to: 1.1 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });

      this.scene.tweens.add({
        targets: glowFx,
        alpha: { from: 0.1, to: 0.3 },
        scale: { from: 0.9, to: 1.1 },
        duration: 2000,
        yoyo: true,
        repeat: -1
      });

      this.add(emojiContainer);
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

    // 豆豆类型
    const typeText = this.scene.add.text(
      leftColumnX,
      detailsY,
      `类型: ${this.bean.type}`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ff9900',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    typeText.setOrigin(0.5, 0.5);
    this.add(typeText);

    // 豆豆技能
    const skillText = this.scene.add.text(
      leftColumnX,
      detailsY + detailsSpacing,
      `技能: ${this.bean.skill?.name || '无'}`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ff00ff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    skillText.setOrigin(0.5, 0.5);
    this.add(skillText);

    // 豆豆属性
    const statsTitle = this.scene.add.text(
      0,
      detailsY + detailsSpacing * 2,
      '豆豆属性:',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    statsTitle.setOrigin(0.5, 0.5);
    this.add(statsTitle);

    // 显示豆豆属性
    const stats = this.bean.stats || { hp: 0, attack: 0, defense: 0, speed: 0 };
    const statsText = this.scene.add.text(
      0,
      detailsY + detailsSpacing * 3,
      `生命: ${stats.hp} | 攻击: ${stats.attack} | 防御: ${stats.defense} | 速度: ${stats.speed}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: this.panelWidth - 80 },
        align: 'center'
      }
    );
    statsText.setOrigin(0.5, 0.5);
    this.add(statsText);

    // 豆豆技能描述
    this.createSkillDescription(0, detailsY + detailsSpacing * 5, detailsSpacing);
  }

  /**
   * 创建技能描述
   * @param x X坐标
   * @param baseY 基础Y坐标
   * @param spacing 间距
   */
  private createSkillDescription(x: number, baseY: number, spacing: number): void {
    const skillTitle = this.scene.add.text(
      x,
      baseY,
      '技能描述:',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    skillTitle.setOrigin(0.5, 0.5);
    this.add(skillTitle);

    if (this.bean.skill) {
      // 显示技能描述
      const skillDescription = this.scene.add.text(
        x,
        baseY + spacing,
        `• ${this.bean.skill.name}: ${this.bean.skill.description || '无描述'}`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#ffffff',
          wordWrap: { width: this.panelWidth - 80 },
          align: 'center'
        }
      );
      skillDescription.setOrigin(0.5, 0.5);
      this.add(skillDescription);

      // 显示技能类型和冷却时间
      const skillDetails = this.scene.add.text(
        x,
        baseY + spacing * 2,
        `• 类型: ${this.bean.skill.type || '无'} | 冷却: ${this.bean.skill.cooldown || 0}秒`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#ffffff',
          wordWrap: { width: this.panelWidth - 80 },
          align: 'center'
        }
      );
      skillDetails.setOrigin(0.5, 0.5);
      this.add(skillDetails);

      // 显示技能伤害（如果有）
      if (this.bean.skill.damage) {
        const skillDamage = this.scene.add.text(
          x,
          baseY + spacing * 3,
          `• 伤害: ${this.bean.skill.damage}`,
          {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ff6666',
            wordWrap: { width: this.panelWidth - 80 },
            align: 'center'
          }
        );
        skillDamage.setOrigin(0.5, 0.5);
        this.add(skillDamage);
      }
    } else {
      const noSkill = this.scene.add.text(
        x,
        baseY + spacing,
        '• 暂无技能',
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      noSkill.setOrigin(0.5, 0.5);
      this.add(noSkill);
    }
  }
}
