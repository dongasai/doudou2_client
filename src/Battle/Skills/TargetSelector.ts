/**
 * 技能目标选择器
 * 负责根据技能配置选择合适的目标
 */

import { Entity, EntityType } from '../Entities/Entity';
import { EntityManager } from '../Core/EntityManager';
import { RandomManager } from '../Core/RandomManager';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';
import { TargetType, Skill } from './SkillTypes';

export class TargetSelector {
  private entityManager: EntityManager;
  private randomManager: RandomManager;

  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param randomManager 随机数管理器
   */
  constructor(entityManager: EntityManager, randomManager: RandomManager) {
    this.entityManager = entityManager;
    this.randomManager = randomManager;
  }

  /**
   * 选择技能目标
   * @param caster 施法者
   * @param skill 技能
   * @param targetId 目标ID（可选）
   * @param position 目标位置（可选）
   * @returns 目标列表和错误信息
   */
  public selectTargets(
    caster: Entity,
    skill: Skill,
    targetId?: string,
    position?: Vector2D
  ): { targets: Entity[], error?: string } {
    let targets: Entity[] = [];
    
    switch (skill.config.targetType) {
      case TargetType.SELF:
        targets = [caster];
        break;
        
      case TargetType.SINGLE:
        if (targetId) {
          const target = this.entityManager.getEntity(targetId);
          if (target && target.isAlive()) {
            // 检查射程
            if (skill.config.range) {
              const distance = Vector2DUtils.distance(
                caster.getPosition(),
                target.getPosition()
              );
              if (distance > skill.config.range) {
                return { targets: [], error: '目标超出射程' };
              }
            }
            targets = [target];
          } else {
            return { targets: [], error: '目标不存在或已死亡' };
          }
        } else {
          return { targets: [], error: '未指定目标' };
        }
        break;
        
      case TargetType.AREA:
        if (!position) {
          return { targets: [], error: '未指定目标位置' };
        }
        
        // 检查射程
        if (skill.config.range) {
          const distance = Vector2DUtils.distance(
            caster.getPosition(),
            position
          );
          if (distance > skill.config.range) {
            return { targets: [], error: '目标位置超出射程' };
          }
        }
        
        // 获取区域内的目标
        const areaRadius = skill.config.areaRadius || 100;
        targets = this.entityManager.getEntitiesNearby(
          position,
          areaRadius,
          EntityType.BEAN
        );
        break;
        
      case TargetType.ENEMY:
        // 获取所有敌人
        targets = this.entityManager.getEntitiesByType(EntityType.BEAN)
          .filter(entity => entity.isAlive());
        
        // 如果有射程限制，筛选在射程内的敌人
        if (skill.config.range) {
          targets = targets.filter(target => {
            const distance = Vector2DUtils.distance(
              caster.getPosition(),
              target.getPosition()
            );
            return distance <= skill.config.range;
          });
        }
        
        // 如果有最大目标数限制，随机选择
        const maxTargets = skill.config.maxTargets || targets.length;
        if (targets.length > maxTargets) {
          targets = this.randomManager.shuffle(targets).slice(0, maxTargets);
        }
        break;
        
      case TargetType.ALLY:
        // 获取所有友方单位（英雄）
        targets = this.entityManager.getEntitiesByType(EntityType.HERO)
          .filter(entity => entity.isAlive() && entity.getId() !== caster.getId());
        
        // 如果有射程限制，筛选在射程内的友方
        if (skill.config.range) {
          targets = targets.filter(target => {
            const distance = Vector2DUtils.distance(
              caster.getPosition(),
              target.getPosition()
            );
            return distance <= skill.config.range;
          });
        }
        
        // 如果有最大目标数限制，随机选择
        const maxAllies = skill.config.maxTargets || targets.length;
        if (targets.length > maxAllies) {
          targets = this.randomManager.shuffle(targets).slice(0, maxAllies);
        }
        break;
        
      case TargetType.MULTIPLE:
        // 需要指定多个目标ID，这里简化处理
        if (targetId) {
          const target = this.entityManager.getEntity(targetId);
          if (target && target.isAlive()) {
            targets = [target];
          }
        }
        break;
    }
    
    // 如果没有有效目标，返回错误
    if (targets.length === 0) {
      return { targets: [], error: '没有有效目标' };
    }
    
    return { targets };
  }
}
