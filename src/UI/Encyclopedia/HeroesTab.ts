import Phaser from 'phaser';
import { Tab } from '../Tab';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 英雄信息
 */
interface HeroInfo {
  id: number;
  name: string;
  description: string;
  type: string;
  image: string;
  stats: {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: {
    name: string;
    description: string;
    cooldown: number;
  }[];
  unlockCondition: string;
}

/**
 * 英雄标签页
 * 显示游戏中的英雄信息
 */
export class HeroesTab extends Tab {
  // 英雄列表
  private heroList!: Phaser.GameObjects.Container;

  // 英雄详情
  private heroDetail!: Phaser.GameObjects.Container;

  // 英雄数据
  private heroes: HeroInfo[] = [];

  // 当前选中的英雄索引
  private selectedHeroIndex: number = -1;

  // 英雄按钮
  private heroButtons: Phaser.GameObjects.Container[] = [];

  // 配置管理器
  private configManager: ConfigManager;

  // 详情组件
  private heroImage!: Phaser.GameObjects.Image;
  private heroName!: Phaser.GameObjects.Text;
  private heroDescription!: Phaser.GameObjects.Text;
  private heroType!: Phaser.GameObjects.Text;
  private heroStats!: Phaser.GameObjects.Text;
  private heroSkills!: Phaser.GameObjects.Text;
  private heroUnlockCondition!: Phaser.GameObjects.Text;

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

  /**
   * 初始化内容
   */
  protected init(): void {
    try {
      // 加载英雄数据
      this.loadHeroData();

      // 创建布局
      this.createLayout();

      // 创建英雄列表
      this.createHeroList();

      // 创建英雄详情
      this.createHeroDetail();

      // 默认选中第一个英雄
      if (this.heroes.length > 0) {
        this.selectHero(0);
      }

      console.log('[INFO] 英雄标签页初始化完成');
    } catch (error) {
      console.error('[ERROR] 英雄标签页初始化失败:', error);
    }
  }

  /**
   * 加载英雄数据
   */
  private loadHeroData(): void {
    try {
      // 从配置管理器中获取英雄数据
      this.heroes = this.configManager.getHeroesConfig();
      console.log('[INFO] 英雄数据加载完成，共加载', this.heroes.length, '个英雄');
    } catch (error) {
      console.error('[ERROR] 加载英雄数据失败:', error);

      // 加载失败时使用默认数据
      this.heroes = [
        {
          id: 1,
          name: '法师',
          description: '强大的魔法使用者，擅长远程攻击和控制技能。',
          type: '魔法',
          image: 'hero_wizard',
          stats: {
            hp: 800,
            mp: 1000,
            attack: 50,
            defense: 30,
            speed: 40
          },
          skills: [
            {
              name: '火球术',
              description: '向敌人发射一个火球，造成魔法伤害',
              cooldown: 3
            }
          ],
          unlockCondition: '默认解锁'
        }
      ];

      console.warn('[WARN] 使用默认英雄数据');
    }
  }

  /**
   * 创建布局
   */
  private createLayout(): void {
    try {
      // 创建英雄列表容器
      this.heroList = this.scene.add.container(-this.width / 2 + 150, 0);
      this.container.add(this.heroList);

      // 创建英雄详情容器
      this.heroDetail = this.scene.add.container(50, 0);
      this.container.add(this.heroDetail);

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

      console.log('[INFO] 英雄标签页布局创建完成');
    } catch (error) {
      console.error('[ERROR] 创建英雄标签页布局失败:', error);
    }
  }

  /**
   * 创建英雄列表
   */
  private createHeroList(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '英雄列表', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.heroList.add(title);

      // 创建英雄按钮
      for (let i = 0; i < this.heroes.length; i++) {
        const hero = this.heroes[i];

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
          `${hero.name}`,
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
          this.selectHero(i);
        });

        // 添加悬停效果
        buttonBg.on('pointerover', () => {
          buttonBg.setFillStyle(0x555555, 0.8);
        });

        buttonBg.on('pointerout', () => {
          if (this.selectedHeroIndex !== i) {
            buttonBg.setFillStyle(0x333333, 0.8);
          }
        });

        // 添加到列表
        this.heroList.add(buttonContainer);
        this.heroButtons.push(buttonContainer);
      }

