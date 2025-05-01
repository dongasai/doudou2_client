import Phaser from 'phaser';
import { BattleState } from '@/Battle/Core/BattleManager';
import { BattleInitParams } from '@/DesignConfig/types/BattleInitParams';
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
    // 创建白色粒子纹理
    // const graphics = this.add.graphics();
    // graphics.fillStyle(0xffffff);
    // graphics.fillCircle(4, 4, 4);
    // graphics.generateTexture('white', 8, 8);
    // graphics.destroy();

    console.log('预加载资源完成');
  }

  /**
   * 创建场景
   */
  create(): void {
    console.log('创建战斗场景');

    try {
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
    // 创建渐变背景
    // const width = this.cameras.main.width;
    // const height = this.cameras.main.height;

    // // 创建渐变矩形 - 使用多个矩形模拟渐变效果
    // const background = this.add.graphics();

    // // 设置颜色（从深蓝色到浅蓝色的渐变）
    // const topColor = 0x1a2a3a;
    // const bottomColor = 0x4a6a8a;

    // // 创建多个矩形来模拟渐变
    // const steps = 20;
    // for (let i = 0; i < steps; i++) {
    //   const ratio = i / steps;
    //   const color = Phaser.Display.Color.Interpolate.ColorWithColor(
    //     Phaser.Display.Color.ValueToColor(topColor),
    //     Phaser.Display.Color.ValueToColor(bottomColor),
    //     steps,
    //     i
    //   );

    //   background.fillStyle(color.color, 1);
    //   background.fillRect(0, height * (i / steps), width, height / steps + 1);
    // }

    // // 添加一些随机的星星（点）
    // for (let i = 0; i < 100; i++) {
    //   const x = Math.random() * width;
    //   const y = Math.random() * height;
    //   const size = Math.random() * 2 + 1;
    //   const alpha = Math.random() * 0.8 + 0.2;

    //   const star = this.add.circle(x, y, size, 0xffffff, alpha);
    // }
  }

  /**
   * 检查战斗状态
   */
  private checkBattleState(): void {
    // 获取战斗状态
    const battleState = this.battleEngine.getState();

    // 检查战斗是否结束
    if (battleState === BattleState.COMPLETED) {
      // 战斗已结束，BattleSceneView 会处理结果显示
    }
  }
}
