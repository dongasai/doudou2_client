/**
 * 战斗实体基类
 * 所有战斗中的实体（英雄、豆豆、水晶等）都继承自此类
 */

import { logger } from '../Core/Logger';
import { Vector2D } from '../Types/Vector2D';

export enum EntityType {
  HERO = 'hero',
  BEAN = 'bean',
  CRYSTAL = 'crystal',
  ITEM = 'item',
  PROJECTILE = 'projectile'
}

export interface EntityStats {
  hp: number;
  maxHp: number;
  mp?: number;
  maxMp?: number;
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  [key: string]: number | undefined;
}

export abstract class Entity {
  /** 实体唯一ID */
  protected id: string;
  /** 实体类型 */
  protected type: EntityType;
  /** 实体名称 */
  protected name: string;
  /** 实体位置 */
  protected position: Vector2D;
  /** 实体朝向（弧度） */
  protected rotation: number = 0;
  /** 实体状态 */
  protected stats: EntityStats;
  /** 是否存活 */
  protected alive: boolean = true;
  /** 实体标签（用于分组和筛选） */
  protected tags: Set<string> = new Set();
  /** 实体创建时间（帧号） */
  protected createdAt: number;
  /** 实体最后更新时间（帧号） */
  protected lastUpdatedAt: number;

  /**
   * 构造函数
   * @param id 实体唯一ID
   * @param type 实体类型
   * @param name 实体名称
   * @param position 初始位置
   * @param stats 初始属性
   * @param currentFrame 当前帧号
   */
  constructor(
    id: string,
    type: EntityType,
    name: string,
    position: Vector2D,
    stats: EntityStats,
    currentFrame: number
  ) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.position = { ...position };
    this.stats = { ...stats };
    this.createdAt = currentFrame;
    this.lastUpdatedAt = currentFrame;

    logger.debug(`实体创建: ${this.toString()}`);
  }

  /**
   * 获取实体ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * 获取实体类型
   */
  public getType(): EntityType {
    return this.type;
  }

  /**
   * 获取实体名称
   */
  public getName(): string {
    return this.name;
  }

  /**
   * 获取实体位置
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * 设置实体位置
   * @param position 新位置
   */
  public setPosition(position: Vector2D): void {
    this.position = { ...position };
  }

  /**
   * 获取实体朝向
   */
  public getRotation(): number {
    return this.rotation;
  }

  /**
   * 设置实体朝向
   * @param rotation 新朝向（弧度）
   */
  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  /**
   * 获取实体属性
   */
  public getStats(): EntityStats {
    return { ...this.stats };
  }

  /**
   * 获取特定属性值
   * @param key 属性名
   */
  public getStat(key: keyof EntityStats): number | undefined {
    return this.stats[key];
  }

  /**
   * 设置特定属性值
   * @param key 属性名
   * @param value 属性值
   */
  public setStat(key: keyof EntityStats, value: number): void {
    this.stats[key] = value;
  }

  /**
   * 修改特定属性值（增加或减少）
   * @param key 属性名
   * @param delta 变化量
   */
  public modifyStat(key: keyof EntityStats, delta: number): void {
    const currentValue = this.stats[key];
    if (currentValue !== undefined) {
      this.stats[key] = currentValue + delta;
    } else {
      this.stats[key] = delta;
    }
  }

  /**
   * 检查实体是否存活
   */
  public isAlive(): boolean {
    return this.alive;
  }

  /**
   * 设置实体存活状态
   * @param alive 是否存活
   */
  public setAlive(alive: boolean): void {
    this.alive = alive;
  }

  /**
   * 对实体造成伤害
   * @param amount 伤害量
   * @param type 伤害类型
   * @param source 伤害来源
   * @returns 实际造成的伤害
   */
  public takeDamage(amount: number, type: string, source?: Entity): number {
    if (!this.alive || amount <= 0) {
      logger.debug(`实体${this.id}无法受到伤害: 存活=${this.alive}, 伤害量=${amount}`);
      return 0;
    }

    // 计算实际伤害（可被子类重写以实现不同的伤害计算逻辑）
    const actualDamage = this.calculateDamage(amount, type, source);

    // 记录当前生命值
    const currentHp = this.stats.hp;
    logger.debug(`实体${this.id}受到伤害前生命值: ${currentHp}/${this.stats.maxHp}`);

    // 应用伤害
    this.stats.hp = Math.max(0, currentHp - actualDamage);

    // 记录新生命值
    const newHp = this.stats.hp;

    // 添加详细的info日志，记录实体受到伤害的情况
    if (this.type === EntityType.BEAN) {
      logger.info(`豆豆${this.id}受到${actualDamage}点${damageType}伤害，生命值: ${currentHp} -> ${newHp}，来源: ${source?.getId() || '未知'}`);
    } else {
      logger.debug(`实体${this.id}受到${actualDamage}点伤害，生命值: ${currentHp} -> ${newHp}`);
    }

    // 检查是否死亡
    if (this.stats.hp <= 0) {
      this.alive = false;
      this.onDeath(source);
      logger.info(`实体${this.id}死亡，击杀者: ${source?.getId() || '未知'}`);
    }

    return actualDamage;
  }

  /**
   * 计算实际伤害
   * @param amount 原始伤害量
   * @param type 伤害类型
   * @param source 伤害来源
   * @returns 计算后的实际伤害
   */
  protected calculateDamage(amount: number, type: string, source?: Entity): number {
    // 基础实现，子类可重写
    return amount;
  }

  /**
   * 死亡时触发的回调
   * @param killer 击杀者
   */
  protected onDeath(killer?: Entity): void {
    // 基础实现，子类可重写
    logger.info(`实体死亡: ${this.toString()}`);
  }

  /**
   * 添加标签
   * @param tag 标签
   */
  public addTag(tag: string): void {
    this.tags.add(tag);
  }

  /**
   * 移除标签
   * @param tag 标签
   */
  public removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  /**
   * 检查是否有特定标签
   * @param tag 标签
   */
  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * 获取所有标签
   */
  public getTags(): string[] {
    return Array.from(this.tags);
  }

  /**
   * 更新实体状态
   * @param deltaTime 时间增量（毫秒）
   * @param currentFrame 当前帧号
   */
  public update(deltaTime: number, currentFrame: number): void {
    this.lastUpdatedAt = currentFrame;
    // 基础实现，子类应重写此方法
  }

  /**
   * 获取实体的字符串表示
   */
  public toString(): string {
    return `Entity[id=${this.id}, type=${this.type}, name=${this.name}, pos=(${this.position.x},${this.position.y}), hp=${this.stats.hp}/${this.stats.maxHp}]`;
  }

  /**
   * 获取实体的JSON表示
   */
  public toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      position: this.position,
      rotation: this.rotation,
      stats: this.stats,
      alive: this.alive,
      tags: Array.from(this.tags),
      createdAt: this.createdAt,
      lastUpdatedAt: this.lastUpdatedAt
    };
  }
}
