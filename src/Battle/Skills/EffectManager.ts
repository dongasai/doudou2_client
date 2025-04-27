/**
 * 技能效果管理器
 * 负责管理技能效果的应用、更新和移除
 */

import { Entity } from '../Entities/Entity';
import { EventManager } from '../Core/EventManager';
import { DamageManager, DamageType } from '../Core/DamageManager';
import { logger } from '../Core/Logger';
import { EffectType, SkillEffect, SkillEffectInfo } from './SkillTypes';

export class EffectManager {
  // 持续效果列表
  private activeEffects: SkillEffect[] = [];
  // 效果ID计数器
  private effectIdCounter: number = 0;
  // 事件管理器
  private eventManager: EventManager;
  // 伤害管理器
  private damageManager: DamageManager;

  /**
   * 构造函数
   * @param eventManager 事件管理器
   * @param damageManager 伤害管理器
   */
  constructor(eventManager: EventManager, damageManager: DamageManager) {
    this.eventManager = eventManager;
    this.damageManager = damageManager;
    logger.debug('效果管理器初始化');
  }

  /**
   * 应用效果
   * @param source 效果来源
   * @param target 效果目标
   * @param skillId 技能ID
   * @param type 效果类型
   * @param config 效果配置
   * @returns 效果ID
   */
  public applyEffect(
    source: Entity,
    target: Entity,
    skillId: string,
    type: EffectType,
    config: any
  ): string {
    // 生成效果ID
    const effectId = `effect_${++this.effectIdCounter}`;
    
    // 创建效果对象
    const effect: SkillEffect = {
      id: effectId,
      type,
      source,
      target,
      skillId,
      value: config.value || 0,
      duration: config.duration || 5000,
      interval: config.interval,
      lastTickTime: Date.now(),
      startTime: Date.now(),
      attribute: config.attribute,
      controlType: config.controlType,
      ...config
    };
    
    // 添加到活跃效果列表
    this.activeEffects.push(effect);
    
    // 应用立即效果
    switch (type) {
      case EffectType.BUFF:
      case EffectType.DEBUFF:
        // 属性修改
        if (effect.attribute) {
          const value = type === EffectType.BUFF ? effect.value : -effect.value;
          target.modifyStat(effect.attribute, value);
          
          // 记录原始值，以便移除时恢复
          effect.originalValue = target.getStat(effect.attribute);
        }
        break;
        
      case EffectType.CONTROL:
        // 控制效果
        if (effect.controlType) {
          target.addTag(`control_${effect.controlType}`);
        }
        break;
    }
    
    // 触发效果应用事件
    this.eventManager.emit('skillEffectApplied', {
      effectId,
      skillId,
      sourceId: source.getId(),
      targetId: target.getId(),
      type,
      value: effect.value,
      duration: effect.duration
    });
    
    logger.debug(`应用效果: ${type}, 技能: ${skillId}, 目标: ${target.getId()}, 持续: ${effect.duration}ms`);
    
    return effectId;
  }

  /**
   * 移除效果
   * @param effectId 效果ID
   */
  public removeEffect(effectId: string): void {
    const index = this.activeEffects.findIndex(e => e.id === effectId);
    if (index === -1) {
      return;
    }
    
    const effect = this.activeEffects[index];
    
    // 移除效果
    switch (effect.type) {
      case EffectType.BUFF:
      case EffectType.DEBUFF:
        // 恢复属性
        if (effect.attribute) {
          const value = effect.type === EffectType.BUFF ? -effect.value : effect.value;
          effect.target.modifyStat(effect.attribute, value);
        }
        break;
        
      case EffectType.CONTROL:
        // 移除控制标签
        if (effect.controlType) {
          effect.target.removeTag(`control_${effect.controlType}`);
        }
        break;
    }
    
    // 从列表中移除
    this.activeEffects.splice(index, 1);
    
    // 触发效果移除事件
    this.eventManager.emit('skillEffectRemoved', {
      effectId,
      skillId: effect.skillId,
      sourceId: effect.source.getId(),
      targetId: effect.target.getId(),
      type: effect.type
    });
    
    logger.debug(`移除效果: ${effectId}, 类型: ${effect.type}, 目标: ${effect.target.getId()}`);
  }

  /**
   * 更新效果
   * @param deltaTime 时间增量（毫秒）
   * @param currentTime 当前时间（毫秒）
   */
  public update(deltaTime: number, currentTime: number): void {
    // 更新持续效果
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      
      // 检查效果是否过期
      const elapsedTime = currentTime - effect.startTime;
      if (elapsedTime >= effect.duration) {
        // 移除效果
        this.removeEffect(effect.id);
        continue;
      }
      
      // 检查目标是否存活
      if (!effect.target.isAlive()) {
        this.removeEffect(effect.id);
        continue;
      }
      
      // 处理周期性效果
      if (effect.interval && effect.interval > 0) {
        const timeSinceLastTick = currentTime - effect.lastTickTime;
        if (timeSinceLastTick >= effect.interval) {
          effect.lastTickTime = currentTime;
          
          // 应用效果
          switch (effect.type) {
            case EffectType.DOT:
              // 持续伤害
              this.damageManager.applyDamage(
                effect.source,
                effect.target,
                effect.value,
                DamageType.DOT,
                { skillId: effect.skillId }
              );
              break;
              
            case EffectType.HOT:
              // 持续治疗
              this.damageManager.applyHealing(
                effect.source,
                effect.target,
                effect.value,
                { skillId: effect.skillId }
              );
              break;
          }
        }
      }
    }
  }

  /**
   * 获取实体的活跃效果
   * @param entity 实体
   * @returns 效果列表
   */
  public getEntityActiveEffects(entity: Entity): SkillEffectInfo[] {
    return this.activeEffects
      .filter(effect => effect.target.getId() === entity.getId())
      .map(effect => ({
        id: effect.id,
        type: effect.type,
        sourceId: effect.source.getId(),
        skillId: effect.skillId,
        value: effect.value,
        duration: effect.duration,
        remainingTime: effect.duration - (Date.now() - effect.startTime)
      }));
  }

  /**
   * 清除实体的所有效果
   * @param entity 实体
   */
  public clearEntityEffects(entity: Entity): void {
    const entityId = entity.getId();
    
    // 找出所有与该实体相关的效果
    const effectsToRemove = this.activeEffects
      .filter(effect => effect.target.getId() === entityId)
      .map(effect => effect.id);
    
    // 移除效果
    for (const effectId of effectsToRemove) {
      this.removeEffect(effectId);
    }
  }

  /**
   * 清除所有效果
   */
  public clearAllEffects(): void {
    // 移除所有效果
    for (const effect of this.activeEffects) {
      this.removeEffect(effect.id);
    }
    
    // 确保列表为空
    this.activeEffects = [];
  }
}