      console.log('[INFO] 英雄列表创建完成');
    } catch (error) {
      console.error('[ERROR] 创建英雄列表失败:', error);
    }
  }

  /**
   * 创建英雄详情
   */
  private createHeroDetail(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '英雄详情', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.heroDetail.add(title);

      // 创建英雄图片
      this.heroImage = this.scene.add.image(0, -this.height / 2 + 120, 'hero_wizard');
      this.heroImage.setDisplaySize(150, 150);
      this.heroDetail.add(this.heroImage);

      // 创建英雄名称
      this.heroName = this.scene.add.text(0, -this.height / 2 + 210, '', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      this.heroName.setOrigin(0.5, 0.5);
      this.heroDetail.add(this.heroName);

      // 创建英雄类型
      this.heroType = this.scene.add.text(0, -this.height / 2 + 240, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00'
      });
      this.heroType.setOrigin(0.5, 0.5);
      this.heroDetail.add(this.heroType);

      // 创建英雄描述
      this.heroDescription = this.scene.add.text(0, -this.height / 2 + 280, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: 400 }
      });
      this.heroDescription.setOrigin(0.5, 0);
      this.heroDetail.add(this.heroDescription);

      // 创建英雄属性
      this.heroStats = this.scene.add.text(0, -this.height / 2 + 350, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ffff',
        align: 'center'
      });
      this.heroStats.setOrigin(0.5, 0);
      this.heroDetail.add(this.heroStats);

      // 创建英雄技能
      this.heroSkills = this.scene.add.text(0, -this.height / 2 + 450, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ff00',
        wordWrap: { width: 400 }
      });
      this.heroSkills.setOrigin(0.5, 0);
      this.heroDetail.add(this.heroSkills);

      // 创建解锁条件
      this.heroUnlockCondition = this.scene.add.text(0, this.height / 2 - 50, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff9900'
      });
      this.heroUnlockCondition.setOrigin(0.5, 0.5);
      this.heroDetail.add(this.heroUnlockCondition);

      console.log('[INFO] 英雄详情创建完成');
    } catch (error) {
      console.error('[ERROR] 创建英雄详情失败:', error);
    }
  }

  /**
   * 选择英雄
   * @param index 英雄索引
   */
  private selectHero(index: number): void {
    try {
      // 检查索引是否有效
      if (index < 0 || index >= this.heroes.length) {
        console.warn(`[WARN] 无效的英雄索引: ${index}`);
        return;
      }

      // 如果已经选中，不做任何操作
      if (this.selectedHeroIndex === index) {
        return;
      }

      // 重置之前选中的按钮
      if (this.selectedHeroIndex !== -1) {
        const prevButton = this.heroButtons[this.selectedHeroIndex].getAt(0) as Phaser.GameObjects.Rectangle;
        prevButton.setFillStyle(0x333333, 0.8);
      }

      // 设置新选中的按钮
      const button = this.heroButtons[index].getAt(0) as Phaser.GameObjects.Rectangle;
      button.setFillStyle(0x555555, 0.8);

      // 更新选中的英雄索引
      this.selectedHeroIndex = index;

      // 更新英雄详情
      this.updateHeroDetail(this.heroes[index]);

      console.log(`[INFO] 选择英雄: ${index}`);
    } catch (error) {
      console.error(`[ERROR] 选择英雄失败: ${index}`, error);
    }
  }

  /**
   * 更新英雄详情
   * @param hero 英雄信息
   */
  private updateHeroDetail(hero: HeroInfo): void {
    try {
      // 更新图片
      this.heroImage.setTexture(hero.image);

      // 更新名称
      this.heroName.setText(hero.name);

      // 更新类型
      this.heroType.setText(`类型: ${hero.type}`);

      // 设置类型颜色
      switch (hero.type) {
        case '魔法':
          this.heroType.setColor('#9966ff');
          break;
        case '物理':
          this.heroType.setColor('#ff6600');
          break;
        default:
          this.heroType.setColor('#ffffff');
      }

      // 更新描述
      this.heroDescription.setText(hero.description);

      // 更新属性
      this.heroStats.setText(
        `生命值: ${hero.stats.hp}\n` +
        `魔法值: ${hero.stats.mp}\n` +
        `攻击力: ${hero.stats.attack}\n` +
        `防御力: ${hero.stats.defense}\n` +
        `速度: ${hero.stats.speed}`
      );

      // 更新技能
      let skillsText = '技能:\n';
      for (const skill of hero.skills) {
        skillsText += `${skill.name} (冷却: ${skill.cooldown}秒): ${skill.description}\n\n`;
      }
      this.heroSkills.setText(skillsText);

      // 更新解锁条件
      this.heroUnlockCondition.setText(`解锁条件: ${hero.unlockCondition}`);

      console.log(`[INFO] 更新英雄详情: ${hero.name}`);
    } catch (error) {
      console.error(`[ERROR] 更新英雄详情失败: ${hero.name}`, error);
    }
  }

  /**
   * 显示时的回调
   */
  protected onShow(): void {
    // 如果有选中的英雄，更新详情
    if (this.selectedHeroIndex !== -1) {
      this.updateHeroDetail(this.heroes[this.selectedHeroIndex]);
    }
  }
}
