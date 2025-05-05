/**
 * 豆豆实体类
 * 表示游戏中的敌人单位
 */

import { logger } from '../Core/Logger';
import { Entity, EntityStats, EntityType } from './Entity';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';
import { DamageManager, DamageType } from '../Core/DamageManager';
import { EntityManager } from '../Core/EntityManager';

// 豆豆类型枚举
export enum BeanType {
  NORMAL = 'normal',       // 普通豆
  FAST = 'fast',           // 快速豆
  STRONG = 'strong',       // 强壮豆
  POISON = 'poison',       // 毒豆
  EXPLOSIVE = 'explosive', // 炸弹豆
  FROST = 'frost',         // 冰霜豆
  ARMORED = 'armored',     // 铁甲豆
  RAGE = 'rage',           // 狂暴豆
  BOSS = 'boss'            // BOSS豆
}

// 豆豆行为状态枚举
export enum BeanState {
  IDLE = 'idle',           // 空闲
  MOVE = 'move',           // 移动
  ATTACK = 'attack',       // 攻击
  STUNNED = 'stunned',     // 眩晕
  FROZEN = 'frozen',       // 冻结
  DEAD = 'dead'            // 死亡
}

export class Bean extends Entity {
  // 豆豆类型
  private beanType: BeanType;
  // 当前状态
  private state: BeanState = BeanState.IDLE;
  // 目标实体ID
  private targetId: string | null = null;
  // 移动速度（像素/秒）
  private moveSpeed: number;
  // 攻击范围（像素）
  private attackRange: number;
  // 攻击间隔（毫秒）
  private attackInterval: number;
  // 上次攻击时间（毫秒）
  private lastAttackTime: number = 0;
  // 状态持续时间（毫秒）
  private stateDuration: number = 0;
  // 状态开始时间（毫秒）
  private stateStartTime: number = 0;
  // 是否是特殊敌人（如BOSS）
  private isSpecial: boolean = false;
  // 生成波次索引
  private waveIndex: number = 0;
  // 目标位置
  private targetPosition: Vector2D | null = null;
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
   * @param beanType 豆豆类型
   * @param moveSpeed 移动速度
   * @param attackRange 攻击范围
   * @param attackInterval 攻击间隔
   * @param isSpecial 是否特殊敌人
   * @param waveIndex 生成波次索引
   */
  constructor(
    id: string,
    name: string,
    position: Vector2D,
    stats: EntityStats,
    currentFrame: number,
    beanType: BeanType,
    moveSpeed: number,
    attackRange: number,
    attackInterval: number,
    isSpecial: boolean = false,
    waveIndex: number = 0
  ) {
    super(id, EntityType.BEAN, name, position, stats, currentFrame);

    this.beanType = beanType;
    this.moveSpeed = moveSpeed;
    this.attackRange = attackRange;
    this.attackInterval = attackInterval;
    this.isSpecial = isSpecial;
    this.waveIndex = waveIndex;

    // 添加豆豆标签
    this.addTag('bean');
    this.addTag(`bean_${beanType}`);
    if (isSpecial) {
      this.addTag('special');
    }

    logger.debug(`豆豆创建: ${this.toString()}`);
  }

  /**
   * 获取豆豆类型
   */
  public getBeanType(): BeanType {
    return this.beanType;
  }

  /**
   * 获取当前状态
   */
  public getState(): BeanState {
    return this.state;
  }

  /**
   * 设置当前状态
   * @param state 新状态
   * @param duration 持续时间（毫秒，可选）
   */
  public setState(state: BeanState, duration?: number): void {
    this.state = state;
    this.stateStartTime = Date.now();

    if (duration !== undefined) {
      this.stateDuration = duration;
    } else {
      this.stateDuration = 0; // 无限持续
    }

    logger.debug(`豆豆${this.id}状态变更: ${state}, 持续: ${duration || '无限'}ms`);
  }

