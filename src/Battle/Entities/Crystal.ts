/**
 * 水晶实体类
 * 表示游戏中的核心防守目标
 */

import { logger } from '../Core/Logger';
import { Entity, EntityStats, EntityType } from './Entity';
import { Vector2D } from '../Types/Vector2D';

// 水晶状态枚举
export enum CrystalState {
  NORMAL = 'normal',       // 正常状态
  DAMAGED = 'damaged',     // 受损状态（HP < 70%）
  CRITICAL = 'critical',   // 危急状态（HP < 30%）
  DESTROYED = 'destroyed'  // 已摧毁（HP = 0）
}

export class Crystal extends Entity {
  // 当前状态
  private state: CrystalState = CrystalState.NORMAL;
  // 防御加成
  private defenseBonus: number = 0;
  // 上次受伤时间
  private lastDamageTime: number = 0;
  // 受伤冷却时间（毫秒）
  private damageCooldown: number = 1000;
  // 是否处于无敌状态
  private invulnerable: boolean = false;
  // 无敌状态持续时间
  private invulnerableDuration: number = 0;
  // 无敌状态开始时间
  private invulnerableStartTime: number = 0;

  /**
   * 构造函数
   * @param id 实体ID
   * @param name 实体名称
   * @param position 初始位置
   * @param stats 初始属性
   * @param currentFrame 当前帧号
   */
  constructor(
    id: string,
    name: string,
    position: Vector2D,
    stats: EntityStats,
    currentFrame: number
  ) {
    super(id, EntityType.CRYSTAL, name, position, stats, currentFrame);
    
    // 添加水晶标签
    this.addTag('crystal');
    
    // 更新初始状态
    this.updateState();
    
    logger.debug(`水晶创建: ${this.toString()}`);
  }

  /**
   * 获取当前状态
   */
  public getState(): CrystalState {
    return this.state;
  }

  /**
   * 获取防御加成
   */
  public getDefenseBonus(): number {
    return this.defenseBonus;
  }

  /**
   * 设置防御加成
   * @param bonus 防御加成值
   */
  public setDefenseBonus(bonus: number): void {
    this.defenseBonus = Math.max(0, bonus);
    logger.debug(`水晶${this.id}防御加成设置为${this.defenseBonus}`);
  }

  /**
   * 设置无敌状态
   * @param duration 持续时间（毫秒）
   */
  public setInvulnerable(duration: number): void {
    this.invulnerable = true;
    this.invulnerableDuration = duration;
    this.invulnerableStartTime = Date.now();
    logger.debug(`水晶${this.id}进入无敌状态，持续${duration}ms`);
  }

  /**
   * 是否处于无敌状态
   */
  public isInvulnerable(): boolean {
    return this.invulnerable;
  }

  /**
   * 对实体造成伤害
   * @param amount 伤害量
   * @param type 伤害类型
   * @param source 伤害来源
   * @returns 实际造成的伤害
   */
  public override takeDamage(amount: number, type: string, source?: Entity): number {
    // 检查无敌状态
    if (this.invulnerable) {
      logger.debug(`水晶${this.id}处于无敌状态，免疫伤害`);
      return 0;
    }
    
    // 检查伤害冷却
    const currentTime = Date.now();
    if (currentTime - this.lastDamageTime < this.damageCooldown) {
      logger.debug(`水晶${this.id}处于伤害冷却中，免疫伤害`);
      return 0;
    }
    
    // 应用防御加成
    const reducedAmount = amount * (1 - this.defenseBonus / 100);
    
    // 调用父类方法应用伤害
    const actualDamage = super.takeDamage(reducedAmount, type, source);
    
    if (actualDamage > 0) {
      // 更新上次受伤时间
      this.lastDamageTime = currentTime;
      
      // 更新状态
      this.updateState();
      
      // 触发受伤效果
      this.onDamaged(actualDamage, source);
    }
    
    return actualDamage;
  }

  /**
   * 更新实体状态
   * @param deltaTime 时间增量（毫秒）
   * @param currentFrame 当前帧号
   */
  public override update(deltaTime: number, currentFrame: number): void {
    super.update(deltaTime, currentFrame);
    
    // 检查无敌状态
    if (this.invulnerable) {
      const elapsedTime = Date.now() - this.invulnerableStartTime;
      if (elapsedTime >= this.invulnerableDuration) {
        this.invulnerable = false;
        logger.debug(`水晶${this.id}无敌状态结束`);
      }
    }
    
    // 水晶特有的更新逻辑
    // ...
  }

  /**
   * 更新水晶状态
   */
  private updateState(): void {
    const hpPercent = (this.stats.hp / this.stats.maxHp) * 100;
    let newState: CrystalState;
    
    if (this.stats.hp <= 0) {
      newState = CrystalState.DESTROYED;
    } else if (hpPercent < 30) {
      newState = CrystalState.CRITICAL;
    } else if (hpPercent < 70) {
      newState = CrystalState.DAMAGED;
    } else {
      newState = CrystalState.NORMAL;
    }
    
    if (newState !== this.state) {
      const oldState = this.state;
      this.state = newState;
      
      logger.info(`水晶${this.id}状态变更: ${oldState} -> ${newState}, HP: ${this.stats.hp}/${this.stats.maxHp} (${hpPercent.toFixed(1)}%)`);
      
      // 触发状态变更效果
      this.onStateChanged(oldState, newState);
    }
  }

  /**
   * 受伤时触发的回调
   * @param damage 伤害量
   * @param source 伤害来源
   */
  private onDamaged(damage: number, source?: Entity): void {
    logger.debug(`水晶${this.id}受到${damage}点伤害，来源: ${source?.getId() || '未知'}`);
    
    // 受伤特效和音效（实际实现中，应该触发事件）
    // ...
  }

  /**
   * 状态变更时触发的回调
   * @param oldState 旧状态
   * @param newState 新状态
   */
  private onStateChanged(oldState: CrystalState, newState: CrystalState): void {
    // 根据新状态执行不同的效果
    switch (newState) {
      case CrystalState.DAMAGED:
        // 进入受损状态
        logger.debug(`水晶${this.id}进入受损状态`);
        break;
        
      case CrystalState.CRITICAL:
        // 进入危急状态
        logger.debug(`水晶${this.id}进入危急状态`);
        break;
        
      case CrystalState.DESTROYED:
        // 水晶被摧毁
        logger.debug(`水晶${this.id}被摧毁`);
        break;
    }
    
    // 触发状态变更事件（实际实现中，应该通过事件管理器触发）
    // ...
  }

  /**
   * 死亡时触发的回调
   * @param killer 击杀者
   */
  protected override onDeath(killer?: Entity): void {
    super.onDeath(killer);
    
    // 水晶死亡特有逻辑
    logger.info(`水晶${this.id}被摧毁，击杀者: ${killer?.getId() || '未知'}`);
    
    // 触发游戏结束事件（实际实现中，应该通过事件管理器触发）
    // ...
  }

  /**
   * 获取实体的字符串表示
   */
  public override toString(): string {
    return `Crystal[id=${this.id}, state=${this.state}, pos=(${this.position.x},${this.position.y}), hp=${this.stats.hp}/${this.stats.maxHp}]`;
  }
}
