/**
 * 英雄实体类
 * 表示玩家控制的英雄角色
 */

import { logger } from '../Core/Logger';
import { Entity, EntityStats, EntityType } from './Entity';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';
import { DamageManager, DamageType } from '../Core/DamageManager';
import { EntityManager } from '../Core/EntityManager';

export class Hero extends Entity {
  // 玩家ID
  private playerId: string;
  // 英雄ID
  private heroId: number;
  // 已学习的技能ID列表
  private learnedSkills: Set<number> = new Set();
  // 当前位置索引（1-5）
  private positionIndex: number = 0;
  // 经验值
  private exp: number = 0;
  // 等级
  private level: number = 1;
  // 金币
  private gold: number = 0;
  // 装备的物品ID列表
  private equippedItems: string[] = [];
  // 攻击范围（像素）
  private attackRange: number = 150;
  // 攻击间隔（毫秒）
  private attackInterval: number = 1000;
  // 上次攻击时间（毫秒）
  private lastAttackTime: number = 0;
  // 目标实体ID
  private targetId: string | null = null;
  // 伤害管理器
  private damageManager: DamageManager | null = null;
  // 实体管理器
  private entityManager: EntityManager | null = null;

  /**
   * 构造函数
   * @param id 实体ID
   * @param name 实体名称
   * @param position 初始位置
   * @param stats 初始属性
   * @param currentFrame 当前帧号
   * @param playerId 玩家ID
   * @param heroId 英雄ID
   */
  constructor(
    id: string,
    name: string,
    position: Vector2D,
    stats: EntityStats,
    currentFrame: number,
    playerId: string,
    heroId: number,
    attackRange: number = 150,
    attackInterval: number = 1000
  ) {
    super(id, EntityType.HERO, name, position, stats, currentFrame);

    this.playerId = playerId;
    this.heroId = heroId;
    this.attackRange = attackRange;
    this.attackInterval = attackInterval;

    // 计算位置索引（简化处理）
    this.positionIndex = this.calculatePositionIndex(position);

    // 添加英雄标签
    this.addTag('hero');
    this.addTag(`player_${playerId}`);

    logger.debug(`英雄创建: ${this.toString()}`);
  }

  /**
   * 获取玩家ID
   */
  public getPlayerId(): string {
    return this.playerId;
  }

  /**
   * 获取英雄ID
   */
  public getHeroId(): number {
    return this.heroId;
  }

  /**
   * 获取位置索引
   */
  public getPositionIndex(): number {
    return this.positionIndex;
  }

  /**
   * 更换位置
   * @param newPositionIndex 新位置索引（1-5）
   */
  public changePosition(newPositionIndex: number): void {
    if (newPositionIndex < 1 || newPositionIndex > 5) {
      logger.warn(`无效的位置索引: ${newPositionIndex}`);
      return;
    }

    this.positionIndex = newPositionIndex;

    // 更新位置坐标（简化处理）
    const newPosition = this.calculatePositionCoordinates(newPositionIndex);
    this.setPosition(newPosition);

    logger.debug(`英雄${this.id}更换位置到${newPositionIndex}, 坐标: (${newPosition.x}, ${newPosition.y})`);
  }

  /**
   * 学习技能
   * @param skillId 技能ID
   * @returns 是否成功学习
   */
  public learnSkill(skillId: number): boolean {
    // 检查是否已学习
    if (this.learnedSkills.has(skillId)) {
      logger.debug(`英雄${this.id}已学习技能${skillId}`);
      return false;
    }

    // 添加到已学习列表
    this.learnedSkills.add(skillId);

    logger.debug(`英雄${this.id}学习技能${skillId}`);
    return true;
  }

  /**
   * 获取已学习的技能ID列表
   */
  public getLearnedSkills(): number[] {
    return Array.from(this.learnedSkills);
  }

  /**
   * 检查是否已学习技能
   * @param skillId 技能ID
   */
  public hasLearnedSkill(skillId: number): boolean {
    return this.learnedSkills.has(skillId);
  }

