/**
 * 实体渲染器
 * 负责战斗场景中实体的渲染和更新
 */

import Phaser from 'phaser';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { EntityCreatedEvent } from '@/Event/b2v/EntityCreated';
import { CameraController } from './CameraController';
import { DepthLayers } from '@/Constants/DepthLayers';

export class EntityRenderer {
  private scene: Phaser.Scene;
  private cameraController: CameraController;

  // 实体显示对象
  private entitySprites: Map<string, Phaser.GameObjects.Sprite>;

  // 伤害数字组
  private damageTexts: Phaser.GameObjects.Group;

  // 屏幕外指示器管理器
  private offscreenIndicatorManager: any = null;

  // 实体表情符号映射 (实体ID -> 表情符号)
  private entityEmojis: Map<string, string> = new Map();

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param cameraController 相机控制器
   */
  constructor(scene: Phaser.Scene, cameraController: CameraController) {
    this.scene = scene;
    this.cameraController = cameraController;

    // 初始化实体显示对象
    this.entitySprites = new Map();

    // 创建伤害数字组
    this.damageTexts = scene.add.group();
  }

  /**
   * 设置屏幕外指示器管理器
   * @param manager 指示器管理器
   */
  public setOffscreenIndicatorManager(manager: any): void {
    this.offscreenIndicatorManager = manager;
  }

