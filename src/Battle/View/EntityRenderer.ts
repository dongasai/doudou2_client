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

  // 当前选中的实体ID
  private selectedEntityId: string | null = null;

  // 选中效果图形对象
  private selectionIndicator: Phaser.GameObjects.Graphics | null = null;

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

    // 使用世界坐标（不需要转换为屏幕坐标）

    if (animate) {
      // 使用动画移动精灵
      this.scene.tweens.add({
        targets: sprite,
        x: position.x,
        y: position.y,
        duration: 100,
        ease: 'Linear',
        onUpdate: () => {
          // 如果这个实体是当前选中的实体，更新选中效果的位置
          if (this.selectedEntityId === entityId && this.selectionIndicator) {
            this.updateSelectionIndicatorPosition(sprite);
          }
        }
      });
    } else {
      // 直接设置位置
      sprite.x = position.x;
      sprite.y = position.y;

      // 如果这个实体是当前选中的实体，更新选中效果的位置
      if (this.selectedEntityId === entityId && this.selectionIndicator) {
        this.updateSelectionIndicatorPosition(sprite);
      }
    }

    // 如果是豆豆实体，检查是否在屏幕内并更新指示器
    if (entityId.startsWith('bean_') && this.offscreenIndicatorManager) {
      const isVisible = this.isEntityVisible(position);
      const emoji = this.entityEmojis.get(entityId) || '🟢';
      this.offscreenIndicatorManager.updateIndicator(entityId, position, emoji, isVisible);
    }
  }

  /**
   * 更新选中效果的位置
   * @param sprite 目标精灵
   */
  private updateSelectionIndicatorPosition(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Text): void {
    if (!this.selectionIndicator) return;

    // 清除之前的绘制
    this.selectionIndicator.clear();

    // 重新绘制选中效果
    this.selectionIndicator.lineStyle(3, 0x8A2BE2, 0.8); // 紫色

    // 计算圆圈大小（比精灵稍大）
    const size = Math.max(sprite.width, sprite.height) * 1.3;

    // 绘制圆圈
    this.selectionIndicator.strokeCircle(sprite.x, sprite.y, size / 2);
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

    // 保存原始位置
    const originalX = sprite.x;
    const originalY = sprite.y;

    // 根据实体类型播放不同的受击动画
    if (entityId.startsWith('bean_')) {
      // ===== 豆豆受击动画 =====

      // 红色闪烁效果
      sprite.setTint(0xff0000);

      // 震动效果 - 豆豆震动幅度较大
      this.scene.tweens.add({
        targets: sprite,
        x: { from: originalX - 8, to: originalX + 8 },
        y: { from: originalY - 3, to: originalY + 3 },
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // 恢复原始位置
          sprite.x = originalX;
          sprite.y = originalY;
        }
      });

      // 缩放效果 - 豆豆被压扁再弹回
      this.scene.tweens.add({
        targets: sprite,
        scaleX: { from: 1.3, to: 1.0 },
        scaleY: { from: 0.7, to: 1.0 },
        duration: 200,
        ease: 'Elastic.easeOut'
      });

      // 闪光效果
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

      // 清除红色着色
      this.scene.time.delayedCall(150, () => {
        sprite.clearTint();
      });

    } else if (entityId.startsWith('hero_')) {
      // ===== 英雄受击动画 =====

      // 蓝色闪烁效果（区别于豆豆的红色）
      sprite.setTint(0x3366ff);

      // 震动效果 - 英雄震动幅度较小
      this.scene.tweens.add({
        targets: sprite,
        x: { from: originalX - 3, to: originalX + 3 },
        y: { from: originalY - 1, to: originalY + 1 },
        duration: 40,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // 恢复原始位置
          sprite.x = originalX;
          sprite.y = originalY;
        }
      });

      // 英雄受击时短暂变暗
      this.scene.tweens.add({
        targets: sprite,
        alpha: { from: 0.6, to: 1.0 },
        duration: 150,
        ease: 'Cubic.easeOut'
      });

      // 添加防御姿态效果（轻微后仰再回正）
      this.scene.tweens.add({
        targets: sprite,
        angle: { from: -5, to: 0 },
        duration: 200,
        ease: 'Quad.easeOut'
      });

      // 清除蓝色着色
      this.scene.time.delayedCall(120, () => {
        sprite.clearTint();
      });

      // 添加防护罩效果
      const shield = this.scene.add.graphics();
      shield.lineStyle(2, 0x00ffff, 0.8);
      shield.strokeCircle(sprite.x, sprite.y, 40);
      shield.setDepth(DepthLayers.WORLD_EFFECT);

      // 防护罩消失动画
      this.scene.tweens.add({
        targets: shield,
        alpha: 0,
        scale: 1.2,
        duration: 300,
        onComplete: () => {
          shield.destroy();
        }
      });

    } else if (entityId.startsWith('crystal_')) {
      // ===== 水晶受击动画 =====

      // 紫色闪烁效果
      sprite.setTint(0xff00ff);

      // 水晶震动效果 - 频率高但幅度小
      this.scene.tweens.add({
        targets: sprite,
        x: { from: originalX - 2, to: originalX + 2 },
        y: { from: originalY - 2, to: originalY + 2 },
        duration: 30,
        yoyo: true,
        repeat: 5,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // 恢复原始位置
          sprite.x = originalX;
          sprite.y = originalY;
        }
      });

      // 水晶受击时发光效果
      this.scene.tweens.add({
        targets: sprite,
        alpha: { from: 1.5, to: 1.0 }, // 超过1的alpha会产生过曝效果
        duration: 300,
        ease: 'Expo.easeOut'
      });

      // 清除紫色着色
      this.scene.time.delayedCall(200, () => {
        sprite.clearTint();
      });

      // 添加能量波纹效果
      for (let i = 0; i < 2; i++) {
        const ring = this.scene.add.graphics();
        ring.lineStyle(3 - i, 0xff00ff, 0.7 - i * 0.3);
        ring.strokeCircle(sprite.x, sprite.y, 30 + i * 20);
        ring.setDepth(DepthLayers.WORLD_EFFECT);

        // 波纹扩散动画
        this.scene.tweens.add({
          targets: ring,
          alpha: 0,
          scale: 1.5 + i * 0.5,
          duration: 400 + i * 200,
          delay: i * 100,
          onComplete: () => {
            ring.destroy();
          }
        });
      }

      // 添加碎片效果
      for (let i = 0; i < 5; i++) {
        const shard = this.scene.add.graphics();
        shard.fillStyle(0xff00ff, 0.7);
        shard.fillTriangle(0, 0, 5, 10, 10, 0);
        shard.setPosition(sprite.x, sprite.y);
        shard.setDepth(DepthLayers.WORLD_EFFECT);

        // 随机角度
        shard.rotation = Math.random() * Math.PI * 2;

        // 碎片飞散动画
        this.scene.tweens.add({
          targets: shard,
          x: sprite.x + Math.cos(shard.rotation) * 50,
          y: sprite.y + Math.sin(shard.rotation) * 50,
          alpha: 0,
          duration: 300,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            shard.destroy();
          }
        });
      }

    } else {
      // ===== 默认受击动画（用于其他类型实体）=====

      // 红色闪烁效果
      sprite.setTint(0xff0000);

      // 基础震动效果
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

      // 基础缩放效果
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
    }
  }

  /**
   * 播放实体死亡动画
   * @param entityId 实体ID
   */
  public playDeathAnimation(entityId: string): void {
    console.log(`[INFO] 播放实体${entityId}的死亡动画`);

    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      console.warn(`[WARN] 找不到实体${entityId}的精灵，无法播放死亡动画`);
      return;
    }

    console.log(`[INFO] 找到实体${entityId}的精灵，开始播放死亡动画`);

    // 如果死亡的实体是当前选中的实体，清除选中效果
    if (this.selectedEntityId === entityId) {
      console.log(`[INFO] 死亡的实体${entityId}是当前选中的实体，清除选中效果`);
      this.setSelectedEntity(null);
    }

    // 根据实体类型播放不同的死亡动画
    if (entityId.startsWith('bean_')) {
      // ===== 豆豆死亡动画 =====

      // 创建爆炸效果
      const explosion = this.scene.add.graphics();
      explosion.fillStyle(0xffff00, 0.7);
      explosion.fillCircle(sprite.x, sprite.y, 30);
      explosion.setDepth(DepthLayers.WORLD_EFFECT);

      // 爆炸效果动画
      this.scene.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 2,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          explosion.destroy();
        }
      });

      // 创建碎片效果
      for (let i = 0; i < 8; i++) {
        const particle = this.scene.add.graphics();
        particle.fillStyle(0xffff00, 0.6);
        particle.fillCircle(0, 0, 5);
        particle.setPosition(sprite.x, sprite.y);
        particle.setDepth(DepthLayers.WORLD_EFFECT);

        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;

        // 粒子飞散动画
        this.scene.tweens.add({
          targets: particle,
          x: sprite.x + Math.cos(angle) * distance,
          y: sprite.y + Math.sin(angle) * distance,
          alpha: 0,
          scale: 0.5,
          duration: 400 + Math.random() * 200,
          ease: 'Power2',
          onComplete: () => {
            particle.destroy();
          }
        });
      }

      // 主精灵淡出动画
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scale: 1.5,
        y: sprite.y - 20, // 向上飘一点
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          console.log(`[INFO] 实体${entityId}的死亡动画完成，销毁精灵`);
          sprite.destroy();
          this.entitySprites.delete(entityId);

          // 移除屏幕外指示器（如果有）
          if (this.offscreenIndicatorManager) {
            this.offscreenIndicatorManager.removeIndicator(entityId);
          }
        }
      });

    } else {
      // ===== 默认死亡动画（用于其他类型实体）=====

      // 播放死亡动画
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        y: sprite.y + 20,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          console.log(`[INFO] 实体${entityId}的死亡动画完成，销毁精灵`);
          sprite.destroy();
          this.entitySprites.delete(entityId);

          // 移除屏幕外指示器（如果有）
          if (this.offscreenIndicatorManager) {
            this.offscreenIndicatorManager.removeIndicator(entityId);
          }
        }
      });
    }
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
   * 设置选中的实体
   * @param entityId 实体ID
   */
  public setSelectedEntity(entityId: string | null): void {
    console.log(`[INFO] 设置选中实体: ${entityId}`);

    // 如果当前已有选中的实体，先清除选中效果
    if (this.selectedEntityId) {
      this.clearSelectionIndicator();
    }

    // 更新选中的实体ID
    this.selectedEntityId = entityId;

    // 如果传入的实体ID为null，则只清除选中效果
    if (!entityId) {
      return;
    }

    // 获取实体精灵
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      console.warn(`[WARN] 找不到实体${entityId}的精灵，无法显示选中效果`);
      return;
    }

    // 创建选中效果
    this.showSelectionIndicator(sprite);
  }

  /**
   * 显示选中效果
   * @param sprite 目标精灵
   */
  private showSelectionIndicator(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Text): void {
    // 清除之前的选中效果
    this.clearSelectionIndicator();

    // 创建新的选中效果
    this.selectionIndicator = this.scene.add.graphics();

    // 设置紫色外圈
    this.selectionIndicator.lineStyle(3, 0x8A2BE2, 0.8); // 紫色

    // 计算圆圈大小（比精灵稍大）
    const size = Math.max(sprite.width, sprite.height) * 1.3;

    // 绘制圆圈
    this.selectionIndicator.strokeCircle(sprite.x, sprite.y, size / 2);

    // 设置深度，确保显示在实体下方
    this.selectionIndicator.setDepth(DepthLayers.WORLD_ENTITY - 1);

    // 添加脉动动画效果
    // this.scene.tweens.add({
    //   targets: this.selectionIndicator,
    //   alpha: { from: 0.9, to: 0.5 },
    //   scale: { from: 0.95, to: 1.05 },
    //   duration: 800,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'Sine.easeInOut'
    // });

    console.log(`[INFO] 显示选中效果: 位置(${sprite.x}, ${sprite.y}), 大小${size}`);
  }

  /**
   * 清除选中效果
   */
  private clearSelectionIndicator(): void {
    if (this.selectionIndicator) {
      this.selectionIndicator.destroy();
      this.selectionIndicator = null;
      console.log(`[INFO] 清除选中效果`);
    }
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
