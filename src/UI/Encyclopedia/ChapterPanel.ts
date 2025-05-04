import Phaser from 'phaser';
import { LevelButton } from './LevelButton';
import { LevelConfig } from '@/DesignConfig/Level';
import { Chapter } from '@/DesignConfig/Chapter';

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

    // 创建章节标题背景
    const chapterTitleBg = this.scene.add.rectangle(
      0,
      0,
      this.scrollAreaWidth - 40,
      40,
      0x222222,
      0.8
    );
    chapterTitleBg.setStrokeStyle(1, 0x444444, 0.8);
    this.add(chapterTitleBg);

    // 创建章节标题
    const chapterTitle = this.scene.add.text(
      0,
      0,
      `${this.chapter.name}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    chapterTitle.setOrigin(0.5, 0.5);
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
    const buttonsPerRow = 2; // 每行显示2个按钮
    const buttonSpacingX = 20; // 按钮水平间距
    const buttonSpacingY = 30; // 按钮垂直间距
    const availableWidth = this.scrollAreaWidth - (padding * 2);
    const buttonWidth = (availableWidth - buttonSpacingX) / buttonsPerRow;
    const buttonHeight = 120;

    for (let i = 0; i < chapterLevels.length; i++) {
      const level = chapterLevels[i];
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;

      // 计算按钮位置
      const startX = (this.scrollAreaWidth - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * buttonSpacingX)) / 2 - this.scrollAreaWidth / 2;
      const x = startX + col * (buttonWidth + buttonSpacingX) + buttonWidth / 2;
      const y = 70 + row * (buttonHeight + buttonSpacingY);

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

    const buttonsPerRow = 2;
    const buttonHeight = 120;
    const buttonSpacingY = 30;
    const rowCount = Math.ceil(chapterLevels.length / buttonsPerRow);
    
    // 如果没有关卡，返回基础高度
    if (chapterLevels.length === 0) {
      return 100; // 标题高度 + 提示文本高度
    }
    
    // 返回章节总高度
    return 70 + rowCount * (buttonHeight + buttonSpacingY);
  }
}
