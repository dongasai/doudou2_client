/**
 * 技能管理器
 * 负责管理技能的释放、冷却和效果应用
 */

import { logger } from './Logger';
import { Entity, EntityType } from '../Entities/Entity';
import { EntityManager } from './EntityManager';
import { EventManager } from './EventManager';
import { DamageManager, DamageType } from './DamageManager';
import { RandomManager } from './RandomManager';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';

// 技能类型
export enum SkillType {
  DAMAGE = 'damage',       // 伤害技能
  HEAL = 'heal',           // 治疗技能
  BUFF = 'buff',           // 增益技能
  DEBUFF = 'debuff',       // 减益技能
  CONTROL = 'control',     // 控制技能
  SUMMON = 'summon',       // 召唤技能
  MOVEMENT = 'movement',   // 移动技能
  SPECIAL = 'special'      // 特殊技能
}

// 目标类型
export enum TargetType {
  SINGLE = 'single',       // 单体目标
  MULTIPLE = 'multiple',   // 多个目标
  AREA = 'area',           // 区域目标
  SELF = 'self',           // 自身
  ALLY = 'ally',           // 友方
  ENEMY = 'enemy'          // 敌方
}

// 技能效果类型
export enum EffectType {
  DAMAGE = 'damage',       // 伤害效果
  HEAL = 'heal',           // 治疗效果
  DOT = 'dot',             // 持续伤害
  HOT = 'hot',             // 持续治疗
  BUFF = 'buff',           // 增益效果
  DEBUFF = 'debuff',       // 减益效果
  CONTROL = 'control',     // 控制效果
  SUMMON = 'summon',       // 召唤效果
  MOVEMENT = 'movement',   // 移动效果
  SPECIAL = 'special'      // 特殊效果
}

// 技能配置接口
export interface SkillConfig {
  id: string;              // 技能ID
  name: string;            // 技能名称
  type: SkillType;         // 技能类型
  targetType: TargetType;  // 目标类型
  cooldown: number;        // 冷却时间（毫秒）
  range?: number;          // 射程（像素）
  duration?: number;       // 持续时间（毫秒）
  baseDamage?: number;     // 基础伤害
  baseHeal?: number;       // 基础治疗
  criticalRate?: number;   // 暴击率
  criticalMultiplier?: number; // 暴击倍率
  cost?: number;           // 消耗（魔法值等）
  effects?: {              // 技能效果
    [key: string]: {
      type: EffectType;
      value?: number;
      duration?: number;
      interval?: number;
      attribute?: string;
      [key: string]: any;
    }
  };
  [key: string]: any;      // 其他自定义属性
}

// 技能实例接口
export interface Skill {
  config: SkillConfig;     // 技能配置
  owner: Entity;           // 技能拥有者
  level: number;           // 技能等级
  currentCooldown: number; // 当前冷却时间
  lastCastTime: number;    // 上次释放时间
  isAvailable: boolean;    // 是否可用
}

// 技能释放结果
export interface SkillCastResult {
  success: boolean;        // 是否成功释放
  skillId: string;         // 技能ID
  caster: Entity;          // 施法者
  targets: Entity[];       // 目标列表
  position?: Vector2D;     // 目标位置
  effects: {               // 效果列表
    type: EffectType;
    target: Entity;
    value: number;
    isCritical?: boolean;
  }[];
  failReason?: string;     // 失败原因
}

export class SkillManager {
  private entityManager: EntityManager;
  private eventManager: EventManager;
  private damageManager: DamageManager;
  private randomManager: RandomManager;
  
