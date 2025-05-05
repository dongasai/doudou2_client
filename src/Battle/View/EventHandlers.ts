/**
 * 事件处理器
 * 负责处理战斗场景中的各种事件
 */

import { EntityCreatedEvent } from '@/Event/b2v/EntityCreated';
import { EntityMovedEvent } from '@/Event/b2v/EntityMoved';
import { DamageDealtEvent } from '@/Event/b2v/DamageDealt';
import { SkillCastEvent } from '@/Event/b2v/SkillCast';
import { SkillEffectAppliedEvent } from '@/Event/b2v/SkillEffectApplied';
import { SkillCooldownUpdateEvent } from '@/Event/b2v/SkillCooldownUpdate';
import { EntityStateChangedEvent } from '@/Event/b2v/EntityStateChanged';
import { EntityStatsChangedEvent } from '@/Event/b2v/EntityStatsChanged';
import { BuffAppliedEvent } from '@/Event/b2v/BuffApplied';
import { BuffRemovedEvent } from '@/Event/b2v/BuffRemoved';
import { GameOverEvent } from '@/Event/b2v/GameOver';
import { EntityRenderer } from './EntityRenderer';
import { UIManager } from './UIManager';
import { CameraController } from './CameraController';
import { SkillEffectView } from './SkillEffectView';
import { EventManager, EventHandler } from '@/Battle/Core/EventManager';
import { EventType } from '@/Event/EventTypes';
import { BattleEngine } from '@/Battle/Core/BattleEngine';

export class EventHandlers {
  private entityRenderer: EntityRenderer;
  private uiManager: UIManager;
  private cameraController: CameraController;
  private skillEffectView: SkillEffectView;
  private eventManager: EventManager;
  private battleEngine: BattleEngine;

  // 绑定的事件处理器
  private boundEventHandlers: Map<string, EventHandler<any>> = new Map();

  /**
   * 构造函数
   * @param entityRenderer 实体渲染器
   * @param uiManager UI管理器
   * @param cameraController 相机控制器
   * @param skillEffectView 技能效果视图
   * @param eventManager 事件管理器
   * @param battleEngine 战斗引擎
   */
  constructor(
    entityRenderer: EntityRenderer,
    uiManager: UIManager,
    cameraController: CameraController,
    skillEffectView: SkillEffectView,
    eventManager: EventManager,
    battleEngine: BattleEngine
  ) {
    this.entityRenderer = entityRenderer;
    this.uiManager = uiManager;
    this.cameraController = cameraController;
    this.skillEffectView = skillEffectView;
    this.eventManager = eventManager;
    this.battleEngine = battleEngine;

    // 注册事件监听
    this.registerEventListeners();
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 创建并保存绑定的事件处理器
    const bindEventHandler = <T>(eventType: string, handler: (event: T) => void): void => {
      const boundHandler: EventHandler<T> = handler.bind(this);
      this.boundEventHandlers.set(eventType, boundHandler);
      this.eventManager.on(eventType, boundHandler);
    };

    // 战斗引擎到视图层的实体事件
    bindEventHandler(EventType.ENTITY_CREATED, this.onEntityCreated);
    bindEventHandler(EventType.ENTITY_MOVED, this.onEntityMoved);
    bindEventHandler(EventType.ENTITY_STATE_CHANGED, this.onEntityStateChanged);
    bindEventHandler(EventType.ENTITY_STATS_CHANGED, this.onEntityStatsChanged);
    bindEventHandler('entityStatsChanged', this.onEntityStatsChanged); // 添加字符串版本的事件监听
    bindEventHandler(EventType.BUFF_APPLIED, this.onBuffApplied);
    bindEventHandler(EventType.BUFF_REMOVED, this.onBuffRemoved);

    // 战斗引擎到视图层的伤害和技能事件
    bindEventHandler(EventType.DAMAGE_DEALT, this.onDamageDealt);
    bindEventHandler(EventType.SKILL_CAST, this.onSkillCast);
    bindEventHandler(EventType.SKILL_EFFECT_APPLIED, this.onSkillEffectApplied);
    bindEventHandler(EventType.SKILL_COOLDOWN_UPDATE, this.onSkillCooldownUpdate);

    // 波次事件
    bindEventHandler(EventType.WAVE_COMPLETED, this.onWaveCompleted);

    // 使用字符串的事件（保留向后兼容性）
    bindEventHandler('waveChanged', this.onWaveChanged);

    // 游戏结束事件
    bindEventHandler(EventType.GAME_OVER, this.onGameOver);
  }