  /**
   * 获取移动速度
   */
  public getMoveSpeed(): number {
    return this.moveSpeed;
  }

  /**
   * 设置移动速度
   * @param speed 新速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = Math.max(0, speed);
  }

  /**
   * 获取攻击范围
   */
  public getAttackRange(): number {
    return this.attackRange;
  }

  /**
   * 设置攻击范围
   * @param range 新范围
   */
  public setAttackRange(range: number): void {
    this.attackRange = Math.max(0, range);
  }

  /**
   * 获取攻击间隔
   */
  public getAttackInterval(): number {
    return this.attackInterval;
  }

  /**
   * 设置攻击间隔
   * @param interval 新间隔
   */
  public setAttackInterval(interval: number): void {
    this.attackInterval = Math.max(100, interval);
  }

  /**
   * 是否是特殊敌人
   */
  public isSpecialEnemy(): boolean {
    return this.isSpecial;
  }

  /**
   * 获取生成波次索引
   */
  public getWaveIndex(): number {
    return this.waveIndex;
  }

  /**
   * 设置伤害管理器
   * @param damageManager 伤害管理器
   */
  public setDamageManager(damageManager: DamageManager): void {
    this.damageManager = damageManager;
    logger.debug(`豆豆${this.id}设置伤害管理器`);
  }

  /**
   * 设置实体管理器
   * @param entityManager 实体管理器
   */
  public setEntityManager(entityManager: EntityManager): void {
    this.entityManager = entityManager;
    logger.debug(`豆豆${this.id}设置实体管理器`);
  }

  /**
   * 设置目标实体
   * @param targetId 目标ID
   */
  public setTarget(targetId: string): void {
    this.targetId = targetId;
    this.targetPosition = null; // 清除位置目标
    logger.debug(`豆豆${this.id}设置目标: ${targetId}`);
  }

  /**
   * 获取目标ID
   */
  public getTargetId(): string | null {
    return this.targetId;
  }

  /**
   * 设置目标位置
   * @param position 目标位置
   */
  public setTargetPosition(position: Vector2D): void {
    this.targetPosition = { ...position };
    logger.debug(`豆豆${this.id}设置目标位置: (${position.x}, ${position.y})`);
  }

  /**
   * 获取目标位置
   */
  public getTargetPosition(): Vector2D | null {
    return this.targetPosition ? { ...this.targetPosition } : null;
  }

  /**
   * 更新实体状态
   * @param deltaTime 时间增量（毫秒）
   * @param currentFrame 当前帧号
   */
  public override update(deltaTime: number, currentFrame: number): void {
    super.update(deltaTime, currentFrame);

    // 如果已经死亡，不执行任何行为
    if (!this.alive) {
      return;
    }

    // 检查状态持续时间
    if (this.stateDuration > 0) {
      const elapsedTime = Date.now() - this.stateStartTime;
      if (elapsedTime >= this.stateDuration) {
        // 状态结束，恢复到空闲状态
        this.setState(BeanState.IDLE);
        logger.debug(`豆豆${this.id}状态持续时间结束，恢复到空闲状态`);
      }
    }

    // 如果处于空闲状态但有目标，切换到移动状态
    if (this.state === BeanState.IDLE && (this.targetId || this.targetPosition)) {
      this.setState(BeanState.MOVE);
      logger.debug(`豆豆${this.id}从空闲状态切换到移动状态，因为有目标`);
    }

    // 根据当前状态执行不同的行为
    switch (this.state) {
      case BeanState.IDLE:
        // 空闲状态，寻找目标
        // 实际实现中，这里应该由AI系统控制
        // 如果有水晶目标，应该切换到移动状态
        if (this.targetId && this.targetId.startsWith('crystal_')) {
          this.setState(BeanState.MOVE);
          logger.debug(`豆豆${this.id}从空闲状态切换到移动状态，目标是水晶`);
        }
        break;

      case BeanState.MOVE:
        // 移动状态，向目标移动
        this.moveToTarget(deltaTime);
        break;

      case BeanState.ATTACK:
        // 攻击状态，攻击目标
        this.attackTarget();
        break;

      case BeanState.STUNNED:
      case BeanState.FROZEN:
        // 被控制状态，无法行动
        logger.debug(`豆豆${this.id}处于控制状态: ${this.state}，无法行动`);
        break;

      case BeanState.DEAD:
        // 死亡状态，不执行任何行为
        logger.debug(`豆豆${this.id}已死亡，不执行任何行为`);
        break;
    }
  }

