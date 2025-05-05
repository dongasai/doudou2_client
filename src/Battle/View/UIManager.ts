/**
 * UI管理器
 * 负责战斗场景中UI元素的创建和管理
 */

import Phaser from 'phaser';
import { SkillUIComponent } from './SkillUIComponent';
import { BattleParamsService } from '@/services/BattleParamsService';
import { gameState } from '@/main';
import { DepthLayers } from '@/Constants/DepthLayers';

export class UIManager {
  private scene: Phaser.Scene;

  // UI元素
  private statusBar!: Phaser.GameObjects.Container;
  private waveIndicator!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Text;
  private skillButtonsContainer!: Phaser.GameObjects.Container;
  private skillUIComponents: Map<string, SkillUIComponent> = new Map();
  private uiContainer!: Phaser.GameObjects.Container;

  // 状态
  private isPaused: boolean = false;

  // 回调函数
  private onPauseCallback: () => void;
  private onResumeCallback: () => void;

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param onPause 暂停回调
   * @param onResume 继续回调
   */
  constructor(scene: Phaser.Scene, onPause: () => void, onResume: () => void) {
    this.scene = scene;
    this.onPauseCallback = onPause;
    this.onResumeCallback = onResume;

    // 初始化UI组件
    this.skillUIComponents = new Map();

    // 创建UI元素
    this.createUI();
  }

  /**
   * 获取场景引用
   * @returns Phaser场景
   */
  public getScene(): Phaser.Scene {
    return this.scene;
  }

  /**
   * 创建UI元素
   */
  private createUI(): void {
    try {
      console.log('[INFO] 开始创建UI元素...');

      // 获取屏幕尺寸
      const screenWidth = this.scene.cameras.main.width;
      const screenHeight = this.scene.cameras.main.height;
      console.log('[INFO] 屏幕尺寸:', screenWidth, screenHeight);

      // 创建UI容器 - 直接使用场景而不是容器，避免容器嵌套问题
      // this.uiContainer = this.scene.add.container(0, 0);
      // this.uiContainer.setName('uiContainer');
      console.log('[INFO] 使用场景作为UI容器');

      // 创建状态栏 (位于屏幕左上角)
      this.createStatusBar();
      console.log('[INFO] 创建状态栏成功');

      // 创建波次指示器 (位于屏幕右上角)
      this.createWaveIndicator();
      console.log('[INFO] 创建波次指示器成功');

      // 创建暂停/继续按钮 (位于屏幕右上角，波次指示器下方)
      this.createPauseButton();
      console.log('[INFO] 创建暂停按钮成功');

      // 创建技能按钮 (位于屏幕底部中央)
      this.createSkillButtons();
      console.log('[INFO] 创建技能按钮成功');

      // 固定UI元素，使其不受摄像机移动影响
      this.fixUIElements();
      console.log('[INFO] 固定UI元素成功');

      // 确保所有UI元素可见并设置为适当的UI层级
      this.statusBar.setVisible(true);
      this.statusBar.setAlpha(1);
      this.statusBar.setDepth(DepthLayers.UI_ELEMENT);

      this.waveIndicator.setVisible(true);
      this.waveIndicator.setAlpha(1);
      this.waveIndicator.setDepth(DepthLayers.UI_ELEMENT);

      this.pauseButton.setVisible(true);
      this.pauseButton.setAlpha(1);
      this.pauseButton.setDepth(DepthLayers.UI_ELEMENT);

      this.skillButtonsContainer.setVisible(true);
      this.skillButtonsContainer.setAlpha(1);
      this.skillButtonsContainer.setDepth(DepthLayers.UI_ELEMENT);

      console.log('[INFO] UI元素创建完成');

      // 打印UI元素位置和尺寸信息，用于调试
      console.log('[DEBUG] 状态栏位置:', this.statusBar.x, this.statusBar.y);
      console.log('[DEBUG] 波次指示器位置:', this.waveIndicator.x, this.waveIndicator.y);
      console.log('[DEBUG] 暂停按钮位置:', this.pauseButton.x, this.pauseButton.y);
      console.log('[DEBUG] 技能按钮容器位置:', this.skillButtonsContainer.x, this.skillButtonsContainer.y);
    } catch (error) {
      console.error('[ERROR] 创建UI元素失败:', error);
    }
  }

