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

      // 设置相机初始位置
      console.log('[INFO] 设置相机初始位置...');
      this.cameraController.focusOnPosition({ x: 1500, y: 1500 }, 0);

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

      // 确保UI元素创建完成后再注册
      // 增加延迟时间，确保UI元素完全创建
      this.scene.time.delayedCall(500, () => {
        const uiElements = this.uiManager.getAllUIElements();
        console.log('[INFO] 获取到', uiElements.length, '个UI元素');
        this.cameraController.registerUIElements(uiElements);
        console.log('[INFO] UI元素注册完成');

        // 强制更新一次UI，确保显示正确
        this.updateUI();

        // 添加调试信息，显示UI元素的位置和可见性
        console.log('[DEBUG] 状态栏:',
          this.uiManager.getStatusBar().x,
          this.uiManager.getStatusBar().y,
          this.uiManager.getStatusBar().visible,
          this.uiManager.getStatusBar().depth
        );
      });

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
      console.log('[INFO] 开始触发初始化事件...');

      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();
      console.log('[INFO] 获取战斗状态:', battleStats);

      // 更新状态栏
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        this.uiManager.updateStatusBar(hero.hp, hero.maxHp, hero.mp, hero.maxMp);
        console.log('[INFO] 更新状态栏:', hero);
      }

      // 更新波次指示器
      if (battleStats.currentWave) {
        this.uiManager.updateWaveIndicator(battleStats.currentWave.number);
        console.log('[INFO] 更新波次指示器:', battleStats.currentWave.number);
      }

      // 手动创建英雄实体
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        for (const hero of battleStats.heroStats) {
          if (hero.id) {
            console.log('[INFO] 手动创建英雄实体:', hero.id);
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
      } else {
        // 如果没有英雄数据，创建一个默认英雄
        console.log('[INFO] 创建默认英雄实体');
        this.entityRenderer.createEntity({
          id: 'hero_1',
          entityType: 'hero',
          position: { x: 1500, y: 1500 },
          stats: {
            hp: 100,
            maxHp: 100
          }
        });
      }

      // 手动创建水晶实体
      if (battleStats.crystalStats && battleStats.crystalStats.length > 0) {
        for (const crystal of battleStats.crystalStats) {
          if (crystal.id) {
            console.log('[INFO] 手动创建水晶实体:', crystal.id);
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
      } else {
        // 如果没有水晶数据，创建一个默认水晶
        console.log('[INFO] 创建默认水晶实体');
        this.entityRenderer.createEntity({
          id: 'crystal_1',
          entityType: 'crystal',
          position: { x: 1500, y: 1500 },
          stats: {
            hp: 1000,
            maxHp: 1000
          }
        });
      }

      // 手动创建豆豆实体
      if (battleStats.beanStats && battleStats.beanStats.length > 0) {
        for (const bean of battleStats.beanStats) {
          if (bean.id) {
            console.log('[INFO] 手动创建豆豆实体:', bean.id);
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
      } else {
        // 如果没有豆豆数据，创建一些默认豆豆
        console.log('[INFO] 创建默认豆豆实体');
        for (let i = 1; i <= 5; i++) {
          this.entityRenderer.createEntity({
            id: `bean_${i}`,
            entityType: 'bean',
            position: {
              x: 1500 + Math.random() * 300 - 150,
              y: 1500 + Math.random() * 300 - 150
            },
            stats: {
              hp: 50,
              maxHp: 50
            }
          });
        }
      }

      console.log('[INFO] 初始化事件触发完成');
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
    // 更新实体位置和状态
    this.updateEntities();

    // 更新UI
    this.updateUI();

    // 更新技能冷却
    this.uiManager.updateSkillCooldowns(delta);

    // 更新触摸控制器
    this.touchController.update(time, delta);
  }

  /**
   * 更新实体
   * 这个方法与原始代码中的updateEntities方法类似，确保实体正确显示
   */
  private updateEntities(): void {
    try {
      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();

      // 更新英雄
      if (battleStats.heroStats) {
        for (const hero of battleStats.heroStats) {
          const sprite = this.entityRenderer.getEntitySprite(hero.id);
          if (sprite) {
            // 更新位置
            this.entityRenderer.updateEntityPosition(hero.id, hero.position, false);

            // 更新生命值条
            this.entityRenderer.updateHealthBar(hero.id, hero.hp, hero.maxHp);

            // 聚焦摄像机到英雄
            this.cameraController.focusOnPosition(hero.position);
          } else if (hero.id) {
            // 如果英雄精灵不存在但有英雄状态，检查是否已经尝试创建过
            console.log('[INFO] 英雄状态存在但精灵不存在，尝试创建:', hero.id);

            // 使用延迟创建，避免在同一帧多次尝试创建
            if (!this.pendingCreations.has(hero.id)) {
              this.pendingCreations.add(hero.id);

              // 延迟100ms创建，避免重复创建
              this.scene.time.delayedCall(100, () => {
                // 再次检查是否已经创建
                if (!this.entityRenderer.hasEntity(hero.id)) {
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
                this.pendingCreations.delete(hero.id);
              });
            }
          }
        }
      }

      // 更新水晶
      if (battleStats.crystalStats) {
        // 检查水晶状态是否有效
        const validHp = battleStats.crystalStats.hp !== undefined && !isNaN(battleStats.crystalStats.hp);
        const validMaxHp = battleStats.crystalStats.maxHp !== undefined && !isNaN(battleStats.crystalStats.maxHp);

        // 如果水晶状态无效，使用默认值
        const hp = validHp ? battleStats.crystalStats.hp : 1000;
        const maxHp = validMaxHp ? battleStats.crystalStats.maxHp : 1000;

        const sprite = this.entityRenderer.getEntitySprite('crystal_1');
        if (sprite) {
          // 更新生命值条
          this.entityRenderer.updateHealthBar('crystal_1', hp, maxHp);
        } else {
          // 如果水晶精灵不存在但有水晶状态，尝试创建
          console.log('[INFO] 水晶状态存在但精灵不存在，尝试创建');

          this.entityRenderer.createEntity({
            id: 'crystal_1',
            entityType: 'crystal',
            position: { x: 1500, y: 1500 },
            stats: {
              hp: hp,
              maxHp: maxHp
            }
          });
        }
      }

      // 更新豆豆
      if (battleStats.beanStats && battleStats.beanStats.length > 0) {
        for (const bean of battleStats.beanStats) {
          if (bean.id) {
            const sprite = this.entityRenderer.getEntitySprite(bean.id);
            if (sprite) {
              // 更新位置
              this.entityRenderer.updateEntityPosition(bean.id, bean.position, false);

              // 更新生命值条
              this.entityRenderer.updateHealthBar(bean.id, bean.hp, bean.maxHp);
            } else {
              // 如果豆豆精灵不存在但有豆豆状态，尝试创建
              console.log('[INFO] 豆豆状态存在但精灵不存在，尝试创建:', bean.id);

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
      }
    } catch (error) {
      console.error('[ERROR] 更新实体失败:', error);
    }
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    try {
      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();

      // 更新状态栏
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        this.uiManager.updateStatusBar(hero.hp, hero.maxHp, hero.mp, hero.maxMp);
      } else {
        // 使用默认值更新状态栏
        this.uiManager.updateStatusBar(100, 100, 100, 100);
      }

      // 更新波次指示器
      if (battleStats.currentWave) {
        this.uiManager.updateWaveIndicator(battleStats.currentWave.number);
      } else {
        // 使用默认值更新波次指示器
        this.uiManager.updateWaveIndicator(1);
      }
    } catch (error) {
      console.error('[ERROR] 更新UI失败:', error);
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