  /**
   * 向目标移动
   * @param deltaTime 时间增量（毫秒）
   */
  private moveToTarget(deltaTime: number): void {
    // 如果没有目标，不移动
    if (!this.targetId && !this.targetPosition) {
      logger.debug(`豆豆${this.id}没有目标，无法移动`);
      return;
    }

    // 计算目标位置
    let targetPos: Vector2D | null = null;

    if (this.targetPosition) {
      // 使用指定的目标位置
      targetPos = this.targetPosition;
      logger.debug(`豆豆${this.id}使用目标位置(${targetPos.x}, ${targetPos.y})`);
    } else if (this.targetId) {
      // 使用目标实体的位置
      // 这里简化处理，假设目标在中心点
      // 实际应该从实体管理器获取目标位置
      targetPos = { x: 1500, y: 1500 };
      logger.debug(`豆豆${this.id}使用目标ID${this.targetId}的位置(${targetPos.x}, ${targetPos.y})`);
    }

    if (!targetPos) {
      logger.debug(`豆豆${this.id}无法确定目标位置`);
      return;
    }

    // 计算方向向量
    const direction = {
      x: targetPos.x - this.position.x,
      y: targetPos.y - this.position.y
    };

    // 计算距离
    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    // 如果已经到达目标附近，切换到攻击状态
    if (distance <= this.attackRange) {
      logger.debug(`豆豆${this.id}到达攻击范围(${this.attackRange})，切换到攻击状态`);
      this.setState(BeanState.ATTACK);
      return;
    }

    // 归一化方向向量
    if (distance > 0) {
      direction.x /= distance;
      direction.y /= distance;
    }

    // 计算移动距离
    const moveDistance = this.moveSpeed * (deltaTime / 1000);

    // 更新位置
    const oldX = this.position.x;
    const oldY = this.position.y;
    this.position.x += direction.x * moveDistance;
    this.position.y += direction.y * moveDistance;

    // 记录移动日志
    logger.debug(`豆豆${this.id}移动: (${oldX.toFixed(2)}, ${oldY.toFixed(2)}) -> (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}), 距离=${moveDistance.toFixed(2)}`);

    // 更新朝向
    this.rotation = Math.atan2(direction.y, direction.x);
  }

