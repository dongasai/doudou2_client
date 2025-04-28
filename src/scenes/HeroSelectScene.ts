import Phaser from 'phaser';
import { gameState } from '@/main';
import { BattleInitParams } from '@/DesignConfig/types/BattleInitParams';

/**
 * 英雄选择场景
 * 玩家可以在此选择要使用的英雄
 */
export class HeroSelectScene extends Phaser.Scene {
  // 英雄按钮组
  private heroButtons: Phaser.GameObjects.Container;

  // 返回按钮
  private backButton: Phaser.GameObjects.Text;

  // 开始战斗按钮
  private startButton: Phaser.GameObjects.Text;

  // 英雄数据
  private heroes = [
    {
      id: 1,
      name: '烈焰法师',
      emoji: '🔥',
      type: 'mage',
      description: '擅长火系魔法攻击，可以对敌人造成持续伤害',
      stats: {
        hp: 800,
        attack: 50,
        defense: 40,
        magicAttack: 120,
        magicDefense: 60,
        speed: 50
      },
      skills: [
        { id: 1, name: '火球术', description: '发射火球造成伤害' },
        { id: 2, name: '烈焰风暴', description: '召唤火焰风暴持续伤害' }
      ]
    },
    {
      id: 2,
      name: '坚盾战士',
      emoji: '🛡️',
      type: 'warrior',
      description: '高防御力的前排坦克，可以吸收大量伤害',
      stats: {
        hp: 1200,
        attack: 80,
        defense: 100,
        magicAttack: 20,
        magicDefense: 80,
        speed: 40
      },
      skills: [
        { id: 3, name: '盾击', description: '用盾牌击退敌人' },
        { id: 4, name: '防御姿态', description: '提高自身防御力' }
      ]
    },
    {
      id: 3,
      name: '迅捷射手',
      emoji: '🏹',
      type: 'archer',
      description: '远程物理攻击，攻速快，可以快速消灭单体目标',
      stats: {
        hp: 700,
        attack: 100,
        defense: 30,
        magicAttack: 30,
        magicDefense: 40,
        speed: 90
      },
      skills: [
        { id: 5, name: '快速射击', description: '连续射出多支箭' },
        { id: 6, name: '穿透箭', description: '射出可穿透多个敌人的箭' }
      ]
    }
  ];

  // 已选择的英雄
  private selectedHeroes: number[] = [];

  // 最大可选英雄数
  private maxHeroCount: number = 3;

  /**
   * 构造函数
   */
  constructor() {
    super({ key: 'HeroSelectScene' });
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

    // 创建英雄按钮
    this.createHeroButtons();

    // 创建返回按钮
    this.createBackButton();

    // 创建开始战斗按钮
    this.createStartButton();

    // 默认选中第一个英雄
    this.selectFirstAvailableHero();
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

    // 设置颜色（从深紫色到浅紫色的渐变）
    const topColor = 0x2a1a3a;
    const bottomColor = 0x5a4a7a;

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

    // 添加一些装饰性的粒子
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 2;

      const particle = this.add.circle(x, y, size, 0xffaa00, 0.6);

      // 添加简单的浮动动画
      this.tweens.add({
        targets: particle,
        y: y - 100 - Math.random() * 100,
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 2000,
        onComplete: () => {
          particle.y = y;
          particle.alpha = 0.6;
        }
      });
    }
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;

