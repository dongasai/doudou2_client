/**
 * 技能效果视图
 * 负责处理技能视觉效果的渲染
 */

import Phaser from 'phaser';
import { SkillType, EffectType } from '../Skills/SkillTypes';
import { getSkillVisualConfig, getEffectTypeVisualConfig, SkillVisualEffect } from './SkillVisualConfig';
import { Vector2D } from '../Types/Vector2D';

export class SkillEffectView {
  private scene: Phaser.Scene;
  private effectsGroup: Phaser.GameObjects.Group;

  /**
   * 构造函数
   * @param scene Phaser场景
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.effectsGroup = scene.add.group();
  }

  /**
   * 播放技能效果
   * @param skillId 技能ID
   * @param sourcePosition 源位置
   * @param targetPosition 目标位置
   * @param onComplete 完成回调
   */
  public playSkillEffect(
    skillId: string,
    sourcePosition: Vector2D,
    targetPosition: Vector2D,
    onComplete?: () => void
  ): void {
    // 获取技能视觉配置
    const config = getSkillVisualConfig(skillId);
    if (!config) {
      console.warn(`未找到技能视觉配置: ${skillId}`);
      return;
    }

    const visualEffect = config.visualEffect;

    // 根据技能类型选择不同的效果
    switch (visualEffect.type) {
      case SkillType.DAMAGE:
        this.playDamageEffect(visualEffect, sourcePosition, targetPosition, onComplete);
        break;

      case SkillType.HEAL:
        this.playHealEffect(visualEffect, sourcePosition, targetPosition, onComplete);
        break;

      case SkillType.BUFF:
      case SkillType.DEBUFF:
        this.playBuffEffect(visualEffect, targetPosition, onComplete);
        break;

      case SkillType.CONTROL:
        this.playControlEffect(visualEffect, targetPosition, onComplete);
        break;

      default:
        this.playGenericEffect(visualEffect, sourcePosition, targetPosition, onComplete);
        break;
    }
  }