  /**
   * 实体创建事件处理
   * @param event 事件数据
   */
  private onEntityCreated(event: EntityCreatedEvent): void {
    // 创建实体
    this.entityRenderer.createEntity(event);
  }

  /**
   * 实体移动事件处理
   * @param event 事件数据
   */
  private onEntityMoved(event: EntityMovedEvent): void {
    // 更新实体位置
    this.entityRenderer.updateEntityPosition(event.entityId, event.position, true);

    // 如果是英雄，聚焦摄像机
    if (event.entityId.startsWith('hero_')) {
      this.cameraController.focusOnPosition(event.position);
    }
  }

  /**
   * 伤害事件处理
   * @param event 事件数据
   */
  private onDamageDealt(event: DamageDealtEvent): void {
    // 获取目标精灵
    const sprite = this.entityRenderer.getEntitySprite(event.targetId);
    if (!sprite) {
      return;
    }

    // 显示伤害数字
    this.entityRenderer.showDamageNumber(
      { x: sprite.x, y: sprite.y },
      event.damage,
      event.isCritical
    );

    // 播放受击动画
    this.entityRenderer.playHitAnimation(event.targetId);
  }

  /**
   * 技能释放事件处理
   * @param event 事件数据
   */
  private onSkillCast(event: SkillCastEvent): void {
    // 触发技能UI冷却
    this.uiManager.triggerSkillCooldown(event.skillId);

    // 获取施法者精灵
    const casterSprite = this.entityRenderer.getEntitySprite(event.casterId);
    if (!casterSprite) {
      return;
    }

    // 如果有目标，播放技能效果
    if (event.targetIds && event.targetIds.length > 0) {
      for (const targetId of event.targetIds) {
        const targetSprite = this.entityRenderer.getEntitySprite(targetId);
        if (targetSprite) {
          // 播放技能效果
          this.skillEffectView.playSkillEffect(
            `skill_${event.skillId}`,
            { x: casterSprite.x, y: casterSprite.y },
            { x: targetSprite.x, y: targetSprite.y }
          );
        }
      }
    } else if (event.position) {
      // 如果有位置，播放技能效果到位置
      const screenPos = this.cameraController.worldToScreenPosition(event.position);

      // 播放技能效果
      this.skillEffectView.playSkillEffect(
        `skill_${event.skillId}`,
        { x: casterSprite.x, y: casterSprite.y },
        screenPos
      );
    }
  }

  /**
   * 技能效果应用事件处理
   * @param event 事件数据
   */
  private onSkillEffectApplied(event: SkillEffectAppliedEvent): void {
    // 获取目标精灵
    const sprite = this.entityRenderer.getEntitySprite(event.targetId);
    if (!sprite) {
      return;
    }

    // 播放效果动画
    this.skillEffectView.playEffectAnimation(
      event.effectType as any,
      { x: sprite.x, y: sprite.y }
    );
  }

  /**
   * 技能冷却更新事件处理
   * @param event 事件数据
   */
  private onSkillCooldownUpdate(event: SkillCooldownUpdateEvent): void {
    // 更新技能UI冷却进度
    this.uiManager.updateSkillCooldownProgress(event.skillId, event.progress);
  }

  /**
   * 实体状态变化事件处理
   * @param event 事件数据
   */
  private onEntityStateChanged(event: EntityStateChangedEvent): void {
    // 如果状态是死亡，播放死亡动画
    if (event.state === 'dead') {
      this.entityRenderer.playDeathAnimation(event.entityId);
    }
  }

