/**
 * 技能管理器
 * 此文件已被重构，请使用 src/Battle/Skills/SkillManager.ts
 * 此文件仅作为兼容层，将在后续版本中移除
 */

import { logger } from './Logger';
import { Entity } from '../Entities/Entity';
import { EntityManager } from './EntityManager';
import { EventManager } from './EventManager';
import { DamageManager } from './DamageManager';
import { RandomManager } from './RandomManager';
import { Vector2D } from '../Types/Vector2D';

// 导入新的模块
import { SkillManager as NewSkillManager } from '../Skills/SkillManager';

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

  // 新的技能管理器实例
  private newSkillManager: NewSkillManager;

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

    // 初始化新的技能管理器
    this.newSkillManager = new NewSkillManager(
      entityManager,
      eventManager,
      damageManager,
      randomManager
    );

    logger.debug('技能管理器初始化（兼容层）');
  }

  /**
   * 注册技能
   * @param owner 技能拥有者
   * @param config 技能配置
   * @param level 技能等级
   * @returns 技能实例
   */
  public registerSkill(owner: Entity, config: SkillConfig, level: number = 1): Skill {
    // 调用新的技能管理器
    return this.newSkillManager.registerSkill(owner, config, level);
  }

  /**
   * 获取实体的技能列表
   * @param entity 实体
   * @returns 技能列表
   */
  public getEntitySkills(entity: Entity): Skill[] {
    // 调用新的技能管理器
    return this.newSkillManager.getEntitySkills(entity);
  }

  /**
   * 获取实体的特定技能
   * @param entity 实体
   * @param skillId 技能ID
   * @returns 技能实例
   */
  public getEntitySkill(entity: Entity, skillId: string): Skill | undefined {
    // 调用新的技能管理器
    return this.newSkillManager.getEntitySkill(entity, skillId);
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
    // 调用新的技能管理器
    return this.newSkillManager.castSkill(caster, skillId, targetId, position);
  }

  /**
   * 更新技能冷却和效果
   * @param deltaTime 时间增量（毫秒）
   * @param currentTime 当前时间（毫秒）
   */
  public update(deltaTime: number, currentTime: number): void {
    // 调用新的技能管理器
    this.newSkillManager.update(deltaTime, currentTime);
  }

  /**
   * 获取实体的活跃效果
   * @param entity 实体
   * @returns 效果列表
   */
  public getEntityActiveEffects(entity: Entity): any[] {
    // 调用新的技能管理器
    return this.newSkillManager.getEntityActiveEffects(entity);
  }

  /**
   * 清除实体的所有效果
   * @param entity 实体
   */
  public clearEntityEffects(entity: Entity): void {
    // 调用新的技能管理器
    this.newSkillManager.clearEntityEffects(entity);
  }

  /**
   * 清除所有效果
   */
  public clearAllEffects(): void {
    // 调用新的技能管理器
    this.newSkillManager.clearAllEffects();
  }
}
