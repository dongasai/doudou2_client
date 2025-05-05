/**
 * 伤害管理器
 * 负责处理战斗中的伤害计算和应用
 */

import { logger } from './Logger';
import { Entity } from '../Entities/Entity';
import { RandomManager } from './RandomManager';
import { EventManager } from './EventManager';

// 伤害类型
export enum DamageType {
  PHYSICAL = 'physical',   // 物理伤害
  MAGICAL = 'magical',     // 魔法伤害
  PURE = 'pure',           // 真实伤害
  DOT = 'dot'              // 持续伤害
}

// 伤害结果
export interface DamageResult {
  originalAmount: number;  // 原始伤害值
  actualAmount: number;    // 实际伤害值
  isCritical: boolean;     // 是否暴击
  isEvaded: boolean;       // 是否闪避
  isBlocked: boolean;      // 是否格挡
  damageType: DamageType;  // 伤害类型
  source?: Entity;         // 伤害来源
  target: Entity;          // 伤害目标
  skillId?: string;        // 技能ID（如果是技能造成的伤害）
}

export class DamageManager {
  private randomManager: RandomManager;
  private eventManager: EventManager;

  /**
   * 构造函数
   * @param randomManager 随机数管理器
   * @param eventManager 事件管理器
   */
  constructor(randomManager: RandomManager, eventManager: EventManager) {
    this.randomManager = randomManager;
    this.eventManager = eventManager;
    logger.debug('伤害管理器初始化');
  }

  /**
   * 应用伤害
   * @param source 伤害来源（可选）
   * @param target 伤害目标
   * @param amount 伤害量
   * @param type 伤害类型
   * @param options 额外选项
   * @returns 伤害结果
   */
  public applyDamage(
    source: Entity | undefined,
    target: Entity,
    amount: number,
    type: DamageType,
    options: {
      skillId?: string;
      criticalRate?: number;
      criticalMultiplier?: number;
      ignoreDefense?: boolean;
      evadeCheck?: boolean;
    } = {}
  ): DamageResult {
    // 默认选项
    const {
      skillId,
      criticalRate = 0,
      criticalMultiplier = 1.5,
      ignoreDefense = false,
      evadeCheck = true
    } = options;

    // 检查目标是否存活
    if (!target.isAlive()) {
      logger.debug(`目标已死亡，无法造成伤害: ${target.getId()}`);
      return {
        originalAmount: amount,
        actualAmount: 0,
        isCritical: false,
        isEvaded: false,
        isBlocked: false,
        damageType: type,
        source,
        target,
        skillId
      };
    }

    // 闪避检查
    let isEvaded = false;
    if (evadeCheck) {
      isEvaded = this.checkEvade(source, target);
    }

    if (isEvaded) {
      logger.debug(`伤害被闪避: ${source?.getId() || 'unknown'} -> ${target.getId()}`);

      // 触发闪避事件
      this.eventManager.emit('damageEvaded', {
        source,
        target,
        damageType: type,
        skillId
      });

      return {
        originalAmount: amount,
        actualAmount: 0,
        isCritical: false,
        isEvaded: true,
        isBlocked: false,
        damageType: type,
        source,
        target,
        skillId
      };
    }

    // 暴击检查
    let isCritical = false;
    let damageMultiplier = 1.0;

    if (criticalRate > 0) {
      isCritical = this.randomManager.randomBool(criticalRate);
      if (isCritical) {
        damageMultiplier = criticalMultiplier;
        logger.debug(`暴击伤害: ${source?.getId() || 'unknown'} -> ${target.getId()}, 倍率: ${criticalMultiplier}`);
      }
    }

    // 计算实际伤害
    let actualAmount = amount * damageMultiplier;
    let isBlocked = false;

    // 应用防御减免（除非忽略防御）
    if (!ignoreDefense) {
      const { reducedAmount, blocked } = this.calculateDamageReduction(source, target, actualAmount, type);
      actualAmount = reducedAmount;
      isBlocked = blocked;
    }

    // 确保伤害至少为1
    actualAmount = Math.max(1, Math.floor(actualAmount));

    // 记录目标当前生命值
    const targetHpBefore = target.getStat('hp');
    logger.debug(`目标${target.getId()}当前生命值: ${targetHpBefore}`);

    // 应用伤害
    const appliedDamage = target.takeDamage(actualAmount, type, source);

    // 记录目标新生命值
    const targetHpAfter = target.getStat('hp');
    logger.debug(`目标${target.getId()}受到伤害后生命值: ${targetHpAfter}, 减少了${targetHpBefore - targetHpAfter}点`);

    // 创建伤害结果
    const result: DamageResult = {
      originalAmount: amount,
      actualAmount: appliedDamage,
      isCritical,
      isEvaded,
      isBlocked,
      damageType: type,
      source,
      target,
      skillId
    };

    // 触发伤害事件
    this.eventManager.emit('damageDealt', result);

    // 如果目标死亡，触发死亡事件
    if (!target.isAlive()) {
      this.eventManager.emit('entityDeath', {
        entity: target,
        killer: source,
        damageType: type,
        skillId
      });
    }

    logger.debug(`伤害应用: ${source?.getId() || 'unknown'} -> ${target.getId()}, 类型: ${type}, 原始: ${amount}, 实际: ${appliedDamage}, 暴击: ${isCritical}`);
    return result;
  }

