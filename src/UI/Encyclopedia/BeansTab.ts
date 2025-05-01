import Phaser from 'phaser';
import { Tab } from '../Tab';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 豆豆信息
 */
interface BeanInfo {
  id: number;
  name: string;
  description: string;
  type: string;
  image: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  abilities: string[];
  drops: string[];
  firstAppearLevel: string;
}

/**
 * 豆豆标签页
 * 显示游戏中的豆豆信息
 */
export class BeansTab extends Tab {
  // 豆豆列表
  private beanList!: Phaser.GameObjects.Container;

  // 豆豆详情
  private beanDetail!: Phaser.GameObjects.Container;

  // 豆豆数据
  private beans: BeanInfo[] = [];

  // 当前选中的豆豆索引
  private selectedBeanIndex: number = -1;

  // 豆豆按钮
  private beanButtons: Phaser.GameObjects.Container[] = [];

  // 配置管理器
  private configManager: ConfigManager;

  // 详情组件
  private beanImage!: Phaser.GameObjects.Image;
  private beanName!: Phaser.GameObjects.Text;
  private beanDescription!: Phaser.GameObjects.Text;
  private beanType!: Phaser.GameObjects.Text;
  private beanStats!: Phaser.GameObjects.Text;
  private beanAbilities!: Phaser.GameObjects.Text;
  private beanDrops!: Phaser.GameObjects.Text;
  private beanFirstAppear!: Phaser.GameObjects.Text;

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
      // 加载豆豆数据
      this.loadBeanData();

      // 创建布局
      this.createLayout();

      // 创建豆豆列表
      this.createBeanList();

      // 创建豆豆详情
      this.createBeanDetail();

      // 默认选中第一个豆豆
      if (this.beans.length > 0) {
        this.selectBean(0);
      }

