/**
 * 实体渲染器
 * 负责战斗场景中实体的渲染和更新
 */

import Phaser from 'phaser';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { EntityCreatedEvent } from '@/Event/b2v/EntityCreated';
import { CameraController } from './CameraController';

export class EntityRenderer {
  private scene: Phaser.Scene;
  private cameraController: CameraController;

  // 实体显示对象
  private entitySprites: Map<string, Phaser.GameObjects.Sprite>;
  private entityHealthBars: Map<string, Phaser.GameObjects.Graphics>;

  // 伤害数字组
  private damageTexts: Phaser.GameObjects.Group;

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
    this.entityHealthBars = new Map();

    // 创建伤害数字组
    this.damageTexts = scene.add.group();
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

      // 创建精灵
      let sprite;

      switch (entityType) {
        case 'hero':
          // 创建英雄精灵
          sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'hero');
          if (!sprite.texture.key || sprite.texture.key === '__MISSING') {
            // 如果纹理不存在，使用文本作为后备
            sprite.destroy();
            sprite = this.scene.add.text(screenPos.x, screenPos.y, '🧙', {
              fontSize: `${heroSize}px`
            });
          }
          sprite.setOrigin(0.5);
          sprite.setScale(0.5);

          // 如果是英雄，立即聚焦摄像机
          this.cameraController.focusOnPosition(position);
          break;

        case 'bean':
          // 创建豆豆精灵
          sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'bean');
          if (!sprite.texture.key || sprite.texture.key === '__MISSING') {
            // 如果纹理不存在，使用文本作为后备
            sprite.destroy();
            sprite = this.scene.add.text(screenPos.x, screenPos.y, '🟢', {
              fontSize: `${beanSize}px`
            });
          }
          sprite.setOrigin(0.5);
          sprite.setScale(0.4);
          break;

        case 'crystal':
          // 创建水晶精灵
          sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'crystal');
          if (!sprite.texture.key || sprite.texture.key === '__MISSING') {
            // 如果纹理不存在，使用文本作为后备
            sprite.destroy();
            sprite = this.scene.add.text(screenPos.x, screenPos.y, '💎', {
              fontSize: `${heroSize}px`
            });
          }
          sprite.setOrigin(0.5);
          sprite.setScale(0.5);
          break;

        default:
          // 使用默认的豆豆精灵作为后备
          sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'bean');
          if (!sprite.texture.key || sprite.texture.key === '__MISSING') {
            // 如果纹理不存在，使用文本作为后备
            sprite.destroy();
            sprite = this.scene.add.text(screenPos.x, screenPos.y, '❓', {
              fontSize: `${beanSize}px`
            });
          }
          sprite.setOrigin(0.5);
          sprite.setScale(0.4);
          break;
      }

      // 添加到映射
      this.entitySprites.set(entityId, sprite as any);
      console.log('[INFO] 实体创建成功:', entityId);

      // 创建生命值条
      const healthBar = this.scene.add.graphics();
      this.entityHealthBars.set(entityId, healthBar);

      // 确保stats数据存在
      if (!event.stats) {
        event.stats = { hp: 100, maxHp: 100 };
      }

      // 更新生命值条
      this.updateHealthBar(entityId, event.stats.hp, event.stats.maxHp);

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

    // 更新生命值条位置
    const healthBar = this.entityHealthBars.get(entityId);
    if (healthBar) {
      healthBar.x = sprite.x;
      healthBar.y = sprite.y;
    }
  }

  /**
   * 更新生命值条
   * @param entityId 实体ID
   * @param currentHp 当前生命值
   * @param maxHp 最大生命值
   */
  public updateHealthBar(entityId: string, currentHp: number, maxHp: number): void {
    // 检查参数有效性
    if (currentHp === undefined || isNaN(currentHp)) {
      currentHp = 100;
    }

    if (maxHp === undefined || isNaN(maxHp) || maxHp <= 0) {
      maxHp = 100;
    }

    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;

    // 获取生命值条
    const healthBar = this.entityHealthBars.get(entityId);
    if (!healthBar) {
      return;
    }

    // 获取实体精灵
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
      return;
    }

    // 计算生命值比例
    const ratio = Math.max(0, Math.min(1, currentHp / maxHp));

    // 计算生命值条尺寸 (根据屏幕宽度和实体类型调整)
    let barWidth, barHeight, barOffsetY;

    // 根据实体类型调整生命值条尺寸
    if (entityId.startsWith('hero_') || entityId.startsWith('crystal_')) {
      // 英雄和水晶使用较大的生命值条
      barWidth = Math.min(50, Math.max(30, screenWidth * 0.1)); // 宽度
      barHeight = Math.min(8, Math.max(4, screenWidth * 0.015)); // 高度
      barOffsetY = Math.min(40, Math.max(25, screenWidth * 0.08)); // 上方偏移
    } else {
      // 豆豆使用较小的生命值条
      barWidth = Math.min(40, Math.max(20, screenWidth * 0.08)); // 宽度
      barHeight = Math.min(6, Math.max(3, screenWidth * 0.01)); // 高度
      barOffsetY = Math.min(30, Math.max(20, screenWidth * 0.06)); // 上方偏移
    }

    // 计算生命值条位置
    const barX = -barWidth / 2; // 水平居中

    // 更新生命值条
    healthBar.clear();

    // 绘制背景 (半透明黑色矩形)
    healthBar.fillStyle(0x000000, 0.5);
    healthBar.fillRect(barX, -barOffsetY, barWidth, barHeight);

    // 绘制生命值 (绿色矩形，宽度根据生命值比例变化)
    healthBar.fillStyle(0x00ff00);
    healthBar.fillRect(barX, -barOffsetY, barWidth * ratio, barHeight);

    // 设置位置 (跟随实体精灵)
    healthBar.x = sprite.x;
    healthBar.y = sprite.y;
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

    // 播放受击动画
    sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      sprite.clearTint();
    });
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

        // 移除生命值条
        const healthBar = this.entityHealthBars.get(entityId);
        if (healthBar) {
          healthBar.destroy();
          this.entityHealthBars.delete(entityId);
        }
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

    // 销毁所有生命值条
    for (const healthBar of this.entityHealthBars.values()) {
      healthBar.destroy();
    }
    this.entityHealthBars.clear();

    // 清除所有伤害数字
    this.damageTexts.clear(true, true);
  }
}