    // 创建场景标题
    const title = this.add.text(centerX, 80, '选择英雄', {
      fontSize: '40px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 添加副标题
    const subtitle = this.add.text(centerX, 130, `选择 ${this.maxHeroCount} 名英雄进入战斗`, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    subtitle.setOrigin(0.5);

    // 添加已选择计数
    const countText = this.add.text(centerX, 160, `已选择: 0/${this.maxHeroCount}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff00'
    });
    countText.setOrigin(0.5);
    countText.setName('countText');
  }

  /**
   * 创建英雄按钮
   */
  private createHeroButtons(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 220;

    // 根据屏幕高度调整按钮高度和间距
    const screenHeight = this.cameras.main.height;
    const availableHeight = screenHeight - startY - 100; // 减去顶部和底部的空间
    const totalHeroes = this.heroes.length;

    // 计算合适的按钮高度和间距
    const buttonHeight = Math.min(150, (availableHeight / totalHeroes) * 0.8);
    const buttonSpacing = Math.min(20, (availableHeight / totalHeroes) * 0.2);

    // 创建容器
    this.heroButtons = this.add.container(0, 0);

    // 为每个英雄创建按钮
    this.heroes.forEach((hero, index) => {
      const y = startY + index * (buttonHeight + buttonSpacing);

      // 计算按钮宽度（根据屏幕宽度调整）
      const buttonWidth = Math.min(350, this.cameras.main.width * 0.9);

      // 计算文本大小比例（根据按钮高度）
      const textSizeRatio = buttonHeight / 150; // 150是原始按钮高度

      // 创建按钮背景
      const buttonBackground = this.add.rectangle(
        centerX,
        y,
        buttonWidth,
        buttonHeight,
        0x4a4a7a,
        0.8
      );
      buttonBackground.setStrokeStyle(Math.max(1, Math.floor(2 * textSizeRatio)), 0xffffff);

      // 存储英雄背景引用
      this.heroBgRects.set(hero.id, buttonBackground);

      // 检查英雄是否已解锁
      const isUnlocked = gameState.player.unlockedHeroes.includes(hero.id);

      // 计算垂直偏移量
      const topOffset = buttonHeight * 0.27; // 顶部偏移
      const middleOffset = buttonHeight * 0.07; // 中间偏移
      const bottomOffset = buttonHeight * 0.13; // 底部偏移

      // 创建英雄图标
      const heroIcon = this.add.text(
        centerX - buttonHeight * 0.93,
        y,
        hero.emoji,
        {
          fontSize: `${Math.floor(48 * textSizeRatio)}px`
        }
      );
      heroIcon.setOrigin(0.5);

      // 创建英雄名称
      const nameText = this.add.text(
        centerX - buttonHeight * 0.33,
        y - topOffset,
        hero.name,
        {
          fontSize: `${Math.floor(24 * textSizeRatio)}px`,
          color: isUnlocked ? '#ffffff' : '#888888',
          fontFamily: 'Arial, sans-serif'
        }
      );
      nameText.setOrigin(0, 0.5);

      // 创建英雄类型
      const typeText = this.add.text(
        centerX - buttonHeight * 0.33,
        y - middleOffset,
        `类型: ${this.getHeroTypeText(hero.type)}`,
        {
          fontSize: `${Math.floor(16 * textSizeRatio)}px`,
          color: isUnlocked ? '#dddddd' : '#888888',
          fontFamily: 'Arial, sans-serif'
        }
      );
      typeText.setOrigin(0, 0.5);

      // 创建英雄描述
      const descText = this.add.text(
        centerX - buttonHeight * 0.33,
        y + bottomOffset,
        hero.description,
        {
          fontSize: `${Math.floor(14 * textSizeRatio)}px`,
          color: isUnlocked ? '#bbbbbb' : '#888888',
          fontFamily: 'Arial, sans-serif',
          wordWrap: { width: Math.min(200, buttonHeight * 1.33) }
        }
      );
      descText.setOrigin(0, 0.5);

      // 创建一个数组来存储所有要添加到容器的元素
      const elementsToAdd = [buttonBackground, heroIcon, nameText, typeText, descText];

      // 如果英雄未解锁，添加锁定图标
      if (!isUnlocked) {
        const lockIcon = this.add.text(
          centerX + buttonHeight * 0.93,
          y,
          '🔒',
          {
            fontSize: `${Math.floor(32 * textSizeRatio)}px`
          }
        );
        lockIcon.setOrigin(0.5);
        elementsToAdd.push(lockIcon);
      } else {
        // 如果英雄已解锁，添加选择按钮
        const selectButton = this.add.text(
          centerX + buttonHeight * 0.93,
          y,
          this.selectedHeroes.includes(hero.id) ? '✓' : '选择',
          {
            fontSize: `${Math.floor(20 * textSizeRatio)}px`,
            color: '#ffffff',
            backgroundColor: this.selectedHeroes.includes(hero.id) ? '#00aa00' : '#5a5a9a',
            padding: {
              left: Math.floor(10 * textSizeRatio),
              right: Math.floor(10 * textSizeRatio),
              top: Math.floor(5 * textSizeRatio),
              bottom: Math.floor(5 * textSizeRatio)
            }
          }
        );
        selectButton.setOrigin(0.5);
        selectButton.setInteractive({ useHandCursor: true });
        selectButton.on('pointerdown', () => this.onHeroButtonClick(hero.id));

        // 存储选择按钮引用
        this.selectButtons.set(hero.id, selectButton);

        // 添加到要添加的元素数组中
        elementsToAdd.push(selectButton);
      }

      // 将所有元素一次性添加到容器
      this.heroButtons.add(elementsToAdd);
    });
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
        backgroundColor: '#4a4a7a',
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
   * 创建开始战斗按钮
   */
  private createStartButton(): void {
    const centerX = this.cameras.main.width / 2;
    const bottomY = this.cameras.main.height - 80;

    this.startButton = this.add.text(
      centerX,
      bottomY,
      '开始战斗 ▶',
      {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: this.selectedHeroes.length > 0 ? '#4a7a4a' : '#777777',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    this.startButton.setOrigin(0.5);

    // 只有选择了英雄才能点击
    if (this.selectedHeroes.length > 0) {
      this.startButton.setInteractive({ useHandCursor: true });
      this.startButton.on('pointerdown', this.onStartButtonClick, this);
    }
  }

  // 存储选择按钮引用
  private selectButtons: Map<number, Phaser.GameObjects.Text> = new Map();

  // 存储英雄背景引用
  private heroBgRects: Map<number, Phaser.GameObjects.Rectangle> = new Map();

  /**
   * 英雄按钮点击事件
   * @param heroId 英雄ID
   */
  private onHeroButtonClick(heroId: number): void {
    // 检查是否已选择该英雄
    const index = this.selectedHeroes.indexOf(heroId);

    if (index === -1) {
      // 如果未选择且未达到最大数量，则添加
      if (this.selectedHeroes.length < this.maxHeroCount) {
        this.selectedHeroes.push(heroId);
      } else {
        // 已达到最大数量，显示提示
        this.showToast(`最多只能选择 ${this.maxHeroCount} 名英雄`);
        return;
      }
    } else {
      // 如果已选择，则移除
      this.selectedHeroes.splice(index, 1);
    }

    // 更新选择按钮
    const selectButton = this.selectButtons.get(heroId);
    if (selectButton) {
      selectButton.setText(this.selectedHeroes.includes(heroId) ? '✓' : '选择');
      selectButton.setBackgroundColor(this.selectedHeroes.includes(heroId) ? '#00aa00' : '#5a5a9a');
    }

    // 更新英雄背景
    const heroBg = this.heroBgRects.get(heroId);
    if (heroBg) {
      heroBg.setStrokeStyle(2, this.selectedHeroes.includes(heroId) ? 0xffff00 : 0xffffff);
    }

    // 更新计数文本
    const countText = this.children.getByName('countText') as Phaser.GameObjects.Text;
    if (countText) {
      countText.setText(`已选择: ${this.selectedHeroes.length}/${this.maxHeroCount}`);
    }

    // 更新开始按钮
    this.updateStartButton();

    console.log(`英雄 ${heroId} 选择状态变更，当前选择: ${this.selectedHeroes.join(', ')}`);
  }

  /**
   * 返回按钮点击事件
   */
  private onBackButtonClick(): void {
    // 返回关卡选择场景
    this.scene.start('LevelSelectScene');
  }

  /**
   * 开始战斗按钮点击事件
   */
  private onStartButtonClick(): void {
    if (this.selectedHeroes.length === 0) {
      this.showToast('请至少选择一名英雄');
      return;
    }

    // 保存选中的英雄
    gameState.selectedHeroes = this.selectedHeroes;

    // 准备战斗参数
    const battleParams: BattleInitParams = this.prepareBattleParams();

    // 切换到战斗场景
    this.scene.start('BattleScene', {
      battleParams: battleParams,
      seed: Date.now() // 使用当前时间作为随机种子
    });
  }

  /**
   * 准备战斗参数
   */
  private prepareBattleParams(): BattleInitParams {
    // 获取选中的关卡
    const level = gameState.selectedLevel;

    // 创建玩家数组
    const players = this.selectedHeroes.map((heroId, index) => {
      const hero = this.heroes.find(h => h.id === heroId);
      if (!hero) {
        throw new Error(`找不到英雄: ${heroId}`);
      }

      return {
        id: `player${index + 1}`,
        name: `玩家${index + 1}`,
        hero: {
          id: heroId,
          stats: {
            hp: hero.stats.hp,
            mp: hero.stats.magicAttack || 100, // 使用魔法攻击作为MP，或默认值
            attack: hero.stats.attack,
            defense: hero.stats.defense,
            magicAttack: hero.stats.magicAttack || 0,
            magicDefense: hero.stats.magicDefense || 0,
            speed: hero.stats.speed || 50, // 添加速度属性
            level: 1,
            exp: 0,
            gold: 0,
            equippedItems: [],
            learnedSkills: hero.skills.map(s => s.id)
          },
          position: index + 1 // 位置从1开始
        }
      };
    });

    // 创建战斗参数
    return {
      crystal: {
        id: 1,
        name: '水晶',
        stats: {
          hp: level.crystal.maxHp,
          mp: 0,
          attack: 0,
          defense: 100,
          magicAttack: 0,
          magicDefense: 100,
          speed: 0,
          currentHP: level.crystal.maxHp,
          maxHP: level.crystal.maxHp
        },
        status: 'normal',
        positionIndex: 0,
        defenseBonus: 0
      },
      players: players,
      level: {
        chapter: 1,
        stage: parseInt(level.id.split('-')[2])
      }
    };
  }

  /**
   * 更新开始按钮
   */
  private updateStartButton(): void {
    // 移除现有按钮
    if (this.startButton) {
      this.startButton.destroy();
    }

    // 重新创建按钮
    this.createStartButton();
  }

  /**
   * 显示提示消息
   * @param message 消息内容
   */
  private showToast(message: string): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建提示背景
    const toastBg = this.add.rectangle(
      centerX,
      centerY,
      300,
      80,
      0x000000,
      0.8
    );
    toastBg.setStrokeStyle(2, 0xffffff);

    // 创建提示文本
    const toastText = this.add.text(
      centerX,
      centerY,
      message,
      {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center'
      }
    );
    toastText.setOrigin(0.5);

    // 添加淡出动画
    this.tweens.add({
      targets: [toastBg, toastText],
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => {
        toastBg.destroy();
        toastText.destroy();
      }
    });
  }

  /**
   * 获取英雄类型文本
   * @param type 英雄类型
   */
  private getHeroTypeText(type: string): string {
    switch (type) {
      case 'mage':
        return '法师';
      case 'warrior':
        return '战士';
      case 'archer':
        return '射手';
      default:
        return type;
    }
  }

  /**
   * 默认选中第一个可用英雄
   */
  private selectFirstAvailableHero(): void {
    // 查找第一个已解锁的英雄
    const firstUnlockedHero = this.heroes.find(hero =>
      gameState.player.unlockedHeroes.includes(hero.id)
    );

    // 如果找到已解锁的英雄，则选中它
    if (firstUnlockedHero) {
      // 调用英雄选择方法
      this.onHeroButtonClick(firstUnlockedHero.id);

      console.log(`默认选中英雄: ${firstUnlockedHero.name}`);
    }
  }
}