  // 技能映射（实体ID -> 技能列表）
  private skills: Map<string, Skill[]> = new Map();
  // 持续效果列表
  private activeEffects: Array<{
    id: string;
    type: EffectType;
    source: Entity;
    target: Entity;
    skillId: string;
    value: number;
    duration: number;
    interval?: number;
    lastTickTime: number;
    startTime: number;
    attribute?: string;
    [key: string]: any;
  }> = [];
  // 效果ID计数器
  private effectIdCounter: number = 0;

  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param eventManager 事件管理器
   * @param damageManager 伤害管理器
   * @param randomManager 随机数管理器
   */
  constructor(
    entityManager: EntityManager,
    eventManager: EventManager,
    damageManager: DamageManager,
    randomManager: RandomManager
  ) {
    this.entityManager = entityManager;
    this.eventManager = eventManager;
    this.damageManager = damageManager;
    this.randomManager = randomManager;
    logger.debug('技能管理器初始化');
  }

  /**
   * 注册技能
   * @param owner 技能拥有者
   * @param config 技能配置
   * @param level 技能等级
   * @returns 技能实例
   */
  public registerSkill(owner: Entity, config: SkillConfig, level: number = 1): Skill {
    const skill: Skill = {
      config,
      owner,
      level,
      currentCooldown: 0,
      lastCastTime: 0,
      isAvailable: true
    };
    
    // 获取实体的技能列表
    const ownerId = owner.getId();
    if (!this.skills.has(ownerId)) {
      this.skills.set(ownerId, []);
    }
    
    const ownerSkills = this.skills.get(ownerId)!;
    
    // 检查是否已存在相同ID的技能
    const existingIndex = ownerSkills.findIndex(s => s.config.id === config.id);
    if (existingIndex !== -1) {
      // 更新已有技能
      ownerSkills[existingIndex] = skill;
      logger.debug(`更新技能: ${config.id}, 拥有者: ${ownerId}, 等级: ${level}`);
    } else {
      // 添加新技能
      ownerSkills.push(skill);
      logger.debug(`注册技能: ${config.id}, 拥有者: ${ownerId}, 等级: ${level}`);
    }
    
    return skill;
  }

  /**
   * 获取实体的技能列表
   * @param entity 实体
   * @returns 技能列表
   */
  public getEntitySkills(entity: Entity): Skill[] {
    const entityId = entity.getId();
    return this.skills.has(entityId) ? [...this.skills.get(entityId)!] : [];
  }

  /**
   * 获取实体的特定技能
   * @param entity 实体
   * @param skillId 技能ID
   * @returns 技能实例
   */
  public getEntitySkill(entity: Entity, skillId: string): Skill | undefined {
    const entityId = entity.getId();
    if (!this.skills.has(entityId)) {
      return undefined;
    }
    
    return this.skills.get(entityId)!.find(skill => skill.config.id === skillId);
  }

