/**
 * 英雄实体类
 * 表示玩家控制的英雄角色
 */

import { logger } from '../Core/Logger';
import { Entity, EntityStats, EntityType } from './Entity';
import { Vector2D } from '../Types/Vector2D';

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
    heroId: number
  ) {
    super(id, EntityType.HERO, name, position, stats, currentFrame);
    
    this.playerId = playerId;
    this.heroId = heroId;
    
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
    // ...
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
   * 获取实体的字符串表示
   */
  public override toString(): string {
    return `Hero[id=${this.id}, name=${this.name}, player=${this.playerId}, pos=(${this.position.x},${this.position.y}), hp=${this.stats.hp}/${this.stats.maxHp}, level=${this.level}]`;
  }
}
