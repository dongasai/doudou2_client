/**
 * 屏幕外指示器管理器
 * 负责管理屏幕外实体的指示器
 */

import Phaser from 'phaser';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { CameraController } from './CameraController';
import { DepthLayers } from '@/Constants/DepthLayers';

export class OffscreenIndicatorManager {
  private scene: Phaser.Scene;
  private cameraController: CameraController;
  
  // 指示器映射 (实体ID -> 指示器对象)
  private indicators: Map<string, Phaser.GameObjects.Container> = new Map();
  
  // 边缘距离 (指示器与屏幕边缘的距离)
  private edgePadding: number = 20;
  
  /**
   * 构造函数
   * @param scene Phaser场景
   * @param cameraController 相机控制器
   */
  constructor(scene: Phaser.Scene, cameraController: CameraController) {
    this.scene = scene;
    this.cameraController = cameraController;
    
    console.log('[INFO] 屏幕外指示器管理器初始化完成');
  }
  
  /**
   * 更新指示器
   * @param entityId 实体ID
   * @param worldPosition 实体世界坐标
   * @param emoji 实体表情符号
   * @param isVisible 实体是否在屏幕内可见
   */
  public updateIndicator(entityId: string, worldPosition: Vector2D, emoji: string, isVisible: boolean): void {
    // 只处理豆豆实体
    if (!entityId.startsWith('bean_')) {
      return;
    }
    
    // 如果实体在屏幕内可见，移除指示器
    if (isVisible) {
      this.removeIndicator(entityId);
      return;
    }
    
    // 如果实体在屏幕外，创建或更新指示器
    this.createOrUpdateIndicator(entityId, worldPosition, emoji);
  }
  
  /**
   * 创建或更新指示器
   * @param entityId 实体ID
   * @param worldPosition 实体世界坐标
   * @param emoji 实体表情符号
   */
  private createOrUpdateIndicator(entityId: string, worldPosition: Vector2D, emoji: string): void {
    try {
      // 计算指示器位置
      const indicatorPosition = this.calculateIndicatorPosition(worldPosition);
      
      // 如果已存在指示器，更新位置
      if (this.indicators.has(entityId)) {
        const indicator = this.indicators.get(entityId)!;
        indicator.setPosition(indicatorPosition.x, indicatorPosition.y);
        return;
      }
      
      // 创建新指示器
      const indicator = this.createIndicator(entityId, emoji);
      indicator.setPosition(indicatorPosition.x, indicatorPosition.y);
      
      // 添加到映射
      this.indicators.set(entityId, indicator);
      
      console.log(`[INFO] 创建屏幕外指示器: ${entityId}, 位置=(${indicatorPosition.x}, ${indicatorPosition.y})`);
    } catch (error) {
      console.error(`[ERROR] 创建或更新指示器失败: ${error}`);
    }
  }
  
  /**
   * 创建指示器
   * @param entityId 实体ID
   * @param emoji 实体表情符号
   * @returns 指示器容器
   */
  private createIndicator(entityId: string, emoji: string): Phaser.GameObjects.Container {
    // 创建容器
    const container = this.scene.add.container(0, 0);
    container.setDepth(DepthLayers.UI_ELEMENT);
    
    // 创建背景
    const background = this.scene.add.circle(0, 0, 15, 0x000000, 0.6);
    container.add(background);
    
    // 创建箭头
    const arrow = this.scene.add.triangle(0, -25, 0, -10, 10, 0, -10, 0, 0xffffff);
    container.add(arrow);
    
    // 创建表情符号
    const emojiText = this.scene.add.text(0, 0, emoji || '🟢', {
      fontSize: '20px',
      fontFamily: 'Arial'
    });
    emojiText.setOrigin(0.5);
    container.add(emojiText);
    
    // 添加闪烁动画
    this.scene.tweens.add({
      targets: container,
      alpha: { from: 0.7, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    return container;
  }
  
  /**
   * 计算指示器位置
   * @param worldPosition 实体世界坐标
   * @returns 指示器屏幕坐标
   */
  private calculateIndicatorPosition(worldPosition: Vector2D): Vector2D {
    // 转换为屏幕坐标
    const screenPos = this.cameraController.worldToScreenPosition(worldPosition);
    
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // 计算方向向量 (从屏幕中心到实体)
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const dx = screenPos.x - centerX;
    const dy = screenPos.y - centerY;
    
    // 计算角度
    const angle = Math.atan2(dy, dx);
    
    // 计算屏幕边缘的交点
    // 使用参数方程: x = centerX + t*dx, y = centerY + t*dy
    // 求解t，使得点(x,y)位于屏幕边缘
    
    // 计算与屏幕边缘的交点的参数t
    let t = 1;
    
    // 与右边缘的交点
    if (dx > 0) {
      const tRight = (screenWidth - this.edgePadding - centerX) / dx;
      if (tRight < t) t = tRight;
    }
    // 与左边缘的交点
    else if (dx < 0) {
      const tLeft = (this.edgePadding - centerX) / dx;
      if (tLeft < t) t = tLeft;
    }
    
    // 与下边缘的交点
    if (dy > 0) {
      const tBottom = (screenHeight - this.edgePadding - centerY) / dy;
      if (tBottom < t) t = tBottom;
    }
    // 与上边缘的交点
    else if (dy < 0) {
      const tTop = (this.edgePadding - centerY) / dy;
      if (tTop < t) t = tTop;
    }
    
    // 计算指示器位置
    const x = centerX + t * dx;
    const y = centerY + t * dy;
    
    // 设置箭头旋转角度
    this.rotateArrows(angle);
    
    return { x, y };
  }
  
  /**
   * 旋转所有指示器的箭头
   * @param angle 角度
   */
  private rotateArrows(angle: number): void {
    for (const indicator of this.indicators.values()) {
      // 获取箭头 (第二个子元素)
      const arrow = indicator.getAt(1) as Phaser.GameObjects.Triangle;
      if (arrow) {
        arrow.setRotation(angle);
      }
    }
  }
  
  /**
   * 移除指示器
   * @param entityId 实体ID
   */
  public removeIndicator(entityId: string): void {
    if (this.indicators.has(entityId)) {
      const indicator = this.indicators.get(entityId)!;
      indicator.destroy();
      this.indicators.delete(entityId);
      
      console.log(`[INFO] 移除屏幕外指示器: ${entityId}`);
    }
  }
  
  /**
   * 清除所有指示器
   */
  public clearAllIndicators(): void {
    for (const indicator of this.indicators.values()) {
      indicator.destroy();
    }
    this.indicators.clear();
    
    console.log('[INFO] 清除所有屏幕外指示器');
  }
}