  /**
   * 创建实体
   * @param event 实体创建事件
   */
  public createEntity(event: EntityCreatedEvent): void {
    try {
      console.log('[INFO] 创建实体:', event.id, event.entityType);

      // 获取屏幕尺寸
      const screenWidth = this.scene.cameras.main.width;

      // 创建实体精灵
      const entityId = event.id;
      const entityType = event.entityType || 'bean'; // 使用默认类型

      // 确保位置数据存在
      if (!event.position || typeof event.position.x !== 'number' || typeof event.position.y !== 'number') {
        console.error('[ERROR] 实体位置数据无效:', event.position);
        // 使用默认位置
        event.position = { x: 1500, y: 1500 };
      }

      const position = event.position;
      console.log('[INFO] 实体位置:', position);

      // 转换为屏幕坐标
      const screenPos = this.cameraController.worldToScreenPosition(position);
      console.log('[INFO] 屏幕坐标:', screenPos);

      // 计算实体大小 (根据屏幕宽度自适应)
      const heroSize = Math.min(48, Math.max(32, screenWidth * 0.09)); // 英雄和水晶大小
      const beanSize = Math.min(32, Math.max(24, screenWidth * 0.06)); // 豆豆大小

      // 创建精灵 (直接使用Text对象显示Emoji，与原始代码保持一致)
      let sprite: Phaser.GameObjects.Text;

      switch (entityType) {
        case 'hero':
          // 使用英雄Emoji
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '🧙', {
            fontSize: `${heroSize}px`
          });
          sprite.setOrigin(0.5);
          sprite.setDepth(DepthLayers.WORLD_ENTITY);

          // 如果是英雄，立即聚焦摄像机
          this.cameraController.focusOnPosition(position);
          console.log('[INFO] 英雄创建成功:', entityId);
          break;

        case 'bean':
          // 使用豆豆Emoji
          // 直接从事件中获取emoji信息
          let beanEmoji = event.emoji || '🟢'; // 使用事件中的emoji或默认emoji
          console.log(`[INFO] 使用豆豆emoji: ${beanEmoji} 用于 ${entityId}`);

          // 保存豆豆的表情符号，用于屏幕外指示器
          this.entityEmojis.set(entityId, beanEmoji);

          // 创建豆豆精灵
          sprite = this.scene.add.text(screenPos.x, screenPos.y, beanEmoji, {
            fontSize: `${beanSize}px`
          });
          sprite.setOrigin(0.5);
          sprite.setDepth(DepthLayers.WORLD_ENTITY);
          sprite.name = entityId; // 设置名称，便于后续查找

          // 添加点击交互
          sprite.setInteractive({ useHandCursor: true });

          // 添加点击事件
          sprite.on('pointerdown', () => {
            console.log(`[INFO] 豆豆被点击: ${entityId}`);
            // 触发豆豆点击事件
            this.scene.events.emit('beanClicked', {
              beanId: entityId,
              position: position
            });
          });

          // 检查豆豆是否在屏幕内
          const isVisible = this.isEntityVisible(position);
          console.log(`[INFO] 豆豆${entityId}是否在屏幕内: ${isVisible}`);

          // 更新屏幕外指示器
          if (this.offscreenIndicatorManager) {
            this.offscreenIndicatorManager.updateIndicator(entityId, position, beanEmoji, isVisible);
          }

          console.log('[INFO] 豆豆创建成功:', entityId);
          break;

        case 'crystal':
          // 使用水晶Emoji
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '💎', {
            fontSize: `${heroSize}px`
          });
          sprite.setOrigin(0.5);
          sprite.setDepth(DepthLayers.WORLD_ENTITY);
          console.log('[INFO] 水晶创建成功:', entityId);
          break;

        default:
          // 使用默认的豆豆Emoji作为后备
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '❓', {
            fontSize: `${beanSize}px`
          });
          sprite.setOrigin(0.5);
          sprite.setDepth(DepthLayers.WORLD_ENTITY);
          console.log('[INFO] 未知实体创建成功:', entityId);
          break;
      }

      // 添加到映射
      this.entitySprites.set(entityId, sprite as any);
      console.log('[INFO] 实体添加到映射:', entityId);

      // 确保stats数据存在
      if (!event.stats) {
        event.stats = { hp: 100, maxHp: 100 };
      }

      console.log('[INFO] 实体创建完成:', entityId);

    } catch (error) {
      console.error('[ERROR] 创建实体出错:', error);
    }
  }

  /**
   * 更新实体位置
   * @param entityId 实体ID
   * @param position 世界坐标位置
   * @param animate 是否使用动画
   */
  public updateEntityPosition(entityId: string, position: Vector2D, animate: boolean = true): void {
    // 获取实体精灵
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      return;
    }

    // 转换为屏幕坐标
    const screenPos = this.cameraController.worldToScreenPosition(position);

    if (animate) {
      // 使用动画移动精灵
      this.scene.tweens.add({
        targets: sprite,
        x: screenPos.x,
        y: screenPos.y,
        duration: 100,
        ease: 'Linear'
      });
    } else {
      // 直接设置位置
      sprite.x = screenPos.x;
      sprite.y = screenPos.y;
    }

    // 如果是豆豆实体，检查是否在屏幕内并更新指示器
    if (entityId.startsWith('bean_') && this.offscreenIndicatorManager) {
      const isVisible = this.isEntityVisible(position);
      const emoji = this.entityEmojis.get(entityId) || '🟢';
      this.offscreenIndicatorManager.updateIndicator(entityId, position, emoji, isVisible);
    }
  }

  /**
   * 检查实体是否在屏幕内可见
   * @param worldPosition 实体世界坐标
   * @returns 是否在屏幕内可见
   */
  public isEntityVisible(worldPosition: Vector2D): boolean {
    // 转换为屏幕坐标
    const screenPos = this.cameraController.worldToScreenPosition(worldPosition);

    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // 添加边缘缓冲区
    const buffer = 50;

    // 检查是否在屏幕内（包含缓冲区）
    return (
      screenPos.x >= -buffer &&
      screenPos.x <= screenWidth + buffer &&
      screenPos.y >= -buffer &&
      screenPos.y <= screenHeight + buffer
    );
  }


  /**
   * 显示伤害数字
   * @param position 位置
   * @param damage 伤害值
   * @param isCritical 是否暴击
   */
  public showDamageNumber(position: Vector2D, damage: number, isCritical: boolean = false): void {
    // 创建文本
    const text = this.scene.add.text(
      position.x,
      position.y,
      damage.toString(),
      {
        fontSize: isCritical ? '32px' : '24px',
        color: isCritical ? '#ff0000' : '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    text.setOrigin(0.5);
    text.setDepth(DepthLayers.WORLD_EFFECT); // 使用效果层级，确保显示在实体和生命值条之上

    // 添加到组
    this.damageTexts.add(text);

    // 添加动画
    this.scene.tweens.add({
      targets: text,
      y: position.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * 播放实体受击动画
   * @param entityId 实体ID
   */
  public playHitAnimation(entityId: string): void {
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      return;
    }

    // 停止之前的动画（如果有）
    this.scene.tweens.killTweensOf(sprite);

    // 播放受击动画 - 红色闪烁效果
    sprite.setTint(0xff0000);

    // 添加震动效果
    const originalX = sprite.x;
    const originalY = sprite.y;

    // 创建震动动画
    this.scene.tweens.add({
      targets: sprite,
      x: { from: originalX - 5, to: originalX + 5 },
      y: { from: originalY - 2, to: originalY + 2 },
      duration: 50,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 恢复原始位置
        sprite.x = originalX;
        sprite.y = originalY;
      }
    });

    // 添加缩放效果
    this.scene.tweens.add({
      targets: sprite,
      scale: { from: 1.2, to: 1.0 },
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 清除红色着色
    this.scene.time.delayedCall(150, () => {
      sprite.clearTint();
    });

    // 如果是豆豆，添加特殊效果
    if (entityId.startsWith('bean_')) {
      // 创建闪光效果
      const flash = this.scene.add.graphics();
      flash.fillStyle(0xffffff, 0.8);
      flash.fillCircle(sprite.x, sprite.y, 30);
      flash.setDepth(DepthLayers.WORLD_EFFECT);

      // 闪光消失动画
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.5,
        duration: 200,
        onComplete: () => {
          flash.destroy();
        }
      });
    }
  }

  /**
   * 播放实体死亡动画
   * @param entityId 实体ID
   */
  public playDeathAnimation(entityId: string): void {
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      return;
    }

    // 播放死亡动画
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      y: sprite.y + 20,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        sprite.destroy();
        this.entitySprites.delete(entityId);

        // 不再处理生命值条
      }
    });
  }

  /**
   * 获取实体精灵
   * @param entityId 实体ID
   * @returns 实体精灵
   */
  public getEntitySprite(entityId: string): Phaser.GameObjects.Sprite | Phaser.GameObjects.Text | undefined {
    return this.entitySprites.get(entityId);
  }

  /**
   * 检查实体是否存在
   * @param entityId 实体ID
   * @returns 是否存在
   */
  public hasEntity(entityId: string): boolean {
    return this.entitySprites.has(entityId);
  }

  /**
   * 清除所有实体
   */
  public clearAllEntities(): void {
    // 销毁所有实体精灵
    for (const sprite of this.entitySprites.values()) {
      sprite.destroy();
    }
    this.entitySprites.clear();

    // 清除所有伤害数字
    this.damageTexts.clear(true, true);

    // 清除实体表情符号映射
    this.entityEmojis.clear();

    // 清除所有屏幕外指示器
    if (this.offscreenIndicatorManager) {
      this.offscreenIndicatorManager.clearAllIndicators();
    }
  }
}
