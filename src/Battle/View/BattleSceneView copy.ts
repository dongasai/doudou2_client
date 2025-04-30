/**
 * 战斗场景视图
 * 负责将战斗引擎的状态转换为可视化的游戏场景
 *
 * 屏幕适配：
 * - 目标设备：手机屏幕 (430*930)
 * - 布局策略：自适应布局，根据屏幕尺寸调整UI元素位置和大小
 */

import Phaser from 'phaser';
import { BattleEngine } from '@/Battle/Core/BattleEngine';
import { EventManager } from '@/Battle/Core/EventManager';
import { SkillEffectView } from '@/Battle/View/SkillEffectView';
import { EntityRenderer } from '@/Battle/View/EntityRenderer';
import { UIManager } from '@/Battle/View/UIManager';
import { CameraController } from '@/Battle/View/CameraController';
import { EventHandlers } from '@/Battle/View/EventHandlers';
import { TouchController } from '@/Battle/View/TouchController';
import { Vector2D } from '@/Battle/Types/Vector2D';

export class BattleSceneView {
  private scene: Phaser.Scene;
  private battleEngine: BattleEngine;
  private eventManager: EventManager;

  // 组件
  private entityRenderer: EntityRenderer;
  private uiManager: UIManager;
  private cameraController: CameraController;
  private skillEffectView: SkillEffectView;
  private eventHandlers: EventHandlers;
  private touchController: TouchController;

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param battleEngine 战斗引擎
   */
  constructor(scene: Phaser.Scene, battleEngine: BattleEngine) {
    try {
      console.log('[INFO] 初始化BattleSceneView...');
      this.scene = scene;
      this.battleEngine = battleEngine;
      this.eventManager = battleEngine.getEventManager();

      // 初始化相机控制器
      console.log('[INFO] 初始化相机控制器...');
      this.cameraController = new CameraController(scene);

      // 初始化技能效果视图
      console.log('[INFO] 初始化技能效果视图...');
      this.skillEffectView = new SkillEffectView(scene);

      // 初始化实体渲染器
      console.log('[INFO] 初始化实体渲染器...');
      this.entityRenderer = new EntityRenderer(scene, this.cameraController);

      // 初始化UI管理器
      console.log('[INFO] 初始化UI管理器...');
      this.uiManager = new UIManager(
        scene,
        () => this.battleEngine.pause(),  // 暂停回调
        () => this.battleEngine.resume()  // 继续回调
      );

      // 初始化触摸控制器
      console.log('[INFO] 初始化触摸控制器...');
      this.touchController = new TouchController(scene, battleEngine);

      // 注册UI元素到相机控制器
      console.log('[INFO] 注册UI元素到相机控制器...');
      this.cameraController.registerUIElements(this.uiManager.getAllUIElements());

      // 初始化事件处理器
      console.log('[INFO] 初始化事件处理器...');
      this.eventHandlers = new EventHandlers(
        this.entityRenderer,
        this.uiManager,
        this.cameraController,
        this.skillEffectView,
        this.eventManager,
        this.battleEngine
      );

      // 手动触发一些初始化事件，确保UI和实体正确显示
      console.log('[INFO] 触发初始化事件...');
      this.triggerInitialEvents();

      console.log('[INFO] BattleSceneView初始化完成');
    } catch (error) {
      console.error('[ERROR] BattleSceneView初始化失败:', error);
      throw error;
    }
  }

  /**
   * 触发初始化事件
   * 这个方法用于确保UI和实体正确显示
   */
  private triggerInitialEvents(): void {
    try {
      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();

      // 更新状态栏
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        this.uiManager.updateStatusBar(hero.hp, hero.maxHp, hero.mp, hero.maxMp);
      }

      // 更新波次指示器
      if (battleStats.currentWave) {
        this.uiManager.updateWaveIndicator(battleStats.currentWave.number);
      }

      // 手动创建英雄实体
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        if (hero.id) {
          this.entityRenderer.createEntity({
            id: hero.id,
            entityType: 'hero',
            position: hero.position || { x: 1500, y: 1500 },
            stats: {
              hp: hero.hp,
              maxHp: hero.maxHp
            }
          });
        }
      }

      // 手动创建水晶实体
      if (battleStats.crystalStats && battleStats.crystalStats.length > 0) {
        for (const crystal of battleStats.crystalStats) {
          if (crystal.id) {
            this.entityRenderer.createEntity({
              id: crystal.id,
              entityType: 'crystal',
              position: crystal.position || { x: 1500, y: 1500 },
              stats: {
                hp: crystal.hp,
                maxHp: crystal.maxHp
              }
            });
          }
        }
      }

      // 手动创建豆豆实体
      if (battleStats.beanStats && battleStats.beanStats.length > 0) {
        for (const bean of battleStats.beanStats) {
          if (bean.id) {
            this.entityRenderer.createEntity({
              id: bean.id,
              entityType: 'bean',
              position: bean.position || { x: 1500, y: 1500 },
              stats: {
                hp: bean.hp,
                maxHp: bean.maxHp
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('[ERROR] 触发初始化事件失败:', error);
    }
  }

  /**
   * 更新
   * @param time 当前时间
   * @param delta 时间增量
   */
  public update(time: number, delta: number): void {
    // 更新UI
    this.updateUI();

    // 更新技能冷却
    this.uiManager.updateSkillCooldowns(delta);

    // 更新触摸控制器
    this.touchController.update(time, delta);
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 更新状态栏
    if (battleStats.heroStats && battleStats.heroStats.length > 0) {
      const hero = battleStats.heroStats[0];
      this.uiManager.updateStatusBar(hero.hp, hero.maxHp, hero.mp, hero.maxMp);
    }

    // 更新波次指示器
    if (battleStats.currentWave) {
      this.uiManager.updateWaveIndicator(battleStats.currentWave.number);
    }
  }

  /**
   * 世界坐标转屏幕坐标
   * 这是一个便捷方法，直接调用相机控制器的同名方法
   * @param position 世界坐标
   * @returns 屏幕坐标
   */
  public worldToScreenPosition(position: Vector2D): Vector2D {
    return this.cameraController.worldToScreenPosition(position);
  }

  /**
   * 屏幕坐标转世界坐标
   * 这是一个便捷方法，直接调用相机控制器的同名方法
   * @param screenPos 屏幕坐标
   * @returns 世界坐标
   */
  public screenToWorldPosition(screenPos: Vector2D): Vector2D {
    return this.cameraController.screenToWorldPosition(screenPos);
  }

  /**
   * 设置相机缩放级别
   * @param zoomLevel 缩放级别
   */
  public setCameraZoom(zoomLevel: number): void {
    this.cameraController.setZoom(zoomLevel);
  }

  /**
   * 销毁
   */
  public destroy(): void {
    console.log('[INFO] 销毁BattleSceneView...');

    // 移除事件监听
    this.eventHandlers.removeAllEventListeners();

    // 销毁组件
    this.skillEffectView.clearAllEffects();
    this.uiManager.destroy();
    this.entityRenderer.clearAllEntities();
    this.touchController.destroy();

    console.log('[INFO] BattleSceneView销毁完成');
  }
}