  /**
   * 播放效果动画
   * @param effectType 效果类型
   * @param position 位置
   * @param onComplete 完成回调
   */
  public playEffectAnimation(
    effectType: EffectType,
    position: Vector2D,
    onComplete?: () => void
  ): void {
    // 获取效果类型视觉配置
    const config = getEffectTypeVisualConfig(effectType);
    if (!config) {
      return;
    }

    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(position.x, position.y, config.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置颜色
    if (config.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(config.color).color);
    }

    // 添加粒子效果
    if (config.particleEmoji) {
      this.createParticleEffect(config.particleEmoji, position);
    }

    // 添加动画效果
    this.scene.tweens.add({
      targets: text,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 播放伤害效果
   * @param visualEffect 视觉效果配置
   * @param sourcePosition 源位置
   * @param targetPosition 目标位置
   * @param onComplete 完成回调
   */
  private playDamageEffect(
    visualEffect: SkillVisualEffect,
    sourcePosition: Vector2D,
    targetPosition: Vector2D,
    onComplete?: () => void
  ): void {
    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(sourcePosition.x, sourcePosition.y, visualEffect.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置属性
    text.setScale(visualEffect.scale || 1);
    if (visualEffect.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }
    if (visualEffect.alpha !== undefined) {
      text.setAlpha(visualEffect.alpha);
    }

    // 添加粒子效果
    if (visualEffect.particleEmoji) {
      this.createParticleEffect(visualEffect.particleEmoji, sourcePosition, targetPosition);
    }

    // 移动到目标位置
    const distance = Phaser.Math.Distance.Between(
      sourcePosition.x, sourcePosition.y,
      targetPosition.x, targetPosition.y
    );

    const duration = visualEffect.travelSpeed ?
      distance / visualEffect.travelSpeed * 1000 :
      visualEffect.duration;

    this.scene.tweens.add({
      targets: text,
      x: targetPosition.x,
      y: targetPosition.y,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        // 创建命中效果
        this.createHitEffect(visualEffect, targetPosition);

        // 销毁文本
        text.destroy();

        if (onComplete) {
          onComplete();
        }
      }
    });

    // 如果有旋转速度，添加旋转动画
    if (visualEffect.rotationSpeed) {
      this.scene.tweens.add({
        targets: text,
        rotation: Math.PI * 2 * visualEffect.rotationSpeed,
        duration: duration,
        ease: 'Linear'
      });
    }
  }

  /**
   * 播放治疗效果
   * @param visualEffect 视觉效果配置
   * @param sourcePosition 源位置
   * @param targetPosition 目标位置
   * @param onComplete 完成回调
   */
  private playHealEffect(
    visualEffect: SkillVisualEffect,
    sourcePosition: Vector2D,
    targetPosition: Vector2D,
    onComplete?: () => void
  ): void {
    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(targetPosition.x, targetPosition.y, visualEffect.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置属性
    text.setScale(0.1);
    if (visualEffect.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }
    if (visualEffect.alpha !== undefined) {
      text.setAlpha(visualEffect.alpha);
    }

    // 添加粒子效果
    if (visualEffect.particleEmoji) {
      this.createParticleEffect(visualEffect.particleEmoji, targetPosition);
    }

    // 添加缩放动画
    this.scene.tweens.add({
      targets: text,
      scale: visualEffect.scale || 1,
      alpha: 0,
      duration: visualEffect.duration,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 播放增益/减益效果
   * @param visualEffect 视觉效果配置
   * @param position 位置
   * @param onComplete 完成回调
   */
  private playBuffEffect(
    visualEffect: SkillVisualEffect,
    position: Vector2D,
    onComplete?: () => void
  ): void {
    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(position.x, position.y, visualEffect.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置属性
    text.setScale(0.1);
    if (visualEffect.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }
    if (visualEffect.alpha !== undefined) {
      text.setAlpha(visualEffect.alpha);
    }

    // 添加粒子效果
    if (visualEffect.particleEmoji) {
      this.createParticleEffect(visualEffect.particleEmoji, position);
    }

    // 添加缩放和旋转动画
    this.scene.tweens.add({
      targets: text,
      scale: visualEffect.scale || 1,
      rotation: Math.PI * 2,
      alpha: { from: 1, to: 0 },
      duration: visualEffect.duration,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 播放控制效果
   * @param visualEffect 视觉效果配置
   * @param position 位置
   * @param onComplete 完成回调
   */
  private playControlEffect(
    visualEffect: SkillVisualEffect,
    position: Vector2D,
    onComplete?: () => void
  ): void {
    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(position.x, position.y, visualEffect.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置属性
    text.setScale(visualEffect.scale || 1);
    if (visualEffect.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }
    if (visualEffect.alpha !== undefined) {
      text.setAlpha(visualEffect.alpha);
    }

    // 添加粒子效果
    if (visualEffect.particleEmoji) {
      this.createParticleEffect(visualEffect.particleEmoji, position);
    }

    // 添加动画
    this.scene.tweens.add({
      targets: text,
      y: position.y - 20,
      alpha: 0,
      duration: visualEffect.duration,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 播放通用效果
   * @param visualEffect 视觉效果配置
   * @param sourcePosition 源位置
   * @param targetPosition 目标位置
   * @param onComplete 完成回调
   */
  private playGenericEffect(
    visualEffect: SkillVisualEffect,
    sourcePosition: Vector2D,
    targetPosition: Vector2D,
    onComplete?: () => void
  ): void {
    // 创建效果文本（使用Emoji）
    const text = this.scene.add.text(sourcePosition.x, sourcePosition.y, visualEffect.emoji, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });
    text.setOrigin(0.5);
    this.effectsGroup.add(text);

    // 设置属性
    text.setScale(visualEffect.scale || 1);
    if (visualEffect.color) {
      text.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }
    if (visualEffect.alpha !== undefined) {
      text.setAlpha(visualEffect.alpha);
    }

    // 添加粒子效果
    if (visualEffect.particleEmoji) {
      this.createParticleEffect(visualEffect.particleEmoji, sourcePosition, targetPosition);
    }

    // 添加动画
    this.scene.tweens.add({
      targets: text,
      x: targetPosition.x,
      y: targetPosition.y,
      duration: visualEffect.duration,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  /**
   * 创建命中效果
   * @param visualEffect 视觉效果配置
   * @param position 位置
   */
  private createHitEffect(visualEffect: SkillVisualEffect, position: Vector2D): void {
    // 创建命中效果文本（使用Emoji）
    const hitText = this.scene.add.text(position.x, position.y, visualEffect.hitEmoji || visualEffect.emoji, {
      fontSize: '40px',
      fontFamily: 'Arial, sans-serif'
    });
    hitText.setOrigin(0.5);
    this.effectsGroup.add(hitText);

    // 设置属性
    hitText.setScale(0.1);
    if (visualEffect.color) {
      hitText.setTint(Phaser.Display.Color.HexStringToColor(visualEffect.color).color);
    }

    // 添加缩放动画
    this.scene.tweens.add({
      targets: hitText,
      scale: visualEffect.scale || 1,
      alpha: 0,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        hitText.destroy();
      }
    });

    // 添加屏幕震动效果
    this.scene.cameras.main.shake(100, 0.01);
  }

  /**
   * 创建粒子效果
   * @param particleEmoji 粒子效果Emoji
   * @param position 位置
   * @param targetPosition 目标位置（可选）
   */
  private createParticleEffect(
    particleEmoji: string,
    position: Vector2D,
    targetPosition?: Vector2D
  ): void {
    // 创建多个粒子（使用Emoji文本）
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.text(position.x, position.y, particleEmoji, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif'
      });
      particle.setOrigin(0.5);
      this.effectsGroup.add(particle);

      // 随机方向和速度
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(20, 100);
      const distance = Phaser.Math.Between(30, 80);

      // 计算目标位置
      const targetX = position.x + Math.cos(angle * Math.PI / 180) * distance;
      const targetY = position.y + Math.sin(angle * Math.PI / 180) * distance;

      // 添加动画
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        scale: { from: 0.5, to: 0 },
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(300, 800),
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 如果有目标位置，创建定向粒子
    if (targetPosition) {
      // 计算方向
      const angle = Phaser.Math.Angle.Between(
        position.x, position.y,
        targetPosition.x, targetPosition.y
      );

      // 创建定向粒子
      for (let i = 0; i < 5; i++) {
        const particle = this.scene.add.text(position.x, position.y, particleEmoji, {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        });
        particle.setOrigin(0.5);
        this.effectsGroup.add(particle);

        // 计算路径点
        const pathX = position.x + Math.cos(angle) * (targetPosition.x - position.x) * (i + 1) / 5;
        const pathY = position.y + Math.sin(angle) * (targetPosition.y - position.y) * (i + 1) / 5;

        // 添加动画
        this.scene.tweens.add({
          targets: particle,
          x: pathX,
          y: pathY,
          scale: { from: 0.8, to: 0 },
          alpha: { from: 1, to: 0 },
          duration: 500,
          ease: 'Linear',
          delay: i * 100,
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
  }



  /**
   * 清除所有效果
   */
  public clearAllEffects(): void {
    this.effectsGroup.clear(true, true);
  }
}
