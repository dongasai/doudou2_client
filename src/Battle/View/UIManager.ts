/**
 * UI管理器
 * 负责战斗场景中UI元素的创建和管理
 */

import Phaser from 'phaser';
import { SkillUIComponent } from './SkillUIComponent';
import { BattleParamsService } from '@/services/BattleParamsService';
import { gameState } from '@/main';

export class UIManager {
  private scene: Phaser.Scene;
  
  // UI元素
  private statusBar: Phaser.GameObjects.Container;
  private waveIndicator: Phaser.GameObjects.Text;
  private pauseButton: Phaser.GameObjects.Text;
  private skillButtonsContainer: Phaser.GameObjects.Container;
  private skillUIComponents: Map<string, SkillUIComponent>;
  private uiContainer: Phaser.GameObjects.Container;
  
  // 状态
  private isPaused: boolean = false;
  
  // 回调函数
  private onPauseCallback: () => void;
  private onResumeCallback: () => void;

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param onPause 暂停回调
   * @param onResume 继续回调
   */
  constructor(scene: Phaser.Scene, onPause: () => void, onResume: () => void) {
    this.scene = scene;
    this.onPauseCallback = onPause;
    this.onResumeCallback = onResume;
    
    // 初始化UI组件
    this.skillUIComponents = new Map();
    
    // 创建UI元素
    this.createUI();
  }

  /**
   * 创建UI元素
   */
  private createUI(): void {
    try {
      // 创建UI容器
      this.uiContainer = this.scene.add.container(0, 0);
      this.uiContainer.setName('uiContainer');
      
      // 创建状态栏 (位于屏幕左上角)
      this.createStatusBar();
      
      // 创建波次指示器 (位于屏幕右上角)
      this.createWaveIndicator();
      
      // 创建暂停/继续按钮 (位于屏幕右上角，波次指示器下方)
      this.createPauseButton();
      
      // 创建技能按钮 (位于屏幕底部中央)
      this.createSkillButtons();
      
      // 固定UI元素，使其不受摄像机移动影响
      this.fixUIElements();
    } catch (error) {
      console.error('[ERROR] 创建UI元素失败:', error);
    }
  }

  /**
   * 创建状态栏
   */
  private createStatusBar(): void {
    // 获取屏幕宽度
    const screenWidth = this.scene.cameras.main.width;
    
    // 计算状态栏宽度 (适配窄屏设备)
    const barWidth = Math.min(180, screenWidth * 0.4); // 最大宽度180，或屏幕宽度的40%
    const barHeight = 60;
    
    // 创建状态栏容器 (位于屏幕左上角，坐标为 10,10)
    this.statusBar = this.scene.add.container(10, 10);
    
    // 创建背景 (黑色半透明矩形)
    const bg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.5);
    bg.setOrigin(0, 0);
    this.statusBar.add(bg);
    
    // 计算头像大小和位置 (根据状态栏宽度调整)
    const iconSize = Math.min(40, barWidth * 0.2); // 头像大小
    const iconX = 10;
    const iconY = barHeight / 2;
    
    // 创建英雄头像 (使用文本Emoji代替图片)
    const heroIcon = this.scene.add.text(iconX, iconY, '🧙', {
      fontSize: `${iconSize}px`
    });
    heroIcon.setOrigin(0, 0.5);
    this.statusBar.add(heroIcon);
    
    // 计算生命值条和魔法值条的尺寸和位置
    const barX = iconX + iconSize + 10; // 条形图X坐标
    const barLength = barWidth - barX - 10; // 条形图长度
    const barHeight1 = 12; // 条形图高度
    const hpY = 20; // 生命值条Y坐标
    const mpY = 40; // 魔法值条Y坐标
    
    // 创建生命值条背景
    const hpBarBg = this.scene.add.rectangle(barX, hpY, barLength, barHeight1, 0x333333);
    hpBarBg.setOrigin(0, 0);
    this.statusBar.add(hpBarBg);
    
    // 创建生命值条
    const hpBar = this.scene.add.rectangle(barX, hpY, barLength, barHeight1, 0xff0000);
    hpBar.setOrigin(0, 0);
    this.statusBar.add(hpBar);
    
    // 创建魔法值条背景
    const mpBarBg = this.scene.add.rectangle(barX, mpY, barLength, barHeight1, 0x333333);
    mpBarBg.setOrigin(0, 0);
    this.statusBar.add(mpBarBg);
    
    // 创建魔法值条
    const mpBar = this.scene.add.rectangle(barX, mpY, barLength, barHeight1, 0x0000ff);
    mpBar.setOrigin(0, 0);
    this.statusBar.add(mpBar);
    
