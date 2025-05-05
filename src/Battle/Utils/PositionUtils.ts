/**
 * 位置工具类
 * 提供位置计算相关的工具方法，确保前端和后端使用相同的逻辑
 */

import { Vector2D } from '../Types/Vector2D';
const centerX = 1500;
const centerY = 1500;
const radius = 50;
export class PositionUtils {
  /**
   * 计算英雄位置
   * @param positionIndex 位置索引（1-5）
   * @returns 坐标
   */
  public static calculateHeroPosition(positionIndex: number): Vector2D {
    // 简化处理，实际应该根据游戏坐标系统计算
 
    

    // 计算角度（均匀分布在半圆上）
    const angle = Math.PI * (0.5 + (positionIndex - 1) / 4);

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  /**
   * 计算位置坐标（围绕中心点的圆形分布）
   * @param positionIndex 位置索引（1-5）
   * @returns 位置坐标
   */
  public static calculatePositionCoordinates(positionIndex: number): Vector2D {
    // 简化处理，实际应该根据游戏坐标系统计算
 

    // 计算角度（均匀分布在圆上）
    const angle = (positionIndex - 1) * (2 * Math.PI / 5);

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  /**
   * 计算位置索引
   * @param position 位置坐标
   * @returns 位置索引（1-5）
   */
  public static calculatePositionIndex(position: Vector2D): number {
    // 简化处理，实际应该根据游戏坐标系统计算
    // 这里假设位置是围绕中心点(1500,1500)的圆形分布


    
    
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
}
