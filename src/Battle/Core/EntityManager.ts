/**
 * 实体管理器
 * 负责管理战斗中的所有实体（英雄、豆豆、水晶等）
 */

import { logger } from './Logger';
import { Entity, EntityType } from '../Entities/Entity';
import { Vector2D, Vector2DUtils } from '../Types/Vector2D';

export class EntityManager {
  // 实体映射（ID -> 实体）
  private entities: Map<string, Entity> = new Map();
  // 实体类型分组
  private entityGroups: Map<EntityType, Set<string>> = new Map();
  // 实体标签分组
  private tagGroups: Map<string, Set<string>> = new Map();
  // 空间分区（用于快速查找附近实体）
  private spatialGrid: Map<string, Set<string>> = new Map();
  // 网格大小
  private gridSize: number = 100;

  /**
   * 构造函数
   * @param gridSize 空间网格大小
   */
  constructor(gridSize: number = 100) {
    this.gridSize = gridSize;
    logger.debug(`实体管理器初始化，网格大小: ${gridSize}`);
    
    // 初始化实体类型分组
    for (const type in EntityType) {
      this.entityGroups.set(EntityType[type as keyof typeof EntityType], new Set());
    }
  }

  /**
   * 添加实体
   * @param entity 实体对象
   */
  public addEntity(entity: Entity): void {
    const id = entity.getId();
    
    // 检查ID是否已存在
    if (this.entities.has(id)) {
      logger.warn(`实体ID已存在: ${id}`);
      return;
    }
    
    // 添加到实体映射
    this.entities.set(id, entity);
    
    // 添加到类型分组
    const type = entity.getType();
    if (!this.entityGroups.has(type)) {
      this.entityGroups.set(type, new Set());
    }
    this.entityGroups.get(type)!.add(id);
    
    // 添加到标签分组
    for (const tag of entity.getTags()) {
      this.addEntityToTagGroup(id, tag);
    }
    
    // 添加到空间网格
    this.updateEntityInSpatialGrid(entity);
    
    logger.debug(`添加实体: ${id}, 类型: ${type}`);
  }

  /**
   * 移除实体
   * @param id 实体ID
   */
  public removeEntity(id: string): void {
    // 检查ID是否存在
    if (!this.entities.has(id)) {
      logger.warn(`实体ID不存在: ${id}`);
      return;
    }
    
    const entity = this.entities.get(id)!;
    
    // 从类型分组中移除
    const type = entity.getType();
    if (this.entityGroups.has(type)) {
      this.entityGroups.get(type)!.delete(id);
    }
    
    // 从标签分组中移除
    for (const tag of entity.getTags()) {
      this.removeEntityFromTagGroup(id, tag);
    }
    
    // 从空间网格中移除
    this.removeEntityFromSpatialGrid(entity);
    
    // 从实体映射中移除
    this.entities.delete(id);
    
    logger.debug(`移除实体: ${id}`);
  }

  /**
   * 获取实体
   * @param id 实体ID
   */
  public getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * 获取所有实体
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * 获取指定类型的所有实体
   * @param type 实体类型
   */
  public getEntitiesByType(type: EntityType): Entity[] {
    if (!this.entityGroups.has(type)) {
      return [];
    }
    
    const ids = this.entityGroups.get(type)!;
    return Array.from(ids).map(id => this.entities.get(id)!);
  }

  /**
   * 获取指定标签的所有实体
   * @param tag 标签
   */
  public getEntitiesByTag(tag: string): Entity[] {
    if (!this.tagGroups.has(tag)) {
      return [];
    }
    
    const ids = this.tagGroups.get(tag)!;
    return Array.from(ids).map(id => this.entities.get(id)!);
  }

  /**
   * 获取指定位置附近的实体
   * @param position 中心位置
   * @param radius 半径
   * @param type 实体类型（可选）
   */
  public getEntitiesNearby(position: Vector2D, radius: number, type?: EntityType): Entity[] {
    // 获取可能包含目标的网格
    const gridIds = this.getGridsInRadius(position, radius);
    const candidateIds = new Set<string>();
    
    // 收集所有候选实体ID
    for (const gridId of gridIds) {
      if (this.spatialGrid.has(gridId)) {
        const idsInGrid = this.spatialGrid.get(gridId)!;
        for (const id of idsInGrid) {
          candidateIds.add(id);
        }
      }
    }
    
    // 过滤出在半径内的实体
    const result: Entity[] = [];
    for (const id of candidateIds) {
      const entity = this.entities.get(id)!;
      
      // 如果指定了类型，检查类型是否匹配
      if (type !== undefined && entity.getType() !== type) {
        continue;
      }
      
      // 检查距离
      const distance = Vector2DUtils.distance(position, entity.getPosition());
      if (distance <= radius) {
        result.push(entity);
      }
    }
    
    return result;
  }

