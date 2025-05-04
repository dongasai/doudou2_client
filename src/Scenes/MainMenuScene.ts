import Phaser from 'phaser';
import { gameState } from '@/main';
import { BattleParamsService } from '@/services/BattleParamsService';

/**
 * 主菜单场景
 * 游戏的入口场景，提供开始游戏、设置等选项
 */
export class MainMenuScene extends Phaser.Scene {
  // UI元素
  private title!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private quickStartButton!: Phaser.GameObjects.Text;
  private encyclopediaButton!: Phaser.GameObjects.Text;
  private settingsButton!: Phaser.GameObjects.Text;
  private creditsButton!: Phaser.GameObjects.Text;

  /**
   * 构造函数
   */
  constructor() {
    super({ key: 'MainMenuScene' });
    console.log('主菜单场景创建成功');
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

    // 创建按钮
    this.createButtons();
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

    // 设置颜色（从深绿色到浅绿色的渐变）
    const topColor = 0x0a3a1a;
    const bottomColor = 0x3a7a4a;

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

    // 添加一些装饰性的豆豆图案
    const emojis = ['🟢', '🟤', '🔴', '🟠', '🟡'];
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const scale = 0.5 + Math.random() * 1.5;
      const alpha = 0.3 + Math.random() * 0.4;

      const text = this.add.text(x, y, emoji, {
        fontSize: `${24 * scale}px`,
        color: '#ffffff'
      });
      text.setAlpha(alpha);
      text.setOrigin(0.5);

      // 添加简单的动画
      this.tweens.add({
        targets: text,
        y: y + 50,
        alpha: alpha - 0.2,
        duration: 2000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * 创建标题
   */
  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;

    // 创建游戏标题
    this.title = this.add.text(centerX, 150, '豆豆防御战', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000',
        blur: 5,
        stroke: true,
        fill: true
      }
    });
    this.title.setOrigin(0.5);

    // 添加标题动画
    this.tweens.add({
      targets: this.title,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加副标题
    const subtitle = this.add.text(centerX, 220, '保卫水晶，击退豆豆！', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    subtitle.setOrigin(0.5);
  }

  /**
   * 创建按钮
   */
  private createButtons(): void {
    const centerX = this.cameras.main.width / 2;
    const buttonStyle = {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#4a6a8a',
      padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 10
      },
      fixedWidth: 250,
      align: 'center'
    };

    // 开始游戏按钮
    this.startButton = this.add.text(centerX, 350, '开始游戏 ▶️', buttonStyle);
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    this.startButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      this.startButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的颜色
        this.startButton.clearTint();

        // 处理点击事件
        this.onStartButtonClick();
      });
    });

    // 快速开始按钮（第一关，1号英雄）
    this.quickStartButton = this.add.text(centerX, 420, '快速开始 ⚡', {
      ...buttonStyle,
      backgroundColor: '#4a7a4a', // 绿色背景，区别于其他按钮
    });
    this.quickStartButton.setOrigin(0.5);
    this.quickStartButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    this.quickStartButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      this.quickStartButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的颜色
        this.quickStartButton.clearTint();

        // 处理点击事件
        this.onQuickStartButtonClick();
      });
    });

    // 百科按钮
    this.encyclopediaButton = this.add.text(centerX, 490, '游戏百科 📚', {
      ...buttonStyle,
      backgroundColor: '#4a5a9a', // 蓝色背景，区别于其他按钮
    });
    this.encyclopediaButton.setOrigin(0.5);
    this.encyclopediaButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    this.encyclopediaButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      this.encyclopediaButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的颜色
        this.encyclopediaButton.clearTint();

        // 处理点击事件
        this.onEncyclopediaButtonClick();
      });
    });

    // 设置按钮
    this.settingsButton = this.add.text(centerX, 560, '设置 ⚙️', buttonStyle);
    this.settingsButton.setOrigin(0.5);
    this.settingsButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    this.settingsButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      this.settingsButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的颜色
        this.settingsButton.clearTint();

        // 处理点击事件
        this.onSettingsButtonClick();
      });
    });

    // 制作人员按钮
    this.creditsButton = this.add.text(centerX, 630, '制作人员 👥', buttonStyle);
    this.creditsButton.setOrigin(0.5);
    this.creditsButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    this.creditsButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      this.creditsButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的颜色
        this.creditsButton.clearTint();

        // 处理点击事件
        this.onCreditsButtonClick();
      });
    });

    // 添加版本信息
    const versionText = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'v1.0.0',
      {
        fontSize: '16px',
        color: '#ffffff',
        align: 'right'
      }
    );
    versionText.setOrigin(1, 1);
  }

  /**
   * 开始游戏按钮点击事件
   */
  private onStartButtonClick(): void {
    // 重置游戏状态
    gameState.resetState();

    // 切换到关卡选择场景
    this.scene.start('LevelSelectScene');
  }

  /**
   * 百科按钮点击事件
   */
  private onEncyclopediaButtonClick(): void {
    console.log('[INFO] 点击百科按钮');
    // 切换到百科选择场景
    this.scene.start('EncyclopediaSelectScene');
  }

  /**
   * 快速开始按钮点击事件（直接选择第一关和1号英雄）
   */
  private async onQuickStartButtonClick(): Promise<void> {
    // 显示加载提示
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '加载中...',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    loadingText.setOrigin(0.5);

    try {
      // 重置游戏状态
      gameState.resetState();

      // 设置选中的关卡ID（第一关）
      gameState.selectedLevel = { id: 'level-1-1' };

      // 设置选中的英雄（1号英雄）
      gameState.selectedHeroes = [1];

      // 准备战斗参数
      const battleParams = await BattleParamsService.prepareBattleParams();

      // 切换到战斗场景
      this.scene.start('BattleScene', {
        battleParams: battleParams,
        seed: Date.now() // 使用当前时间作为随机种子
      });
    } catch (error) {
      console.error('快速开始失败:', error);

      // 显示错误提示
      loadingText.setText('加载失败，请重试');

      // 3秒后隐藏错误提示
      this.time.delayedCall(3000, () => {
        loadingText.destroy();
      });
    }
  }



  /**
   * 设置按钮点击事件
   */
  private onSettingsButtonClick(): void {
    // 显示设置面板（这里简单实现，实际可能需要一个单独的设置场景）
    const settingsPanel = this.createSettingsPanel();

    // 添加关闭按钮
    const closeButton = this.add.text(
      settingsPanel.x + settingsPanel.width - 20,
      settingsPanel.y + 20,
      '✖',
      {
        fontSize: '24px',
        color: '#ffffff'
      }
    );
    closeButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    closeButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      closeButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(100, () => {
        // 销毁面板和控件
        settingsPanel.destroy();
        closeButton.destroy();
        // 销毁所有设置控件
        this.settingsControls.forEach(control => control.destroy());
        this.settingsControls = [];
      });
    });
  }

  // 设置控件数组
  private settingsControls: Phaser.GameObjects.GameObject[] = [];

  /**
   * 创建设置面板
   */
  private createSettingsPanel(): Phaser.GameObjects.Rectangle {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const panelWidth = 300;
    const panelHeight = 400;

    // 创建面板背景
    const panel = this.add.rectangle(
      centerX,
      centerY,
      panelWidth,
      panelHeight,
      0x000000,
      0.8
    );
    panel.setStrokeStyle(2, 0xffffff);

    // 创建标题
    const title = this.add.text(
      centerX,
      centerY - panelHeight / 2 + 30,
      '游戏设置',
      {
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      }
    );
    title.setOrigin(0.5);
    this.settingsControls.push(title);

    // 创建音效设置
    const soundLabel = this.add.text(
      centerX - panelWidth / 2 + 30,
      centerY - 80,
      '音效音量',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    this.settingsControls.push(soundLabel);

    // 创建音乐设置
    const musicLabel = this.add.text(
      centerX - panelWidth / 2 + 30,
      centerY - 20,
      '音乐音量',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    this.settingsControls.push(musicLabel);

    // 创建振动设置
    const vibrationLabel = this.add.text(
      centerX - panelWidth / 2 + 30,
      centerY + 40,
      '振动效果',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    this.settingsControls.push(vibrationLabel);

    // 创建自动技能设置
    const autoSkillLabel = this.add.text(
      centerX - panelWidth / 2 + 30,
      centerY + 100,
      '自动技能',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    );
    this.settingsControls.push(autoSkillLabel);

    // 保存按钮
    const saveButton = this.add.text(
      centerX,
      centerY + panelHeight / 2 - 40,
      '保存设置',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#4a6a8a',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    saveButton.setOrigin(0.5);
    saveButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    saveButton.on('pointerdown', () => {
      // 点击时改变背景色，提供视觉反馈
      saveButton.setStyle({ backgroundColor: '#5a7a9a' });

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(150, () => {
        // 恢复原来的背景色
        saveButton.setStyle({ backgroundColor: '#4a6a8a' });

        // 保存设置
        gameState.saveState();

        // 关闭设置面板
        panel.destroy();
        this.settingsControls.forEach(control => control.destroy());
        this.settingsControls = [];
      });
    });
    this.settingsControls.push(saveButton);

    return panel;
  }

  /**
   * 制作人员按钮点击事件
   */
  private onCreditsButtonClick(): void {
    // 显示制作人员信息（简单实现）
    const creditsPanel = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      300,
      400,
      0x000000,
      0.8
    );
    creditsPanel.setStrokeStyle(2, 0xffffff);

    // 添加标题
    const title = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 150,
      '制作人员',
      {
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      }
    );
    title.setOrigin(0.5);

    // 添加制作人员信息
    const credits = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      '游戏设计: 豆豆团队\n\n程序开发: 豆豆工程师\n\n美术设计: Emoji提供\n\n音效设计: 豆豆音效师',
      {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    );
    credits.setOrigin(0.5);

    // 添加关闭按钮
    const closeButton = this.add.text(
      creditsPanel.x + 130,
      creditsPanel.y - 180,
      '✖',
      {
        fontSize: '24px',
        color: '#ffffff'
      }
    );
    closeButton.setInteractive({ useHandCursor: true });

    // 为触摸设备优化的点击效果
    closeButton.on('pointerdown', () => {
      // 点击时添加黄色高亮效果
      closeButton.setTint(0xffff00);

      // 短暂延迟后执行操作，让用户看到按钮状态变化
      this.time.delayedCall(100, () => {
        // 销毁面板和控件
        creditsPanel.destroy();
        title.destroy();
        credits.destroy();
        closeButton.destroy();
      });
    });
  }
}
