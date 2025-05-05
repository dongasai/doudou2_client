/**
 * 触摸控制器
 * 负责处理触摸输入和技能释放
 */

import Phaser from 'phaser';
import { Vector2D } from '../Types/Vector2D';
import { BattleEngine } from '../Core/BattleEngine';
import { BattleCommand } from '../../DesignConfig/BattleCommand';

export class TouchController {
  private scene: Phaser.Scene;
  private battleEngine: BattleEngine;

  // 触摸状态
  private isTouchActive: boolean = false;
  private selectedSkillId: string | null = null;
  private touchStartPosition: Vector2D | null = null;
  private currentTouchPosition: Vector2D | null = null;

  // 视觉元素
  private targetIndicator: Phaser.GameObjects.Image;
  private rangeIndicator: Phaser.GameObjects.Graphics;
  private directionLine: Phaser.GameObjects.Graphics;
  private attackRangeIndicator: Phaser.GameObjects.Graphics; // 攻击范围指示器

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param battleEngine 战斗引擎
   */
  constructor(scene: Phaser.Scene, battleEngine: BattleEngine) {
    this.scene = scene;
    this.battleEngine = battleEngine;

    // 创建目标指示器
    this.targetIndicator = scene.add.image(0, 0, 'target_indicator');
    this.targetIndicator.setVisible(false);

    // 创建范围指示器
    this.rangeIndicator = scene.add.graphics();

    // 创建方向线
    this.directionLine = scene.add.graphics();

    // 创建攻击范围指示器
    this.attackRangeIndicator = scene.add.graphics();

    // 设置输入事件
    this.setupInputEvents();
  }

  /**
   * 设置输入事件
   */
  private setupInputEvents(): void {
    // 监听技能选择事件
    this.scene.events.on('skillSelected', this.onSkillSelected, this);

    // 监听技能取消选择事件
    this.scene.events.on('skillDeselected', this.onSkillDeselected, this);

    // 监听豆豆点击事件
    this.scene.events.on('beanClicked', this.onBeanClicked, this);

    // 设置触摸输入
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  /**
   * 技能选择事件处理
   * @param skillId 技能ID
   */
  private onSkillSelected(skillId: string): void {
    // 如果已经选择了这个技能，则不做任何操作
    // 因为取消选择的逻辑已经在SkillUIComponent中处理
    if (this.selectedSkillId === skillId) {
      return;
    }

    this.selectedSkillId = skillId;

    // 显示范围指示器
    this.showRangeIndicator(skillId);
  }

  /**
   * 技能取消选择事件处理
   * @param skillId 技能ID
   */
  private onSkillDeselected(skillId: string): void {
    // 如果当前选中的技能被取消选择，则重置状态
    if (this.selectedSkillId === skillId) {
      this.resetTouchState();
    }
  }

  /**
   * 豆豆点击事件处理
   * @param event 豆豆点击事件数据
   */
  private onBeanClicked(event: { beanId: string, position: Vector2D }): void {
    console.log(`[INFO] 处理豆豆点击事件: ${event.beanId}`);

    // 如果当前有选中的技能，则使用技能攻击豆豆
    if (this.selectedSkillId) {
      // 使用技能攻击豆豆
      this.castSkillAtBean(this.selectedSkillId, event.beanId);
      // 重置状态
      this.resetTouchState();
    } else {
      // 普通攻击豆豆
      this.attackBean(event.beanId);
    }
  }

  // 移动模式枚举
  private mode: 'skill' | 'move' = 'skill';

  /**
   * 指针按下事件处理
   * @param pointer 指针
   */
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // 如果没有选择技能，进入移动模式
    if (!this.selectedSkillId) {
      this.mode = 'move';
      this.touchStartPosition = { x: pointer.x, y: pointer.y };
      this.currentTouchPosition = { x: pointer.x, y: pointer.y };
      this.isTouchActive = true;
      return;
    }

    // 技能模式
    this.mode = 'skill';
    this.touchStartPosition = { x: pointer.x, y: pointer.y };
    this.currentTouchPosition = { x: pointer.x, y: pointer.y };
    this.isTouchActive = true;

    // 显示目标指示器
    this.targetIndicator.setPosition(pointer.x, pointer.y);
    this.targetIndicator.setVisible(true);

    // 清除方向线
    this.directionLine.clear();
  }

