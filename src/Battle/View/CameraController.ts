/**
 * 相机控制器
 * 负责战斗场景中相机的控制和坐标转换
 */

import Phaser from 'phaser';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { DepthLayers } from '@/Constants/DepthLayers';

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
   * 聚焦主相机到指定位置
   * @param position 世界坐标位置
   * @param duration 移动持续时间（毫秒）
   */
  public focusOnPosition(position: Vector2D, duration: number = 300): void {
    // 将世界坐标转换为屏幕坐标
    const screenPos = this.worldToScreenPosition(position);

    // 设置主相机跟随目标
    // 使用平滑移动效果，让相机缓慢跟随
    this.scene.cameras.main.pan(
      screenPos.x,
      screenPos.y,
      duration,
      'Sine.easeOut'
    );

    // 注意：UI相机保持固定，不会跟随移动
    // UI元素已经设置了scrollFactor=0，确保它们不受主相机移动影响
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
   * 注册UI元素，设置它们的属性并创建专用的UI相机
   *
   * 这个方法会：
   * 1. 创建一个固定位置的UI相机，专门用于渲染UI元素
   * 2. 设置UI元素的属性，包括深度、可见性和scrollFactor
   *
   * @param elements UI元素数组
   */
  public registerUIElements(elements: Phaser.GameObjects.GameObject[]): void {
    try {
      console.log('[INFO] 开始注册UI元素，数量:', elements.length);
      this.uiElements = elements;

      // 创建专用的UI相机
      this.createUICamera();

      // 确保UI元素不受主相机移动影响
      this.fixUIElements();

      console.log('[INFO] UI元素注册完成');
    } catch (error) {
      console.error('[ERROR] 注册UI元素失败:', error);
    }
  }

  /**
   * 创建专用的UI相机，固定位置不随游戏世界移动
   *
   * 这个相机专门用于渲染UI元素，它的位置是固定的，不会随着游戏世界的移动而移动。
   * 这确保了UI元素在屏幕上的位置始终保持不变，提供一致的用户体验。
   */
  private createUICamera(): void {
    try {
      console.log('[INFO] 开始创建UI相机...');

      // 获取主相机
      const mainCamera = this.scene.cameras.main;

      // 检查是否已存在UI相机
      const existingUICamera = this.scene.cameras.getCamera('uiCamera');
      if (existingUICamera) {
        console.log('[INFO] UI相机已存在，跳过创建');
        return;
      }

      // 创建UI相机 - 这是一个额外的相机，专门用于渲染UI
      const uiCamera = this.scene.cameras.add(0, 0, mainCamera.width, mainCamera.height);
      uiCamera.setName('uiCamera');
      uiCamera.setScroll(0, 0); // UI相机不滚动

      // 不设置背景色，保持透明
      uiCamera.transparent = true;

      // 简化相机设置，不使用复杂的忽略逻辑
      // 而是通过设置UI元素的深度和scrollFactor来确保它们正确显示

      // 设置所有UI元素的深度为UI层级，确保它们显示在游戏世界之上
      for (const element of this.uiElements) {
        if (element) {
          // 设置UI层级
          if ((element as any).setDepth) {
            (element as any).setDepth(DepthLayers.UI_ELEMENT);
          }

          // 确保可见
          if ((element as any).setVisible) {
            (element as any).setVisible(true);
          }

          // 设置不透明
          if ((element as any).setAlpha) {
            (element as any).setAlpha(1);
          }
        }
      }

      console.log('[INFO] UI元素深度已设置为UI层级，确保显示在游戏世界之上');

      // 将UI相机放在最上层
      // Phaser 3不支持setZOrder，使用其他方式确保UI相机在最上层
      this.scene.cameras.cameras.forEach(camera => {
        if (camera.name === 'uiCamera') {
          // 将UI相机移到数组末尾，使其最后渲染
          this.scene.cameras.cameras.splice(this.scene.cameras.cameras.indexOf(camera), 1);
          this.scene.cameras.cameras.push(camera);
        }
      });

      console.log('[INFO] UI相机创建成功');
    } catch (error) {
      console.error('[ERROR] 创建UI相机失败:', error);
    }
  }

  /**
   * 设置UI元素的属性，确保它们在UI相机下正确显示
   *
   * 这个方法只需要在UI元素初始化时调用一次，不需要在每次相机移动后调用
   */
  private fixUIElements(): void {
    try {
      console.log('[INFO] 开始设置UI元素属性...');
      let fixedCount = 0;

      for (const element of this.uiElements) {
        if (element) {
          // 设置UI层级
          if ((element as any).setDepth) {
            (element as any).setDepth(DepthLayers.UI_ELEMENT);
          }

          // 设置scrollFactor=0，确保元素位置固定，不随相机滚动
          // 这是关键设置，使UI元素不受主相机移动影响
          if ((element as any).setScrollFactor) {
            (element as any).setScrollFactor(0);
            fixedCount++;
          }

          // 确保可见
          if ((element as any).setVisible) {
            (element as any).setVisible(true);
          }

          // 设置不透明
          if ((element as any).setAlpha) {
            (element as any).setAlpha(1);
          }
        }
      }

      console.log('[INFO] UI元素属性设置完成，成功设置', fixedCount, '个元素');
    } catch (error) {
      console.error('[ERROR] 设置UI元素属性失败:', error);
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