  /**
   * 创建状态栏
   */
  private createStatusBar(): void {
    // 获取屏幕宽度
    const screenWidth = this.scene.cameras.main.width;

    // 计算状态栏宽度 (适配窄屏设备)
    const barWidth = Math.min(220, screenWidth * 0.5); // 增加宽度以容纳更多信息
    const barHeight = 90; // 增加高度以容纳水晶HP

    // 创建状态栏容器 (位于屏幕左上角，坐标为 10,10)
    this.statusBar = this.scene.add.container(10, 10);
    this.statusBar.setDepth(DepthLayers.UI_BACKGROUND); // 设置UI背景层级

    // 创建背景 (黑色半透明矩形)
    const bg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.7); // 增加不透明度
    bg.setOrigin(0, 0);
    bg.setDepth(DepthLayers.UI_BACKGROUND);
    this.statusBar.add(bg);

    // 计算头像大小和位置 (根据状态栏宽度调整)
    const iconSize = Math.min(40, barWidth * 0.2); // 头像大小
    const iconX = 10;
    const iconY = barHeight / 2 + 10; // 将英雄图标下移

    // 创建水晶图标 (使用文本Emoji代替图片)
    const crystalIcon = this.scene.add.text(iconX, 20, '💎', {
      fontSize: `${iconSize}px`
    });
    crystalIcon.setOrigin(0, 0.5);
    crystalIcon.setDepth(DepthLayers.UI_ELEMENT);
    this.statusBar.add(crystalIcon);

    // 创建英雄头像 (使用文本Emoji代替图片)
    const heroIcon = this.scene.add.text(iconX, iconY, '🧙', {
      fontSize: `${iconSize}px`
    });
    heroIcon.setOrigin(0, 0.5);
    heroIcon.setDepth(DepthLayers.UI_ELEMENT);
    this.statusBar.add(heroIcon);

    // 计算生命值条和魔法值条的尺寸和位置
    const barX = iconX + iconSize + 10; // 条形图X坐标
    const barLength = barWidth - barX - 10; // 条形图长度
    const barHeight1 = 12; // 条形图高度

    const crystalY = 20; // 水晶生命值条Y坐标
    const heroHpY = 45; // 英雄生命值条Y坐标
    const heroMpY = 70; // 英雄魔法值条Y坐标

    // 创建水晶生命值条背景
    const crystalHpBarBg = this.scene.add.rectangle(barX, crystalY, barLength, barHeight1, 0x333333);
    crystalHpBarBg.setOrigin(0, 0);
    crystalHpBarBg.setDepth(DepthLayers.UI_ELEMENT);
    this.statusBar.add(crystalHpBarBg);

    // 创建水晶生命值条
    const crystalHpBar = this.scene.add.rectangle(barX, crystalY, barLength, barHeight1, 0xff5555);
    crystalHpBar.setOrigin(0, 0);
    crystalHpBar.setDepth(DepthLayers.UI_ELEMENT + 1); // 稍高一层，确保显示在背景上方
    this.statusBar.add(crystalHpBar);

    // 创建英雄生命值条背景
    const heroHpBarBg = this.scene.add.rectangle(barX, heroHpY, barLength, barHeight1, 0x333333);
    heroHpBarBg.setOrigin(0, 0);
    heroHpBarBg.setDepth(DepthLayers.UI_ELEMENT);
    this.statusBar.add(heroHpBarBg);

    // 创建英雄生命值条
    const heroHpBar = this.scene.add.rectangle(barX, heroHpY, barLength, barHeight1, 0xff0000);
    heroHpBar.setOrigin(0, 0);
    heroHpBar.setDepth(DepthLayers.UI_ELEMENT + 1); // 稍高一层，确保显示在背景上方
    this.statusBar.add(heroHpBar);

