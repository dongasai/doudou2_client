/**
 * 英雄AI
 * 负责英雄的自动行为，如自动选择目标
 */

import { Entity } from '../Entities/Entity';
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
   * @param hero 英雄实体
   * @returns 目标ID或null
   */
  public selectTargetForHero(hero: Entity): string | null {
    if (!hero) {
      logger.warn('无法为空英雄选择目标');
      return null;
    }

    // 获取英雄位置
    const heroPosition = hero.getPosition();

    // 获取所有豆豆
    const beans = this.getAllBeans();
    if (beans.length === 0) {
      console.info(`英雄${hero.getId()}没有可选择的豆豆目标`);
      return null;
    }

    // 按照距离排序
    const sortedBeans = this.sortBeansByDistance(beans, heroPosition);

    // 选择最近的豆豆
    const closestBean = sortedBeans[0];
    logger.info(`英雄${hero.getId()}自动选择目标: ${closestBean.id}, 距离: ${closestBean.distance}`);

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
      return entity.getType() === 'bean' && entity.isAlive();
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
   * @param hero 英雄实体
   */
  public update(hero: Entity): void {
    if (!hero || !hero.isAlive()) {
      return;
    }

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
      }
    }
  }
}
