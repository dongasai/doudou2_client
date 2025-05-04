import Phaser from 'phaser';
import { LevelConfig } from '@/DesignConfig/Level';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 关卡详情面板组件
 * 负责显示关卡详情弹窗
 */
export class LevelDetailsPanel extends Phaser.GameObjects.Container {
  private level: LevelConfig;
  private panelWidth: number;
  private panelHeight: number;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param level 关卡数据
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    level: LevelConfig
  ) {
    super(scene, x, y);
    this.level = level;

    // 计算面板尺寸
    this.panelWidth = Math.min(600, scene.cameras.main.width - 40);
    this.panelHeight = Math.min(500, scene.cameras.main.height - 100);

    // 创建面板UI
    this.createPanelUI();

    // 设置面板名称，方便后续查找
    this.setName('levelDetailsPanel');

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
      this.level.name,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    title.setOrigin(0.5, 0.5);
    this.add(title);

    // 创建描述
    const description = this.scene.add.text(
      0,
      -this.panelHeight / 2 + 80,
      this.level.description || '无描述',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: this.panelWidth - 50 }
      }
    );
    description.setOrigin(0.5, 0);
    this.add(description);

    // 创建详情列表
    this.createDetailsList();
  }

  /**
   * 创建详情列表
   */
  private createDetailsList(): void {
    const detailsY = -this.panelHeight / 2 + 160;
    const detailsSpacing = 25;
    const leftColumnX = -this.panelWidth / 2 + 20;

    // 难度
    const difficulty = typeof this.level.difficulty === 'string' ?
      this.level.difficulty :
      '未知';

    const difficultyText = this.scene.add.text(
      leftColumnX,
      detailsY,
      `难度: ${difficulty}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }
    );
    this.add(difficultyText);

    // 解锁条件
    const unlockCondition = this.scene.add.text(
      leftColumnX,
      detailsY + detailsSpacing,
      `解锁条件: ${this.level.unlockCondition || '未知'}`,
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    this.add(unlockCondition);

    // 奖励
    this.createRewardsList(leftColumnX, detailsY, detailsSpacing);

    // 敌人
    this.createEnemiesList(this.panelWidth / 4, detailsY, detailsSpacing);
  }

  /**
   * 创建奖励列表
   * @param x X坐标
   * @param baseY 基础Y坐标
   * @param spacing 间距
   */
  private createRewardsList(x: number, baseY: number, spacing: number): void {
    const rewardsTitle = this.scene.add.text(
      x,
      baseY + spacing * 2,
      '奖励:',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    this.add(rewardsTitle);

    if (this.level.rewards && this.level.rewards.length > 0) {
      // 限制显示的奖励数量
      const maxRewards = Math.min(this.level.rewards.length, 3);
      for (let i = 0; i < maxRewards; i++) {
        const reward = this.scene.add.text(
          x + 20,
          baseY + spacing * (3 + i),
          `• ${this.level.rewards[i]}`,
          {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff'
          }
        );
        this.add(reward);
      }

      // 如果有更多奖励，显示"更多..."
      if (this.level.rewards.length > maxRewards) {
        const moreRewards = this.scene.add.text(
          x + 20,
          baseY + spacing * (3 + maxRewards),
          `• 更多...`,
          {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'italic'
          }
        );
        this.add(moreRewards);
      }
    } else {
      const noRewards = this.scene.add.text(
        x + 20,
        baseY + spacing * 3,
        '• 无奖励',
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      this.add(noRewards);
    }
  }

  /**
   * 创建敌人列表
   * @param x X坐标
   * @param baseY 基础Y坐标
   * @param spacing 间距
   */
  private createEnemiesList(x: number, baseY: number, spacing: number): void {
    const enemiesTitle = this.scene.add.text(
      x,
      baseY,
      '敌人:',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    this.add(enemiesTitle);

    if (this.level.enemies && this.level.enemies.length > 0) {
      // 限制显示的敌人数量
      const maxEnemies = Math.min(this.level.enemies.length, 3);
      for (let i = 0; i < maxEnemies; i++) {
        const enemy = this.scene.add.text(
          x + 20,
          baseY + spacing * (1 + i),
          `• ${this.level.enemies[i]}`,
          {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff'
          }
        );
        this.add(enemy);
      }

      // 如果有更多敌人，显示"更多..."
      if (this.level.enemies.length > maxEnemies) {
        const moreEnemies = this.scene.add.text(
          x + 20,
          baseY + spacing * (1 + maxEnemies),
          `• 更多...`,
          {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'italic'
          }
        );
        this.add(moreEnemies);
      }
    } else {
      const noEnemies = this.scene.add.text(
        x + 20,
        baseY + spacing,
        '• 未知敌人',
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      this.add(noEnemies);
    }

    // BOSS
    if (this.level.bossName) {
      // 计算BOSS文本的Y位置
      const bossY = baseY + spacing * (this.level.enemies && this.level.enemies.length > 0 ?
        Math.min(this.level.enemies.length, 3) + 2 : 3);

      const boss = this.scene.add.text(
        x,
        bossY,
        `BOSS: ${this.level.bossName}`,
        {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#ff6666'
        }
      );
      this.add(boss);
    }
  }
}
