import Phaser from 'phaser';
import { BattleEngine } from '../Battle/Core/BattleEngine';
import { BattleState, BattleResult } from '../Battle/Core/BattleManager';
import { Entity, EntityType } from '../Battle/Entities/Entity';
import { Vector2D } from '../Battle/Types/Vector2D';
import { BattleInitParams } from '../DesignConfig/types/BattleInitParams';
import { BattleCommand } from '../DesignConfig/types/BattleCommand';
import { BattleSceneView } from '../Battle/View/BattleSceneView';

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
  }

  /**
   * 初始化场景
   * @param data 初始化数据
   */
  init(data: any): void {
    // 获取战斗参数
    this.battleParams = data.battleParams;

    // 创建战斗引擎
    this.battleEngine = new BattleEngine();

    // 初始化战斗
    if (this.battleParams) {
      this.battleEngine.initBattle(this.battleParams, data.seed);
    }
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

    // 创建战斗场景视图
    this.battleSceneView = new BattleSceneView(this, this.battleEngine);

    // 开始战斗
    this.battleEngine.startBattle();
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
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建渐变矩形
    const background = this.add.graphics();

    // 设置填充样式（从深蓝色到浅蓝色的渐变）
    const gradient = background.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(1, '#4a6a8a');

    background.fillStyle(gradient);
    background.fillRect(0, 0, width, height);

    // 添加一些随机的星星（点）
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.8 + 0.2;

      const star = this.add.circle(x, y, size, 0xffffff, alpha);
    }
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
