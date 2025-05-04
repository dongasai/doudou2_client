import Phaser from 'phaser';
import { gameState } from '@/main';
import { LevelConfig } from '@/DesignConfig/Level';

/**
 * 关卡选择场景
 * 玩家可以在此选择要挑战的关卡
 */
export class LevelSelectScene extends Phaser.Scene {
  // 关卡按钮组
  private levelButtons: Phaser.GameObjects.Container;

  // 返回按钮
  private backButton: Phaser.GameObjects.Text;

  // 关卡数据
  private levels: LevelConfig[] = [];

  // 当前页码
  private currentPage: number = 0;

  // 每页显示的关卡数
  private levelsPerPage: number = 5;

  // 存储关卡按钮背景引用
  private levelButtonBgs: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  /**
   * 构造函数
   */
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  /**
   * 预加载资源
   */
  preload(): void {
    // 不需要加载图片资源，使用Emoji和Phaser图形API
  }

  /**
   * 创建场景
   */
  create(): void {
    // 创建背景
    this.createBackground();

    // 创建标题
    this.createTitle();

    // 加载关卡数据
    this.loadLevelData();

    // 创建关卡按钮
    this.createLevelButtons();

    // 创建导航按钮
    this.createNavigationButtons();

    // 创建返回按钮
    this.createBackButton();

    // 默认选中第一个关卡（如果有解锁的关卡）
    this.selectFirstAvailableLevel();
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    // 创建渐变背景
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建渐变矩形 - 使用多个矩形模拟渐变效果
    const background = this.add.graphics();

    // 设置颜色（从深蓝色到浅蓝色的渐变）
    const topColor = 0x1a2a3a;
    const bottomColor = 0x4a6a8a;

    // 创建多个矩形来模拟渐变
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(topColor),
        Phaser.Display.Color.ValueToColor(bottomColor),
        steps,
        i
      );