  /**
   * 攻击目标
   */
  private attackTarget(): void {
    const currentTime = Date.now();

    // 检查攻击冷却
    if (currentTime - this.lastAttackTime < this.attackInterval) {
      // 冷却中，不能攻击
      return;
    }

    // 检查是否有目标
    if (!this.targetId && !this.targetPosition) {
      logger.warn(`豆豆${this.id}没有攻击目标，切换回移动状态`);
      this.setState(BeanState.MOVE);
      return;
    }

    // 更新上次攻击时间
    this.lastAttackTime = currentTime;

    // 获取攻击力
    const attackPower = this.stats.attack || 10;

    // 执行攻击
    if (this.targetId) {
      // 记录攻击日志
      logger.info(`豆豆${this.id}攻击目标: ${this.targetId}, 攻击力: ${attackPower}`);

      // 如果有伤害管理器和实体管理器，使用伤害管理器造成伤害
      if (this.damageManager && this.entityManager) {
        // 从实体管理器获取目标实体
        const targetEntity = this.entityManager.getEntity(this.targetId);

        if (targetEntity && targetEntity.isAlive()) {
          // 记录目标实体的当前生命值
          const targetHpBefore = targetEntity.getStat('hp');
          logger.debug(`目标${this.targetId}当前生命值: ${targetHpBefore}`);

          // 应用伤害
          const damageResult = this.damageManager.applyDamage(
            this, // 伤害来源
            targetEntity, // 伤害目标
            attackPower, // 伤害量
            DamageType.PHYSICAL, // 伤害类型
            {
              criticalRate: 0.1, // 10%暴击率
              evadeCheck: false, // 水晶不能闪避
              ignoreDefense: false // 不忽略防御
            }
          );

          // 记录目标实体的新生命值
          const targetHpAfter = targetEntity.getStat('hp');

          logger.info(`豆豆${this.id}攻击目标${this.targetId}，造成${damageResult.actualAmount}点伤害，目标生命值: ${targetHpBefore} -> ${targetHpAfter}`);

          // 检查目标是否死亡
          if (!targetEntity.isAlive()) {
            logger.info(`目标${this.targetId}已被摧毁`);
          }
        } else {
          logger.warn(`豆豆${this.id}的目标${this.targetId}不存在或已死亡`);
          // 目标不存在或已死亡，切换回移动状态
          this.setState(BeanState.MOVE);
        }
      } else {
        if (!this.damageManager) {
          logger.warn(`豆豆${this.id}没有伤害管理器，无法造成伤害`);
        }
        if (!this.entityManager) {
          logger.warn(`豆豆${this.id}没有实体管理器，无法获取目标实体`);
        }
      }
    } else if (this.targetPosition) {
      // 位置目标，无法造成伤害
      logger.info(`豆豆${this.id}攻击位置目标: (${this.targetPosition.x}, ${this.targetPosition.y}), 攻击力: ${attackPower}`);
    }

    // 攻击后可以继续移动
    this.setState(BeanState.MOVE);
    logger.debug(`豆豆${this.id}攻击完成，切换回移动状态`);
  }

  /**
   * 死亡时触发的回调
   * @param killer 击杀者
   */
  protected override onDeath(killer?: Entity): void {
    super.onDeath(killer);

    // 豆豆死亡特有逻辑
    this.setState(BeanState.DEAD);

    // 根据豆豆类型执行不同的死亡效果
    switch (this.beanType) {
      case BeanType.EXPLOSIVE:
        // 爆炸豆死亡时产生爆炸效果
        logger.debug(`爆炸豆${this.id}爆炸！`);
        break;

      case BeanType.POISON:
        // 毒豆死亡时释放毒云
        logger.debug(`毒豆${this.id}释放毒云！`);
        break;
    }

    logger.info(`豆豆${this.id}死亡，击杀者: ${killer?.getId() || '未知'}`);
  }

  /**
   * 计算实际伤害
   * @param amount 原始伤害量
   * @param type 伤害类型
   * @param source 伤害来源
   * @returns 计算后的实际伤害
   */
  protected override calculateDamage(amount: number, type: string, source?: Entity): number {
    let actualDamage = amount;

    // 根据豆豆类型应用不同的伤害计算规则
    switch (this.beanType) {
      case BeanType.ARMORED:
        // 铁甲豆减少50%伤害
        actualDamage *= 0.5;
        break;

      case BeanType.FROST:
        // 冰霜豆对火焰伤害抵抗
        if (type === 'fire') {
          actualDamage *= 0.7;
        }
        break;

      case BeanType.RAGE:
        // 狂暴豆受伤后攻击力提升
        if (this.isAlive() && actualDamage > 0) {
          this.modifyStat('attack', Math.floor(actualDamage * 0.1));
        }
        break;
    }

    return Math.max(1, Math.floor(actualDamage));
  }

  /**
   * 获取实体的字符串表示
   */
  public override toString(): string {
    return `Bean[id=${this.id}, type=${this.beanType}, state=${this.state}, pos=(${this.position.x},${this.position.y}), hp=${this.stats.hp}/${this.stats.maxHp}]`;
  }
}