  /**
   * 应用治疗
   * @param source 治疗来源（可选）
   * @param target 治疗目标
   * @param amount 治疗量
   * @param options 额外选项
   * @returns 实际治疗量
   */
  public applyHealing(
    source: Entity | undefined,
    target: Entity,
    amount: number,
    options: {
      skillId?: string;
      criticalRate?: number;
      criticalMultiplier?: number;
    } = {}
  ): number {
    // 默认选项
    const {
      skillId,
      criticalRate = 0,
      criticalMultiplier = 1.5
    } = options;

    // 检查目标是否存活
    if (!target.isAlive()) {
      logger.debug(`目标已死亡，无法治疗: ${target.getId()}`);
      return 0;
    }

    // 暴击检查
    let isCritical = false;
    let healMultiplier = 1.0;

    if (criticalRate > 0) {
      isCritical = this.randomManager.randomBool(criticalRate);
      if (isCritical) {
        healMultiplier = criticalMultiplier;
        logger.debug(`暴击治疗: ${source?.getId() || 'unknown'} -> ${target.getId()}, 倍率: ${criticalMultiplier}`);
      }
    }

    // 计算实际治疗量
    let actualAmount = Math.floor(amount * healMultiplier);

    // 获取目标当前生命值和最大生命值
    const currentHp = target.getStat('hp') || 0;
    const maxHp = target.getStat('maxHp') || 0;

    // 计算可以恢复的生命值
    const healableAmount = Math.min(actualAmount, maxHp - currentHp);

    // 应用治疗
    if (healableAmount > 0) {
      target.modifyStat('hp', healableAmount);
      logger.debug(`治疗应用: ${source?.getId() || 'unknown'} -> ${target.getId()}, 数量: ${healableAmount}, 暴击: ${isCritical}`);
    }

    // 触发治疗事件
    this.eventManager.emit('healingApplied', {
      source,
      target,
      originalAmount: amount,
      actualAmount: healableAmount,
      isCritical,
      skillId
    });

    return healableAmount;
  }

  /**
   * 检查是否闪避
   * @param source 伤害来源
   * @param target 伤害目标
   * @returns 是否闪避成功
   */
  private checkEvade(source: Entity | undefined, target: Entity): boolean {
    // 获取目标的闪避率（基于速度属性）
    const targetSpeed = target.getStat('speed') || 0;
    const baseEvadeRate = targetSpeed * 0.002; // 每点速度提供0.2%的闪避率

    // 获取攻击者的命中率（如果有）
    let attackerAccuracy = 0;
    if (source) {
      attackerAccuracy = source.getStat('accuracy') || 0;
    }

    // 计算最终闪避率（考虑攻击者的命中率）
    const finalEvadeRate = Math.max(0, Math.min(0.75, baseEvadeRate - attackerAccuracy * 0.001)); // 闪避率上限75%

    // 随机判定是否闪避
    return this.randomManager.randomBool(finalEvadeRate);
  }

  /**
   * 计算伤害减免
   * @param source 伤害来源
   * @param target 伤害目标
   * @param amount 原始伤害
   * @param type 伤害类型
   * @returns 减免后的伤害和是否格挡
   */
  private calculateDamageReduction(
    source: Entity | undefined,
    target: Entity,
    amount: number,
    type: DamageType
  ): { reducedAmount: number, blocked: boolean } {
    // 获取目标的防御属性
    let defense = 0;
    let damageReduction = 0;
    let blockChance = 0;

    // 根据伤害类型选择对应的防御属性
    if (type === DamageType.PHYSICAL) {
      defense = target.getStat('defense') || 0;
      blockChance = target.getStat('blockChance') || 0;
    } else if (type === DamageType.MAGICAL) {
      defense = target.getStat('magicDefense') || 0;
    } else if (type === DamageType.PURE) {
      // 真实伤害不受防御影响
      return { reducedAmount: amount, blocked: false };
    }

    // 计算伤害减免百分比
    // 防御公式: 减伤率 = 防御 / (防御 + 100)，这样防御越高，边际效益越低
    damageReduction = defense / (defense + 100);

    // 检查是否格挡（仅对物理伤害有效）
    let blocked = false;
    if (type === DamageType.PHYSICAL && blockChance > 0) {
      blocked = this.randomManager.randomBool(blockChance);
      if (blocked) {
        // 格挡减少50%的伤害
        damageReduction += 0.5;
      }
    }

    // 应用伤害减免
    const reducedAmount = amount * (1 - Math.min(0.9, damageReduction)); // 最大减伤90%

    return { reducedAmount, blocked };
  }
}