  /**
   * 实体属性变化事件处理
   * @param event 事件数据
   */
  private onEntityStatsChanged(event: EntityStatsChangedEvent): void {
    console.log(`[INFO] 收到实体属性变化事件:`, event);

    // 检查事件中是否包含hp和maxHp属性
    if (event.changedStats && event.changedStats.hp !== undefined && event.changedStats.maxHp !== undefined) {
      console.log(`[INFO] 实体${event.entityId}生命值变化: ${event.changedStats.hp}/${event.changedStats.maxHp}`);

      // 获取实体精灵
      const sprite = this.entityRenderer.getEntitySprite(event.entityId);
      if (sprite) {
        console.log(`[INFO] 找到实体精灵: ${event.entityId}`);

        // 如果是水晶，更新水晶的视觉效果
        if (event.entityId.startsWith('crystal_')) {
          console.log(`[INFO] 更新水晶${event.entityId}的视觉效果`);

          // 计算生命值百分比
          const hpPercent = (event.changedStats.hp / event.changedStats.maxHp) * 100;

          // 根据生命值百分比设置不同的颜色
          let color = '#ffffff'; // 默认白色
          if (hpPercent < 30) {
            color = '#ff0000'; // 红色（危险）
          } else if (hpPercent < 70) {
            color = '#ffff00'; // 黄色（警告）
          }

          // 设置水晶颜色
          (sprite as Phaser.GameObjects.Text).setColor(color);

          // 播放受伤动画
          this.entityRenderer.playHitAnimation(event.entityId);

          // 计算伤害值（当前生命值与最大生命值的差值的绝对值）
          const damageValue = Math.abs(event.changedStats.maxHp - event.changedStats.hp);

          // 显示伤害数字
          this.entityRenderer.showDamageNumber(
            { x: sprite.x, y: sprite.y },
            damageValue, // 显示损失的生命值
            false
          );

          console.log(`[INFO] 水晶${event.entityId}视觉效果更新完成，颜色: ${color}`);
        }
      } else {
        console.warn(`[WARN] 未找到实体精灵: ${event.entityId}`);
      }
    }

    // 如果是英雄，更新状态栏
    if (event.entityId.startsWith('hero_') && event.changedStats) {
      console.log(`[INFO] 更新英雄${event.entityId}的状态栏`);

      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();

      // 获取水晶状态
      const crystalHp = battleStats.crystalStats?.hp || 1000;
      const crystalMaxHp = battleStats.crystalStats?.maxHp || 1000;

      // 更新状态栏
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        const heroHp = hero.hp || 100;
        const heroMaxHp = hero.maxHp || 100;
        const heroMp = hero.mp || 100;
        const heroMaxMp = hero.maxMp || 100;

        // 同时更新水晶HP和英雄HP/MP
        this.uiManager.updateStatusBar(
          crystalHp,
          crystalMaxHp,
          heroHp,
          heroMaxHp,
          heroMp,
          heroMaxMp
        );

        console.log(`[INFO] 状态栏更新完成: 水晶=${crystalHp}/${crystalMaxHp}, 英雄HP=${heroHp}/${heroMaxHp}, MP=${heroMp}/${heroMaxMp}`);
      }
    }