  /**
   * 获取经验值
   */
  public getExp(): number {
    return this.exp;
  }

  /**
   * 增加经验值
   * @param amount 经验值数量
   * @returns 是否升级
   */
  public addExp(amount: number): boolean {
    if (amount <= 0) {
      return false;
    }

    this.exp += amount;

    // 检查是否升级
    const oldLevel = this.level;
    this.updateLevel();

    return this.level > oldLevel;
  }

  /**
   * 获取等级
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * 获取金币
   */
  public getGold(): number {
    return this.gold;
  }

  /**
   * 增加金币
   * @param amount 金币数量
   */
  public addGold(amount: number): void {
    if (amount <= 0) {
      return;
    }

    this.gold += amount;
    logger.debug(`英雄${this.id}获得${amount}金币，当前: ${this.gold}`);
  }

  /**
   * 消费金币
   * @param amount 金币数量
   * @returns 是否成功消费
   */
  public spendGold(amount: number): boolean {
    if (amount <= 0 || this.gold < amount) {
      return false;
    }

    this.gold -= amount;
    logger.debug(`英雄${this.id}消费${amount}金币，剩余: ${this.gold}`);
    return true;
  }

  /**
   * 获取装备的物品ID列表
   */
  public getEquippedItems(): string[] {
    return [...this.equippedItems];
  }

  /**
   * 装备物品
   * @param itemId 物品ID
   * @returns 是否成功装备
   */
  public equipItem(itemId: string): boolean {
    // 检查是否已装备
    if (this.equippedItems.includes(itemId)) {
      return false;
    }

    // 添加到装备列表
    this.equippedItems.push(itemId);

    logger.debug(`英雄${this.id}装备物品${itemId}`);
    return true;
  }

  /**
   * 卸下物品
   * @param itemId 物品ID
   * @returns 是否成功卸下
   */
  public unequipItem(itemId: string): boolean {
    const index = this.equippedItems.indexOf(itemId);
    if (index === -1) {
      return false;
    }

    // 从装备列表中移除
    this.equippedItems.splice(index, 1);

    logger.debug(`英雄${this.id}卸下物品${itemId}`);
    return true;
  }

  /**
   * 更新实体状态
   * @param deltaTime 时间增量（毫秒）
   * @param currentFrame 当前帧号
   */
  public override update(deltaTime: number, currentFrame: number): void {
    super.update(deltaTime, currentFrame);

    // 英雄特有的更新逻辑

    // 如果有目标且可以攻击，则尝试攻击目标
    if (this.targetId && this.canAttack() && this.entityManager && this.damageManager) {
      const targetEntity = this.entityManager.getEntity(this.targetId);

      // 检查目标是否存在且存活
      if (targetEntity && targetEntity.isAlive()) {
        // 检查目标是否在攻击范围内
        const distance = Vector2DUtils.distance(this.position, targetEntity.getPosition());
        logger.debug(`英雄${this.id}到目标${this.targetId}的距离: ${distance}, 攻击范围: ${this.attackRange}`);

        if (distance <= this.attackRange) {
          // 执行攻击
          logger.info(`英雄${this.id}自动攻击目标${this.targetId}`);
          const attackResult = this.attackTarget();

          if (attackResult.success) {
            logger.info(`英雄${this.id}自动攻击成功，造成${attackResult.damage}点伤害`);
          } else {
            logger.warn(`英雄${this.id}自动攻击失败: ${attackResult.message}`);
          }
        } else {
          logger.debug(`目标${this.targetId}超出攻击范围，距离: ${distance}, 攻击范围: ${this.attackRange}`);
        }
      } else {
        // 目标不存在或已死亡，清除目标
        logger.info(`目标${this.targetId}不存在或已死亡，清除目标`);
        this.targetId = null;
      }
    }
  }

  /**
   * 死亡时触发的回调
   * @param killer 击杀者
   */
  protected override onDeath(killer?: Entity): void {
    super.onDeath(killer);

    // 英雄死亡特有逻辑
    logger.info(`英雄${this.id}死亡，击杀者: ${killer?.getId() || '未知'}`);
  }

