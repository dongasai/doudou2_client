import Phaser from 'phaser';
import { LevelButton } from './LevelButton';
import { LevelConfig } from '@/DesignConfig/Level';
import { Chapter } from '@/DesignConfig/Chapter';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 章节面板组件
 * 负责显示单个章节及其关卡
 */
export class ChapterPanel extends Phaser.GameObjects.Container {
  private chapter: Chapter;
  private levels: LevelConfig[];
  private scrollAreaWidth: number;
  private onLevelSelect: (level: LevelConfig) => void;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param chapter 章节数据
   * @param levels 关卡数据
   * @param scrollAreaWidth 滚动区域宽度
   * @param onLevelSelect 关卡选择回调
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    chapter: Chapter,
    levels: LevelConfig[],
    scrollAreaWidth: number,
    onLevelSelect: (level: LevelConfig) => void
  ) {
    super(scene, x, y);
    this.chapter = chapter;
    this.levels = levels;
    this.scrollAreaWidth = scrollAreaWidth;
    this.onLevelSelect = onLevelSelect;

    // 创建章节UI
    this.createChapterUI();

    // 将容器添加到场景
    scene.add.existing(this);
  }

  /**
   * 创建章节UI
   */
  private createChapterUI(): void {
    const padding = 20;

    // 添加调试边框，帮助我们确认章节面板的位置和大小
    const debugBorder = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth,
      this.getHeight(),
      0x0000ff,
      0.1
    );
    debugBorder.setStrokeStyle(2, 0x0000ff, 0.5);
    debugBorder.setDepth(1); // 设置相对深度为1，确保在章节面板的最底层
    this.add(debugBorder);

    // 创建章节标题背景 - 使用更明显的颜色
    const chapterTitleBg = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth - 40,
      50, // 增加高度
      0x0066cc, // 蓝色背景
      1.0 // 完全不透明
    );
    chapterTitleBg.setStrokeStyle(3, 0xffffff, 1.0); // 白色边框
    chapterTitleBg.setDepth(2); // 设置相对深度为2，确保在调试边框之上
    this.add(chapterTitleBg);

    // 设置章节面板的深度
    this.setDepth(DepthLayers.UI_PANEL); // 设置深度为UI面板层

    // 添加闪烁动画，使章节标题更加明显
    this.scene.tweens.add({
      targets: chapterTitleBg,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // 创建章节标题 - 使用更明显的颜色和描边
    const chapterTitle = this.scene.add.text(
      0,
      0,
      `${this.chapter.name} (ID: ${this.chapter.id})`, // 添加ID以便调试
      {
        fontSize: '28px', // 增大字体
        fontFamily: 'Arial',
        color: '#ffffff', // 白色文本
        stroke: '#000000',
        strokeThickness: 4, // 增加描边厚度
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 4 } // 添加阴影
      }
    );
    chapterTitle.setOrigin(0.5, 0.5);
    chapterTitle.setDepth(3); // 设置相对深度为3，确保在标题背景之上
    this.add(chapterTitle);

    // 获取该章节的关卡
    const chapterLevels = this.levels.filter(level => {
      // 从level.id中提取章节ID，格式为"level-章节ID-关卡ID"
      const idParts = level.id.split('-');
      return idParts.length >= 3 && parseInt(idParts[1]) === this.chapter.id;
    });

    // 如果没有关卡，显示一个提示
    if (chapterLevels.length === 0) {
      const noLevelsText = this.scene.add.text(
        0,
        50,
        '该章节暂无关卡',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#cccccc',
          fontStyle: 'italic'
        }
      );
      noLevelsText.setOrigin(0.5, 0.5);
      this.add(noLevelsText);
      return;
    }

    // 创建关卡按钮
    const buttonsPerRow = 1; // 每行只显示1个按钮，避免重叠
    const buttonSpacingY = 40; // 增加按钮垂直间距
    const availableWidth = this.scrollAreaWidth - (padding * 2);
    const buttonWidth = Math.min(availableWidth * 0.9, 350); // 限制按钮最大宽度
    const buttonHeight = 140; // 增加按钮高度，给文本留出更多空间

    // 添加调试信息
    console.log(`[DEBUG] 章节 ${this.chapter.id} 关卡数量: ${chapterLevels.length}`);
    console.log(`[DEBUG] 按钮尺寸: ${buttonWidth}x${buttonHeight}`);

    for (let i = 0; i < chapterLevels.length; i++) {
      const level = chapterLevels[i];
      const row = i; // 每行只有一个按钮

      // 计算按钮位置 - 居中显示
      const x = 0; // 居中
      const y = 100 + row * (buttonHeight + buttonSpacingY); // 增加起始Y位置

      console.log(`[DEBUG] 按钮 ${i} 位置: (${x}, ${y})`);

      // 创建关卡按钮
      const levelButton = new LevelButton(
        this.scene,
        x,
        y,
        buttonWidth,
        buttonHeight,
        level,
        () => this.onLevelSelect(level)
      );

      this.add(levelButton);

      // 移除调试文本，避免与按钮重叠
    }
  }

  /**
   * 获取章节高度
   * @returns 章节高度
   */
  public getHeight(): number {
    // 获取该章节的关卡
    const chapterLevels = this.levels.filter(level => {
      const idParts = level.id.split('-');
      return idParts.length >= 3 && parseInt(idParts[1]) === this.chapter.id;
    });

    const buttonsPerRow = 1; // 每行只显示1个按钮
    const buttonHeight = 140; // 按钮高度
    const buttonSpacingY = 40; // 按钮垂直间距
    const rowCount = chapterLevels.length; // 行数等于按钮数量

    // 如果没有关卡，返回基础高度
    if (chapterLevels.length === 0) {
      return 100; // 标题高度 + 提示文本高度
    }

    // 返回章节总高度 - 增加底部边距
    return 100 + rowCount * (buttonHeight + buttonSpacingY) + 50; // 增加顶部和底部边距
  }
}
