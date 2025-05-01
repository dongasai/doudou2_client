import Phaser from 'phaser';
import { Tab } from '../Tab';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 关卡信息
 */
interface LevelInfo {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  image: string;
  unlockCondition: string;
  rewards: string[];
  enemies?: string[];
  bossName?: string;
  mapSize?: string;
  estimatedTime?: string;
}

/**
 * 关卡标签页
 * 显示游戏中的关卡信息
 */
export class LevelsTab extends Tab {
  // 关卡列表
  private levelList!: Phaser.GameObjects.Container;

  // 关卡详情
  private levelDetail!: Phaser.GameObjects.Container;

  // 关卡数据
  private levels: LevelInfo[] = [];

  // 当前选中的关卡索引
  private selectedLevelIndex: number = -1;

  // 关卡按钮
  private levelButtons: Phaser.GameObjects.Container[] = [];

  // 配置管理器
  private configManager: ConfigManager;

  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   * @param configManager 配置管理器
   */
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, configManager: ConfigManager) {
    super(scene, x, y, width, height);
    this.configManager = configManager;
  }

  // 详情组件
  private levelImage!: Phaser.GameObjects.Image;
  private levelName!: Phaser.GameObjects.Text;
  private levelDescription!: Phaser.GameObjects.Text;
  private levelDifficulty!: Phaser.GameObjects.Text;
  private levelUnlockCondition!: Phaser.GameObjects.Text;
  private levelRewards!: Phaser.GameObjects.Text;
  private levelEnemies!: Phaser.GameObjects.Text;
  private levelBoss!: Phaser.GameObjects.Text;
  private levelMapInfo!: Phaser.GameObjects.Text;

  /**
   * 初始化内容
   */
  protected init(): void {
    try {
      // 加载关卡数据
      this.loadLevelData();

      // 创建布局
      this.createLayout();

      // 创建关卡列表
      this.createLevelList();

      // 创建关卡详情
      this.createLevelDetail();

      // 默认选中第一个关卡
      if (this.levels.length > 0) {
        this.selectLevel(0);
      }

      console.log('[INFO] 关卡标签页初始化完成');
    } catch (error) {
      console.error('[ERROR] 关卡标签页初始化失败:', error);
    }
  }

  /**
   * 加载关卡数据
   */
  private loadLevelData(): void {
    try {
      // 从配置管理器中获取关卡数据
      this.levels = this.configManager.getLevelsConfig();
      console.log('[INFO] 关卡数据加载完成，共加载', this.levels.length, '个关卡');
    } catch (error) {
      console.error('[ERROR] 加载关卡数据失败:', error);

      // 加载失败时使用默认数据
      this.levels = [
        {
          id: 1,
          name: '新手村',
          description: '适合初学者的简单关卡，了解游戏基本操作和机制。敌人较弱，资源丰富，是练习的好地方。',
          difficulty: '简单',
          image: 'level_1',
          unlockCondition: '默认解锁',
          rewards: ['100金币', '经验值+50', '初级装备箱']
        }
      ];

      console.warn('[WARN] 使用默认关卡数据');
    }
  }

  /**
   * 创建布局
   */
  private createLayout(): void {
    try {
      // 创建关卡列表容器
      this.levelList = this.scene.add.container(-this.width / 2 + 150, 0);
      this.container.add(this.levelList);

      // 创建关卡详情容器
      this.levelDetail = this.scene.add.container(50, 0);
      this.container.add(this.levelDetail);

      // 创建分隔线
      const separator = this.scene.add.line(
        -this.width / 2 + 300,
        0,
        0,
        -this.height / 2,
        0,
        this.height,
        0xffffff,
        0.5
      );
      this.container.add(separator);

      console.log('[INFO] 关卡标签页布局创建完成');
    } catch (error) {
      console.error('[ERROR] 创建关卡标签页布局失败:', error);
    }
  }

  /**
   * 创建关卡列表
   */
  private createLevelList(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '关卡列表', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.levelList.add(title);

      // 创建关卡按钮
      for (let i = 0; i < this.levels.length; i++) {
        const level = this.levels[i];

        // 创建按钮容器
        const buttonContainer = this.scene.add.container(
          0,
          -this.height / 2 + 80 + i * 60
        );

        // 创建按钮背景
        const buttonBg = this.scene.add.rectangle(
          0,
          0,
          250,
          50,
          0x333333,
          0.8
        );
        buttonBg.setStrokeStyle(2, 0xffffff, 0.5);
        buttonContainer.add(buttonBg);

        // 创建按钮文本
        const buttonText = this.scene.add.text(
          0,
          0,
          `${level.id}. ${level.name}`,
          {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
          }
        );
        buttonText.setOrigin(0.5, 0.5);
        buttonContainer.add(buttonText);

        // 设置交互
        buttonBg.setInteractive();

        // 添加点击事件
        buttonBg.on('pointerdown', () => {
          this.selectLevel(i);
        });

        // 添加悬停效果
        buttonBg.on('pointerover', () => {
          buttonBg.setFillStyle(0x555555, 0.8);
        });

        buttonBg.on('pointerout', () => {
          if (this.selectedLevelIndex !== i) {
            buttonBg.setFillStyle(0x333333, 0.8);
          }
        });

        // 添加到列表
        this.levelList.add(buttonContainer);
        this.levelButtons.push(buttonContainer);
      }

      console.log('[INFO] 关卡列表创建完成');
    } catch (error) {
      console.error('[ERROR] 创建关卡列表失败:', error);
    }
  }

  /**
   * 创建关卡详情
   */
  private createLevelDetail(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '关卡详情', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.levelDetail.add(title);

      // 创建关卡图片
      this.levelImage = this.scene.add.image(0, -this.height / 2 + 120, 'level_1');
      this.levelImage.setDisplaySize(300, 150);
      this.levelDetail.add(this.levelImage);

      // 创建关卡名称
      this.levelName = this.scene.add.text(0, -this.height / 2 + 210, '', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      this.levelName.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelName);

      // 创建难度
      this.levelDifficulty = this.scene.add.text(0, -this.height / 2 + 250, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00'
      });
      this.levelDifficulty.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelDifficulty);

      // 创建描述
      this.levelDescription = this.scene.add.text(0, -this.height / 2 + 300, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: 400 }
      });
      this.levelDescription.setOrigin(0.5, 0);
      this.levelDetail.add(this.levelDescription);

      // 创建地图信息
      this.levelMapInfo = this.scene.add.text(0, -this.height / 2 + 380, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff9900'
      });
      this.levelMapInfo.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelMapInfo);

      // 创建敌人信息
      this.levelEnemies = this.scene.add.text(0, -this.height / 2 + 420, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff6666',
        wordWrap: { width: 400 }
      });
      this.levelEnemies.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelEnemies);

      // 创建BOSS信息
      this.levelBoss = this.scene.add.text(0, -this.height / 2 + 460, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff3333'
      });
      this.levelBoss.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelBoss);

      // 创建解锁条件
      this.levelUnlockCondition = this.scene.add.text(0, -this.height / 2 + 500, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ffff'
      });
      this.levelUnlockCondition.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelUnlockCondition);

      // 创建奖励
      this.levelRewards = this.scene.add.text(0, -this.height / 2 + 540, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ff00',
        wordWrap: { width: 400 }
      });
      this.levelRewards.setOrigin(0.5, 0.5);
      this.levelDetail.add(this.levelRewards);

      console.log('[INFO] 关卡详情创建完成');
    } catch (error) {
      console.error('[ERROR] 创建关卡详情失败:', error);
    }
  }

  /**
   * 选择关卡
   * @param index 关卡索引
   */
  private selectLevel(index: number): void {
    try {
      // 检查索引是否有效
      if (index < 0 || index >= this.levels.length) {
        console.warn(`[WARN] 无效的关卡索引: ${index}`);
        return;
      }

      // 如果已经选中，不做任何操作
      if (this.selectedLevelIndex === index) {
        return;
      }

      // 重置之前选中的按钮
      if (this.selectedLevelIndex !== -1) {
        const prevButton = this.levelButtons[this.selectedLevelIndex].getAt(0) as Phaser.GameObjects.Rectangle;
        prevButton.setFillStyle(0x333333, 0.8);
      }

      // 设置新选中的按钮
      const button = this.levelButtons[index].getAt(0) as Phaser.GameObjects.Rectangle;
      button.setFillStyle(0x555555, 0.8);

      // 更新选中的关卡索引
      this.selectedLevelIndex = index;

      // 更新关卡详情
      this.updateLevelDetail(this.levels[index]);

      console.log(`[INFO] 选择关卡: ${index}`);
    } catch (error) {
      console.error(`[ERROR] 选择关卡失败: ${index}`, error);
    }
  }

  /**
   * 更新关卡详情
   * @param level 关卡信息
   */
  private updateLevelDetail(level: LevelInfo): void {
    try {
      // 更新图片
      this.levelImage.setTexture(level.image);

      // 更新名称
      this.levelName.setText(`${level.id}. ${level.name}`);

      // 更新难度
      this.levelDifficulty.setText(`难度: ${level.difficulty}`);

      // 设置难度颜色
      switch (level.difficulty) {
        case '简单':
          this.levelDifficulty.setColor('#00ff00');
          break;
        case '中等':
          this.levelDifficulty.setColor('#ffff00');
          break;
        case '困难':
          this.levelDifficulty.setColor('#ff0000');
          break;
        case '噩梦':
          this.levelDifficulty.setColor('#ff00ff');
          break;
        default:
          this.levelDifficulty.setColor('#ffffff');
      }

      // 更新描述
      this.levelDescription.setText(level.description);

      // 更新地图信息
      if (level.mapSize && level.estimatedTime) {
        this.levelMapInfo.setText(`地图大小: ${level.mapSize} | 预计时间: ${level.estimatedTime}`);
      } else {
        this.levelMapInfo.setText('');
      }

      // 更新敌人信息
      if (level.enemies && level.enemies.length > 0) {
        this.levelEnemies.setText(`敌人: ${level.enemies.join(', ')}`);
      } else {
        this.levelEnemies.setText('');
      }

      // 更新BOSS信息
      if (level.bossName) {
        this.levelBoss.setText(`BOSS: ${level.bossName}`);
      } else {
        this.levelBoss.setText('');
      }

      // 更新解锁条件
      this.levelUnlockCondition.setText(`解锁条件: ${level.unlockCondition}`);

      // 更新奖励
      this.levelRewards.setText(`奖励: ${level.rewards.join(', ')}`);

      console.log(`[INFO] 更新关卡详情: ${level.name}`);
    } catch (error) {
      console.error(`[ERROR] 更新关卡详情失败: ${level.name}`, error);
    }
  }

  /**
   * 显示时的回调
   */
  protected onShow(): void {
    // 如果有选中的关卡，更新详情
    if (this.selectedLevelIndex !== -1) {
      this.updateLevelDetail(this.levels[this.selectedLevelIndex]);
    }
  }
}