    // 创建英雄魔法值条背景
    const heroMpBarBg = this.scene.add.rectangle(barX, heroMpY, barLength, barHeight1, 0x333333);
    heroMpBarBg.setOrigin(0, 0);
    heroMpBarBg.setDepth(DepthLayers.UI_ELEMENT);
    this.statusBar.add(heroMpBarBg);

    // 创建英雄魔法值条
    const heroMpBar = this.scene.add.rectangle(barX, heroMpY, barLength, barHeight1, 0x0000ff);
    heroMpBar.setOrigin(0, 0);
    heroMpBar.setDepth(DepthLayers.UI_ELEMENT + 1); // 稍高一层，确保显示在背景上方
    this.statusBar.add(heroMpBar);

    // 计算文本大小和位置
    const textSize = Math.min(12, barLength * 0.1); // 文本大小
    const textX = barX + barLength / 2; // 文本X坐标

    // 创建水晶生命值文本
    const crystalHpText = this.scene.add.text(textX, crystalY, '水晶: 1000/1000', {
      fontSize: `${textSize}px`,
      color: '#ffffff'
    });
    crystalHpText.setOrigin(0.5, 0);
    crystalHpText.setDepth(DepthLayers.UI_FOREGROUND); // 使用前景层级，确保显示在最上方
    this.statusBar.add(crystalHpText);

    // 创建英雄生命值文本
    const heroHpText = this.scene.add.text(textX, heroHpY, '英雄HP: 100/100', {
      fontSize: `${textSize}px`,
      color: '#ffffff'
    });
    heroHpText.setOrigin(0.5, 0);
    heroHpText.setDepth(DepthLayers.UI_FOREGROUND); // 使用前景层级，确保显示在最上方
    this.statusBar.add(heroHpText);

    // 创建英雄魔法值文本
    const heroMpText = this.scene.add.text(textX, heroMpY, '英雄MP: 100/100', {
      fontSize: `${textSize}px`,
      color: '#ffffff'
    });
    heroMpText.setOrigin(0.5, 0);
    heroMpText.setDepth(DepthLayers.UI_FOREGROUND); // 使用前景层级，确保显示在最上方
    this.statusBar.add(heroMpText);

    // 确保状态栏可见
    this.statusBar.setVisible(true);
    this.statusBar.setAlpha(1);