  /**
   * 更新所有实体
   * @param deltaTime 时间增量（毫秒）
   * @param currentFrame 当前帧号
   */
  public updateAllEntities(deltaTime: number, currentFrame: number): void {
    for (const entity of this.entities.values()) {
      // 更新实体
      entity.update(deltaTime, currentFrame);
      
      // 更新实体在空间网格中的位置
      this.updateEntityInSpatialGrid(entity);
    }
  }

  /**
   * 清除所有实体
   */
  public clearAllEntities(): void {
    this.entities.clear();
    
    // 清除类型分组
    for (const group of this.entityGroups.values()) {
      group.clear();
    }
    
    // 清除标签分组
    this.tagGroups.clear();
    
    // 清除空间网格
    this.spatialGrid.clear();
    
    logger.debug('清除所有实体');
  }

  /**
   * 获取实体数量
   */
  public getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * 获取指定类型的实体数量
   * @param type 实体类型
   */
  public getEntityCountByType(type: EntityType): number {
    return this.entityGroups.has(type) ? this.entityGroups.get(type)!.size : 0;
  }

  /**
   * 获取指定标签的实体数量
   * @param tag 标签
   */
  public getEntityCountByTag(tag: string): number {
    return this.tagGroups.has(tag) ? this.tagGroups.get(tag)!.size : 0;
  }

  /**
   * 添加实体到标签分组
   * @param entityId 实体ID
   * @param tag 标签
   */
  private addEntityToTagGroup(entityId: string, tag: string): void {
    if (!this.tagGroups.has(tag)) {
      this.tagGroups.set(tag, new Set());
    }
    this.tagGroups.get(tag)!.add(entityId);
  }

  /**
   * 从标签分组中移除实体
   * @param entityId 实体ID
   * @param tag 标签
   */
  private removeEntityFromTagGroup(entityId: string, tag: string): void {
    if (this.tagGroups.has(tag)) {
      this.tagGroups.get(tag)!.delete(entityId);
      
      // 如果标签分组为空，删除该分组
      if (this.tagGroups.get(tag)!.size === 0) {
        this.tagGroups.delete(tag);
      }
    }
  }

  /**
   * 更新实体在空间网格中的位置
   * @param entity 实体
   */
  private updateEntityInSpatialGrid(entity: Entity): void {
    // 先从旧位置移除
    this.removeEntityFromSpatialGrid(entity);
    
    // 计算网格坐标
    const position = entity.getPosition();
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    const gridId = `${gridX},${gridY}`;
    
    // 添加到新位置
    if (!this.spatialGrid.has(gridId)) {
      this.spatialGrid.set(gridId, new Set());
    }
    this.spatialGrid.get(gridId)!.add(entity.getId());
  }

  /**
   * 从空间网格中移除实体
   * @param entity 实体
   */
  private removeEntityFromSpatialGrid(entity: Entity): void {
    const position = entity.getPosition();
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    const gridId = `${gridX},${gridY}`;
    
    if (this.spatialGrid.has(gridId)) {
      this.spatialGrid.get(gridId)!.delete(entity.getId());
      
      // 如果网格为空，删除该网格
      if (this.spatialGrid.get(gridId)!.size === 0) {
        this.spatialGrid.delete(gridId);
      }
    }
  }

  /**
   * 获取指定半径内的所有网格ID
   * @param center 中心位置
   * @param radius 半径
   */
  private getGridsInRadius(center: Vector2D, radius: number): string[] {
    const result: string[] = [];
    
    // 计算网格范围
    const minGridX = Math.floor((center.x - radius) / this.gridSize);
    const maxGridX = Math.floor((center.x + radius) / this.gridSize);
    const minGridY = Math.floor((center.y - radius) / this.gridSize);
    const maxGridY = Math.floor((center.y + radius) / this.gridSize);
    
    // 收集所有网格ID
    for (let x = minGridX; x <= maxGridX; x++) {
      for (let y = minGridY; y <= maxGridY; y++) {
        result.push(`${x},${y}`);
      }
    }
    
    return result;
  }
}
