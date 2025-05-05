import Phaser from 'phaser';
import { BattleState } from '@/Battle/Core/BattleManager';
import { BattleInitParams } from '@/DesignConfig/BattleInitParams';
import { BattleSceneView } from '@/Battle/View/BattleSceneView';
import { battleEngine, BattleEngine } from '@/Battle/Core/BattleEngine';

/**
 * 战斗场景
 * 负责战斗的视觉展示、动画效果和用户输入处理
 */
export class BattleScene extends Phaser.Scene {
  // 战斗引擎
  private battleEngine: BattleEngine;

  // 战斗场景视图
  private battleSceneView: BattleSceneView;

  // 战斗参数
  private battleParams: BattleInitParams | null = null;

  /**
   * 构造函数
   */
  constructor() {
    super({ key: 'BattleScene' });
    console.log('战斗场景创建成功');
  }

  /**
   * 初始化场景
   * @param data 初始化数据
   */
  init(data: any): void {
    console.log('战斗场景初始化，数据:', data);

    // 获取战斗参数
    this.battleParams = data.battleParams;
    console.log('战斗参数:', this.battleParams);

    // 使用已导出的战斗引擎单例
    try {
      this.battleEngine = battleEngine;
      console.log('获取战斗引擎单例成功:', this.battleEngine);

      // 测试事件管理器
      const eventManager = this.battleEngine.getEventManager();
      console.log('事件管理器:', eventManager);

      // 初始化战斗
      if (this.battleParams) {
        this.battleEngine.initBattle(this.battleParams, data.seed);
        console.log('战斗初始化完成');
      } else {
        console.warn('没有战斗参数，无法初始化战斗');
        throw new Error('没有战斗参数，无法初始化战斗');
      }
    } catch (error) {
      console.error('战斗引擎初始化失败:', error);
      // 向上抛出错误，确保场景不会在没有正确初始化的情况下继续
      throw error;
    }
  }

  /**
   * 预加载资源
   */
  preload(): void {
    try {
      console.log('[INFO] 开始预加载资源...');

      // 显示加载进度
      this.createLoadingBar();

      // 创建白色粒子纹理
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('particle', 8, 8);
      graphics.destroy();



      console.log('[INFO] 预加载资源完成');
    } catch (error) {
      console.error('[ERROR] 预加载资源失败:', error);
    }
  }

  /**
   * 创建加载进度条
   */
  private createLoadingBar(): void {
    try {
      // 获取屏幕尺寸
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // 创建背景
      const progressBarBg = this.add.rectangle(
        width / 2,
        height / 2,
        width * 0.7,
        30,
        0x222222
      );
      progressBarBg.setOrigin(0.5);

      // 创建进度条
      const progressBar = this.add.rectangle(
        width / 2 - (width * 0.7) / 2,
        height / 2,
        0,
        20,
        0x00ff00
      );
      progressBar.setOrigin(0, 0.5);

      // 创建文本
      const progressText = this.add.text(
        width / 2,
        height / 2 + 50,
        '加载中... 0%',
        {
          fontSize: '24px',
          color: '#ffffff'
        }
      );
      progressText.setOrigin(0.5);

      // 监听加载进度
      this.load.on('progress', (value: number) => {
        // 更新进度条
        progressBar.width = (width * 0.7) * value;
        // 更新文本
        progressText.setText(`加载中... ${Math.floor(value * 100)}%`);
      });

      // 监听加载完成
      this.load.on('complete', () => {
        // 移除进度条
        progressBarBg.destroy();
        progressBar.destroy();
        progressText.destroy();
      });
    } catch (error) {
      console.error('[ERROR] 创建加载进度条失败:', error);
    }
  }

