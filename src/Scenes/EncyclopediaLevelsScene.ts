import Phaser from 'phaser';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 百科视图场景 - 关卡页面
 */
export class EncyclopediaLevelsScene extends Phaser.Scene {
  // 返回按钮
  private backButton!: Phaser.GameObjects.Text;
  // 下一页按钮
  private nextButton!: Phaser.GameObjects.Text;
  // 配置管理器
  private configManager: ConfigManager = ConfigManager.getInstance();

  constructor() {
    super({ key: 'EncyclopediaLevelsScene' });
  }


  async create(): Promise<void> {
    try {
      console.log('[DEBUG] EncyclopediaLevelsScene.create() 开始执行');
      console.log('[DEBUG] 屏幕尺寸:', this.cameras.main.width, 'x', this.cameras.main.height);

      // 创建背景矩形，帮助我们确认UI区域
      const bg = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width - 20,
        this.cameras.main.height - 100,
        0x333333,
        0.2
      );

      // 创建标题
      this.createTitle('关卡百科');
      console.log('[DEBUG] 标题已创建');

      // 创建返回按钮
      this.createBackButton();
      console.log('[DEBUG] 返回按钮已创建');

      // 创建下一页按钮
      this.createNextButton('英雄百科', 'EncyclopediaHeroesScene');
      console.log('[DEBUG] 下一页按钮已创建');

      // 显示加载中提示
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
      console.log('[DEBUG] 加载提示已创建');

      // 确保配置管理器已初始化
      // 这里我们等待一小段时间，确保配置数据已加载
      console.log('[DEBUG] 等待配置数据加载...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[DEBUG] 等待完成');

      // 移除加载中提示
      loadingText.destroy();
      console.log('[DEBUG] 加载提示已移除');

      // 创建关卡列表
      console.log('[DEBUG] 开始创建关卡列表...');
      this.createLevelsList();
      console.log('[DEBUG] 关卡列表创建完成');
    } catch (error) {
      console.error('[ERROR] 创建场景失败:', error);

      // 显示错误提示
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

  private createLevelsList(): void {
    try {
      // 添加调试信息
      console.log('[DEBUG] 开始创建关卡列表');
      console.log('[DEBUG] 屏幕尺寸:', this.cameras.main.width, 'x', this.cameras.main.height);

      // 创建一个测试文本，确认UI可以正常显示
      const testText = this.add.text(
        this.cameras.main.width / 2,
        80,
        '关卡列表测试',
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          color: '#000000',
          stroke: '#000000',
          strokeThickness: 2
        }
      );
      testText.setOrigin(0.5, 0.5);

      // 获取配置数据
      const levels = this.configManager.getLevelsConfig();
      console.log('[DEBUG] 关卡数据:', levels);

      // 打印每个关卡的ID，帮助我们调试
      if (levels && levels.length > 0) {
        console.log('[DEBUG] 关卡ID列表:');
        levels.forEach(level => {
          console.log(`  - ${level.id}: ${level.name}`);
        });
      }

      // 获取章节配置
      const chapters = this.configManager.getChaptersConfig();
      console.log('[DEBUG] 章节数据:', chapters);

      // 打印每个章节的ID和包含的关卡，帮助我们调试
      if (chapters && chapters.length > 0) {
        console.log('[DEBUG] 章节ID列表:');
        chapters.forEach(chapter => {
          console.log(`  - ${chapter.id}: ${chapter.name}, 关卡: ${chapter.levels ? chapter.levels.join(', ') : '无'}`);
        });
      }

      // 检查是否有可用的关卡数据
      if (!levels || levels.length === 0) {
        console.warn('[WARN] 没有可用的关卡数据');

        // 即使没有关卡数据，也显示一个提示
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



        return;
      }



      console.log(`[INFO] 加载了 ${levels.length} 个关卡数据和 ${chapters.length} 个章节数据`);

      // 创建滚动区域 - 适应430*930的分辨率
      const scrollView = this.add.container(0, 0);
      console.log('[DEBUG] 创建滚动容器');

      // 计算适合屏幕的滚动区域大小
      const padding = 20; // 边距
      const scrollAreaWidth = this.cameras.main.width - (padding * 2);
      const scrollAreaHeight = this.cameras.main.height - 150; // 减去顶部的标题和按钮区域
      console.log('[DEBUG] 滚动区域大小:', scrollAreaWidth, 'x', scrollAreaHeight);

      // 创建滚动区域背景 - 使用黑色背景
      const scrollBg = this.add.rectangle(
        this.cameras.main.width / 2,
        100 + scrollAreaHeight / 2,
        scrollAreaWidth,
        scrollAreaHeight,
        0x000000, // 纯黑色背景
        0.7 // 不透明度
      );
      scrollBg.setStrokeStyle(
          2, 0xffffff, 0.5); // 白色边框
      console.log('[DEBUG] 创建滚动区域背景 0xffffff');




      // 创建章节标题和关卡按钮
      let yPosition = 120;
      console.log('[DEBUG] 开始创建章节和关卡按钮');

      // 添加章节列表标题，并使用背景增强可读性
      const titleBg = this.add.rectangle(
        this.cameras.main.width / 2,
        yPosition,
        scrollAreaWidth - 20,
        50,
        0x333333,
        0.9
      );
      titleBg.setStrokeStyle(2, 0x666666, 0.9);
      scrollView.add(titleBg);

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
      scrollView.add(chapterListTitle);
      yPosition += 80; // 增加标题与第一个章节之间的间距

      console.log('[DEBUG] 章节数量:', chapters.length);
      for (const chapter of chapters) {
        console.log('[DEBUG] 处理章节:', chapter.name);

        // 创建章节标题 - 居中显示，并添加背景以增强可读性
        const chapterTitleBg = this.add.rectangle(
          this.cameras.main.width / 2,
          yPosition,
          scrollAreaWidth - 40,
          40,
          0x222222,
          0.8
        );
        chapterTitleBg.setStrokeStyle(1, 0x444444, 0.8);
        scrollView.add(chapterTitleBg);

        const chapterTitle = this.add.text(
          this.cameras.main.width / 2,
          yPosition,
          `${chapter.name}`,
          {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
          }
        );

        chapterTitle.setOrigin(0.5, 0.5); // 居中对齐
        scrollView.add(chapterTitle);
        yPosition += 70; // 增加章节标题与关卡按钮之间的间距

        // 获取该章节的关卡
        console.log('[DEBUG] 过滤章节关卡, 章节ID:', chapter.id);
        const chapterLevels = levels.filter(level => {
          // 从level.id中提取章节ID，格式为"level-章节ID-关卡ID"
          const idParts = level.id.split('-');
          const match = idParts.length >= 3 && parseInt(idParts[1]) === chapter.id;
          console.log('[DEBUG] 关卡ID:', level.id, '匹配结果:', match);
          return match;
        });
        console.log('[DEBUG] 章节关卡数量:', chapterLevels.length);

        // 如果没有关卡，显示一个提示
        if (chapterLevels.length === 0) {
          const noLevelsText = this.add.text(
            this.cameras.main.width / 2,
            yPosition + 30,
            '该章节暂无关卡',
            {
              fontSize: '18px',
              fontFamily: 'Arial',
              color: '#cccccc', // 使用更亮的灰色，提高可读性
              fontStyle: 'italic'
            }
          );
          noLevelsText.setOrigin(0.5, 0.5);
          scrollView.add(noLevelsText);
          yPosition += 60;
        }

        // 创建关卡按钮 - 适应430*930的分辨率
        const buttonsPerRow = 2; // 每行显示2个按钮

        // 计算按钮大小，使其适应屏幕宽度
        const availableWidth = scrollAreaWidth - (padding * 2);
        const buttonSpacingX = 20; // 增加按钮水平间距
        const buttonWidth = (availableWidth - buttonSpacingX) / buttonsPerRow;

        const buttonHeight = 120; // 增加按钮高度，确保有足够空间
        const buttonSpacingY = 30; // 增加按钮垂直间距

        for (let i = 0; i < chapterLevels.length; i++) {
          const level = chapterLevels[i];
          const row = Math.floor(i / buttonsPerRow);
          const col = i % buttonsPerRow;

          // 计算按钮位置，使其在屏幕中居中，并确保有足够间距
          const startX = padding + (scrollAreaWidth - (buttonsPerRow * buttonWidth + (buttonsPerRow - 1) * buttonSpacingX)) / 2;
          const x = startX + col * (buttonWidth + buttonSpacingX);
          // 增加行间距，确保按钮之间不会重叠
          const y = yPosition + row * (buttonHeight + buttonSpacingY);

          // 创建按钮容器
          const buttonContainer = this.add.container(x, y);

          // 创建按钮背景 - 使用深灰色背景，在黑色背景上更加明显
          const buttonBg = this.add.rectangle(
            0,
            0,
            buttonWidth,
            buttonHeight,
            0x333333, // 深灰色背景，而不是纯黑色
            0.95 // 不透明度提高
          );
          buttonBg.setStrokeStyle(3, 0xffffff, 0.9); // 加粗白色边框，提高对比度
          buttonContainer.add(buttonBg);

          // 从level.id中提取关卡ID，格式为"level-章节ID-关卡ID"
          const idParts = level.id.split('-');
          const levelNumber = idParts.length >= 3 ? idParts[2] : '?';

          // 创建关卡标题 - 调整位置和大小
          const levelTitle = this.add.text(
            0,
            -buttonHeight/2 + 25, // 向下调整位置
            `关卡 ${levelNumber}`,
            {
              fontSize: '16px',
              fontFamily: 'Arial',
              color: '#ffffff',
              stroke: '#000000',
              strokeThickness: 1
            }
          );
          levelTitle.setOrigin(0.5, 0.5);
          buttonContainer.add(levelTitle);

          // 创建关卡名称 - 居中显示
          const levelName = this.add.text(
            0,
            0, // 保持在中央
            level.name,
            {
              fontSize: '18px',
              fontFamily: 'Arial',
              color: '#ffffff',
              stroke: '#000000',
              strokeThickness: 1,
              wordWrap: { width: buttonWidth - 20 } // 添加文本换行
            }
          );
          levelName.setOrigin(0.5, 0.5);
          buttonContainer.add(levelName);

          // 创建难度文本 - 调整位置
          const difficulty = typeof level.difficulty === 'string' ?
            level.difficulty :
            '未知';

          const difficultyText = this.add.text(
            0,
            buttonHeight/2 - 25, // 向上调整位置
            `难度: ${difficulty}`,
            {
              fontSize: '14px',
              fontFamily: 'Arial',
              color: '#ffff00'
            }
          );
          difficultyText.setOrigin(0.5, 0.5);
          buttonContainer.add(difficultyText);

          // 设置交互
          buttonBg.setInteractive();

          // 添加点击事件
          buttonBg.on('pointerdown', () => {
            this.showLevelDetails(level);
          });

          // 添加悬停效果 - 使用更亮的灰色
          buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x555555, 0.95); // 更亮的灰色，悬停时明显变亮
            buttonBg.setStrokeStyle(3, 0xaaaaff, 1.0); // 悬停时边框颜色变为淡蓝色，更加明显
          });

          buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x333333, 0.95); // 恢复为深灰色
            buttonBg.setStrokeStyle(3, 0xffffff, 0.9); // 恢复为白色边框
          });

          scrollView.add(buttonContainer);
        }

        // 更新Y位置，为下一章节留出空间
        const rowCount = Math.ceil(chapterLevels.length / buttonsPerRow);
        yPosition += rowCount * (buttonHeight + buttonSpacingY) + 30;
      }

      // 添加滚动功能
      this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: any, deltaY: any, _deltaZ: any) => {
        if (deltaY > 0) {
          // 向下滚动
          scrollView.y -= 20;
        } else {
          // 向上滚动
          scrollView.y += 20;
        }

        // 限制滚动范围
        scrollView.y = Phaser.Math.Clamp(scrollView.y, -(yPosition - this.cameras.main.height + 100), 0);
      });

      console.log('[INFO] 关卡列表创建完成');
    } catch (error) {
      console.error('[ERROR] 创建关卡列表失败:', error);
    }
  }

  /**
   * 显示关卡详情
   * @param level 关卡配置
   */
  private showLevelDetails(level: any): void {
    try {
      // 清除之前的详情面板
      const existingPanel = this.children.getByName('levelDetailsPanel');
      if (existingPanel) {
        existingPanel.destroy();
      }

      // 创建详情面板 - 适应430*930的分辨率
      const panel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
      panel.setName('levelDetailsPanel');

      // 创建背景 - 调整大小以适应小屏幕
      const panelWidth = Math.min(600, this.cameras.main.width - 40); // 最大宽度600，但不超过屏幕宽度减去边距
      const panelHeight = Math.min(500, this.cameras.main.height - 100); // 最大高度500，但不超过屏幕高度减去边距

      // 创建外层边框 - 添加一个稍大的矩形作为外框
      const outerBg = this.add.rectangle(
        0,
        0,
        panelWidth + 4,
        panelHeight + 4,
        0xffffff, // 白色外框
        0.3 // 半透明
      );
      panel.add(outerBg);

      // 创建内层背景
      const bg = this.add.rectangle(
        0,
        0,
        panelWidth,
        panelHeight,
        0x000000, // 纯黑色背景
        0.95 // 几乎不透明
      );
      bg.setStrokeStyle(1, 0x444444, 0.8); // 深灰色内边框
      panel.add(bg);

      // 创建关闭按钮 - 使用圆形背景
      const closeButtonBg = this.add.circle(
        bg.width / 2 - 25,
        -bg.height / 2 + 25,
        20,
        0xff3333 // 红色背景
      );
      closeButtonBg.setInteractive();
      panel.add(closeButtonBg);

      // 创建关闭按钮文本
      const closeButton = this.add.text(
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
      panel.add(closeButton);

      // 添加关闭按钮的点击事件
      closeButtonBg.on('pointerdown', () => {
        panel.destroy();
      });

      // 添加悬停效果
      closeButtonBg.on('pointerover', () => {
        closeButtonBg.setFillStyle(0xff6666); // 悬停时颜色变亮
      });

      closeButtonBg.on('pointerout', () => {
        closeButtonBg.setFillStyle(0xff3333); // 恢复原来的颜色
      });

      // 创建标题 - 减小字体大小
      const title = this.add.text(
        0,
        -panelHeight / 2 + 40, // 调整位置
        level.name,
        {
          fontSize: '24px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2
        }
      );
      title.setOrigin(0.5, 0.5);
      panel.add(title);

      // 创建描述 - 减小字体大小和调整换行宽度
      const description = this.add.text(
        0,
        -panelHeight / 2 + 80, // 调整位置
        level.description || '无描述',
        {
          fontSize: '16px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffffff',
          wordWrap: { width: panelWidth - 50 } // 调整换行宽度
        }
      );
      description.setOrigin(0.5, 0);
      panel.add(description);

      // 创建详情列表 - 调整位置和间距
      const detailsY = -panelHeight / 2 + 160; // 调整起始位置
      const detailsSpacing = 25; // 减小间距

      // 计算左侧列的X坐标
      const leftColumnX = -panelWidth / 2 + 20; // 左边距20

      // 难度
      const difficulty = typeof level.difficulty === 'string' ?
        level.difficulty :
        '未知';

      const difficultyText = this.add.text(
        leftColumnX,
        detailsY,
        `难度: ${difficulty}`,
        {
          fontSize: '16px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffff00'
        }
      );
      panel.add(difficultyText);

      // 解锁条件
      const unlockCondition = this.add.text(
        leftColumnX,
        detailsY + detailsSpacing,
        `解锁条件: ${level.unlockCondition || '未知'}`,
        {
          fontSize: '16px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      panel.add(unlockCondition);

      // 奖励
      const rewardsTitle = this.add.text(
        leftColumnX,
        detailsY + detailsSpacing * 2,
        '奖励:',
        {
          fontSize: '16px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      panel.add(rewardsTitle);

      if (level.rewards && level.rewards.length > 0) {
        // 限制显示的奖励数量，避免超出面板
        const maxRewards = Math.min(level.rewards.length, 3);
        for (let i = 0; i < maxRewards; i++) {
          const reward = this.add.text(
            leftColumnX + 20, // 缩进
            detailsY + detailsSpacing * (3 + i),
            `• ${level.rewards[i]}`,
            {
              fontSize: '14px', // 减小字体大小
              fontFamily: 'Arial',
              color: '#ffffff'
            }
          );
          panel.add(reward);
        }

        // 如果有更多奖励，显示"更多..."
        if (level.rewards.length > maxRewards) {
          const moreRewards = this.add.text(
            leftColumnX + 20,
            detailsY + detailsSpacing * (3 + maxRewards),
            `• 更多...`,
            {
              fontSize: '14px',
              fontFamily: 'Arial',
              color: '#ffffff',
              fontStyle: 'italic'
            }
          );
          panel.add(moreRewards);
        }
      } else {
        const noRewards = this.add.text(
          leftColumnX + 20, // 缩进
          detailsY + detailsSpacing * 3,
          '• 无奖励',
          {
            fontSize: '14px', // 减小字体大小
            fontFamily: 'Arial',
            color: '#ffffff'
          }
        );
        panel.add(noRewards);
      }

      // 敌人 - 计算右侧列的X坐标
      const rightColumnX = panelWidth / 4; // 右侧列位置

      const enemiesTitle = this.add.text(
        rightColumnX,
        detailsY,
        '敌人:',
        {
          fontSize: '16px', // 减小字体大小
          fontFamily: 'Arial',
          color: '#ffffff'
        }
      );
      panel.add(enemiesTitle);

      if (level.enemies && level.enemies.length > 0) {
        // 限制显示的敌人数量，避免超出面板
        const maxEnemies = Math.min(level.enemies.length, 3);
        for (let i = 0; i < maxEnemies; i++) {
          const enemy = this.add.text(
            rightColumnX + 20, // 缩进
            detailsY + detailsSpacing * (1 + i),
            `• ${level.enemies[i]}`,
            {
              fontSize: '14px', // 减小字体大小
              fontFamily: 'Arial',
              color: '#ffffff'
            }
          );
          panel.add(enemy);
        }

        // 如果有更多敌人，显示"更多..."
        if (level.enemies.length > maxEnemies) {
          const moreEnemies = this.add.text(
            rightColumnX + 20,
            detailsY + detailsSpacing * (1 + maxEnemies),
            `• 更多...`,
            {
              fontSize: '14px',
              fontFamily: 'Arial',
              color: '#ffffff',
              fontStyle: 'italic'
            }
          );
          panel.add(moreEnemies);
        }
      } else {
        const noEnemies = this.add.text(
          rightColumnX + 20, // 缩进
          detailsY + detailsSpacing,
          '• 未知敌人',
          {
            fontSize: '14px', // 减小字体大小
            fontFamily: 'Arial',
            color: '#ffffff'
          }
        );
        panel.add(noEnemies);
      }

      // BOSS
      if (level.bossName) {
        // 计算BOSS文本的Y位置
        const bossY = detailsY + detailsSpacing * (level.enemies && level.enemies.length > 0 ?
          Math.min(level.enemies.length, 3) + 2 : 3);

        const boss = this.add.text(
          rightColumnX,
          bossY,
          `BOSS: ${level.bossName}`,
          {
            fontSize: '16px', // 减小字体大小
            fontFamily: 'Arial',
            color: '#ff6666'
          }
        );
        panel.add(boss);
      }

      console.log(`[INFO] 显示关卡详情: ${level.name}`);
    } catch (error) {
      console.error(`[ERROR] 显示关卡详情失败:`, error);
    }
  }
}