  /**
   * 指针移动事件处理
   * @param pointer 指针
   */
  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    // 如果触摸未激活，不处理
    if (!this.isTouchActive || !this.touchStartPosition) {
      return;
    }

    // 更新当前触摸位置
    this.currentTouchPosition = { x: pointer.x, y: pointer.y };

    // 更新目标指示器位置
    this.targetIndicator.setPosition(pointer.x, pointer.y);

    // 绘制方向线
    this.drawDirectionLine(this.touchStartPosition, this.currentTouchPosition);
  }

  /**
   * 指针抬起事件处理
   * @param pointer 指针
   */
  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    // 如果触摸未激活，不处理
    if (!this.isTouchActive || !this.touchStartPosition || !this.currentTouchPosition) {
      return;
    }

    // 根据模式处理
    if (this.mode === 'skill' && this.selectedSkillId) {
      // 技能模式
      this.castSkill(this.selectedSkillId, this.touchStartPosition, this.currentTouchPosition);
    } else if (this.mode === 'move') {
      // 移动模式
      this.sendMoveCommand(this.touchStartPosition, this.currentTouchPosition);
    }

    // 重置状态
    this.resetTouchState();
  }

  /**
   * 发送移动指令
   * @param start 起始位置
   * @param end 结束位置
   */
  private sendMoveCommand(start: Vector2D, end: Vector2D): void {
    // 转换为世界坐标
    const worldPos = this.screenToWorldPosition(end);

    // 获取当前英雄ID
    const heroId = this.getCurrentHeroId();

    // 计算有效位置索引（1-5）
    const positionIndex = this.calculatePositionIndex(worldPos);

    // 创建移动指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'changePosition',
      data: {
        heroId: heroId,
        newPos: positionIndex
      }
    };

    // 发送指令
    this.battleEngine.sendCommand(command);
  }

  /**
   * 计算有效位置索引（1-5）
   * @param position 世界坐标位置
   */
  private calculatePositionIndex(position: Vector2D): number {
    // 确保位置在有效范围内
    const angle = Math.atan2(position.y - 1500, position.x - 1500);
    const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
    const rawIndex = Math.floor(normalizedAngle / (2 * Math.PI / 5)) + 1;

    // 确保索引在1-5范围内
    return Math.max(1, Math.min(5, rawIndex));
  }

  /**
   * 重置触摸状态
   */
  private resetTouchState(): void {
    this.isTouchActive = false;
    this.mode = 'skill';
    this.selectedSkillId = null;
    this.touchStartPosition = null;
    this.currentTouchPosition = null;

    // 隐藏视觉元素
    this.targetIndicator.setVisible(false);
    this.rangeIndicator.clear();
    this.directionLine.clear();
    this.attackRangeIndicator.clear();

    // 触发技能取消选择事件
    this.scene.events.emit('skillDeselected');
  }

  /**
   * 显示范围指示器
   * @param skillId 技能ID
   */
  private showRangeIndicator(skillId: string): void {
    this.rangeIndicator.clear();

    // 获取英雄位置
    const heroPosition = this.getHeroPosition();
    if (!heroPosition) {
      return;
    }

    // 解析技能ID获取数字部分
    const skillIdNumber = parseInt(skillId.replace('skill_', ''));

    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 获取英雄
    const hero = battleStats.heroStats && battleStats.heroStats.length > 0 ?
      battleStats.heroStats[0] : null;

    if (!hero) {
      return;
    }

    // 尝试获取技能配置
    try {
      // 假设我们可以从某个地方获取技能配置
      // 这里简化处理，根据技能ID的数字部分来决定范围类型和大小
      const skillType = skillIdNumber % 3; // 0: 单体, 1: 范围, 2: 直线
      const rangeSize = 100 + (skillIdNumber * 20); // 基础范围 + 技能ID*20

      // 根据技能类型绘制不同的范围指示器
      switch (skillType) {
        case 0: // 单体技能
          // 绘制小圆圈
          this.rangeIndicator.lineStyle(2, 0xffff00, 0.8);
          this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, rangeSize);
          break;

        case 1: // 范围技能
          // 绘制大圆圈
          this.rangeIndicator.lineStyle(2, 0xff0000, 0.8);
          this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, rangeSize);
          // 添加内圈
          this.rangeIndicator.lineStyle(1, 0xff0000, 0.5);
          this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, rangeSize * 0.5);
          break;

        case 2: // 直线技能
          // 绘制扇形区域
          this.rangeIndicator.lineStyle(2, 0x00ffff, 0.8);
          this.drawArc(heroPosition.x, heroPosition.y, rangeSize, -Math.PI/4, Math.PI/4);
          // 绘制方向线
          this.rangeIndicator.lineStyle(1, 0x00ffff, 0.6);
          this.rangeIndicator.beginPath();
          this.rangeIndicator.moveTo(heroPosition.x, heroPosition.y);
          this.rangeIndicator.lineTo(
            heroPosition.x + Math.cos(0) * rangeSize,
            heroPosition.y + Math.sin(0) * rangeSize
          );
          this.rangeIndicator.strokePath();
          break;

        default:
          // 默认圆形范围
          this.rangeIndicator.lineStyle(2, 0xffff00, 0.8);
          this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, 200);
      }
    } catch (error) {
      console.error('[ERROR] 显示技能范围指示器失败:', error);

      // 出错时显示默认范围圈
      this.rangeIndicator.lineStyle(2, 0xffff00, 0.8);
      this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, 200);
    }
  }

  /**
   * 绘制弧形
   * @param x 中心点x坐标
   * @param y 中心点y坐标
   * @param radius 半径
   * @param startAngle 起始角度
   * @param endAngle 结束角度
   */
  private drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
    this.rangeIndicator.beginPath();
    this.rangeIndicator.arc(x, y, radius, startAngle, endAngle);
    this.rangeIndicator.strokePath();
  }

  /**
   * 绘制方向线
   * @param start 起始位置
   * @param end 结束位置
   */
  private drawDirectionLine(start: Vector2D, end: Vector2D): void {
    this.directionLine.clear();
    this.directionLine.lineStyle(3, 0xffff00, 0.8);
    this.directionLine.beginPath();
    this.directionLine.moveTo(start.x, start.y);
    this.directionLine.lineTo(end.x, end.y);
    this.directionLine.strokePath();
  }

  /**
   * 释放技能
   * @param skillId 技能ID
   * @param startPosition 起始位置
   * @param endPosition 结束位置
   */
  private castSkill(skillId: string, startPosition: Vector2D, endPosition: Vector2D): void {
    // 转换为世界坐标
    const worldStartPos = this.screenToWorldPosition(startPosition);
    const worldEndPos = this.screenToWorldPosition(endPosition);

    // 计算方向
    const dx = endPosition.x - startPosition.x;
    const dy = endPosition.y - startPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果距离太小，视为点击
    if (distance < 20) {
      // 点击释放技能
      this.castSkillAtPosition(skillId, worldEndPos);
    } else {
      // 方向释放技能
      this.castSkillInDirection(skillId, worldStartPos, worldEndPos);
    }
  }

  /**
   * 在指定位置释放技能
   * @param skillId 技能ID
   * @param position 位置
   */
  private castSkillAtPosition(skillId: string, position: Vector2D): void {
    // 获取当前英雄ID
    const heroId = this.getCurrentHeroId();

    // 创建指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: heroId,
        skillId: parseInt(skillId.replace('skill_', '')),
        targetType: 'position',
        targetPos: position.x // 简化处理，只使用x坐标
      }
    };

    // 发送指令
    this.battleEngine.sendCommand(command);
  }

  /**
   * 获取当前英雄ID
   * @returns 当前英雄ID
   */
  private getCurrentHeroId(): number {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 检查是否有英雄
    if (!battleStats.heroStats || battleStats.heroStats.length === 0) {
      return 1; // 默认返回1号英雄
    }

    // 获取第一个英雄的ID
    const heroIdStr = battleStats.heroStats[0].id;

    // 解析英雄ID（假设格式为"hero_数字"）
    const heroId = parseInt(heroIdStr.replace('hero_', ''));

    return isNaN(heroId) ? 1 : heroId;
  }

  /**
   * 在指定方向释放技能
   * @param skillId 技能ID
   * @param startPosition 起始位置
   * @param endPosition 结束位置
   */
  private castSkillInDirection(skillId: string, startPosition: Vector2D, endPosition: Vector2D): void {
    // 获取当前英雄ID
    const heroId = this.getCurrentHeroId();

    // 创建指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: heroId,
        skillId: parseInt(skillId.replace('skill_', '')),
        targetType: 'position',
        targetPos: endPosition.x // 简化处理，只使用x坐标
      }
    };

    // 发送指令
    this.battleEngine.sendCommand(command);
  }

  /**
   * 获取英雄位置
   * @returns 英雄位置
   */
  private getHeroPosition(): Vector2D | null {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 检查是否有英雄
    if (!battleStats.heroStats || battleStats.heroStats.length === 0) {
      return null;
    }

    // 获取第一个英雄的位置
    const heroPosition = battleStats.heroStats[0].position;

    // 转换为屏幕坐标
    return this.worldToScreenPosition(heroPosition);
  }

  /**
   * 世界坐标转屏幕坐标
   * @param position 世界坐标
   * @returns 屏幕坐标
   */
  private worldToScreenPosition(position: Vector2D): Vector2D {
    // 假设世界坐标范围是 0-3000，屏幕坐标范围是 0-屏幕宽高
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    return {
      x: (position.x / 3000) * screenWidth,
      y: (position.y / 3000) * screenHeight
    };
  }

  /**
   * 屏幕坐标转世界坐标
   * @param screenPos 屏幕坐标
   * @returns 世界坐标
   */
  private screenToWorldPosition(screenPos: Vector2D): Vector2D {
    // 假设世界坐标范围是 0-3000，屏幕坐标范围是 0-屏幕宽高
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    return {
      x: (screenPos.x / screenWidth) * 3000,
      y: (screenPos.y / screenHeight) * 3000
    };
  }

  /**
   * 使用技能攻击豆豆
   * @param skillId 技能ID
   * @param beanId 豆豆ID
   */
  private castSkillAtBean(skillId: string, beanId: string): void {
    // 获取当前英雄ID
    const heroId = this.getCurrentHeroId();

    // 从豆豆ID中提取数字部分（假设格式为"bean_数字"）
    const beanIdNumber = parseInt(beanId.replace('bean_', ''));

    // 创建指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: heroId,
        skillId: parseInt(skillId.replace('skill_', '')),
        targetType: 'enemy',
        targetId: beanIdNumber
      }
    };

    // 发送指令
    this.battleEngine.sendCommand(command);

    console.log(`[INFO] 发送技能攻击指令: 英雄${heroId}使用技能${skillId}攻击豆豆${beanId}`);
  }

  /**
   * 普通攻击豆豆
   * @param beanId 豆豆ID
   */
  private attackBean(beanId: string): void {
    // 获取当前英雄ID
    const heroId = this.getCurrentHeroId();

    // 我们需要将豆豆ID传递给BattleManager
    // 但由于BattleCommand接口期望targetId是数字，我们需要做一些调整
    // 使用一个特殊的标记，让BattleManager知道这是完整的豆豆ID
    const beanIdNumber = -1; // 使用-1作为特殊标记

    // 创建攻击指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'attack',
      data: {
        heroId: heroId,
        targetId: beanIdNumber
      }
    };

    // 添加完整的豆豆ID
    (command.data as any).fullBeanId = beanId;

    // 发送指令
    this.battleEngine.sendCommand(command);

    console.log(`[INFO] 发送普通攻击指令: 英雄${heroId}攻击豆豆${beanId}`);

    // 播放攻击视觉效果
    this.playAttackVisualEffect(beanId);

    // 设置英雄的持续攻击目标
    this.setHeroAttackTarget(heroId, beanId);
  }

  /**
   * 设置英雄的持续攻击目标
   * @param heroId 英雄ID
   * @param targetId 目标ID
   */
  private setHeroAttackTarget(heroId: number, targetId: string): void {
    // 创建设置目标的命令（这是一个自定义命令，需要在BattleManager中处理）
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'attack',
      data: {
        heroId: heroId,
        targetId: -1 // 使用-1作为特殊标记
      }
    };

    // 添加完整的豆豆ID
    (command.data as any).fullBeanId = targetId;

    // 使用类型断言添加自定义属性
    (command.data as any).setAsTarget = true;

    // 发送指令
    this.battleEngine.sendCommand(command);

    console.log(`[INFO] 设置英雄${heroId}的持续攻击目标为${targetId}`);
  }

  /**
   * 显示英雄攻击范围
   */
  private showAttackRange(): void {
    // 清除之前的攻击范围指示器
    this.attackRangeIndicator.clear();

    // 获取英雄位置
    const heroPosition = this.getHeroPosition();
    if (!heroPosition) {
      return;
    }

    // 获取英雄攻击范围
    const attackRange = this.getHeroAttackRange();
    if (!attackRange) {
      return;
    }

    // 绘制攻击范围圈
    this.attackRangeIndicator.lineStyle(2, 0xff6666, 0.5);
    this.attackRangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, attackRange);

    // 添加半透明填充
    this.attackRangeIndicator.fillStyle(0xff6666, 0.1);
    this.attackRangeIndicator.fillCircle(heroPosition.x, heroPosition.y, attackRange);
  }

  /**
   * 获取英雄攻击范围
   * @returns 攻击范围（屏幕坐标系中的像素值）
   */
  private getHeroAttackRange(): number | null {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 检查是否有英雄
    if (!battleStats.heroStats || battleStats.heroStats.length === 0) {
      return null;
    }

    // 获取英雄攻击范围
    // 由于我们无法直接从BattleEngine获取实体，我们使用默认值
    // 实际项目中，应该通过适当的API获取英雄的攻击范围
    const attackRange = 150; // 默认攻击范围

    // 将世界坐标系中的攻击范围转换为屏幕坐标系中的像素值
    // 这里简化处理，假设世界坐标和屏幕坐标的比例是1:1
    // 实际应该根据相机缩放比例进行转换
    return attackRange;
  }

  /**
   * 播放攻击视觉效果
   * @param targetId 目标ID
   */
  private playAttackVisualEffect(targetId: string): void {
    // 获取英雄位置
    const heroPosition = this.getHeroPosition();
    if (!heroPosition) {
      return;
    }

    // 获取目标实体的精灵
    const targetSprite = this.scene.children.getByName(targetId) as Phaser.GameObjects.Text;
    if (!targetSprite) {
      return;
    }

    // 显示攻击范围
    this.showAttackRange();

    // 绘制攻击线
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xff0000, 0.8);
    graphics.beginPath();
    graphics.moveTo(heroPosition.x, heroPosition.y);
    graphics.lineTo(targetSprite.x, targetSprite.y);
    graphics.strokePath();

    // 计算距离
    const dx = targetSprite.x - heroPosition.x;
    const dy = targetSprite.y - heroPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 获取攻击范围
    const attackRange = this.getHeroAttackRange() || 150;

    // 如果目标超出攻击范围，显示警告提示
    if (distance > attackRange) {
      // 在攻击线上添加警告标记
      const warningX = heroPosition.x + (dx * attackRange / distance);
      const warningY = heroPosition.y + (dy * attackRange / distance);

      // 绘制警告标记
      graphics.lineStyle(2, 0xffff00, 1);
      graphics.beginPath();
      graphics.moveTo(warningX - 10, warningY - 10);
      graphics.lineTo(warningX + 10, warningY + 10);
      graphics.moveTo(warningX + 10, warningY - 10);
      graphics.lineTo(warningX - 10, warningY + 10);
      graphics.strokePath();
    }

    // 短暂显示后消失
    this.scene.time.delayedCall(1000, () => {
      graphics.destroy();
      // 清除攻击范围指示器
      this.attackRangeIndicator.clear();
    });
  }

  /**
   * 更新
   * @param time 当前时间
   * @param delta 时间增量
   */
  public update(time: number, delta: number): void {
    // 更新视觉元素
    if (this.isTouchActive && this.touchStartPosition && this.currentTouchPosition) {
      this.drawDirectionLine(this.touchStartPosition, this.currentTouchPosition);
    }
  }

  /**
   * 销毁
   */
  public destroy(): void {
    // 移除事件监听
    this.scene.events.off('skillSelected', this.onSkillSelected, this);
    this.scene.events.off('skillDeselected', this.onSkillDeselected, this);
    this.scene.events.off('beanClicked', this.onBeanClicked, this);
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);

    // 销毁视觉元素
    this.targetIndicator.destroy();
    this.rangeIndicator.destroy();
    this.directionLine.destroy();
    this.attackRangeIndicator.destroy();
  }
}
