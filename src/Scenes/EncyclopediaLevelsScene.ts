import Phaser from 'phaser';
import { ConfigManager } from '@/Managers/ConfigManager';
import { ChapterPanel } from '@/UI/Encyclopedia/ChapterPanel';
import { LevelDetailsPanel } from '@/UI/Encyclopedia/LevelDetailsPanel';
import { LevelConfig } from '@/DesignConfig/Level';

/**
 * 百科视图场景 - 关卡页面
 * 优化版本：使用组件化结构，减少代码量
 */
export class EncyclopediaLevelsScene extends Phaser.Scene {
  // 返回按钮
  private backButton!: Phaser.GameObjects.Text;
  // 下一页按钮
  private nextButton!: Phaser.GameObjects.Text;
  // 配置管理器
  private configManager: ConfigManager = ConfigManager.getInstance();
  // 滚动容器
  private scrollView!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'EncyclopediaLevelsScene' });
  }


  async create(): Promise<void> {
    try {
      // 创建背景矩形
      this.createBackground();

      // 创建标题
      this.createTitle('关卡百科');

      // 创建返回按钮
      this.createBackButton();

      // 创建下一页按钮
      this.createNextButton('英雄百科', 'EncyclopediaHeroesScene');

      // 显示加载中提示
      const loadingText = this.showLoadingText();

      // 确保配置管理器已初始化
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 移除加载中提示
      loadingText.destroy();

      // 创建关卡列表
      this.createLevelsList();
    } catch (error) {
      console.error('[ERROR] 创建场景失败:', error);
      this.showErrorMessage();
    }
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width - 20,
      this.cameras.main.height - 100,
      0x333333,
      0.2
    );
  }

  /**
   * 显示加载中文本
   * @returns 文本对象
   */
  private showLoadingText(): Phaser.GameObjects.Text {
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '加载中...',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    loadingText.setOrigin(0.5, 0.5);
    return loadingText;
  }

  /**
   * 显示错误消息
   */
  private showErrorMessage(): void {
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '加载失败，请重试',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5, 0.5);
  }



  private createTitle(text: string): void {
    const title = this.add.text(
      this.cameras.main.width / 2,
      50,
      text,
      {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    title.setOrigin(0.5, 0.5);
  }

  private createBackButton(): void {
    this.backButton = this.add.text(50, 50, '返回', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    }).setInteractive();

    this.backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  private createNextButton(text: string, sceneKey: string): void {
    this.nextButton = this.add.text(
      this.cameras.main.width - 150,
      50,
      text,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { left: 15, right: 15, top: 10, bottom: 10 }
      }
    ).setInteractive();

    this.nextButton.on('pointerdown', () => {
      this.scene.start(sceneKey);
    });
  }

  /**
   * 创建关卡列表
   */
  private createLevelsList(): void {
    try {
      // 获取配置数据
      const levels = this.configManager.getLevelsConfig();
      const chapters = this.configManager.getChaptersConfig();

      // 检查是否有可用的关卡数据
      if (!levels || levels.length === 0) {
        this.showNoDataMessage();
        return;
      }

      // 创建滚动区域
      this.createScrollArea(chapters, levels);
    } catch (error) {
      console.error('[ERROR] 创建关卡列表失败:', error);
    }
  }

  /**
   * 显示无数据消息
   */
  private showNoDataMessage(): void {
    const noDataText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '暂无关卡数据\n请检查配置文件',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }
    );
    noDataText.setOrigin(0.5, 0.5);
  }

  /**
   * 创建滚动区域
   * @param chapters 章节数据
   * @param levels 关卡数据
   */
  private createScrollArea(chapters: any[], levels: LevelConfig[]): void {
    // 创建滚动容器
    this.scrollView = this.add.container(0, 0);

    // 计算滚动区域大小
    const padding = 20;
    const scrollAreaWidth = this.cameras.main.width - (padding * 2);
    const scrollAreaHeight = this.cameras.main.height - 150;

    // 创建滚动区域背景
    const scrollBg = this.add.rectangle(
      this.cameras.main.width / 2,
      100 + scrollAreaHeight / 2,
      scrollAreaWidth,
      scrollAreaHeight,
      0x000000,
      0.7
    );
    scrollBg.setStrokeStyle(2, 0xffffff, 0.5);

    // 添加章节列表标题
    this.createChapterListTitle(scrollAreaWidth);

    // 创建章节面板
    let yPosition = 200; // 起始Y位置
    for (const chapter of chapters) {
      // 创建章节面板
      const chapterPanel = new ChapterPanel(
        this,
        this.cameras.main.width / 2,
        yPosition,
        chapter,
        levels,
        scrollAreaWidth,
        (level) => this.showLevelDetails(level)
      );

      // 添加到滚动容器
      this.scrollView.add(chapterPanel);

      // 更新Y位置
      yPosition += chapterPanel.getHeight() + 30;
    }

    // 添加滚动功能
    this.addScrolling(yPosition);
  }

  /**
   * 创建章节列表标题
   * @param scrollAreaWidth 滚动区域宽度
   */
  private createChapterListTitle(scrollAreaWidth: number): void {
    const yPosition = 120;

    // 创建标题背景
    const titleBg = this.add.rectangle(
      this.cameras.main.width / 2,
      yPosition,
      scrollAreaWidth - 20,
      50,
      0x333333,
      0.9
    );
    titleBg.setStrokeStyle(2, 0x666666, 0.9);
    this.scrollView.add(titleBg);

    // 创建标题文本
    const chapterListTitle = this.add.text(
      this.cameras.main.width / 2,
      yPosition,
      '章节列表',
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    chapterListTitle.setOrigin(0.5, 0.5);
    this.scrollView.add(chapterListTitle);
  }

  /**
   * 添加滚动功能
   * @param contentHeight 内容高度
   */
  private addScrolling(contentHeight: number): void {
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: any, deltaY: any, _deltaZ: any) => {
      if (deltaY > 0) {
        // 向下滚动
        this.scrollView.y -= 20;
      } else {
        // 向上滚动
        this.scrollView.y += 20;
      }

      // 限制滚动范围
      this.scrollView.y = Phaser.Math.Clamp(
        this.scrollView.y,
        -(contentHeight - this.cameras.main.height + 100),
        0
      );
    });
  }

  /**
   * 显示关卡详情
   * @param level 关卡配置
   */
  private showLevelDetails(level: LevelConfig): void {
    try {
      // 清除之前的详情面板
      const existingPanel = this.children.getByName('levelDetailsPanel');
      if (existingPanel) {
        existingPanel.destroy();
      }

      // 创建详情面板
      new LevelDetailsPanel(
        this,
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        level
      );
    } catch (error) {
      console.error(`[ERROR] 显示关卡详情失败:`, error);
    }
  }
}