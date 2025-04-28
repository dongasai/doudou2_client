/**
 * 触摸控制器
 * 负责处理触摸输入和技能释放
 */

import Phaser from 'phaser';
import { Vector2D } from '../Types/Vector2D';
import { BattleEngine } from '../Core/BattleEngine';
import { BattleCommand } from '../../DesignConfig/types/BattleCommand';

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
    
    // 设置输入事件
    this.setupInputEvents();
  }
  
  /**
   * 设置输入事件
   */
  private setupInputEvents(): void {
    // 监听技能选择事件
    this.scene.events.on('skillSelected', this.onSkillSelected, this);
    
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
    this.selectedSkillId = skillId;
    
    // 显示范围指示器
    this.showRangeIndicator(skillId);
  }
  
  /**
   * 指针按下事件处理
   * @param pointer 指针
   */
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // 如果没有选择技能，不处理
    if (!this.selectedSkillId) {
      return;
    }
    
    // 记录触摸开始位置
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
    if (!this.isTouchActive || !this.selectedSkillId || !this.touchStartPosition || !this.currentTouchPosition) {
      return;
    }
    
    // 发送技能释放指令
    this.castSkill(this.selectedSkillId, this.touchStartPosition, this.currentTouchPosition);
    
    // 重置状态
    this.resetTouchState();
  }
  
  /**
   * 重置触摸状态
   */
  private resetTouchState(): void {
    this.isTouchActive = false;
    this.selectedSkillId = null;
    this.touchStartPosition = null;
    this.currentTouchPosition = null;
    
    // 隐藏视觉元素
    this.targetIndicator.setVisible(false);
    this.rangeIndicator.clear();
    this.directionLine.clear();
    
    // 触发技能取消选择事件
    this.scene.events.emit('skillDeselected');
  }
  
  /**
   * 显示范围指示器
   * @param skillId 技能ID
   */
  private showRangeIndicator(skillId: string): void {
    // TODO: 根据技能类型显示不同的范围指示器
    this.rangeIndicator.clear();
    
    // 获取英雄位置
    const heroPosition = this.getHeroPosition();
    if (!heroPosition) {
      return;
    }
    
    // 绘制范围圈
    this.rangeIndicator.lineStyle(2, 0xffff00, 0.8);
    this.rangeIndicator.strokeCircle(heroPosition.x, heroPosition.y, 200);
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
    // 创建指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1, // TODO: 获取当前英雄ID
        skillId: parseInt(skillId.replace('skill_', '')),
        targetType: 'position',
        targetPos: position.x // 简化处理，只使用x坐标
      }
    };
    
    // 发送指令
    this.battleEngine.sendCommand(command);
  }
  
  /**
   * 在指定方向释放技能
   * @param skillId 技能ID
   * @param startPosition 起始位置
   * @param endPosition 结束位置
   */
  private castSkillInDirection(skillId: string, startPosition: Vector2D, endPosition: Vector2D): void {
    // 创建指令
    const command: BattleCommand = {
      frame: 0, // 由战斗引擎设置
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1, // TODO: 获取当前英雄ID
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
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    
    // 销毁视觉元素
    this.targetIndicator.destroy();
    this.rangeIndicator.destroy();
    this.directionLine.destroy();
  }
}