      background.fillStyle(color.color, 1);
      background.fillRect(0, height * (i / steps), width, height / steps + 1);
    }

    // 添加一些装饰性的星星
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.8 + 0.2;

      const star = this.add.circle(x, y, size, 0xffffff, alpha);

      // 添加简单的闪烁动画
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;

    // 创建场景标题
    const title = this.add.text(centerX, 80, '选择关卡', {
      fontSize: '40px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 添加副标题
    const subtitle = this.add.text(centerX, 130, '挑战不同的豆豆关卡', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    subtitle.setOrigin(0.5);
  }

  /**
   * 加载关卡数据
   */
  private loadLevelData(): void {
    // 模拟从配置文件加载关卡数据
    // 实际项目中应该从JSON文件或API加载
    this.levels = [
      {
        id: 'level-1-1',
        name: '第一章-第一关',
        description: '基础难度关卡',
        difficulty: 1.0,
        crystal: {
          position: { x: 400, y: 300 },
          maxHp: 1000
        },
        beanRatios: [
          { type: '暴躁豆', weight: 3 },
          { type: '毒豆', weight: 1 }
        ],
        totalBeans: 30,
        spawnInterval: 1000,
        attrFactors: {
          hp: 1.0,
          attack: 1.0,
          defense: 1.0,
          speed: 1.0
        },
        victoryCondition: {
          type: 'allDefeated'
        },
        defeatCondition: {
          type: 'crystalDestroyed'
        },
        background: 'grassland',
        availableHeroSlots: 3
      },
      {
        id: 'level-1-2',
        name: '第一章-第二关',
        description: '初级难度关卡',
        difficulty: 1.2,
        crystal: {
          position: { x: 400, y: 300 },
          maxHp: 950
        },
        beanRatios: [
          { type: '暴躁豆', weight: 2 },
          { type: '毒豆', weight: 1 },
          { type: '闪电豆', weight: 1 }
        ],
        totalBeans: 35,
        spawnInterval: 950,
        attrFactors: {
          hp: 1.1,
          attack: 1.1,
          defense: 1.0,
          speed: 1.0
        },
        victoryCondition: {
          type: 'allDefeated'
        },
        defeatCondition: {
          type: 'crystalDestroyed'
        },
        background: 'grassland',
        availableHeroSlots: 3
      },
      {
        id: 'level-1-3',
        name: '第一章-第三关',
        description: '进阶难度关卡',
        difficulty: 1.3,
        crystal: {
          position: { x: 400, y: 300 },
          maxHp: 900
        },
        beanRatios: [
          { type: '暴躁豆', weight: 2 },
          { type: '毒豆', weight: 1 },
          { type: '闪电豆', weight: 1 },
          { type: '铁甲豆', weight: 1 }
        ],
        totalBeans: 40,
        spawnInterval: 900,
        attrFactors: {
          hp: 1.15,
          attack: 1.1,
          defense: 1.1,
          speed: 1.05
        },
        victoryCondition: {
          type: 'allDefeated'
        },
        defeatCondition: {
          type: 'crystalDestroyed'
        },
        background: 'grassland',
        availableHeroSlots: 3
      }
    ];
  }

  /**
   * 创建关卡按钮
   */
  private createLevelButtons(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 200;
    const buttonHeight = 120;
    const buttonSpacing = 20;

    // 创建容器
    this.levelButtons = this.add.container(0, 0);

    // 获取当前页的关卡
    const startIndex = this.currentPage * this.levelsPerPage;
    const endIndex = Math.min(startIndex + this.levelsPerPage, this.levels.length);
    const currentLevels = this.levels.slice(startIndex, endIndex);

    // 为每个关卡创建按钮
    currentLevels.forEach((level, index) => {
      const y = startY + index * (buttonHeight + buttonSpacing);

      // 创建按钮背景
      const buttonBackground = this.add.rectangle(
        centerX,
        y,
        350,
        buttonHeight,
        0x4a6a8a,
        0.8
      );
      buttonBackground.setStrokeStyle(2, 0xffffff);

      // 存储按钮背景引用
      this.levelButtonBgs.set(level.id, buttonBackground);

      // 检查关卡是否已解锁
      const isUnlocked = gameState.player.unlockedLevels.includes(level.id);

      // 检查是否是当前选中的关卡
      const isSelected = gameState.selectedLevel && gameState.selectedLevel.id === level.id;

      // 如果是选中的关卡，设置高亮样式
      if (isSelected && isUnlocked) {
        buttonBackground.setFillStyle(0x6a9a6a, 0.9); // 绿色背景
        buttonBackground.setStrokeStyle(3, 0xffff00); // 黄色边框
      }

      // 创建关卡名称
      const nameText = this.add.text(
        centerX,
        y - 30,
        level.name,
        {
          fontSize: '24px',
          color: isUnlocked ? '#ffffff' : '#888888',
          fontFamily: 'Arial, sans-serif'
        }
      );
      nameText.setOrigin(0.5);

      // 创建关卡描述
      const descText = this.add.text(
        centerX,
        y + 5,
        level.description,
        {
          fontSize: '18px',
          color: isUnlocked ? '#dddddd' : '#888888',
          fontFamily: 'Arial, sans-serif'
        }
      );
      descText.setOrigin(0.5);

      // 创建难度指示器
      const difficultyText = this.add.text(
        centerX,
        y + 30,
        `难度: ${'⭐'.repeat(Math.ceil(level.difficulty))}`,
        {
          fontSize: '18px',
          color: isUnlocked ? '#ffff00' : '#888888',
          fontFamily: 'Arial, sans-serif'
        }
      );
      difficultyText.setOrigin(0.5);

      // 如果关卡未解锁，添加锁定图标
      if (!isUnlocked) {
        const lockIcon = this.add.text(
          centerX + 150,
          y,
          '🔒',
          {
            fontSize: '32px'
          }
        );
        lockIcon.setOrigin(0.5);
        this.levelButtons.add(lockIcon);
      }

      // 将按钮元素添加到容器
      this.levelButtons.add([buttonBackground, nameText, descText, difficultyText]);

      // 如果关卡已解锁，添加交互功能
      if (isUnlocked) {
        buttonBackground.setInteractive({ useHandCursor: true });

        // 为触摸设备优化的点击效果
        buttonBackground.on('pointerdown', () => {
          // 如果不是当前选中的关卡，提供视觉反馈
          if (!isSelected) {
            // 点击时改变颜色
            buttonBackground.setFillStyle(0x6a8aaa, 0.8);

            // 短暂延迟后执行操作，让用户看到按钮状态变化
            this.time.delayedCall(150, () => {
              // 处理关卡选择
              this.onLevelButtonClick(level);
            });
          } else {
            // 已选中的关卡直接处理点击
            this.onLevelButtonClick(level);
          }
        });
      }
    });
  }

  /**
   * 创建导航按钮
   */
  private createNavigationButtons(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 计算总页数
    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    // 如果只有一页，不显示导航按钮
    if (totalPages <= 1) return;

    // 创建上一页按钮
    if (this.currentPage > 0) {
      const prevButton = this.add.text(
        width / 4,
        height - 100,
        '◀ 上一页',
        {
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#4a6a8a',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          }
        }
      );
      prevButton.setOrigin(0.5);
      prevButton.setInteractive({ useHandCursor: true });
      prevButton.on('pointerdown', this.onPrevButtonClick, this);
    }

    // 创建下一页按钮
    if (this.currentPage < totalPages - 1) {
      const nextButton = this.add.text(
        width * 3 / 4,
        height - 100,
        '下一页 ▶',
        {
          fontSize: '24px',
          color: '#ffffff',
          backgroundColor: '#4a6a8a',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          }
        }
      );
      nextButton.setOrigin(0.5);
      nextButton.setInteractive({ useHandCursor: true });
      nextButton.on('pointerdown', this.onNextButtonClick, this);
    }

    // 显示页码
    const pageText = this.add.text(
      width / 2,
      height - 100,
      `${this.currentPage + 1} / ${totalPages}`,
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    pageText.setOrigin(0.5);
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    this.backButton = this.add.text(
      50,
      50,
      '◀ 返回',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#4a6a8a',
        padding: {
          left: 15,
          right: 15,
          top: 8,
          bottom: 8
        }
      }
    );
    this.backButton.setInteractive({ useHandCursor: true });
    this.backButton.on('pointerdown', this.onBackButtonClick, this);
  }

  /**
   * 关卡按钮点击事件
   * @param level 选中的关卡
   */
  private onLevelButtonClick(level: LevelConfig): void {
    // 清除之前选中关卡的高亮效果
    if (gameState.selectedLevel) {
      const prevButton = this.levelButtonBgs.get(gameState.selectedLevel.id);
      if (prevButton) {
        prevButton.setFillStyle(0x4a6a8a, 0.8);
        prevButton.setStrokeStyle(2, 0xffffff);
      }
    }

    // 保存选中的关卡
    gameState.selectedLevel = level;

    // 设置当前选中关卡的高亮效果
    const currentButton = this.levelButtonBgs.get(level.id);
    if (currentButton) {
      currentButton.setFillStyle(0x6a9a6a, 0.9); // 绿色背景
      currentButton.setStrokeStyle(3, 0xffff00); // 黄色边框
    }

    // 添加短暂延迟，让用户看到选中效果
    this.time.delayedCall(300, () => {
      // 切换到英雄选择场景
      this.scene.start('HeroSelectScene');
    });
  }

  /**
   * 上一页按钮点击事件
   */
  private onPrevButtonClick(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.refreshLevelButtons();
    }
  }

  /**
   * 下一页按钮点击事件
   */
  private onNextButtonClick(): void {
    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.refreshLevelButtons();
    }
  }

  /**
   * 返回按钮点击事件
   */
  private onBackButtonClick(): void {
    // 返回主菜单场景
    this.scene.start('MainMenuScene');
  }

  /**
   * 刷新关卡按钮
   */
  private refreshLevelButtons(): void {
    // 清空现有按钮
    this.levelButtons.removeAll(true);

    // 清空按钮背景引用
    this.levelButtonBgs.clear();

    // 重新创建按钮
    this.createLevelButtons();

    // 重新创建导航按钮
    this.createNavigationButtons();
  }

  /**
   * 默认选中第一个可用关卡
   */
  private selectFirstAvailableLevel(): void {
    // 查找第一个已解锁的关卡
    const firstUnlockedLevel = this.levels.find(level =>
      gameState.player.unlockedLevels.includes(level.id)
    );

    // 如果找到已解锁的关卡，则选中它
    if (firstUnlockedLevel) {
      // 保存选中的关卡
      gameState.selectedLevel = firstUnlockedLevel;

      // 高亮显示选中的关卡按钮
      const buttonBg = this.levelButtonBgs.get(firstUnlockedLevel.id);
      if (buttonBg) {
        // 设置高亮样式
        buttonBg.setFillStyle(0x6a9a6a, 0.9); // 绿色背景
        buttonBg.setStrokeStyle(3, 0xffff00); // 黄色边框

        // 添加轻微的缩放动画，吸引用户注意
        this.tweens.add({
          targets: buttonBg,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 300,
          yoyo: true,
          repeat: 1
        });
      }

      console.log(`默认选中关卡: ${firstUnlockedLevel.name}`);
    }
  }
}
