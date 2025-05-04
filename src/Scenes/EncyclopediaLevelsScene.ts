import Phaser from 'phaser';
import { ConfigManager } from '@/Managers/ConfigManager';
import { ChapterPanel } from '@/UI/Encyclopedia/ChapterPanel';
import { LevelDetailsPanel } from '@/UI/Encyclopedia/LevelDetailsPanel';
import { LevelConfig } from '@/DesignConfig/Level';
import { DepthLayers } from '@/Constants/DepthLayers';

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
    // 计算滚动区域大小
    const padding = 20;
    const scrollAreaWidth = this.cameras.main.width - (padding * 2);
    const scrollAreaHeight = this.cameras.main.height - 150;
    const scrollAreaY = 100; // 滚动区域顶部Y坐标

    // 创建滚动区域背景 - 使用更明显的颜色以便调试
    const scrollBg = this.add.rectangle(
      this.cameras.main.width / 2,
      scrollAreaY + scrollAreaHeight / 2,
      scrollAreaWidth,
      scrollAreaHeight,
      0x222222, // 深灰色背景
      0.8 // 提高不透明度
    );
    scrollBg.setStrokeStyle(2, 0xffffff, 0.8); // 更明显的边框
    scrollBg.setDepth(DepthLayers.UI_BACKGROUND); // 设置深度为UI背景层

    // 添加调试文本，确认滚动区域可见
    const debugText = this.add.text(
      this.cameras.main.width / 2,
      scrollAreaY + 30,
      '滚动区域',
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    debugText.setOrigin(0.5, 0.5);
    debugText.setDepth(DepthLayers.UI_FOREGROUND); // 设置深度为UI前景层，确保在其他元素之上

    // 创建滚动容器 - 设置初始位置在滚动区域顶部
    this.scrollView = this.add.container(this.cameras.main.width / 2, scrollAreaY);
    this.scrollView.setDepth(DepthLayers.UI_CONTAINER); // 设置深度为UI容器层

    // 创建遮罩 - 限制内容只在滚动区域内显示
    const mask = this.add.graphics();
    mask.fillStyle(0xffffff);
    mask.fillRect(
      (this.cameras.main.width - scrollAreaWidth) / 2,
      scrollAreaY,
      scrollAreaWidth,
      scrollAreaHeight
    );

    // 应用遮罩到滚动容器
    this.scrollView.setMask(new Phaser.Display.Masks.GeometryMask(this, mask));

    // 添加章节列表标题
    this.createChapterListTitle(scrollAreaWidth);

    // 创建章节面板
    let yPosition = 70; // 起始Y位置 (相对于滚动容器)
    for (const chapter of chapters) {
      // 创建章节面板 - 注意x坐标为0，因为是相对于滚动容器的中心点
      const chapterPanel = new ChapterPanel(
        this,
        0, // 相对于滚动容器的中心点
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
    this.addScrolling(yPosition, scrollAreaY, scrollAreaHeight);
  }

  /**
   * 创建章节列表标题
   * @param scrollAreaWidth 滚动区域宽度
   */
  private createChapterListTitle(scrollAreaWidth: number): void {
    const yPosition = 20; // 相对于滚动容器的位置

    // 创建标题背景
    const titleBg = this.add.rectangle(
      0, // 相对于滚动容器的中心点
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
      0, // 相对于滚动容器的中心点
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
   * @param scrollAreaY 滚动区域Y坐标
   * @param scrollAreaHeight 滚动区域高度
   */
  private addScrolling(contentHeight: number, scrollAreaY: number, scrollAreaHeight: number): void {
    // 添加调试信息
    console.log(`[DEBUG] 滚动区域: Y=${scrollAreaY}, 高度=${scrollAreaHeight}`);
    console.log(`[DEBUG] 内容高度: ${contentHeight}`);

    // 添加滚动指示器
    const scrollIndicator = this.add.text(
      this.cameras.main.width - 20,
      scrollAreaY + 20,
      '↕️',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }
    );
    scrollIndicator.setOrigin(0.5, 0.5);
    scrollIndicator.setDepth(DepthLayers.UI_FOREGROUND); // 设置深度为UI前景层，确保在其他UI元素之上，确保在其他UI元素之上

    // 添加滚动事件监听
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: any, deltaY: any, _deltaZ: any) => {
      // 添加调试信息
      console.log(`[DEBUG] 滚动: deltaY=${deltaY}, 当前Y=${this.scrollView.y}`);

      if (deltaY > 0) {
        // 向下滚动
        this.scrollView.y -= 30; // 增加滚动速度
      } else {
        // 向上滚动
        this.scrollView.y += 30; // 增加滚动速度
      }

      // 限制滚动范围 - 确保内容不会滚动出滚动区域
      const minY = scrollAreaY - Math.max(0, contentHeight - scrollAreaHeight); // 最小Y值（内容底部对齐滚动区域底部）
      const maxY = scrollAreaY; // 最大Y值（内容顶部对齐滚动区域顶部）

      // 添加调试信息
      console.log(`[DEBUG] 滚动范围: ${minY} ~ ${maxY}`);

      this.scrollView.y = Phaser.Math.Clamp(
        this.scrollView.y,
        minY,
        maxY
      );

      // 更新滚动指示器颜色
      if (this.scrollView.y <= minY) {
        scrollIndicator.setColor('#ff0000'); // 红色表示已到底部
      } else if (this.scrollView.y >= maxY) {
        scrollIndicator.setColor('#00ff00'); // 绿色表示已到顶部
      } else {
        scrollIndicator.setColor('#ffffff'); // 白色表示中间位置
      }
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