  /**
   * 创建场景
   */
  create(): void {
    console.log('创建战斗场景');

    try {
      // 设置战斗场景的帧率为30fps，平衡性能和流畅度
      this.game.loop.targetFps = 30;
      console.log('[INFO] 战斗场景帧率设置为30fps');

      // 创建背景
      this.createBackground();
      console.log('背景创建成功');

      // 创建战斗场景视图
      console.log('开始创建战斗场景视图，战斗引擎:', this.battleEngine);
      this.battleSceneView = new BattleSceneView(this, this.battleEngine);
      console.log('战斗场景视图创建成功:', this.battleSceneView);

      // 开始战斗
      this.battleEngine.startBattle();
      console.log('战斗开始');
    } catch (error) {
      console.error('创建战斗场景失败:', error);
    }
  }

  /**
   * 更新场景
   * @param time 当前时间
   * @param delta 时间增量
   */
  update(time: number, delta: number): void {
    // 更新战斗场景视图
    this.battleSceneView.update(time, delta);

    // 检查战斗状态
    this.checkBattleState();
  }

  /**
   * 创建背景
   */
  private createBackground(): void {
    try {
      console.log('[INFO] 开始创建背景...');

      // 获取相机尺寸
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // 创建纯黑色背景
      const background = this.add.graphics();
      background.fillStyle(0x000000, 1); // 纯黑色背景
      background.fillRect(0, 0, width, height);

      // 设置背景深度为最低，确保它在所有其他元素之下
      background.setDepth(-1000);

      // 将背景固定到相机，使其不随相机移动
      background.setScrollFactor(0);

      console.log('[INFO] 背景创建完成');
    } catch (error) {
      console.error('[ERROR] 创建背景失败:', error);
    }
  }

  /**
   * 检查战斗状态
   */
  private checkBattleState(): void {
    try {
      // 获取战斗状态
      const battleState = this.battleEngine.getState();

      // 检查战斗是否结束
      if (battleState === BattleState.COMPLETED) {
        console.log('[INFO] 战斗已结束，处理结果...');

        // 获取战斗结果
        const battleResult = this.battleEngine.getResult();

        // 显示结果
        this.showBattleResult(battleResult);

        // 保存进度
        this.saveBattleProgress(battleResult);

        // 3秒后返回主菜单
        this.time.delayedCall(3000, () => {
          console.log('[INFO] 战斗结束，返回主菜单');
          this.scene.start('MainMenuScene', {
            fromBattle: true,
            battleResult: battleResult
          });
        });
      }
    } catch (error) {
      console.error('[ERROR] 检查战斗状态失败:', error);
    }
  }

  /**
   * 显示战斗结果
   * @param result 战斗结果
   */
  private showBattleResult(result: any): void {
    try {
      console.log('[INFO] 显示战斗结果:', result);

      // 创建结果文本
      const resultText = result.victory ? '胜利！' : '失败！';
      const style = {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: result.victory ? '#00ff00' : '#ff0000',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          stroke: true,
          fill: true
        }
      };

      // 在屏幕中央显示结果
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const text = this.add.text(width / 2, height / 2, resultText, style);
      text.setOrigin(0.5);
      text.setDepth(1000); // 确保显示在最上层
      text.setScrollFactor(0); // 固定到相机

      // 添加动画效果
      this.tweens.add({
        targets: text,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 2
      });
    } catch (error) {
      console.error('[ERROR] 显示战斗结果失败:', error);
    }
  }

  /**
   * 保存战斗进度
   * @param result 战斗结果
   */
  private saveBattleProgress(result: any): void {
    try {
      console.log('[INFO] 保存战斗进度:', result);

      // 获取战斗统计数据
      const battleStats = this.battleEngine.getBattleStats();

      // 这里可以添加保存进度的逻辑
      // 例如，将结果和统计数据保存到本地存储或发送到服务器

      // 示例：保存到本地存储
      const saveData = {
        result: result,
        stats: battleStats,
        timestamp: Date.now()
      };

      localStorage.setItem('lastBattleResult', JSON.stringify(saveData));
      console.log('[INFO] 战斗进度已保存到本地存储');
    } catch (error) {
      console.error('[ERROR] 保存战斗进度失败:', error);
    }
  }
}
