import Phaser from 'phaser';
import { TabManager } from '@/UI/TabManager';
import { LevelsTab } from '@/UI/Encyclopedia/LevelsTab';
import { HeroesTab } from '@/UI/Encyclopedia/HeroesTab';
import { BeansTab } from '@/UI/Encyclopedia/BeansTab';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 百科视图场景
 * 提供关卡、英雄、豆豆的详细信息
 */
export class EncyclopediaScene extends Phaser.Scene {
  // 标签页管理器
  private tabManager!: TabManager;

  // 标签页内容
  private levelsTab!: LevelsTab;
  private heroesTab!: HeroesTab;
  private beansTab!: BeansTab;

  // 返回按钮
  private backButton!: Phaser.GameObjects.Text;

  // 配置管理器
  private configManager: ConfigManager;

  /**
   * 构造函数
   */
  constructor() {
    super({ key: 'EncyclopediaScene' });
    console.log('[INFO] 百科视图场景构造函数调用');
  }

  /**
   * 预加载资源
   */
  preload(): void {
    try {
      console.log('[INFO] 百科视图场景预加载资源');

      // 加载标签页图标
      this.load.image('tab_levels', 'assets/images/ui/tab_levels.png');
      this.load.image('tab_heroes', 'assets/images/ui/tab_heroes.png');
      this.load.image('tab_beans', 'assets/images/ui/tab_beans.png');

      // 加载英雄图标
      this.load.image('hero_wizard', 'assets/images/heroes/wizard.png');
      this.load.image('hero_warrior', 'assets/images/heroes/warrior.png');
      this.load.image('hero_archer', 'assets/images/heroes/archer.png');

      // 加载豆豆图标
      this.load.image('bean_normal', 'assets/images/beans/normal.png');
      this.load.image('bean_fire', 'assets/images/beans/fire.png');
      this.load.image('bean_ice', 'assets/images/beans/ice.png');
      this.load.image('bean_poison', 'assets/images/beans/poison.png');

      // 加载关卡缩略图
      this.load.image('level_1', 'assets/images/levels/level_1.png');
      this.load.image('level_2', 'assets/images/levels/level_2.png');
      this.load.image('level_3', 'assets/images/levels/level_3.png');
      this.load.image('level_4', 'assets/images/levels/level_4.png');
      this.load.image('level_5', 'assets/images/levels/level_5.png');

      console.log('[INFO] 百科视图场景预加载资源完成');
    } catch (error) {
      console.error('[ERROR] 百科视图场景预加载资源失败:', error);
    }
  }

  /**
   * 创建场景
   */
  create(): void {
    try {
      console.log('[INFO] 创建百科视图场景');

      // 初始化配置管理器
      this.configManager = ConfigManager.getInstance();
      console.log('[INFO] 配置管理器初始化完成');

      // 创建背景
      this.createBackground();

      // 创建标题
      this.createTitle();

      // 创建标签页管理器
      this.createTabManager();

      // 创建返回按钮
      this.createBackButton();

      console.log('[INFO] 百科视图场景创建完成');
    } catch (error) {
      console.error('[ERROR] 创建百科视图场景失败:', error);
    }
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    try {
      // 获取屏幕尺寸
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // 创建渐变背景
      const background = this.add.graphics();

      // 设置颜色（从深蓝色到浅蓝色的渐变）
      const topColor = 0x1a2a3a;
      const bottomColor = 0x4a6a8a;

      // 创建多个矩形来模拟渐变
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(topColor),
          Phaser.Display.Color.ValueToColor(bottomColor),
          steps,
          i
        );

        background.fillStyle(color.color, 1);
        background.fillRect(0, height * (i / steps), width, height / steps + 1);
      }

      // 添加一些随机的星星（点）
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        const alpha = Math.random() * 0.8 + 0.2;

        const star = this.add.circle(x, y, size, 0xffffff, alpha);
      }

      console.log('[INFO] 背景创建完成');
    } catch (error) {
      console.error('[ERROR] 创建背景失败:', error);
    }
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    try {
      // 获取屏幕宽度
      const width = this.cameras.main.width;

      // 创建标题文本
      const title = this.add.text(width / 2, 50, '豆豆大百科', {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          stroke: true,
          fill: true
        }
      });

      // 设置标题位置
      title.setOrigin(0.5, 0.5);

      console.log('[INFO] 标题创建完成');
    } catch (error) {
      console.error('[ERROR] 创建标题失败:', error);
    }
  }

  /**
   * 创建标签页管理器
   */
  private createTabManager(): void {
    try {
      // 获取屏幕尺寸
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // 创建标签页管理器
      this.tabManager = new TabManager(this, width / 2, 120, width * 0.9, height - 200);

      // 创建标签页内容
      this.levelsTab = new LevelsTab(this, width / 2, 120 + 40, width * 0.9, height - 200 - 40, this.configManager);
      this.heroesTab = new HeroesTab(this, width / 2, 120 + 40, width * 0.9, height - 200 - 40, this.configManager);
      this.beansTab = new BeansTab(this, width / 2, 120 + 40, width * 0.9, height - 200 - 40, this.configManager);

      // 添加标签页
      this.tabManager.addTab('关卡', this.levelsTab);
      this.tabManager.addTab('英雄', this.heroesTab);
      this.tabManager.addTab('豆豆', this.beansTab);

      // 默认选中第一个标签页
      this.tabManager.selectTab(0);

      console.log('[INFO] 标签页管理器创建完成');
    } catch (error) {
      console.error('[ERROR] 创建标签页管理器失败:', error);
    }
  }

  /**
   * 创建返回按钮
   */
  private createBackButton(): void {
    try {
      // 创建返回按钮
      this.backButton = this.add.text(50, 50, '返回', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      });

      // 设置交互
      this.backButton.setInteractive();

      // 添加点击事件
      this.backButton.on('pointerdown', () => {
        console.log('[INFO] 点击返回按钮');
        this.scene.start('MainMenuScene');
      });

      // 添加悬停效果
      this.backButton.on('pointerover', () => {
        this.backButton.setStyle({ color: '#ffff00' });
      });

      this.backButton.on('pointerout', () => {
        this.backButton.setStyle({ color: '#ffffff' });
      });

      console.log('[INFO] 返回按钮创建完成');
    } catch (error) {
      console.error('[ERROR] 创建返回按钮失败:', error);
    }
  }

  /**
   * 更新场景
   * @param time 当前时间
   * @param delta 时间增量
   */
  update(time: number, delta: number): void {
    // 更新标签页内容
    if (this.tabManager) {
      this.tabManager.update(time, delta);
    }
  }
}
