/**
 * 技能UI组件
 * 负责显示技能图标、冷却时间和描述等信息
 */

import Phaser from 'phaser';
import { getSkillVisualConfig, SkillUIConfig } from '@/Battle/View/SkillVisualConfig';

export class SkillUIComponent {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Arc;
  private icon: Phaser.GameObjects.Text;
  private cooldownOverlay: Phaser.GameObjects.Graphics;
  private cooldownText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private tooltip: Phaser.GameObjects.Container;

  private skillId: string;
  private uiConfig: SkillUIConfig;
  private currentCooldown: number = 0;
  private maxCooldown: number = 0;
  private isAvailable: boolean = true;
  private isSelected: boolean = false;

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param x X坐标
   * @param y Y坐标
   * @param skillId 技能ID
   * @param customSize 自定义按钮大小（可选）
   */
  constructor(scene: Phaser.Scene, x: number, y: number, skillId: string, customSize?: number) {
    this.scene = scene;
    this.skillId = skillId;

    // 获取技能UI配置
    const config = getSkillVisualConfig(skillId);
    if (!config) {
      console.warn(`未找到技能UI配置: ${skillId}，使用默认配置`);
      // 使用默认配置
      this.uiConfig = {
        id: skillId,
        name: `技能${skillId.replace('skill_', '')}`,
        description: '技能描述',
        emoji: '⚡',
        cooldown: 5,
        cost: 30,
        type: 'damage',
        color: '#ffffff',
        borderColor: '#aaaaaa'
      };
    } else {
      this.uiConfig = config.uiConfig;
    }

    this.maxCooldown = this.uiConfig.cooldown * 1000; // 转换为毫秒

    // 创建容器
    this.container = scene.add.container(x, y);

    // 计算按钮大小（根据屏幕宽度调整或使用自定义大小）
    const buttonSize = customSize || Math.min(35, scene.cameras.main.width / 12);

    // 创建背景（使用圆形图形）
    this.background = scene.add.circle(0, 0, buttonSize, 0x333333, 0.8);
    this.background.setStrokeStyle(2, 0xffffff);
    this.container.add(this.background);

    // 创建图标（使用Emoji文本）
    this.icon = scene.add.text(0, 0, this.uiConfig.emoji, {
      fontSize: `${Math.floor(buttonSize * 1.1)}px`,
      fontFamily: 'Arial, sans-serif'
    });
    this.icon.setOrigin(0.5);
    this.container.add(this.icon);

    // 创建冷却遮罩
    this.cooldownOverlay = scene.add.graphics();
    this.container.add(this.cooldownOverlay);

    // 获取按钮大小
    const buttonRadius = (this.background as Phaser.GameObjects.Arc).radius;

    // 创建冷却文本
    this.cooldownText = scene.add.text(0, 0, '', {
      fontSize: `${Math.floor(buttonRadius * 0.8)}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.cooldownText.setOrigin(0.5);
    this.cooldownText.setVisible(false);
    this.container.add(this.cooldownText);

    // 创建消耗文本
    this.costText = scene.add.text(buttonRadius / 2, buttonRadius / 2, this.uiConfig.cost.toString(), {
      fontSize: `${Math.floor(buttonRadius * 0.5)}px`,
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.costText.setOrigin(1, 1);
    this.container.add(this.costText);

    // 创建提示框
    this.createTooltip();

    // 设置交互
    this.background.setInteractive();
    this.setupInteractions();

    // 应用自定义样式
    this.applyCustomStyle();
  }

  /**
   * 创建提示框
   */
  private createTooltip(): void {
    // 获取按钮大小
    const buttonRadius = (this.background as Phaser.GameObjects.Arc).radius;

    // 创建提示框容器
    this.tooltip = this.scene.add.container(0, -buttonRadius * 3);
    this.tooltip.setVisible(false);
    this.container.add(this.tooltip);

    // 计算提示框宽度（根据屏幕宽度调整）
    const tooltipWidth = Math.min(220, this.scene.cameras.main.width / 2);

    // 创建背景
    const tooltipBg = this.scene.add.rectangle(0, 0, tooltipWidth, 110, 0x000000, 0.8);
    tooltipBg.setStrokeStyle(2, 0xffffff);
    this.tooltip.add(tooltipBg);

    // 创建标题
    const title = this.scene.add.text(0, -35, this.uiConfig.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.tooltip.add(title);

    // 创建描述
    const description = this.scene.add.text(0, 0, this.uiConfig.description, {
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: tooltipWidth - 20 }
    });
    description.setOrigin(0.5);
    this.tooltip.add(description);

    // 创建冷却信息
    const cooldownInfo = this.scene.add.text(0, 35, `冷却: ${this.uiConfig.cooldown}秒`, {
      fontSize: '14px',
      color: '#aaaaff'
    });
    cooldownInfo.setOrigin(0.5);
    this.tooltip.add(cooldownInfo);

    // 调整提示框大小
    const bounds = this.tooltip.getBounds();
    tooltipBg.width = bounds.width + 20;
    tooltipBg.height = bounds.height + 20;
  }

  /**
   * 设置交互
   */
  private setupInteractions(): void {
    // 鼠标悬停
    this.background.on('pointerover', () => {
      if (this.isAvailable) {
        // Arc对象没有setTint方法，使用fillColor代替
        this.background.fillColor = 0xaaaaaa;
      }
      this.tooltip.setVisible(true);
    });

    // 鼠标离开
    this.background.on('pointerout', () => {
      if (this.isAvailable) {
        // Arc对象没有clearTint方法，使用fillColor代替
        this.background.fillColor = 0x333333;
      }
      this.tooltip.setVisible(false);
    });

    // 鼠标按下
    this.background.on('pointerdown', () => {
      if (this.isAvailable) {
        this.setSelected(true);

        // 触发技能选择事件
        this.scene.events.emit('skillSelected', this.skillId);
      }
    });
  }

  /**
   * 应用自定义样式
   */
  private applyCustomStyle(): void {
    // 设置边框颜色
    if (this.uiConfig.borderColor) {
      // Arc对象没有setTint方法，我们需要使用setStrokeStyle来设置边框颜色
      const color = Phaser.Display.Color.HexStringToColor(this.uiConfig.borderColor).color;
      this.background.setStrokeStyle(2, color);

      // 同时也可以设置填充颜色
      this.background.fillColor = color;
    }

    // 设置图标颜色
    if (this.uiConfig.color) {
      this.icon.setTint(Phaser.Display.Color.HexStringToColor(this.uiConfig.color).color);
    }
  }

  /**
   * 更新冷却
   * @param delta 时间增量（毫秒）
   */
  public updateCooldown(delta: number): void {
    if (this.currentCooldown <= 0) {
      return;
    }

    // 更新冷却时间
    this.currentCooldown -= delta;
    if (this.currentCooldown <= 0) {
      this.currentCooldown = 0;
      this.setAvailable(true);
    } else {
      // 更新冷却显示
      this.updateCooldownDisplay();
    }
  }

  /**
   * 更新冷却进度
   * @param progress 冷却进度（0-1，1表示冷却完成）
   */
  public updateCooldownProgress(progress: number): void {
    if (progress >= 1.0) {
      this.currentCooldown = 0;
      this.setAvailable(true);
      return;
    }

    // 计算当前冷却时间
    this.currentCooldown = this.maxCooldown * (1 - progress);

    // 更新冷却显示
    this.updateCooldownDisplay();

    // 设置技能不可用
    if (this.isAvailable) {
      this.setAvailable(false);
    }
  }

  /**
   * 更新冷却显示
   */
  private updateCooldownDisplay(): void {
    // 计算冷却比例
    const ratio = this.currentCooldown / this.maxCooldown;

    // 获取按钮大小
    const buttonRadius = (this.background as Phaser.GameObjects.Arc).radius;

    // 更新冷却遮罩
    this.cooldownOverlay.clear();
    this.cooldownOverlay.fillStyle(0x000000, 0.7);
    this.cooldownOverlay.beginPath();
    this.cooldownOverlay.moveTo(0, 0);
    this.cooldownOverlay.arc(0, 0, buttonRadius, 0, Math.PI * 2 * ratio);
    this.cooldownOverlay.lineTo(0, 0);
    this.cooldownOverlay.closePath();
    this.cooldownOverlay.fillPath();

    // 更新冷却文本
    const seconds = Math.ceil(this.currentCooldown / 1000);
    this.cooldownText.setText(seconds.toString());
    this.cooldownText.setVisible(true);
  }

  /**
   * 设置技能是否可用
   * @param available 是否可用
   */
  public setAvailable(available: boolean): void {
    this.isAvailable = available;

    if (available) {
      // 清除冷却显示
      this.cooldownOverlay.clear();
      this.cooldownText.setVisible(false);

      // 恢复正常外观
      // Arc对象没有clearTint方法，使用fillColor代替
      this.background.fillColor = 0x333333;
      this.icon.clearTint();
      if (this.uiConfig.color) {
        this.icon.setTint(Phaser.Display.Color.HexStringToColor(this.uiConfig.color).color);
      }
    } else {
      // 设置灰色外观
      // Arc对象没有setTint方法，使用fillColor代替
      this.background.fillColor = 0x666666;
      this.icon.setTint(0x666666);
    }
  }

  /**
   * 设置技能是否选中
   * @param selected 是否选中
   */
  public setSelected(selected: boolean): void {
    this.isSelected = selected;

    if (selected) {
      // 设置选中外观
      // Arc对象没有setTint方法，使用fillColor代替
      this.background.fillColor = 0xffff00;
    } else {
      // 恢复正常外观
      if (this.isAvailable) {
        // Arc对象没有clearTint方法，使用fillColor代替
        this.background.fillColor = 0x333333;
        if (this.uiConfig.borderColor) {
          // 使用borderColor作为fillColor
          const color = Phaser.Display.Color.HexStringToColor(this.uiConfig.borderColor).color;
          this.background.fillColor = color;
        }
      } else {
        // Arc对象没有setTint方法，使用fillColor代替
        this.background.fillColor = 0x666666;
      }
    }
  }

  /**
   * 触发技能冷却
   */
  public triggerCooldown(): void {
    this.currentCooldown = this.maxCooldown;
    this.setAvailable(false);
    this.updateCooldownDisplay();
  }

  /**
   * 获取技能ID
   * @returns 技能ID
   */
  public getSkillId(): string {
    return this.skillId;
  }

  /**
   * 获取技能是否可用
   * @returns 是否可用
   */
  public isSkillAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * 获取技能是否选中
   * @returns 是否选中
   */
  public isSkillSelected(): boolean {
    return this.isSelected;
  }

  /**
   * 获取技能UI配置
   * @returns 技能UI配置
   */
  public getUIConfig(): SkillUIConfig {
    return this.uiConfig;
  }

  /**
   * 获取容器
   * @returns 容器
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 设置位置
   * @param x X坐标
   * @param y Y坐标
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * 设置可见性
   * @param visible 是否可见
   */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 销毁组件
   */
  public destroy(): void {
    this.container.destroy();
  }
}