  /**
   * 计算位置索引
   * @param position 位置坐标
   * @returns 位置索引（1-5）
   */
  private calculatePositionIndex(position: Vector2D): number {
    // 简化处理，实际应该根据游戏坐标系统计算
    // 这里假设位置是围绕中心点(1500,1500)的圆形分布

    const centerX = 1500;
    const centerY = 1500;

    // 计算与中心点的角度
    const dx = position.x - centerX;
    const dy = position.y - centerY;
    const angle = Math.atan2(dy, dx);

    // 将角度映射到位置索引（1-5）
    // 假设角度0对应位置3，顺时针增加
    const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
    const posIndex = Math.floor(normalizedAngle / (2 * Math.PI / 5)) + 1;

    return posIndex;
  }

  /**
   * 计算位置坐标
   * @param positionIndex 位置索引（1-5）
   * @returns 位置坐标
   */
  private calculatePositionCoordinates(positionIndex: number): Vector2D {
    // 简化处理，实际应该根据游戏坐标系统计算
    const centerX = 1500;
    const centerY = 1500;
    const radius = 100;

    // 计算角度（均匀分布在圆上）
    const angle = (positionIndex - 1) * (2 * Math.PI / 5);

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  /**
   * 更新等级
   */
  private updateLevel(): void {
    // 简化的等级计算公式
    // 每级所需经验 = 基础经验 * 等级
    const baseExpPerLevel = 100;

    let newLevel = this.level;
    let expRequired = baseExpPerLevel * newLevel;

    while (this.exp >= expRequired) {
      newLevel++;
      expRequired = baseExpPerLevel * newLevel;
    }

    if (newLevel > this.level) {
      const oldLevel = this.level;
      this.level = newLevel;

      // 升级时属性提升
      this.onLevelUp(oldLevel, newLevel);

      logger.info(`英雄${this.id}升级: ${oldLevel} -> ${newLevel}`);
    }
  }

  /**
   * 升级时的处理
   * @param oldLevel 旧等级
   * @param newLevel 新等级
   */
  private onLevelUp(oldLevel: number, newLevel: number): void {
    // 每级属性提升
    const hpPerLevel = 50;
    const mpPerLevel = 20;
    const attackPerLevel = 5;
    const defensePerLevel = 3;

    const levelDiff = newLevel - oldLevel;

    // 提升最大生命值和当前生命值
    const maxHp = (this.stats.maxHp || 0) + hpPerLevel * levelDiff;
    this.stats.maxHp = maxHp;
    this.stats.hp = maxHp; // 升级时恢复满血

    // 提升最大魔法值和当前魔法值
    const maxMp = (this.stats.maxMp || 0) + mpPerLevel * levelDiff;
    this.stats.maxMp = maxMp;
    this.stats.mp = maxMp; // 升级时恢复满蓝

    // 提升攻击力和防御力
    this.modifyStat('attack', attackPerLevel * levelDiff);
    this.modifyStat('defense', defensePerLevel * levelDiff);
  }

  /**
   * 设置伤害管理器
   * @param damageManager 伤害管理器
   */
  public setDamageManager(damageManager: DamageManager): void {
    this.damageManager = damageManager;
  }

  /**
   * 设置实体管理器
   * @param entityManager 实体管理器
   */
  public setEntityManager(entityManager: EntityManager): void {
    this.entityManager = entityManager;
  }

  /**
   * 获取攻击范围
   */
  public getAttackRange(): number {
    return this.attackRange;
  }

  /**
   * 设置攻击范围
   * @param range 攻击范围
   */
  public setAttackRange(range: number): void {
    this.attackRange = range;
  }

  /**
   * 获取攻击间隔
   */
  public getAttackInterval(): number {
    return this.attackInterval;
  }

  /**
   * 设置攻击间隔
   * @param interval 攻击间隔
   */
  public setAttackInterval(interval: number): void {
    this.attackInterval = interval;
  }

  /**
   * 获取目标ID
   */
  public getTargetId(): string | null {
    return this.targetId;
  }

  /**
   * 设置目标ID
   * @param targetId 目标ID
   */
  public setTargetId(targetId: string | null): void {
    this.targetId = targetId;
  }

  /**
   * 检查是否可以攻击
   * @returns 是否可以攻击
   */
  public canAttack(): boolean {
    const currentTime = Date.now();
    return currentTime - this.lastAttackTime >= this.attackInterval;
  }

  /**
   * 攻击目标
   * @param targetId 目标ID（可选，如果不提供则使用当前目标）
   * @returns 攻击结果，包含是否成功、伤害值等信息
   */
  public attackTarget(targetId?: string): { success: boolean, damage?: number, message?: string } {
    const currentTime = Date.now();

    // 检查攻击冷却
    if (currentTime - this.lastAttackTime < this.attackInterval) {
      return {
        success: false,
        message: `攻击冷却中，剩余${Math.ceil((this.attackInterval - (currentTime - this.lastAttackTime)) / 1000)}秒`
      };
    }

    // 确定目标ID
    const actualTargetId = targetId || this.targetId;
    if (!actualTargetId) {
      return { success: false, message: '没有攻击目标' };
    }

    // 检查是否有伤害管理器和实体管理器
    if (!this.damageManager || !this.entityManager) {
      return {
        success: false,
        message: !this.damageManager ? '没有伤害管理器' : '没有实体管理器'
      };
    }

    // 获取目标实体
    const targetEntity = this.entityManager.getEntity(actualTargetId);
    if (!targetEntity || !targetEntity.isAlive()) {
      return {
        success: false,
        message: !targetEntity ? '目标不存在' : '目标已死亡'
      };
    }

    // 检查目标是否在攻击范围内
    const distance = Vector2DUtils.distance(this.position, targetEntity.getPosition());
    if (distance > this.attackRange) {
      return {
        success: false,
        message: `目标超出攻击范围，当前距离: ${Math.floor(distance)}，攻击范围: ${this.attackRange}`
      };
    }

    // 更新上次攻击时间
    this.lastAttackTime = currentTime;

    // 获取攻击力
    const attackPower = this.stats.attack || 10;

    // 记录攻击日志
    logger.info(`英雄${this.id}攻击目标: ${actualTargetId}, 攻击力: ${attackPower}`);

    // 记录目标实体的当前生命值
    const targetHpBefore = targetEntity.getStat('hp');
    logger.debug(`目标${actualTargetId}当前生命值: ${targetHpBefore}`);

    // 应用伤害
    const damageResult = this.damageManager.applyDamage(
      this, // 伤害来源
      targetEntity, // 伤害目标
      attackPower, // 伤害量
      DamageType.PHYSICAL, // 伤害类型
      {
        criticalRate: 0.15, // 15%暴击率
        evadeCheck: true, // 允许闪避
        ignoreDefense: false // 不忽略防御
      }
    );

    // 记录详细的伤害结果，用于调试
    logger.debug(`伤害结果: ${JSON.stringify({
      originalAmount: damageResult.originalAmount,
      actualAmount: damageResult.actualAmount,
      isCritical: damageResult.isCritical,
      isEvaded: damageResult.isEvaded,
      isBlocked: damageResult.isBlocked
    })}`);


    // 记录目标实体的新生命值
    const targetHpAfter = targetEntity.getStat('hp');

    logger.info(`英雄${this.id}攻击目标${actualTargetId}，造成${damageResult.actualAmount}点伤害，目标生命值: ${targetHpBefore} -> ${targetHpAfter}`);

    // 检查目标是否死亡
    if (!targetEntity.isAlive()) {
      logger.info(`目标${actualTargetId}已被击杀`);
    }

    return {
      success: true,
      damage: damageResult.actualAmount
    };
  }

  /**
   * 获取实体的字符串表示
   */
  public override toString(): string {
    return `Hero[id=${this.id}, name=${this.name}, player=${this.playerId}, pos=(${this.position.x},${this.position.y}), hp=${this.stats.hp}/${this.stats.maxHp}, level=${this.level}]`;
  }
}
