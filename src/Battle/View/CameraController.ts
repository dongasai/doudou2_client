/**
 * 相机控制器
 * 负责战斗场景中相机的控制和坐标转换
 */

import Phaser from 'phaser';
import { Vector2D } from '@/Battle/Types/Vector2D';

export class CameraController {
  private scene: Phaser.Scene;

  // 相机配置
  private zoomFactor: number = 2.0; // 默认缩放因子，值越大视角越近
  private worldCenterX: number = 1500; // 世界中心X坐标
  private worldCenterY: number = 1500; // 世界中心Y坐标
  private worldSize: number = 3000; // 世界大小

  // UI元素引用，用于确保它们不受相机移动影响
  private uiElements: Phaser.GameObjects.GameObject[] = [];

  /**
   * 构造函数
   * @param scene Phaser场景
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeCamera();
  }

  /**
   * 初始化相机设置
   */
  private initializeCamera(): void {
    try {
      // 获取主相机
      const mainCamera = this.scene.cameras.main;

      // 设置相机名称
      mainCamera.setName('battleCamera');

      // 设置相机初始缩放级别
      // 值越大，视角越近（显示的世界范围越小）
      // 根据用户反馈，相机位置太高，所以增加缩放因子
      const initialZoom = 1.5; // 使用原始缩放级别
      mainCamera.setZoom(initialZoom);

      // 设置相机背景色
      mainCamera.setBackgroundColor('#111122');

      // 设置相机淡入效果
      mainCamera.fadeIn(1000, 0, 0, 0);
    } catch (error) {
      console.error('[ERROR] 初始化相机设置失败:', error);
    }
  }

  /**
   * 世界坐标转屏幕坐标
   *
   * 坐标系统说明：
   * - 世界坐标：游戏逻辑使用的坐标系统，范围是 0-3000 (x和y方向)
   * - 屏幕坐标：实际显示在屏幕上的像素坐标，范围是 0-屏幕宽高
   *
   * @param position 世界坐标
   * @returns 屏幕坐标
   */
  public worldToScreenPosition(position: Vector2D): Vector2D {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // 计算相对于世界中心的偏移
    const offsetX = position.x - this.worldCenterX;
    const offsetY = position.y - this.worldCenterY;

    // 应用缩放并转换到屏幕坐标
    return {
      x: (screenWidth / 2) + (offsetX * screenWidth / (this.worldSize / this.zoomFactor)),
      y: (screenHeight / 2) + (offsetY * screenHeight / (this.worldSize / this.zoomFactor))
    };
  }

  /**
   * 屏幕坐标转世界坐标
   *
   * 坐标系统说明：
   * - 屏幕坐标：实际显示在屏幕上的像素坐标，范围是 0-屏幕宽高
   * - 世界坐标：游戏逻辑使用的坐标系统，范围是 0-3000 (x和y方向)
   *
   * @param screenPos 屏幕坐标
   * @returns 世界坐标
   */
  public screenToWorldPosition(screenPos: Vector2D): Vector2D {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // 计算相对于屏幕中心的偏移
    const offsetX = screenPos.x - (screenWidth / 2);
    const offsetY = screenPos.y - (screenHeight / 2);

    // 应用缩放并转换到世界坐标
    return {
      x: this.worldCenterX + (offsetX * (this.worldSize / this.zoomFactor) / screenWidth),
      y: this.worldCenterY + (offsetY * (this.worldSize / this.zoomFactor) / screenHeight)
    };
  }

  /**
   * 聚焦相机到指定位置
   * @param position 世界坐标位置
   * @param duration 移动持续时间（毫秒）
   */
  public focusOnPosition(position: Vector2D, duration: number = 300): void {
    // 将世界坐标转换为屏幕坐标
    const screenPos = this.worldToScreenPosition(position);

    // 设置相机跟随目标
    // 使用平滑移动效果，让相机缓慢跟随
    this.scene.cameras.main.pan(
      screenPos.x,
      screenPos.y,
      duration,
      'Sine.easeOut'
    );

    // 确保UI元素不受相机移动影响
    this.fixUIElements();
  }

  /**
   * 设置相机缩放级别
   * @param zoomLevel 缩放级别（1.0为原始大小，大于1.0为放大，小于1.0为缩小）
   */
  public setZoom(zoomLevel: number): void {
    try {
      // 限制缩放级别在合理范围内
      const zoom = Math.max(0.5, Math.min(3.0, zoomLevel));

      // 应用缩放
      this.scene.cameras.main.setZoom(zoom);
    } catch (error) {
      console.error('[ERROR] 设置相机缩放级别失败:', error);
    }
  }

  /**
   * 注册UI元素，确保它们不受相机移动影响
   * @param elements UI元素数组
   */
  public registerUIElements(elements: Phaser.GameObjects.GameObject[]): void {
    this.uiElements = elements;
    this.fixUIElements();
  }

  /**
   * 确保UI元素不受相机移动影响
   */
  private fixUIElements(): void {
    for (const element of this.uiElements) {
      if (element && element.setScrollFactor) {
        element.setScrollFactor(0);
      }
    }
  }

  /**
   * 获取当前缩放因子
   * @returns 缩放因子
   */
  public getZoomFactor(): number {
    return this.zoomFactor;
  }

  /**
   * 设置缩放因子
   * @param factor 缩放因子
   */
  public setZoomFactor(factor: number): void {
    this.zoomFactor = factor;
  }
}