    // 计算文本大小和位置
    const textSize = Math.min(12, barLength * 0.1); // 文本大小
    const textX = barX + barLength / 2; // 文本X坐标
    
    // 创建生命值文本
    const hpText = this.scene.add.text(textX, hpY, '100/100', {
      fontSize: `${textSize}px`,
      color: '#ffffff'
    });
    hpText.setOrigin(0.5, 0);
    this.statusBar.add(hpText);
    
    // 创建魔法值文本
    const mpText = this.scene.add.text(textX, mpY, '100/100', {
      fontSize: `${textSize}px`,
      color: '#ffffff'
    });
    mpText.setOrigin(0.5, 0);
    this.statusBar.add(mpText);
    
    // 添加到UI容器
    this.uiContainer.add(this.statusBar);
  }

  /**
   * 创建波次指示器
   */
  private createWaveIndicator(): void {
    // 获取屏幕宽度
    const screenWidth = this.scene.cameras.main.width;
    
    // 计算字体大小 (适配窄屏设备)
    const fontSize = Math.min(24, Math.max(16, screenWidth * 0.05)); // 最小16px，最大24px
    
    // 创建波次指示器 (位于屏幕右上角，距离右边缘120像素，距离上边缘10像素)
    this.waveIndicator = this.scene.add.text(
      screenWidth - 120,         // X坐标：屏幕宽度减去120像素，为暂停按钮留出空间
      10,                        // Y坐标：距离顶部10像素
      'Wave: 1',
      {
        fontSize: `${fontSize}px`,
        color: '#ffffff',        // 白色文本
        stroke: '#000000',       // 黑色描边
        strokeThickness: Math.max(2, fontSize / 6)  // 描边粗细根据字体大小调整
      }
    );
    this.waveIndicator.setOrigin(1, 0); // 设置原点为右上角，使文本右对齐
    
    // 添加到UI容器
    this.uiContainer.add(this.waveIndicator);
  }

  /**
   * 创建暂停/继续按钮
   */
  private createPauseButton(): void {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    
    // 计算按钮位置 (右上角，与波次指示器平行)
    const x = screenWidth - 20; // 距离右边缘20像素
    const y = 10; // 与波次指示器在同一高度
    
    // 创建暂停按钮
    this.pauseButton = this.scene.add.text(
      x,
      y,
      '⏸️ 暂停',
      {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#4a668d',
        padding: {
          left: 15,
          right: 15,
          top: 8,
          bottom: 8
        },
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 5,
          stroke: true,
          fill: true
        }
      }
    );
    
    // 设置原点为右上角，使按钮右对齐
    this.pauseButton.setOrigin(1, 0);
    
    // 设置为交互式
    this.pauseButton.setInteractive();
    
    // 添加点击效果
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setStyle({ backgroundColor: '#5a769d' });
    });
    
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setStyle({ backgroundColor: '#4a668d' });
    });
    
    // 点击暂停/继续按钮
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });
    
    // 添加到UI容器
    this.uiContainer.add(this.pauseButton);
  }

  /**
   * 创建技能按钮
   */
  private createSkillButtons(): void {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // 计算底部边距 (适配不同屏幕高度)
    const bottomMargin = Math.min(100, screenHeight * 0.08); // 最大100px，或屏幕高度的8%
    
    // 创建技能按钮容器 (位于屏幕底部中央)
    this.skillButtonsContainer = this.scene.add.container(
      screenWidth / 2,                    // X坐标：屏幕宽度的一半（水平居中）
      screenHeight - bottomMargin         // Y坐标：距离屏幕底部的距离
    );
    
    // 从英雄数据中获取技能ID
    let heroId = 1; // 默认使用1号英雄
    
    // 尝试从gameState获取选择的英雄
    try {
      if (gameState && gameState.selectedHeroes && gameState.selectedHeroes.length > 0) {
        heroId = gameState.selectedHeroes[0];
      }
    } catch (error) {
      console.error('[ERROR] 获取选择的英雄失败:', error);
    }
    
    // 从BattleParamsService获取英雄数据
    let heroData = null;
    try {
      heroData = BattleParamsService.getHeroData(heroId);
    } catch (error) {
      console.error('[ERROR] 获取英雄数据失败:', error);
    }
    
    // 获取英雄的技能列表
    let skillIds: string[] = [];
    if (heroData && heroData.skills && Array.isArray(heroData.skills)) {
      try {
        // 从英雄数据中获取技能ID
        skillIds = heroData.skills.map((skill: any) => {
          // 检查skill.id是否存在
          if (skill && skill.id) {
            return `skill_${skill.id}`;
          }
          return 'skill_1'; // 默认技能
        });
      } catch (error) {
        console.error('[ERROR] 解析技能数据失败:', error);
        skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4']; // 使用默认技能
      }
    } else {
      // 如果没有找到英雄数据或技能列表，使用默认技能
      skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4'];
    }
    
    // 确保至少有一个技能
    if (skillIds.length === 0) {
      skillIds = ['skill_1'];
    }
    
    // 计算按钮大小 (根据屏幕宽度调整)
    const buttonSize = Math.min(60, Math.max(40, screenWidth / 8));
    
    // 根据屏幕宽度和按钮大小调整按钮间距，确保按钮不会重叠
    const minSpacing = buttonSize * 2.4; // 确保按钮之间有足够的间距，避免重叠
    const buttonSpacing = Math.min(120, Math.max(minSpacing, screenWidth / 5));
    
    // 创建技能按钮，水平排列
    for (let i = 0; i < skillIds.length; i++) {
      // 计算按钮X坐标，使按钮居中排列
      const x = (i - (skillIds.length - 1) / 2) * buttonSpacing;
      
      // 创建技能UI组件 (Y坐标为0，相对于容器)
      const skillUI = new SkillUIComponent(this.scene, x, 0, skillIds[i], buttonSize);
      
      // 将技能UI组件的容器添加到技能按钮容器中
      this.skillButtonsContainer.add(skillUI.getContainer());
      
      // 保存技能UI组件的引用
      this.skillUIComponents.set(skillIds[i], skillUI);
    }
    
    // 添加到UI容器
    this.uiContainer.add(this.skillButtonsContainer);
  }

  /**
   * 固定UI元素，使其不受摄像机移动影响
   */
  private fixUIElements(): void {
    // 设置UI容器的scrollFactor为0，使其不随摄像机移动
    this.uiContainer.setScrollFactor(0);
    
    // 设置各个UI元素的scrollFactor为0，确保它们不随摄像机移动
    this.statusBar.setScrollFactor(0);
    this.waveIndicator.setScrollFactor(0);
    this.pauseButton.setScrollFactor(0);
    this.skillButtonsContainer.setScrollFactor(0);
    
    // 确保所有子元素也不随摄像机移动
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.getContainer().setScrollFactor(0);
    }
  }

  /**
   * 切换暂停/继续状态
   */
  private togglePause(): void {
    try {
      // 切换暂停状态
      this.isPaused = !this.isPaused;
      
      if (this.isPaused) {
        // 暂停游戏
        this.onPauseCallback();
        
        // 更新按钮文本和样式
        this.pauseButton.setText('▶️ 继续');
        this.pauseButton.setStyle({
          backgroundColor: '#5a769d',
          fontSize: '22px',
          color: '#ffffff',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          },
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 5,
            stroke: true,
            fill: true
          }
        });
      } else {
        // 继续游戏
        this.onResumeCallback();
        
        // 更新按钮文本和样式
        this.pauseButton.setText('⏸️ 暂停');
        this.pauseButton.setStyle({
          backgroundColor: '#4a668d',
          fontSize: '22px',
          color: '#ffffff',
          padding: {
            left: 15,
            right: 15,
            top: 8,
            bottom: 8
          },
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 5,
            stroke: true,
            fill: true
          }
        });
      }
    } catch (error) {
      console.error('[ERROR] 切换暂停状态失败:', error);
    }
  }

  /**
   * 更新状态栏
   * @param hp 当前生命值
   * @param maxHp 最大生命值
   * @param mp 当前魔法值
   * @param maxMp 最大魔法值
   */
  public updateStatusBar(hp: number, maxHp: number, mp: number, maxMp: number): void {
    // 更新生命值条
    const hpBar = this.statusBar.getAt(3) as Phaser.GameObjects.Rectangle;
    hpBar.width = 130 * (hp / maxHp);
    
    // 更新魔法值条
    const mpBar = this.statusBar.getAt(5) as Phaser.GameObjects.Rectangle;
    mpBar.width = 130 * (mp / maxMp);
    
    // 更新生命值文本
    const hpText = this.statusBar.getAt(6) as Phaser.GameObjects.Text;
    hpText.setText(`${Math.floor(hp)}/${maxHp}`);
    
    // 更新魔法值文本
    const mpText = this.statusBar.getAt(7) as Phaser.GameObjects.Text;
    mpText.setText(`${Math.floor(mp)}/${maxMp}`);
  }

  /**
   * 更新波次指示器
   * @param waveNumber 波次编号
   */
  public updateWaveIndicator(waveNumber: number): void {
    this.waveIndicator.setText(`Wave: ${waveNumber}`);
  }

  /**
   * 显示波次变化提示
   * @param waveNumber 波次编号
   */
  public showWaveChangeNotification(waveNumber: number): void {
    // 显示波次提示
    const waveText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      `第 ${waveNumber} 波`,
      {
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    waveText.setOrigin(0.5);
    waveText.setScrollFactor(0); // 确保不随相机移动
    
    // 添加动画
    this.scene.tweens.add({
      targets: waveText,
      alpha: 0,
      scale: 2,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        waveText.destroy();
      }
    });
  }

  /**
   * 显示波次完成提示
   * @param waveIndex 波次索引
   * @param waveName 波次名称
   * @param onContinue 继续回调
   */
  public showWaveCompletedNotification(waveIndex: number, waveName: string, onContinue: () => void): void {
    // 显示波次完成提示
    const completeText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 50,
      `第 ${waveIndex + 1} 波完成!`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    completeText.setOrigin(0.5);
    completeText.setScrollFactor(0); // 确保不随相机移动
    
    // 添加继续按钮
    const continueButton = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 + 20,
      '继续',
      {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#4a668d',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    continueButton.setOrigin(0.5);
    continueButton.setInteractive();
    continueButton.setScrollFactor(0); // 确保不随相机移动
    
    // 添加点击效果
    continueButton.on('pointerover', () => {
      continueButton.setStyle({ backgroundColor: '#5a769d' });
    });
    
    continueButton.on('pointerout', () => {
      continueButton.setStyle({ backgroundColor: '#4a668d' });
    });
    
    // 点击继续按钮时开始下一波
    continueButton.on('pointerdown', () => {
      // 销毁提示和按钮
      completeText.destroy();
      continueButton.destroy();
      
      // 调用继续回调
      onContinue();
    });
  }

  /**
   * 显示游戏结束提示
   * @param result 游戏结果 ('victory' 或 'defeat')
   * @param onReturn 返回回调
   */
  public showGameOverNotification(result: string, onReturn: () => void): void {
    // 显示结果面板
    const resultText = result === 'victory' ? '胜利！' : '失败！';
    
    // 创建背景面板
    const panel = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      300,
      200,
      0x000000,
      0.8
    );
    panel.setScrollFactor(0); // 确保不随相机移动
    
    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      resultText,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0); // 确保不随相机移动
    
    // 添加返回按钮
    const button = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 + 50,
      '返回',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10
        }
      }
    );
    button.setOrigin(0.5);
    button.setInteractive();
    button.setScrollFactor(0); // 确保不随相机移动
    
    button.on('pointerdown', () => {
      // 调用返回回调
      onReturn();
    });
  }

  /**
   * 更新技能冷却
   * @param delta 时间增量
   */
  public updateSkillCooldowns(delta: number): void {
    // 更新所有技能UI组件的冷却
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.updateCooldown(delta);
    }
  }

  /**
   * 触发技能冷却
   * @param skillId 技能ID
   */
  public triggerSkillCooldown(skillId: string): void {
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.triggerCooldown();
    }
  }

  /**
   * 更新技能冷却进度
   * @param skillId 技能ID
   * @param progress 进度 (0-1)
   */
  public updateSkillCooldownProgress(skillId: string, progress: number): void {
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.setAvailable(progress >= 1.0);
      skillUI.updateCooldownProgress(progress);
    }
  }

  /**
   * 获取所有UI元素
   * @returns UI元素数组
   */
  public getAllUIElements(): Phaser.GameObjects.GameObject[] {
    const elements: Phaser.GameObjects.GameObject[] = [
      this.uiContainer,
      this.statusBar,
      this.waveIndicator,
      this.pauseButton,
      this.skillButtonsContainer
    ];
    
    // 添加所有技能UI组件
    for (const skillUI of this.skillUIComponents.values()) {
      elements.push(skillUI.getContainer());
    }
    
    return elements;
  }

  /**
   * 销毁所有UI元素
   */
  public destroy(): void {
    // 销毁技能UI组件
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.destroy();
    }
    
    // 销毁UI元素
    this.statusBar.destroy();
    this.waveIndicator.destroy();
    this.pauseButton.destroy();
    this.skillButtonsContainer.destroy();
    this.uiContainer.destroy();
  }
}
