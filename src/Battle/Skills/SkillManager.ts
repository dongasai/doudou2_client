/**
 * 技能管理器
 * 负责管理技能的注册、释放和冷却
 */

import { logger } from '../Core/Logger';
import { Entity } from '../Entities/Entity';
import { EntityManager } from '../Core/EntityManager';
import { EventManager } from '../Core/EventManager';
import { DamageManager, DamageType } from '../Core/DamageManager';
import { RandomManager } from '../Core/RandomManager';
import { Vector2D } from '../Types/Vector2D';
import { 
  Skill, 
  SkillConfig, 
  SkillCastResult, 
  SkillType, 
  EffectType 
} from './SkillTypes';
import { EffectManager } from './EffectManager';
import { TargetSelector } from './TargetSelector';

export class SkillManager {
  private entityManager: EntityManager;
  private eventManager: EventManager;
  private damageManager: DamageManager;
  private randomManager: RandomManager;
  private effectManager: EffectManager;
  private targetSelector: TargetSelector;
  
  // 技能映射（实体ID -> 技能列表）
  private skills: Map<string, Skill[]> = new Map();

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
    
    // 初始化子系统
    this.effectManager = new EffectManager(eventManager, damageManager);
    this.targetSelector = new TargetSelector(entityManager, randomManager);
    
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
    
    // 选择目标
    const targetResult = this.targetSelector.selectTargets(caster, skill, targetId, position);
    if (targetResult.error) {
      return {
        success: false,
        skillId,
        caster,
        targets: [],
        effects: [],
        failReason: targetResult.error
      };
    }
    
    const targets = targetResult.targets;
    
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
              this.effectManager.applyEffect(
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
    
    // 更新效果
    this.effectManager.update(deltaTime, currentTime);
  }

  /**
   * 获取实体的活跃效果
   * @param entity 实体
   * @returns 效果列表
   */
  public getEntityActiveEffects(entity: Entity): any[] {
    return this.effectManager.getEntityActiveEffects(entity);
  }

  /**
   * 清除实体的所有效果
   * @param entity 实体
   */
  public clearEntityEffects(entity: Entity): void {
    this.effectManager.clearEntityEffects(entity);
  }

  /**
   * 清除所有效果
   */
  public clearAllEffects(): void {
    this.effectManager.clearAllEffects();
  }
}