  /**
   * 释放技能
   * @param caster 施法者
   * @param skillId 技能ID
   * @param targetId 目标ID（可选）
   * @param position 目标位置（可选）
   * @returns 技能释放结果
   */
  public castSkill(
    caster: Entity,
    skillId: string,
    targetId?: string,
    position?: Vector2D
  ): SkillCastResult {
    // 获取技能
    const skill = this.getEntitySkill(caster, skillId);
    if (!skill) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: '技能不存在'
      };
    }
    
    // 检查技能是否可用
    if (!skill.isAvailable) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: '技能冷却中'
      };
    }
    
    // 检查施法者是否存活
    if (!caster.isAlive()) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: '施法者已死亡'
      };
    }
    
    // 检查魔法值消耗
    const cost = skill.config.cost || 0;
    const currentMp = caster.getStat('mp') || 0;
    if (cost > 0 && currentMp < cost) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: '魔法值不足'
      };
    }
    
    // 获取目标
    let targets: Entity[] = [];
    
    switch (skill.config.targetType) {
      case TargetType.SELF:
        targets = [caster];
        break;
        
      case TargetType.SINGLE:
        if (targetId) {
          const target = this.entityManager.getEntity(targetId);
          if (target && target.isAlive()) {
            // 检查射程
            if (skill.config.range) {
              const distance = Vector2DUtils.distance(
                caster.getPosition(),
                target.getPosition()
              );
              if (distance > skill.config.range) {
                return {
                  success: false,
                  skillId,
                  caster,
                  targets: [],
                  effects: [],
                  failReason: '目标超出射程'
                };
              }
            }
            targets = [target];
          } else {
            return {
              success: false,
              skillId,
              caster,
              targets: [],
              effects: [],
              failReason: '目标不存在或已死亡'
            };
          }
        } else {
          return {
            success: false,
            skillId,
            caster,
            targets: [],
            effects: [],
            failReason: '未指定目标'
          };
        }
        break;
        
      case TargetType.AREA:
        if (!position) {
          return {
            success: false,
            skillId,
            caster,
            targets: [],
            effects: [],
            failReason: '未指定目标位置'
          };
        }
        
        // 检查射程
        if (skill.config.range) {
          const distance = Vector2DUtils.distance(
            caster.getPosition(),
            position
          );
          if (distance > skill.config.range) {
            return {
              success: false,
              skillId,
              caster,
              targets: [],
              effects: [],
              failReason: '目标位置超出射程'
            };
          }
        }
        
        // 获取区域内的目标
        const areaRadius = skill.config.areaRadius || 100;
        targets = this.entityManager.getEntitiesNearby(
          position,
          areaRadius,
          EntityType.BEAN
        );
        break;
        
      case TargetType.ENEMY:
        // 获取所有敌人
        targets = this.entityManager.getEntitiesByType(EntityType.BEAN)
          .filter(entity => entity.isAlive());
        
        // 如果有射程限制，筛选在射程内的敌人
        if (skill.config.range) {
          targets = targets.filter(target => {
            const distance = Vector2DUtils.distance(
              caster.getPosition(),
              target.getPosition()
            );
            return distance <= skill.config.range;
          });
        }
        
        // 如果有最大目标数限制，随机选择
        const maxTargets = skill.config.maxTargets || targets.length;
        if (targets.length > maxTargets) {
          targets = this.randomManager.shuffle(targets).slice(0, maxTargets);
        }
        break;
        
      case TargetType.ALLY:
        // 获取所有友方单位（英雄）
        targets = this.entityManager.getEntitiesByType(EntityType.HERO)
          .filter(entity => entity.isAlive() && entity.getId() !== caster.getId());
        
        // 如果有射程限制，筛选在射程内的友方
        if (skill.config.range) {
          targets = targets.filter(target => {
            const distance = Vector2DUtils.distance(
              caster.getPosition(),
              target.getPosition()
            );
            return distance <= skill.config.range;
          });
        }
        
        // 如果有最大目标数限制，随机选择
        const maxAllies = skill.config.maxTargets || targets.length;
        if (targets.length > maxAllies) {
          targets = this.randomManager.shuffle(targets).slice(0, maxAllies);
        }
        break;
        
      case TargetType.MULTIPLE:
        // 需要指定多个目标ID，这里简化处理
        if (targetId) {
          const target = this.entityManager.getEntity(targetId);
          if (target && target.isAlive()) {
            targets = [target];
          }
        }
        break;
    }
    
    // 如果没有有效目标，返回失败
    if (targets.length === 0) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: '没有有效目标'
      };
    }
    
    // 消耗魔法值
    if (cost > 0) {
      caster.modifyStat('mp', -cost);
    }
    
    // 设置冷却
    skill.isAvailable = false;
    skill.currentCooldown = skill.config.cooldown;
    skill.lastCastTime = Date.now();
    
    // 应用技能效果
    const effects: {
      type: EffectType;
      target: Entity;
      value: number;
      isCritical?: boolean;
    }[] = [];
    
    // 处理不同类型的技能
    switch (skill.config.type) {
      case SkillType.DAMAGE:
        // 伤害技能
        for (const target of targets) {
          const baseDamage = skill.config.baseDamage || 0;
          const critRate = skill.config.criticalRate || 0;
          const critMult = skill.config.criticalMultiplier || 1.5;
          
          // 应用伤害
          const damageResult = this.damageManager.applyDamage(
            caster,
            target,
            baseDamage,
            DamageType.MAGICAL,
            {
              skillId: skill.config.id,
              criticalRate: critRate,
              criticalMultiplier: critMult
            }
          );
          
          effects.push({
            type: EffectType.DAMAGE,
            target,
            value: damageResult.actualAmount,
            isCritical: damageResult.isCritical
          });
        }
        break;
        
      case SkillType.HEAL:
        // 治疗技能
        for (const target of targets) {
          const baseHeal = skill.config.baseHeal || 0;
          const critRate = skill.config.criticalRate || 0;
          const critMult = skill.config.criticalMultiplier || 1.5;
          
          // 应用治疗
          const healAmount = this.damageManager.applyHealing(
            caster,
            target,
            baseHeal,
            {
              skillId: skill.config.id,
              criticalRate: critRate,
              criticalMultiplier: critMult
            }
          );
          
          effects.push({
            type: EffectType.HEAL,
            target,
            value: healAmount
          });
        }
        break;
        
      case SkillType.BUFF:
      case SkillType.DEBUFF:
      case SkillType.CONTROL:
        // 状态类技能
        for (const target of targets) {
          // 应用技能效果
          if (skill.config.effects) {
            for (const [effectKey, effectConfig] of Object.entries(skill.config.effects)) {
              this.applyEffect(
                caster,
                target,
                skill.config.id,
                effectConfig.type,
                effectConfig
              );
              
              effects.push({
                type: effectConfig.type,
                target,
                value: effectConfig.value || 0
              });
            }
          }
        }
        break;
    }
    
    // 触发技能释放事件
    this.eventManager.emit('skillCast', {
      skillId: skill.config.id,
      casterId: caster.getId(),
      targetIds: targets.map(t => t.getId()),
      position,
      skillConfig: skill.config
    });
    
    logger.debug(`技能释放: ${skill.config.id}, 施法者: ${caster.getId()}, 目标数: ${targets.length}`);
    
    return {
      success: true,
      skillId: skill.config.id,
      caster,
      targets,
      position,
      effects
    };
  }

  /**
   * 更新技能冷却和效果
   * @param deltaTime 时间增量（毫秒）
   * @param currentTime 当前时间（毫秒）
   */
  public update(deltaTime: number, currentTime: number): void {
    // 更新技能冷却
    for (const [entityId, skills] of this.skills.entries()) {
      for (const skill of skills) {
        if (!skill.isAvailable && skill.currentCooldown > 0) {
          skill.currentCooldown -= deltaTime;
          
          // 冷却完成
          if (skill.currentCooldown <= 0) {
            skill.currentCooldown = 0;
            skill.isAvailable = true;
            
            // 触发冷却完成事件
            this.eventManager.emit('skillCooldownComplete', {
              skillId: skill.config.id,
              ownerId: entityId
            });
            
            logger.debug(`技能冷却完成: ${skill.config.id}, 拥有者: ${entityId}`);
          }
        }
      }
    }
    
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
   * 应用效果
   * @param source 效果来源
   * @param target 效果目标
   * @param skillId 技能ID
   * @param type 效果类型
   * @param config 效果配置
   * @returns 效果ID
   */
  private applyEffect(
    source: Entity,
    target: Entity,
    skillId: string,
    type: EffectType,
    config: any
  ): string {
    // 生成效果ID
    const effectId = `effect_${++this.effectIdCounter}`;
    
    // 创建效果对象
    const effect = {
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
        target.addTag(`control_${config.controlType}`);
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
  private removeEffect(effectId: string): void {
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
        effect.target.removeTag(`control_${effect.controlType}`);
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
   * 获取实体的活跃效果
   * @param entity 实体
   * @returns 效果列表
   */
  public getEntityActiveEffects(entity: Entity): any[] {
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
