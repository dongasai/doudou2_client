/**
 * 英雄AI
 * 负责英雄的自动行为，如自动选择目标
 */

import { Entity, EntityType } from '../Entities/Entity';
import { Hero } from '../Entities/Hero';
import { EntityManager } from '../Core/EntityManager';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';
import { logger } from '../Core/Logger';

export class HeroAI {
  private entityManager: EntityManager;

  /**
   * 构造函数
   * @param entityManager 实体管理器
   */
  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
    logger.info('英雄AI初始化完成');
  }

  /**
   * 为英雄选择最佳目标
   * @param entity 英雄实体
   * @returns 目标ID或null
   */
  public selectTargetForHero(entity: Entity): string | null {
    if (!entity) {
      logger.warn('无法为空英雄选择目标');
      return null;
    }

    // 确保实体是英雄类型
    if (entity.getType() !== EntityType.HERO) {
      logger.warn(`尝试为非英雄实体${entity.getId()}选择目标`);
      return null;
    }

    // 将实体转换为Hero类型
    const hero = entity as Hero;

    // 获取英雄位置
    const heroPosition = hero.getPosition();
    const attackRange = hero.getAttackRange();

    // 获取所有豆豆
    const beans = this.getAllBeans();
    if (beans.length === 0) {
      logger.info(`英雄${hero.getId()}没有可选择的豆豆目标`);
      return null;
    }

    // 按照距离排序
    const sortedBeans = this.sortBeansByDistance(beans, heroPosition);

    // 优先选择在攻击范围内的最近豆豆
    const inRangeBean = sortedBeans.find(bean => bean.distance <= attackRange);

    if (inRangeBean) {
      logger.info(`英雄${hero.getId()}自动选择攻击范围内的目标: ${inRangeBean.id}, 距离: ${inRangeBean.distance}`);
      return inRangeBean.id;
    }

    // 如果没有在攻击范围内的豆豆，选择最近的豆豆
    const closestBean = sortedBeans[0];
    logger.info(`英雄${hero.getId()}自动选择最近的目标: ${closestBean.id}, 距离: ${closestBean.distance}`);

    return closestBean.id;
  }

  /**
   * 获取所有存活的豆豆
   * @returns 豆豆实体数组
   */
  private getAllBeans(): Entity[] {
    // 获取所有实体
    const allEntities = this.entityManager.getAllEntities();

    // 过滤出豆豆类型的实体
    return allEntities.filter(entity => {
      return entity.getType() === EntityType.BEAN && entity.isAlive();
    });
  }

  /**
   * 按照距离排序豆豆
   * @param beans 豆豆实体数组
   * @param heroPosition 英雄位置
   * @returns 排序后的豆豆信息数组
   */
  private sortBeansByDistance(beans: Entity[], heroPosition: Vector2D): Array<{id: string, distance: number}> {
    // 计算每个豆豆到英雄的距离
    const beansWithDistance = beans.map(bean => {
      const beanPosition = bean.getPosition();
      const distance = Vector2DUtils.distance(heroPosition, beanPosition);
      return {
        id: bean.getId(),
        distance
      };
    });

    // 按距离排序（从近到远）
    return beansWithDistance.sort((a, b) => a.distance - b.distance);
  }

  /**
   * 更新英雄AI
   * @param entity 英雄实体
   */
  public update(entity: Entity): void {
    if (!entity || !entity.isAlive()) {
      return;
    }

    // 确保实体是英雄类型
    if (entity.getType() !== EntityType.HERO) {
      logger.warn(`尝试为非英雄实体${entity.getId()}更新AI`);
      return;
    }

    // 将实体转换为Hero类型
    const hero = entity as Hero;

    // 检查英雄是否有目标
    const currentTarget = hero.getTargetId();

    // 如果没有目标，选择一个新目标
    if (!currentTarget) {
      const newTarget = this.selectTargetForHero(hero);
      if (newTarget) {
        hero.setTargetId(newTarget);
        logger.info(`英雄${hero.getId()}AI设置新目标: ${newTarget}`);
      }
    } else {
      // 检查当前目标是否还存在且存活
      const targetEntity = this.entityManager.getEntity(currentTarget);
      if (!targetEntity || !targetEntity.isAlive()) {
        // 目标不存在或已死亡，清除目标并选择新目标
        hero.setTargetId(null);
        const newTarget = this.selectTargetForHero(hero);
        if (newTarget) {
          hero.setTargetId(newTarget);
          logger.info(`英雄${hero.getId()}AI更新目标: ${currentTarget} -> ${newTarget}`);
        }
      } else {
        // 目标存在且存活，检查是否在攻击范围内
        const heroPosition = hero.getPosition();
        const targetPosition = targetEntity.getPosition();
        const distance = Vector2DUtils.distance(heroPosition, targetPosition);
        const attackRange = hero.getAttackRange(); // 获取英雄的攻击范围

        // 如果目标不在攻击范围内，选择新的最近目标
        if (distance > attackRange) {
          logger.debug(`目标${currentTarget}超出攻击范围，距离: ${distance}, 攻击范围: ${attackRange}`);

          // 获取所有豆豆并按距离排序
          const beans = this.getAllBeans();
          if (beans.length > 0) {
            const sortedBeans = this.sortBeansByDistance(beans, heroPosition);

            // 找到在攻击范围内的最近豆豆
            const nearestInRange = sortedBeans.find(bean => bean.distance <= attackRange);

            if (nearestInRange && nearestInRange.id !== currentTarget) {
              // 如果找到在范围内的新目标，切换到该目标
              hero.setTargetId(nearestInRange.id);
              logger.info(`英雄${hero.getId()}切换到攻击范围内的新目标: ${currentTarget} -> ${nearestInRange.id}`);
            } else if (sortedBeans.length > 0 && sortedBeans[0].id !== currentTarget) {
              // 如果没有在范围内的目标，但有更近的目标，切换到最近的目标
              hero.setTargetId(sortedBeans[0].id);
              logger.info(`英雄${hero.getId()}切换到最近的新目标: ${currentTarget} -> ${sortedBeans[0].id}`);
            }
          }
        }
      }
    }
  }
}
