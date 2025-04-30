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
    // 检查事件中是否包含hp和maxHp属性
    if (event.changedStats && event.changedStats.hp !== undefined && event.changedStats.maxHp !== undefined) {
      // 更新生命值条
      this.entityRenderer.updateHealthBar(event.entityId, event.changedStats.hp, event.changedStats.maxHp);
    }
    
    // 如果是英雄，更新状态栏
    if (event.entityId.startsWith('hero_') && event.changedStats) {
      // 获取战斗状态
      const battleStats = this.battleEngine.getBattleStats();
      
      // 更新状态栏
      if (battleStats.heroStats && battleStats.heroStats.length > 0) {
        const hero = battleStats.heroStats[0];
        this.uiManager.updateStatusBar(hero.hp, hero.maxHp, hero.mp, hero.maxMp);
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
    
    // 显示Buff效果
    const buffEmoji = event.buffEmoji || '✨'; // 默认使用闪光emoji
    
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
    const text = this.skillEffectView.createTextEffect(
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
    // 显示游戏结束提示
    this.uiManager.showGameOverNotification(event.result, () => {
      // 返回到关卡选择场景
      this.battleEngine.getScene().scene.start('LevelSelectScene');
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