    // 如果是水晶，更新战斗状态
    if (event.entityId.startsWith('crystal_')) {
      console.log(`[INFO] 更新水晶${event.entityId}的战斗状态`);

      try {
        // 获取战斗状态
        const battleStats = this.battleEngine.getBattleStats();

        // 更新水晶状态
        if (battleStats.crystalStats) {
          // 保存原始值，用于日志
          const oldHp = battleStats.crystalStats.hp;

          // 获取新的生命值
          const newHp = event.changedStats.hp || battleStats.crystalStats.hp;
          const newMaxHp = event.changedStats.maxHp || battleStats.crystalStats.maxHp;

          console.log(`[INFO] 水晶战斗状态更新: HP=${oldHp}->${newHp}/${newMaxHp}`);

          // 获取英雄状态
          let heroHp = 100;
          let heroMaxHp = 100;
          let heroMp = 100;
          let heroMaxMp = 100;

          // 尝试从战斗状态获取英雄信息
          if (battleStats.heroStats && battleStats.heroStats.length > 0) {
            const hero = battleStats.heroStats[0];
            heroHp = hero.hp || heroHp;
            heroMaxHp = hero.maxHp || heroMaxHp;
            heroMp = hero.mp || heroMp;
            heroMaxMp = hero.maxMp || heroMaxMp;
          }

          // 直接更新UI状态栏，同时显示水晶HP和英雄HP/MP
          this.uiManager.updateStatusBar(
            newHp,
            newMaxHp,
            heroHp,
            heroMaxHp,
            heroMp,
            heroMaxMp
          );

          // 使用BattleEngine的方法更新水晶状态
          // 这将确保BattleManager中的水晶状态也被更新
          try {
            // 获取BattleManager
            const battleManager = this.battleEngine.getBattleManager();
            if (battleManager && battleManager.updateCrystalStats) {
              battleManager.updateCrystalStats(newHp, newMaxHp);
              console.log(`[INFO] 通过BattleManager更新水晶状态成功`);
            } else {
              console.warn(`[WARN] 无法获取BattleManager或updateCrystalStats方法不存在`);
            }
          } catch (error) {
            console.error(`[ERROR] 通过BattleManager更新水晶状态失败:`, error);
          }
        }
      } catch (error) {
        console.error(`[ERROR] 更新水晶战斗状态失败:`, error);
      }
    }
  }

  /**
   * Buff应用事件处理
   * @param event 事件数据
   */
  private onBuffApplied(event: BuffAppliedEvent): void {
    // 获取目标精灵
    const sprite = this.entityRenderer.getEntitySprite(event.targetId);
    if (!sprite) {
      return;
    }

    // 创建Buff效果
    this.skillEffectView.playEffectAnimation(
      event.buffType as any,
      { x: sprite.x, y: sprite.y }
    );
  }

  /**
   * Buff移除事件处理
   * @param event 事件数据
   */
  private onBuffRemoved(event: BuffRemovedEvent): void {
    // 获取目标精灵
    const sprite = this.entityRenderer.getEntitySprite(event.targetId);
    if (!sprite) {
      return;
    }

    // 根据移除原因选择不同的图标
    let icon = '❌';
    if (event.reason === 'expired') {
      icon = '⏱️';
    } else if (event.reason === 'dispelled') {
      icon = '🧹';
    } else if (event.reason === 'death') {
      icon = '💀';
    }

    // 创建移除效果
    this.skillEffectView.createTextEffect(
      { x: sprite.x, y: sprite.y },
      icon,
      {
        duration: 800,
        scale: { from: 1, to: 1.5 },
        alpha: { from: 1, to: 0 },
        y: { offset: -50 }
      }
    );
  }

  /**
   * 波次变化事件处理
   * @param data 事件数据
   */
  private onWaveChanged(data: any): void {
    // 确保 data.number 存在，如果不存在则使用 data.waveIndex + 1 或默认值 1
    const waveNumber = data.number || (data.waveIndex !== undefined ? data.waveIndex + 1 : 1);

    // 更新波次指示器
    this.uiManager.updateWaveIndicator(waveNumber);

    // 显示波次提示
    this.uiManager.showWaveChangeNotification(waveNumber);
  }

  /**
   * 波次完成事件处理
   * @param data 事件数据
   */
  private onWaveCompleted(data: any): void {
    const waveIndex = data.waveIndex;
    const waveName = data.waveName;

    // 显示波次完成提示
    this.uiManager.showWaveCompletedNotification(waveIndex, waveName, () => {
      // 调用战斗引擎的波次管理器开始下一波
      this.battleEngine.getWaveManager().startNextWave();
    });
  }

  /**
   * 游戏结束事件处理
   * @param event 事件数据
   */
  private onGameOver(event: GameOverEvent): void {
    console.log('[INFO] 游戏结束事件:', event);

    // 确保结果是正确的
    const result = event.result || (event.victory ? 'victory' : 'defeat');

    // 显示游戏结束提示
    this.uiManager.showGameOverNotification(result, () => {
      // 返回到关卡选择场景
      // 使用UI管理器的场景引用切换场景
      const scene = this.uiManager.getScene();
      if (scene) {
        scene.scene.start('LevelSelectScene');
      } else {
        console.error('[ERROR] 无法获取场景引用，无法切换到关卡选择场景');
      }
    });
  }

  /**
   * 移除所有事件监听
   */
  public removeAllEventListeners(): void {
    // 使用保存的绑定处理器移除事件监听
    for (const [eventType, handler] of this.boundEventHandlers.entries()) {
      this.eventManager.off(eventType, handler);
    }

    // 清空绑定处理器映射
    this.boundEventHandlers.clear();
  }
}