    console.log('[INFO] 状态栏创建完成，位置:', this.statusBar.x, this.statusBar.y);
  }

  /**
   * 创建波次指示器
   */
  private createWaveIndicator(): void {
    try {
      console.log('[INFO] 开始创建波次指示器...');

      // 获取屏幕宽度
      const screenWidth = this.scene.cameras.main.width;
      console.log('[INFO] 屏幕宽度:', screenWidth);

      // 计算字体大小 (适配窄屏设备)
      const fontSize = Math.min(24, Math.max(16, screenWidth * 0.05)); // 最小16px，最大24px
      console.log('[INFO] 波次指示器字体大小:', fontSize);

      // 创建波次指示器 (位于屏幕右上角，距离右边缘60像素，距离上边缘10像素)
      this.waveIndicator = this.scene.add.text(
        screenWidth - 140,         // X坐标：屏幕宽度减去60像素，进一步向左移动
        10,                       // Y坐标：距离顶部10像素
        'Wave:1',
        {
          fontSize: `${fontSize}px`,
          color: '#ffffff',        // 白色文本
          stroke: '#000000',       // 黑色描边
          strokeThickness: Math.max(2, fontSize / 6)  // 描边粗细根据字体大小调整
        }
      );
      this.waveIndicator.setOrigin(1, 0); // 设置原点为右上角，使文本右对齐

      // 设置深度和可见性（使用UI_FOREGROUND确保显示在暂停按钮上方）
      this.waveIndicator.setDepth(DepthLayers.UI_FOREGROUND);
      this.waveIndicator.setVisible(true);
      this.waveIndicator.setAlpha(1);

      console.log('[INFO] 波次指示器创建成功，位置:', this.waveIndicator.x, this.waveIndicator.y);
    } catch (error) {
      console.error('[ERROR] 创建波次指示器失败:', error);
    }
  }

  /**
   * 创建暂停/继续按钮
   */
  private createPauseButton(): void {
    try {
      console.log('[INFO] 开始创建暂停按钮...');

      // 获取屏幕尺寸
      const screenWidth = this.scene.cameras.main.width;
      console.log('[INFO] 屏幕宽度:', screenWidth);

      // 计算按钮位置 (右上角，与波次指示器平行)
      const x = screenWidth - 20; // 距离右边缘20像素
      const y = 10; // 与波次指示器在同一高度
      console.log('[INFO] 暂停按钮位置:', x, y);

      // 创建暂停按钮
      this.pauseButton = this.scene.add.text(
        x,
        y,
        '⏸️ 暂停',
        {
          fontSize: '22px',
          color: '#ffffff',
          backgroundColor: '#4a668d',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          },
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 5,
            stroke: true,
            fill: true
          }
        }
      );

      // 设置原点为右上角，使按钮右对齐
      this.pauseButton.setOrigin(1, 0);

      // 设置深度和可见性
      this.pauseButton.setDepth(DepthLayers.UI_ELEMENT);
      this.pauseButton.setVisible(true);
      this.pauseButton.setAlpha(1);

      // 设置为交互式
      this.pauseButton.setInteractive();

      // 为触摸设备优化的点击效果
      this.pauseButton.on('pointerdown', () => {
        // 点击时改变背景色，提供视觉反馈
        this.pauseButton.setStyle({ backgroundColor: '#5a769d' });

        // 切换暂停状态
        this.togglePause();

        // 300毫秒后恢复原来的背景色
        this.scene.time.delayedCall(300, () => {
          this.pauseButton.setStyle({ backgroundColor: '#4a668d' });
        });
      });

      console.log('[INFO] 暂停按钮创建成功，位置:', this.pauseButton.x, this.pauseButton.y);
    } catch (error) {
      console.error('[ERROR] 创建暂停按钮失败:', error);
    }
  }

  /**
   * 创建技能按钮
   */
  private createSkillButtons(): void {
    try {
      console.log('[INFO] 开始创建技能按钮...');

      // 获取屏幕尺寸
      const screenWidth = this.scene.cameras.main.width;
      const screenHeight = this.scene.cameras.main.height;
      console.log('[INFO] 屏幕尺寸:', screenWidth, screenHeight);

      // 计算底部边距 (适配不同屏幕高度)
      const bottomMargin = Math.min(100, screenHeight * 0.08); // 最大100px，或屏幕高度的8%
      console.log('[INFO] 底部边距:', bottomMargin);

      // 创建技能按钮容器 (位于屏幕底部中央)
      this.skillButtonsContainer = this.scene.add.container(
        screenWidth / 2,                    // X坐标：屏幕宽度的一半（水平居中）
        screenHeight - bottomMargin         // Y坐标：距离屏幕底部的距离
      );

      // 设置深度和可见性
      this.skillButtonsContainer.setDepth(DepthLayers.UI_ELEMENT);

      console.log('[INFO] 技能按钮容器位置:', this.skillButtonsContainer.x, this.skillButtonsContainer.y);

      // 从英雄数据中获取技能ID
      let heroId = 1; // 默认使用1号英雄

      // 尝试从gameState获取选择的英雄
      try {
        if (gameState && gameState.selectedHeroes && gameState.selectedHeroes.length > 0) {
          heroId = gameState.selectedHeroes[0];
        }
      } catch (error) {
        console.error('[ERROR] 获取选择的英雄失败:', error);
      }

      // 从BattleParamsService获取英雄数据
      let heroData = null;
      try {
        heroData = BattleParamsService.getHeroData(heroId);
      } catch (error) {
        console.error('[ERROR] 获取英雄数据失败:', error);
      }

      // 获取英雄的技能列表
      let skillIds: string[] = [];
      if (heroData && heroData.skills && Array.isArray(heroData.skills)) {
        try {
          // 从英雄数据中获取技能ID
          skillIds = heroData.skills.map((skill: any) => {
            // 检查skill.id是否存在
            if (skill && skill.id) {
              return `skill_${skill.id}`;
            }
            return 'skill_1'; // 默认技能
          });
        } catch (error) {
          console.error('[ERROR] 解析技能数据失败:', error);
          skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4']; // 使用默认技能
        }
      } else {
        // 如果没有找到英雄数据或技能列表，使用默认技能
        skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4'];
      }

      // 确保至少有一个技能
      if (skillIds.length === 0) {
        skillIds = ['skill_1'];
      }

      console.log('[INFO] 技能ID列表:', skillIds);

      // 计算按钮大小 (根据屏幕宽度调整)
      const buttonSize = Math.min(60, Math.max(40, screenWidth / 8));
      console.log('[INFO] 按钮大小:', buttonSize);

      // 根据屏幕宽度和按钮大小调整按钮间距，确保按钮不会重叠
      const minSpacing = buttonSize * 2.4; // 确保按钮之间有足够的间距，避免重叠
      const buttonSpacing = Math.min(120, Math.max(minSpacing, screenWidth / 5));
      console.log('[INFO] 按钮间距:', buttonSpacing);

      // 创建技能按钮，水平排列
      for (let i = 0; i < skillIds.length; i++) {
        // 计算按钮X坐标，使按钮居中排列
        const x = (i - (skillIds.length - 1) / 2) * buttonSpacing;

        // 创建技能UI组件 (Y坐标为0，相对于容器)
        const skillUI = new SkillUIComponent(this.scene, x, 0, skillIds[i], buttonSize);

        // 将技能UI组件的容器添加到技能按钮容器中
        this.skillButtonsContainer.add(skillUI.getContainer());

        // 保存技能UI组件的引用
        this.skillUIComponents.set(skillIds[i], skillUI);

        console.log('[INFO] 创建技能按钮:', skillIds[i], '位置:', x, 0);
      }

      console.log('[INFO] 技能按钮创建完成');
    } catch (error) {
      console.error('[ERROR] 创建技能按钮失败:', error);
    }
  }

  /**
   * 固定UI元素，使其不受摄像机移动影响
   */
  private fixUIElements(): void {
    try {
      console.log('[INFO] 开始固定UI元素...');

      // 使用UI层级常量，确保UI元素显示在游戏世界之上
      const UI_DEPTH = DepthLayers.UI_ELEMENT;

      // 设置各个UI元素的scrollFactor为0，确保它们不随摄像机移动
      this.statusBar.setScrollFactor(0);
      this.statusBar.setDepth(UI_DEPTH);
      this.statusBar.setVisible(true);
      this.statusBar.setAlpha(1);

      // 设置状态栏的所有子元素
      for (let i = 0; i < this.statusBar.length; i++) {
        const child = this.statusBar.getAt(i);
        if (child && (child as any).setDepth) {
          (child as any).setDepth(UI_DEPTH);
        }
      }
      console.log('[INFO] 固定状态栏成功');

      this.waveIndicator.setScrollFactor(0);
      this.waveIndicator.setDepth(UI_DEPTH);
      this.waveIndicator.setVisible(true);
      this.waveIndicator.setAlpha(1);
      console.log('[INFO] 固定波次指示器成功');

      this.pauseButton.setScrollFactor(0);
      this.pauseButton.setDepth(UI_DEPTH);
      this.pauseButton.setVisible(true);
      this.pauseButton.setAlpha(1);
      console.log('[INFO] 固定暂停按钮成功');

      this.skillButtonsContainer.setScrollFactor(0);
      this.skillButtonsContainer.setDepth(UI_DEPTH);
      this.skillButtonsContainer.setVisible(true);
      this.skillButtonsContainer.setAlpha(1);

      // 设置技能按钮容器的所有子元素
      for (let i = 0; i < this.skillButtonsContainer.length; i++) {
        const child = this.skillButtonsContainer.getAt(i);
        if (child && (child as any).setDepth) {
          (child as any).setDepth(UI_DEPTH);
        }
      }
      console.log('[INFO] 固定技能按钮容器成功');

      // 确保所有子元素也不随摄像机移动
      for (const skillUI of this.skillUIComponents.values()) {
        const container = skillUI.getContainer();
        container.setScrollFactor(0);
        container.setDepth(UI_DEPTH);
        container.setVisible(true);
        container.setAlpha(1);

        // 设置技能UI组件的所有子元素
        for (let i = 0; i < container.length; i++) {
          const child = container.getAt(i);
          if (child && (child as any).setDepth) {
            (child as any).setDepth(UI_DEPTH);
          }
        }
      }
      console.log('[INFO] 固定技能UI组件成功');

      console.log('[INFO] 固定UI元素完成，所有UI元素深度设置为', UI_DEPTH);
    } catch (error) {
      console.error('[ERROR] 固定UI元素失败:', error);
    }
  }

  /**
   * 切换暂停/继续状态
   */
  private togglePause(): void {
    try {
      // 切换暂停状态
      this.isPaused = !this.isPaused;

      if (this.isPaused) {
        // 暂停游戏
        this.onPauseCallback();

        // 更新按钮文本和样式
        this.pauseButton.setText('▶️ 继续');
        this.pauseButton.setStyle({
          backgroundColor: '#5a769d',
          fontSize: '22px',
          color: '#ffffff',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          },
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 5,
            stroke: true,
            fill: true
          }
        });
      } else {
        // 继续游戏
        this.onResumeCallback();

        // 更新按钮文本和样式
        this.pauseButton.setText('⏸️ 暂停');
        this.pauseButton.setStyle({
          backgroundColor: '#4a668d',
          fontSize: '22px',
          color: '#ffffff',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          },
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 5,
            stroke: true,
            fill: true
          }
        });
      }
    } catch (error) {
      console.error('[ERROR] 切换暂停状态失败:', error);
    }
  }

  /**
   * 更新状态栏
   * @param crystalHp 水晶当前生命值
   * @param crystalMaxHp 水晶最大生命值
   * @param heroHp 英雄当前生命值
   * @param heroMaxHp 英雄最大生命值
   * @param heroMp 英雄当前魔法值
   * @param heroMaxMp 英雄最大魔法值
   */
  public updateStatusBar(
    crystalHp: number,
    crystalMaxHp: number,
    heroHp: number,
    heroMaxHp: number,
    heroMp: number,
    heroMaxMp: number
  ): void {
    try {
      // 获取条形图的最大长度
      const barLength = (this.statusBar.getAt(2) as Phaser.GameObjects.Rectangle).width;

      // 更新水晶生命值条
      const crystalHpBar = this.statusBar.getAt(4) as Phaser.GameObjects.Rectangle;
      const crystalHpRatio = Math.max(0, Math.min(1, crystalHp / crystalMaxHp));
      crystalHpBar.width = barLength * crystalHpRatio;

      // 根据生命值百分比改变水晶生命值条颜色
      if (crystalHpRatio < 0.3) {
        // 生命值低于30%，显示红色
        crystalHpBar.fillColor = 0xff0000;
      } else if (crystalHpRatio < 0.7) {
        // 生命值低于70%，显示黄色
        crystalHpBar.fillColor = 0xffff00;
      } else {
        // 生命值正常，显示浅红色
        crystalHpBar.fillColor = 0xff5555;
      }

      // 更新英雄生命值条
      const heroHpBar = this.statusBar.getAt(6) as Phaser.GameObjects.Rectangle;
      heroHpBar.width = barLength * (heroHp / heroMaxHp);

      // 更新英雄魔法值条
      const heroMpBar = this.statusBar.getAt(8) as Phaser.GameObjects.Rectangle;
      heroMpBar.width = barLength * (heroMp / heroMaxMp);

      // 更新水晶生命值文本
      const crystalHpText = this.statusBar.getAt(9) as Phaser.GameObjects.Text;
      crystalHpText.setText(`水晶: ${Math.floor(crystalHp)}/${crystalMaxHp}`);

      // 更新英雄生命值文本
      const heroHpText = this.statusBar.getAt(10) as Phaser.GameObjects.Text;
      heroHpText.setText(`英雄HP: ${Math.floor(heroHp)}/${heroMaxHp}`);

      // 更新英雄魔法值文本
      const heroMpText = this.statusBar.getAt(11) as Phaser.GameObjects.Text;
      heroMpText.setText(`英雄MP: ${Math.floor(heroMp)}/${heroMaxMp}`);
    } catch (error) {
      console.error('[ERROR] 更新状态栏失败:', error);
    }
  }

  /**
   * 兼容旧版API的更新状态栏方法
   * @param hp 当前生命值
   * @param maxHp 最大生命值
   * @param mp 当前魔法值
   * @param maxMp 最大魔法值
   * @deprecated 使用新的updateStatusBar方法，该方法支持同时显示水晶HP和英雄HP/MP
   */
  public updateStatusBarLegacy(hp: number, maxHp: number, mp: number, maxMp: number): void {
    // 调用新的方法，将传入的参数作为英雄的生命值和魔法值，水晶生命值保持不变
    this.updateStatusBar(1000, 1000, hp, maxHp, mp, maxMp);
    console.warn('[WARN] 使用了已废弃的updateStatusBarLegacy方法，请使用新的updateStatusBar方法');
  }

  /**
   * 更新波次指示器
   * @param waveNumber 波次编号
   */
  public updateWaveIndicator(waveNumber: number): void {
    this.waveIndicator.setText(`Wave:${waveNumber}`);
  }

  /**
   * 显示波次变化提示
   * @param waveNumber 波次编号
   */
  public showWaveChangeNotification(waveNumber: number): void {
    // 显示波次提示
    const waveText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      `第 ${waveNumber} 波`,
      {
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    waveText.setOrigin(0.5);
    waveText.setScrollFactor(0); // 确保不随相机移动

    // 添加动画
    this.scene.tweens.add({
      targets: waveText,
      alpha: 0,
      scale: 2,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        waveText.destroy();
      }
    });
  }

  /**
   * 显示波次完成提示
   * @param waveIndex 波次索引
   * @param waveName 波次名称
   * @param onContinue 继续回调
   */
  public showWaveCompletedNotification(waveIndex: number, waveName: string, onContinue: () => void): void {
    // 显示波次完成提示
    const completeText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 50,
      `第 ${waveIndex + 1} 波 "${waveName}" 完成!`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    completeText.setOrigin(0.5);
    completeText.setScrollFactor(0); // 确保不随相机移动

    // 添加继续按钮
    const continueButton = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 + 20,
      '继续',
      {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#4a668d',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    continueButton.setOrigin(0.5);
    continueButton.setInteractive();
    continueButton.setScrollFactor(0); // 确保不随相机移动

    // 为触摸设备优化的点击效果
    continueButton.on('pointerdown', () => {
      // 点击时改变背景色，提供视觉反馈
      continueButton.setStyle({ backgroundColor: '#5a769d' });

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.scene.time.delayedCall(150, () => {
        // 销毁提示和按钮
        completeText.destroy();
        continueButton.destroy();

        // 调用继续回调
        onContinue();
      });
    });
  }

  /**
   * 显示游戏结束提示
   * @param result 游戏结果 ('victory' 或 'defeat')
   * @param onReturn 返回回调
   */
  public showGameOverNotification(result: string, onReturn: () => void): void {
    // 显示结果面板
    const resultText = result === 'victory' ? '胜利！' : '失败！';

    // 创建背景面板
    const panel = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      300,
      200,
      0x000000,
      0.8
    );
    panel.setScrollFactor(0); // 确保不随相机移动

    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      resultText,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0); // 确保不随相机移动

    // 添加返回按钮
    const button = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 + 50,
      '返回',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    button.setOrigin(0.5);
    button.setInteractive();
    button.setScrollFactor(0); // 确保不随相机移动

    // 为触摸设备优化的点击效果
    button.on('pointerdown', () => {
      // 点击时改变背景色，提供视觉反馈
      button.setStyle({ backgroundColor: '#555555' });

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.scene.time.delayedCall(150, () => {
        // 调用返回回调
        onReturn();
      });
    });
  }

  /**
   * 更新技能冷却
   * @param delta 时间增量
   */
  public updateSkillCooldowns(delta: number): void {
    // 更新所有技能UI组件的冷却
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.updateCooldown(delta);
    }
  }

  /**
   * 触发技能冷却
   * @param skillId 技能ID
   */
  public triggerSkillCooldown(skillId: string): void {
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.triggerCooldown();
    }
  }

  /**
   * 更新技能冷却进度
   * @param skillId 技能ID
   * @param progress 进度 (0-1)
   */
  public updateSkillCooldownProgress(skillId: string, progress: number): void {
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.setAvailable(progress >= 1.0);
      skillUI.updateCooldownProgress(progress);
    }
  }

  /**
   * 获取状态栏
   * @returns 状态栏容器
   */
  public getStatusBar(): Phaser.GameObjects.Container {
    return this.statusBar;
  }

  /**
   * 获取波次指示器
   * @returns 波次指示器文本
   */
  public getWaveIndicator(): Phaser.GameObjects.Text {
    return this.waveIndicator;
  }

  /**
   * 获取暂停按钮
   * @returns 暂停按钮文本
   */
  public getPauseButton(): Phaser.GameObjects.Text {
    return this.pauseButton;
  }

  /**
   * 获取技能按钮容器
   * @returns 技能按钮容器
   */
  public getSkillButtonsContainer(): Phaser.GameObjects.Container {
    return this.skillButtonsContainer;
  }

  /**
   * 获取所有技能UI组件
   * @returns 技能UI组件数组
   */
  public getAllSkillUIComponents(): SkillUIComponent[] {
    try {
      const components: SkillUIComponent[] = [];

      // 将Map转换为数组
      for (const skillUI of this.skillUIComponents.values()) {
        components.push(skillUI);
      }

      return components;
    } catch (error) {
      console.error('[ERROR] 获取技能UI组件失败:', error);
      return [];
    }
  }

  /**
   * 获取所有UI元素
   * @returns UI元素数组
   */
  public getAllUIElements(): Phaser.GameObjects.GameObject[] {
    try {
      console.log('[INFO] 获取所有UI元素...');

      const elements: Phaser.GameObjects.GameObject[] = [];

      // 添加主要UI元素
      if (this.statusBar) {
        elements.push(this.statusBar);
        console.log('[INFO] 添加状态栏到UI元素列表');

        // 添加状态栏的所有子元素
        for (let i = 0; i < this.statusBar.length; i++) {
          const child = this.statusBar.getAt(i);
          if (child) {
            elements.push(child);
          }
        }
      }

      if (this.waveIndicator) {
        elements.push(this.waveIndicator);
        console.log('[INFO] 添加波次指示器到UI元素列表');
      }

      if (this.pauseButton) {
        elements.push(this.pauseButton);
        console.log('[INFO] 添加暂停按钮到UI元素列表');
      }

      if (this.skillButtonsContainer) {
        elements.push(this.skillButtonsContainer);
        console.log('[INFO] 添加技能按钮容器到UI元素列表');

        // 添加技能按钮容器的所有子元素
        for (let i = 0; i < this.skillButtonsContainer.length; i++) {
          const child = this.skillButtonsContainer.getAt(i);
          if (child) {
            elements.push(child);
          }
        }
      }

      // 添加所有技能UI组件
      for (const skillUI of this.skillUIComponents.values()) {
        const container = skillUI.getContainer();
        if (container) {
          elements.push(container);
          console.log('[INFO] 添加技能UI组件到UI元素列表');

          // 添加技能UI组件的所有子元素
          for (let i = 0; i < container.length; i++) {
            const child = container.getAt(i);
            if (child) {
              elements.push(child);
            }
          }
        }
      }

      console.log('[INFO] 获取到', elements.length, '个UI元素');
      return elements;
    } catch (error) {
      console.error('[ERROR] 获取UI元素失败:', error);
      return [];
    }
  }

  /**
   * 销毁所有UI元素
   */
  public destroy(): void {
    // 销毁技能UI组件
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.destroy();
    }

    // 销毁UI元素
    this.statusBar.destroy();
    this.waveIndicator.destroy();
    this.pauseButton.destroy();
    this.skillButtonsContainer.destroy();
    this.uiContainer.destroy();
  }
}