      console.log('[INFO] 豆豆标签页初始化完成');
    } catch (error) {
      console.error('[ERROR] 豆豆标签页初始化失败:', error);
    }
  }

  /**
   * 加载豆豆数据
   */
  private loadBeanData(): void {
    try {
      // 从配置管理器中获取豆豆数据
      this.beans = this.configManager.getBeansConfig();
      console.log('[INFO] 豆豆数据加载完成，共加载', this.beans.length, '个豆豆');
    } catch (error) {
      console.error('[ERROR] 加载豆豆数据失败:', error);

      // 加载失败时使用默认数据
      this.beans = [
        {
          id: 1,
          name: '普通豆豆',
          description: '最常见的豆豆类型，没有特殊能力，但数量众多。',
          type: '普通',
          image: 'bean_normal',
          stats: {
            hp: 50,
            attack: 10,
            defense: 5,
            speed: 30
          },
          abilities: ['基础攻击'],
          drops: ['小型能量核心', '豆豆碎片'],
          firstAppearLevel: '新手村'
        }
      ];

      console.warn('[WARN] 使用默认豆豆数据');
    }
  }

  /**
   * 创建布局
   */
  private createLayout(): void {
    try {
      // 创建豆豆列表容器
      this.beanList = this.scene.add.container(-this.width / 2 + 150, 0);
      this.container.add(this.beanList);

      // 创建豆豆详情容器
      this.beanDetail = this.scene.add.container(50, 0);
      this.container.add(this.beanDetail);

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

      console.log('[INFO] 豆豆标签页布局创建完成');
    } catch (error) {
      console.error('[ERROR] 创建豆豆标签页布局失败:', error);
    }
  }

  /**
   * 创建豆豆列表
   */
  private createBeanList(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '豆豆列表', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.beanList.add(title);

      // 创建豆豆按钮
      for (let i = 0; i < this.beans.length; i++) {
        const bean = this.beans[i];

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
          `${bean.name}`,
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
          this.selectBean(i);
        });

        // 添加悬停效果
        buttonBg.on('pointerover', () => {
          buttonBg.setFillStyle(0x555555, 0.8);
        });

        buttonBg.on('pointerout', () => {
          if (this.selectedBeanIndex !== i) {
            buttonBg.setFillStyle(0x333333, 0.8);
          }
        });

        // 添加到列表
        this.beanList.add(buttonContainer);
        this.beanButtons.push(buttonContainer);
      }

      console.log('[INFO] 豆豆列表创建完成');
    } catch (error) {
      console.error('[ERROR] 创建豆豆列表失败:', error);
    }
  }

  /**
   * 创建豆豆详情
   */
  private createBeanDetail(): void {
    try {
      // 创建标题
      const title = this.scene.add.text(0, -this.height / 2 + 30, '豆豆详情', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      title.setOrigin(0.5, 0.5);
      this.beanDetail.add(title);

      // 创建豆豆图片
      this.beanImage = this.scene.add.image(0, -this.height / 2 + 120, 'bean_normal');
      this.beanImage.setDisplaySize(150, 150);
      this.beanDetail.add(this.beanImage);

      // 创建豆豆名称
      this.beanName = this.scene.add.text(0, -this.height / 2 + 210, '', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      });
      this.beanName.setOrigin(0.5, 0.5);
      this.beanDetail.add(this.beanName);

      // 创建豆豆类型
      this.beanType = this.scene.add.text(0, -this.height / 2 + 240, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00'
      });
      this.beanType.setOrigin(0.5, 0.5);
      this.beanDetail.add(this.beanType);

      // 创建豆豆描述
      this.beanDescription = this.scene.add.text(0, -this.height / 2 + 280, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: 400 }
      });
      this.beanDescription.setOrigin(0.5, 0);
      this.beanDetail.add(this.beanDescription);

      // 创建豆豆属性
      this.beanStats = this.scene.add.text(0, -this.height / 2 + 350, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ffff',
        align: 'center'
      });
      this.beanStats.setOrigin(0.5, 0);
      this.beanDetail.add(this.beanStats);

      // 创建豆豆能力
      this.beanAbilities = this.scene.add.text(0, -this.height / 2 + 450, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#00ff00'
      });
      this.beanAbilities.setOrigin(0.5, 0.5);
      this.beanDetail.add(this.beanAbilities);

      // 创建豆豆掉落物
      this.beanDrops = this.scene.add.text(0, -this.height / 2 + 490, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff9900'
      });
      this.beanDrops.setOrigin(0.5, 0.5);
      this.beanDetail.add(this.beanDrops);

      // 创建首次出现关卡
      this.beanFirstAppear = this.scene.add.text(0, -this.height / 2 + 530, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ff6666'
      });
      this.beanFirstAppear.setOrigin(0.5, 0.5);
      this.beanDetail.add(this.beanFirstAppear);

      console.log('[INFO] 豆豆详情创建完成');
    } catch (error) {
      console.error('[ERROR] 创建豆豆详情失败:', error);
    }
  }

  /**
   * 选择豆豆
   * @param index 豆豆索引
   */
  private selectBean(index: number): void {
    try {
      // 检查索引是否有效
      if (index < 0 || index >= this.beans.length) {
        console.warn(`[WARN] 无效的豆豆索引: ${index}`);
        return;
      }

      // 如果已经选中，不做任何操作
      if (this.selectedBeanIndex === index) {
        return;
      }

      // 重置之前选中的按钮
      if (this.selectedBeanIndex !== -1) {
        const prevButton = this.beanButtons[this.selectedBeanIndex].getAt(0) as Phaser.GameObjects.Rectangle;
        prevButton.setFillStyle(0x333333, 0.8);
      }

      // 设置新选中的按钮
      const button = this.beanButtons[index].getAt(0) as Phaser.GameObjects.Rectangle;
      button.setFillStyle(0x555555, 0.8);

      // 更新选中的豆豆索引
      this.selectedBeanIndex = index;

      // 更新豆豆详情
      this.updateBeanDetail(this.beans[index]);

      console.log(`[INFO] 选择豆豆: ${index}`);
    } catch (error) {
      console.error(`[ERROR] 选择豆豆失败: ${index}`, error);
    }
  }

  /**
   * 更新豆豆详情
   * @param bean 豆豆信息
   */
  private updateBeanDetail(bean: BeanInfo): void {
    try {
      // 更新图片
      this.beanImage.setTexture(bean.image);

      // 更新名称
      this.beanName.setText(bean.name);

      // 更新类型
      this.beanType.setText(`类型: ${bean.type}`);

      // 设置类型颜色
      switch (bean.type) {
        case '普通':
          this.beanType.setColor('#ffffff');
          break;
        case '火系':
          this.beanType.setColor('#ff6600');
          break;
        case '冰系':
          this.beanType.setColor('#00ccff');
          break;
        case '毒系':
          this.beanType.setColor('#00ff00');
          break;
        default:
          this.beanType.setColor('#ffffff');
      }

      // 更新描述
      this.beanDescription.setText(bean.description);

      // 更新属性
      this.beanStats.setText(
        `生命值: ${bean.stats.hp}\n` +
        `攻击力: ${bean.stats.attack}\n` +
        `防御力: ${bean.stats.defense}\n` +
        `速度: ${bean.stats.speed}`
      );

      // 更新能力
      this.beanAbilities.setText(`能力: ${bean.abilities.join(', ')}`);

      // 更新掉落物
      this.beanDrops.setText(`掉落物: ${bean.drops.join(', ')}`);

      // 更新首次出现关卡
      this.beanFirstAppear.setText(`首次出现: ${bean.firstAppearLevel}`);

      console.log(`[INFO] 更新豆豆详情: ${bean.name}`);
    } catch (error) {
      console.error(`[ERROR] 更新豆豆详情失败: ${bean.name}`, error);
    }
  }

  /**
   * 显示时的回调
   */
  protected onShow(): void {
    // 如果有选中的豆豆，更新详情
    if (this.selectedBeanIndex !== -1) {
      this.updateBeanDetail(this.beans[this.selectedBeanIndex]);
    }
  }
}
