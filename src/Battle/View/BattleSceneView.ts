/**
 * 战斗场景视图
 * 负责将战斗引擎的状态转换为可视化的游戏场景
 *
 * 屏幕适配：
 * - 目标设备：手机屏幕 (430*930)
 * - 布局策略：自适应布局，根据屏幕尺寸调整UI元素位置和大小
 */

import Phaser from 'phaser';
import { BattleEngine } from '@/Battle/Core/BattleEngine';
import { EventManager } from '@/Battle/Core/EventManager';
import { SkillEffectView } from '@/Battle/View/SkillEffectView';
import { SkillUIComponent } from '@/Battle/View/SkillUIComponent';
import { TouchController } from '@/Battle/View/TouchController';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { EntityType } from '@/Battle/Entities/Entity';
import { gameState } from '@/main';
import { BattleParamsService } from '@/services/BattleParamsService';
import { EventType } from '@/Event/EventTypes';
import { EntityCreatedEvent } from '@/Event/b2v/EntityCreated';
import { EntityMovedEvent } from '@/Event/b2v/EntityMoved';
import { DamageDealtEvent } from '@/Event/b2v/DamageDealt';
import { SkillCastEvent } from '@/Event/b2v/SkillCast';
import { SkillEffectAppliedEvent } from '@/Event/b2v/SkillEffectApplied';
import { SkillCooldownUpdateEvent } from '@/Event/b2v/SkillCooldownUpdate';
import { EntityStateChangedEvent } from '@/Event/b2v/EntityStateChanged';
import { GameOverEvent } from '@/Event/b2v/GameOver';

export class BattleSceneView {
  private scene: Phaser.Scene;
  private battleEngine: BattleEngine;
  private eventManager: EventManager;

  // 视图组件
  private skillEffectView: SkillEffectView;
  private skillUIComponents: Map<string, SkillUIComponent>;
  private touchController: TouchController;

  // 实体显示对象
  private entitySprites: Map<string, Phaser.GameObjects.Sprite>;
  private entityHealthBars: Map<string, Phaser.GameObjects.Graphics>;

  // UI元素
  private statusBar: Phaser.GameObjects.Container;
  private waveIndicator: Phaser.GameObjects.Text;
  private pauseButton: Phaser.GameObjects.Text;
  private skillButtonsContainer: Phaser.GameObjects.Container;
  private isPaused: boolean = false;

  // 伤害数字组
  private damageTexts: Phaser.GameObjects.Group;

  /**
   * 构造函数
   * @param scene Phaser场景
   * @param battleEngine 战斗引擎
   */
  constructor(scene: Phaser.Scene, battleEngine: BattleEngine) {
    console.log('创建BattleSceneView，参数:', { scene, battleEngine });

    try {
      this.scene = scene;
      this.battleEngine = battleEngine;

      console.log('获取事件管理器...');
      this.eventManager = battleEngine.getEventManager();
      console.log('事件管理器:', this.eventManager);

      // 初始化组件
      console.log('初始化SkillEffectView...');
      this.skillEffectView = new SkillEffectView(scene);

      console.log('初始化skillUIComponents...');
      this.skillUIComponents = new Map();

      console.log('初始化TouchController...');
      this.touchController = new TouchController(scene, battleEngine);

      // 初始化实体显示对象
      this.entitySprites = new Map();
      this.entityHealthBars = new Map();

      // 创建UI元素
      console.log('创建UI元素...');
      this.createUI();

      // 创建伤害数字组
      this.damageTexts = scene.add.group();

      // 注册事件监听
      console.log('注册事件监听...');
      this.registerEventListeners();

      console.log('BattleSceneView初始化完成');
    } catch (error) {
      console.error('BattleSceneView初始化失败:', error);
      throw error; // 重新抛出错误，便于上层捕获
    }
  }

  /**
   * 创建UI元素
   *
   * 屏幕布局说明：
   * +--------------------------------------------------+
   * | 状态栏 (左上角)         波次指示器 (右上角)      |
   * |                                                  |
   * |                                                  |
   * |                  游戏主区域                      |
   * |                                                  |
   * |                                                  |
   * |                                                  |
   * |                                                  |
   * |                技能按钮 (底部中央)               |
   * +--------------------------------------------------+
   */
  private createUI(): void {
    console.log('[DEBUG] BattleSceneView.createUI 开始');

    try {
      // 创建状态栏 (位于屏幕左上角)
      console.log('[DEBUG] 调用 createStatusBar...');
      this.createStatusBar();
      console.log('[DEBUG] createStatusBar 调用成功');

      // 创建波次指示器 (位于屏幕右上角)
      console.log('[DEBUG] 调用 createWaveIndicator...');
      this.createWaveIndicator();
      console.log('[DEBUG] createWaveIndicator 调用成功');

      // 创建暂停/继续按钮 (位于屏幕右上角，波次指示器下方)
      console.log('[DEBUG] 调用 createPauseButton...');
      this.createPauseButton();
      console.log('[DEBUG] createPauseButton 调用成功');

      // 创建技能按钮 (位于屏幕底部中央)
      console.log('[DEBUG] 调用 createSkillButtons...');
      this.createSkillButtons();
      console.log('[DEBUG] createSkillButtons 调用成功');

      console.log('[DEBUG] BattleSceneView.createUI 完成');
    } catch (error) {
      console.error('[ERROR] BattleSceneView.createUI 出错:', error);
      throw error;
    }
  }

  /**
   * 创建状态栏
   *
   * 状态栏布局 (适配430*930屏幕)：
   * +---------------------------+
   * | 头像 | HP: 100/100        |
   * |      | MP: 100/100        |
   * +---------------------------+
   *
   * 位置：屏幕左上角 (10, 10)
   * 大小：根据屏幕宽度自适应，最大宽度180像素，高度60像素
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

    console.log(`[DEBUG] 创建状态栏: 屏幕宽度=${screenWidth}, 状态栏宽度=${barWidth}`);
  }

  /**
   * 创建波次指示器
   *
   * 位置：屏幕右上角 (屏幕宽度 - 10, 10)
   * 样式：白色文本，黑色描边
   * 对齐：右对齐
   *
   * 适配430*930屏幕：
   * - 字体大小根据屏幕宽度自适应
   * - 位置贴近屏幕右上角
   */
  private createWaveIndicator(): void {
    // 获取屏幕宽度
    const screenWidth = this.scene.cameras.main.width;

    // 计算字体大小 (适配窄屏设备)
    const fontSize = Math.min(24, Math.max(16, screenWidth * 0.05)); // 最小16px，最大24px

    // 创建波次指示器 (位于屏幕右上角，距离右边缘10像素，距离上边缘10像素)
    this.waveIndicator = this.scene.add.text(
      screenWidth - 10,          // X坐标：屏幕宽度减去10像素
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

    console.log(`[DEBUG] 创建波次指示器: 屏幕宽度=${screenWidth}, 字体大小=${fontSize}`);
  }

  /**
   * 创建暂停/继续按钮
   *
   * 位置：屏幕右上角，波次指示器下方
   * 样式：文本按钮，带背景色
   * 功能：点击切换暂停/继续状态
   */
  private createPauseButton(): void {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;

    // 计算按钮位置 (右上角，波次指示器下方)
    const x = screenWidth - 20; // 距离右边缘20像素
    const y = 80; // 波次指示器下方

    // 创建暂停按钮
    this.pauseButton = this.scene.add.text(
      x,
      y,
      '⏸️ 暂停',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#4a668d',
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5
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

    console.log(`[DEBUG] 创建暂停按钮: 位置=(${x}, ${y})`);
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
        this.battleEngine.pause();

        // 更新按钮文本
        this.pauseButton.setText('▶️ 继续');

        console.log('[DEBUG] 游戏已暂停');
      } else {
        // 继续游戏
        this.battleEngine.resume();

        // 更新按钮文本
        this.pauseButton.setText('⏸️ 暂停');

        console.log('[DEBUG] 游戏已继续');
      }
    } catch (error) {
      console.error('[ERROR] 切换暂停状态失败:', error);
    }
  }

  /**
   * 创建技能按钮
   *
   * 位置：屏幕底部中央 (屏幕宽度/2, 屏幕高度-80)
   * 布局：水平排列的4个技能按钮
   *
   * 技能按钮布局 (适配430*930屏幕)：
   * +-----+  +-----+  +-----+  +-----+
   * |  1  |  |  2  |  |  3  |  |  4  |
   * +-----+  +-----+  +-----+  +-----+
   *
   * 适配策略：
   * - 按钮大小和间距根据屏幕宽度自适应
   * - 窄屏设备上按钮更小、间距更紧凑
   * - 按钮位置更靠近屏幕底部
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
    // 获取当前选择的英雄
    let heroId = 1; // 默认使用1号英雄

    // 尝试从gameState获取选择的英雄
    try {
      if (gameState && gameState.selectedHeroes && gameState.selectedHeroes.length > 0) {
        heroId = gameState.selectedHeroes[0];
        console.log(`[DEBUG] 从gameState获取英雄ID: ${heroId}`);
      } else {
        console.log('[DEBUG] gameState中没有选择的英雄，使用默认英雄ID: 1');
      }
    } catch (error) {
      console.error('[ERROR] 获取选择的英雄失败:', error);
    }

    // 从BattleParamsService获取英雄数据
    let heroData = null;
    try {
      heroData = BattleParamsService.getHeroData(heroId);
      console.log(`[DEBUG] 获取英雄数据: ${heroId}`, heroData ? '成功' : '失败');
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
        console.log(`[DEBUG] 从英雄数据中获取技能: ${JSON.stringify(skillIds)}`);
      } catch (error) {
        console.error('[ERROR] 解析技能数据失败:', error);
        skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4']; // 使用默认技能
      }
    } else {
      // 如果没有找到英雄数据或技能列表，使用默认技能
      skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4'];
      console.log('[DEBUG] 使用默认技能列表');
    }

    // 确保至少有一个技能
    if (skillIds.length === 0) {
      skillIds = ['skill_1'];
      console.log('[DEBUG] 技能列表为空，添加默认技能');
    }

    // 计算按钮大小 (根据屏幕宽度调整)
    const buttonSize = Math.min(60, Math.max(40, screenWidth / 8));

    // 根据屏幕宽度和按钮大小调整按钮间距，确保按钮不会重叠
    // 间距应该至少是按钮直径的1.2倍，避免重叠
    const minSpacing = buttonSize * 2.4; // 确保按钮之间有足够的间距，避免重叠
    const buttonSpacing = Math.min(120, Math.max(minSpacing, screenWidth / 5));

    // 创建4个技能按钮，水平排列
    for (let i = 0; i < skillIds.length; i++) {
      // 计算按钮X坐标，使4个按钮居中排列
      // i=0时 x=-1.5*spacing, i=1时 x=-0.5*spacing
      // i=2时 x=0.5*spacing, i=3时 x=1.5*spacing
      const x = (i - 1.5) * buttonSpacing;

      // 创建技能UI组件 (Y坐标为0，相对于容器)
      // 传递按钮大小参数，使SkillUIComponent能够适配
      const skillUI = new SkillUIComponent(this.scene, x, 0, skillIds[i], buttonSize);

      // 将技能UI组件的容器添加到技能按钮容器中
      this.skillButtonsContainer.add(skillUI.getContainer());

      // 保存技能UI组件的引用
      this.skillUIComponents.set(skillIds[i], skillUI);

      console.log(`[DEBUG] 创建技能按钮 ${skillIds[i]} 在位置 x=${x}, y=0`);
    }

    console.log(`[DEBUG] 创建技能按钮: 屏幕尺寸=${screenWidth}x${screenHeight}, 按钮间距=${buttonSpacing}, 按钮大小=${buttonSize}`);
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 监听实体创建事件
    this.eventManager.on(EventType.ENTITY_CREATED, this.onEntityCreated.bind(this));

    // 监听实体移动事件
    this.eventManager.on(EventType.ENTITY_MOVED, this.onEntityMoved.bind(this));

    // 监听伤害事件
    this.eventManager.on(EventType.DAMAGE_DEALT, this.onDamageDealt.bind(this));

    // 监听技能释放事件
    this.eventManager.on(EventType.SKILL_CAST, this.onSkillCast.bind(this));

    // 监听技能效果应用事件
    this.eventManager.on(EventType.SKILL_EFFECT_APPLIED, this.onSkillEffectApplied.bind(this));

    // 监听技能冷却完成事件
    this.eventManager.on(EventType.SKILL_COOLDOWN_UPDATE, this.onSkillCooldownUpdate.bind(this));

    // 监听实体状态变化事件
    this.eventManager.on(EventType.ENTITY_STATE_CHANGED, this.onEntityStateChanged.bind(this));

    // 监听波次变化事件
    this.eventManager.on('waveChanged', this.onWaveChanged.bind(this));

    // 监听波次完成事件
    this.eventManager.on('waveCompleted', this.onWaveCompleted.bind(this));

    // 监听战斗结束事件
    this.eventManager.on(EventType.GAME_OVER, this.onGameOver.bind(this));

  }

  /**
   * 更新
   * @param time 当前时间
   * @param delta 时间增量
   */
  public update(time: number, delta: number): void {
    // 更新实体位置和状态
    this.updateEntities();

    // 更新UI
    this.updateUI();

    // 更新技能冷却
    this.updateSkillCooldowns(delta);

    // 更新触摸控制器
    this.touchController.update(time, delta);
  }

  /**
   * 更新实体
   */
  private updateEntities(): void {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 更新英雄
    if (battleStats.heroStats) {
      for (const hero of battleStats.heroStats) {
        const sprite = this.entitySprites.get(hero.id);
        if (sprite) {
          // 更新位置
          const screenPos = this.worldToScreenPosition(hero.position);
          sprite.x = screenPos.x;
          sprite.y = screenPos.y;

          // 更新生命值条
          this.updateHealthBar(hero.id, hero.hp, hero.maxHp);

          // 聚焦摄像机到英雄
          this.focusCameraOnHero(hero.position);
        }
      }
    }

    // 更新水晶
    if (battleStats.crystalStats) {
      const sprite = this.entitySprites.get('crystal_1');
      if (sprite) {
        // 更新生命值条
        this.updateHealthBar('crystal_1', battleStats.crystalStats.hp, battleStats.crystalStats.maxHp);
      } else {
        // 如果水晶精灵不存在但有水晶状态，记录日志
        console.log('[DEBUG] 水晶状态存在但精灵不存在，可能是实体创建事件未被正确处理');
      }
    }

    // TODO: 更新豆豆
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 更新状态栏
    if (battleStats.heroStats && battleStats.heroStats.length > 0) {
      const hero = battleStats.heroStats[0];

      // 更新生命值条
      const hpBar = this.statusBar.getAt(3) as Phaser.GameObjects.Rectangle;
      hpBar.width = 130 * (hero.hp / hero.maxHp);

      // 更新魔法值条
      const mpBar = this.statusBar.getAt(5) as Phaser.GameObjects.Rectangle;
      mpBar.width = 130 * (hero.mp / hero.maxMp);

      // 更新生命值文本
      const hpText = this.statusBar.getAt(6) as Phaser.GameObjects.Text;
      hpText.setText(`${Math.floor(hero.hp)}/${hero.maxHp}`);

      // 更新魔法值文本
      const mpText = this.statusBar.getAt(7) as Phaser.GameObjects.Text;
      mpText.setText(`${Math.floor(hero.mp)}/${hero.maxMp}`);
    }

    // 更新波次指示器
    if (battleStats.currentWave) {
      this.waveIndicator.setText(`Wave: ${battleStats.currentWave.number}`);
    }
  }

  /**
   * 更新技能冷却
   * @param delta 时间增量
   */
  private updateSkillCooldowns(delta: number): void {
    // 更新所有技能UI组件的冷却
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.updateCooldown(delta);
    }
  }

  /**
   * 更新生命值条
   *
   * 生命值条布局 (适配430*930屏幕)：
   * +--------------------------------------------------+
   * |                                                  |
   * |                  [生命值条]                      |  <- 位于实体上方，距离根据实体大小调整
   * |                     实体                         |
   * |                                                  |
   * +--------------------------------------------------+
   *
   * 生命值条样式：
   * - 宽度：根据实体大小自适应
   * - 高度：根据实体大小自适应
   * - 背景：半透明黑色
   * - 前景：绿色（根据生命值比例显示）
   *
   * @param entityId 实体ID
   * @param currentHp 当前生命值
   * @param maxHp 最大生命值
   */
  private updateHealthBar(entityId: string, currentHp: number, maxHp: number): void {
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
  private showDamageNumber(position: Vector2D, damage: number, isCritical: boolean = false): void {
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
   * 世界坐标转屏幕坐标
   *
   * 坐标系统说明：
   * - 世界坐标：游戏逻辑使用的坐标系统，范围是 0-3000 (x和y方向)
   * - 屏幕坐标：实际显示在屏幕上的像素坐标，范围是 0-屏幕宽高
   *
   * 转换方法：
   * - X坐标：(世界X / 3000) * 屏幕宽度
   * - Y坐标：(世界Y / 3000) * 屏幕高度
   *
   * 示例：
   * - 世界坐标 (1500, 1500) -> 屏幕坐标 (屏幕宽度/2, 屏幕高度/2)
   * - 世界坐标 (0, 0) -> 屏幕坐标 (0, 0)
   * - 世界坐标 (3000, 3000) -> 屏幕坐标 (屏幕宽度, 屏幕高度)
   *
   * @param position 世界坐标
   * @returns 屏幕坐标
   */
  private worldToScreenPosition(position: Vector2D): Vector2D {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // 执行坐标转换
    return {
      x: (position.x / 3000) * screenWidth,  // 世界X坐标映射到屏幕宽度
      y: (position.y / 3000) * screenHeight  // 世界Y坐标映射到屏幕高度
    };
  }

  /**
   * 屏幕坐标转世界坐标
   *
   * 坐标系统说明：
   * - 屏幕坐标：实际显示在屏幕上的像素坐标，范围是 0-屏幕宽高
   * - 世界坐标：游戏逻辑使用的坐标系统，范围是 0-3000 (x和y方向)
   *
   * 转换方法：
   * - X坐标：(屏幕X / 屏幕宽度) * 3000
   * - Y坐标：(屏幕Y / 屏幕高度) * 3000
   *
   * 示例：
   * - 屏幕坐标 (屏幕宽度/2, 屏幕高度/2) -> 世界坐标 (1500, 1500)
   * - 屏幕坐标 (0, 0) -> 世界坐标 (0, 0)
   * - 屏幕坐标 (屏幕宽度, 屏幕高度) -> 世界坐标 (3000, 3000)
   *
   * 注意：此方法主要用于处理用户输入，将屏幕点击位置转换为游戏世界位置
   *
   * @param screenPos 屏幕坐标
   * @returns 世界坐标
   */
  private screenToWorldPosition(screenPos: Vector2D): Vector2D {
    // 获取屏幕尺寸
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // 执行坐标转换
    return {
      x: (screenPos.x / screenWidth) * 3000,  // 屏幕X坐标映射到世界宽度
      y: (screenPos.y / screenHeight) * 3000  // 屏幕Y坐标映射到世界高度
    };
  }

  /**
   * 聚焦摄像机到英雄
   * @param heroPosition 英雄的世界坐标
   */
  private focusCameraOnHero(heroPosition: Vector2D): void {
    // 将世界坐标转换为屏幕坐标
    const screenPos = this.worldToScreenPosition(heroPosition);

    // 设置摄像机跟随目标
    // 使用平滑移动效果，让摄像机缓慢跟随英雄
    this.scene.cameras.main.pan(
      screenPos.x,
      screenPos.y,
      300, // 移动持续时间（毫秒）
      'Sine.easeOut' // 缓动函数
    );
  }

  /**
   * 实体创建事件处理
   *
   * 实体在游戏世界中的位置分布：
   * - 英雄：玩家控制的角色，初始位于游戏世界中央附近
   * - 水晶：位于游戏世界中央 (1500, 1500)
   * - 豆豆：敌人，分布在水晶周围的随机位置
   *
   * 实体显示 (适配430*930屏幕)：
   * - 英雄：使用 🧙 表示，大小根据屏幕宽度自适应
   * - 水晶：使用 💎 表示，大小根据屏幕宽度自适应
   * - 豆豆：使用 🟢 表示，大小根据屏幕宽度自适应
   *
   * @param event 事件数据
   */
  private onEntityCreated(event: EntityCreatedEvent): void {
    console.log('[DEBUG] onEntityCreated 被调用，数据:', event);
    console.log('[DEBUG] 实体详细信息 - ID:', event.id, '类型:', event.entityType, '位置:', JSON.stringify(event.position), '属性:', JSON.stringify(event.stats));

    // 特别记录水晶和英雄的创建
    if (event.entityType === 'crystal') {
      console.log('[DEBUG] 检测到水晶创建事件! ID:', event.id, '位置:', JSON.stringify(event.position));
      // 记录所有已注册的事件类型，检查是否有监听 ENTITY_CREATED 事件
      console.log('[DEBUG] 已注册的事件类型:', this.eventManager.eventTypes ? this.eventManager.eventTypes() : '无法获取');
      // 记录 ENTITY_CREATED 事件的监听器数量
      console.log('[DEBUG] ENTITY_CREATED 事件监听器数量:', this.eventManager.listenerCount ? this.eventManager.listenerCount('entityCreated') : '无法获取');
    } else if (event.entityType === 'hero') {
      console.log('[DEBUG] 检测到英雄创建事件! ID:', event.id, '位置:', JSON.stringify(event.position));
    }

    try {
      // 获取屏幕尺寸
      const screenWidth = this.scene.cameras.main.width;

      // 创建实体精灵
      const entityId = event.id;
      const entityType = event.entityType;

      // 检查实体类型是否有效
      if (!entityType) {
        console.error('[ERROR] 实体类型无效:', entityType);
        // 使用默认类型
        event.entityType = 'bean';
      }

      // 确保位置数据存在
      if (!event.position || typeof event.position.x !== 'number' || typeof event.position.y !== 'number') {
        console.error('[ERROR] 实体位置数据无效:', event.position);
        // 使用默认位置
        event.position = { x: 1500, y: 1500 };
      }

      const position = event.position;

      // 转换为屏幕坐标 (将游戏世界坐标转换为屏幕像素坐标)
      const screenPos = this.worldToScreenPosition(position);

      // 计算实体大小 (根据屏幕宽度自适应)
      const heroSize = Math.min(48, Math.max(32, screenWidth * 0.09)); // 英雄和水晶大小
      const beanSize = Math.min(32, Math.max(24, screenWidth * 0.06)); // 豆豆大小

      // 使用Text对象显示Emoji而不是Sprite
      let sprite: Phaser.GameObjects.Text;

      // 使用更新后的实体类型
      const finalEntityType = event.entityType;

      switch (finalEntityType) {
        case 'hero':
          // 使用英雄Emoji (位于转换后的屏幕坐标)
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '🧙', {
            fontSize: `${heroSize}px`  // 英雄大小自适应
          });
          sprite.setOrigin(0.5);  // 设置原点为中心，使Emoji居中显示

          // 如果是英雄，立即聚焦摄像机
          this.focusCameraOnHero(position);
          console.log('[DEBUG] 英雄创建成功:', entityId, '位置:', screenPos, '大小:', heroSize);
          break;

        case 'bean':
          // 使用豆豆Emoji (位于转换后的屏幕坐标)
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '🟢', {
            fontSize: `${beanSize}px`  // 豆豆大小自适应
          });
          sprite.setOrigin(0.5);  // 设置原点为中心，使Emoji居中显示
          console.log('[DEBUG] 豆豆创建成功:', entityId, '位置:', screenPos, '大小:', beanSize);
          break;

        case 'crystal':
          // 使用水晶Emoji (位于转换后的屏幕坐标)
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '💎', {
            fontSize: `${heroSize}px`  // 水晶大小自适应
          });
          sprite.setOrigin(0.5);  // 设置原点为中心，使Emoji居中显示
          console.log('[DEBUG] 水晶创建成功:', entityId, '位置:', screenPos, '大小:', heroSize);
          break;

        default:
          console.warn('[WARN] 未知实体类型:', finalEntityType);
          // 使用默认的豆豆Emoji作为后备
          sprite = this.scene.add.text(screenPos.x, screenPos.y, '❓', {
            fontSize: `${beanSize}px`
          });
          sprite.setOrigin(0.5);
          console.log('[DEBUG] 使用默认图标创建未知实体:', entityId, '类型:', finalEntityType);
          break;
      }

      // 添加到映射
      this.entitySprites.set(entityId, sprite as any);

      // 创建生命值条 (位于实体上方)
      const healthBar = this.scene.add.graphics();
      this.entityHealthBars.set(entityId, healthBar);

      // 确保stats数据存在
      if (!event.stats) {
        console.error('[ERROR] 实体属性数据无效:', event.stats);
        // 使用默认属性
        event.stats = { hp: 100, maxHp: 100 };
      }

      // 更新生命值条
      this.updateHealthBar(entityId, event.stats.hp, event.stats.maxHp);

      console.log('[DEBUG] 实体创建完成:', entityId);
    } catch (error) {
      console.error('[ERROR] onEntityCreated 出错:', error);
    }
  }

  /**
   * 实体移动事件处理
   * @param event 事件数据
   */
  private onEntityMoved(event: EntityMovedEvent): void {
    console.log('[DEBUG] onEntityMoved 被调用，数据:', event);

    try {
      const entityId = event.entityId;

      // 确保位置数据存在
      if (!event.position || typeof event.position.x !== 'number' || typeof event.position.y !== 'number') {
        console.error('[ERROR] 实体位置数据无效:', event.position);
        return;
      }

      const position = event.position;

      // 获取实体精灵
      const sprite = this.entitySprites.get(entityId);
      if (!sprite) {
        console.warn('[WARN] 找不到实体精灵:', entityId);
        return;
      }

      // 转换为屏幕坐标
      const screenPos = this.worldToScreenPosition(position);

      // 移动精灵
      this.scene.tweens.add({
        targets: sprite,
        x: screenPos.x,
        y: screenPos.y,
        duration: 100,
        ease: 'Linear'
      });

      // 如果是英雄，聚焦摄像机
      if (entityId.startsWith('hero_')) {
        this.focusCameraOnHero(position);
      }

      console.log('[DEBUG] 实体移动完成:', entityId, '新位置:', screenPos);
    } catch (error) {
      console.error('[ERROR] onEntityMoved 出错:', error);
    }
  }

  /**
   * 伤害事件处理
   * @param event 事件数据
   */
  private onDamageDealt(event: DamageDealtEvent): void {
    const targetId = event.targetId;
    const damage = event.damage;
    const isCritical = event.isCritical || false;

    // 获取目标精灵
    const sprite = this.entitySprites.get(targetId);
    if (!sprite) {
      return;
    }

    // 显示伤害数字
    this.showDamageNumber(
      { x: sprite.x, y: sprite.y },
      damage,
      isCritical
    );

    // 播放受击动画
    sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      sprite.clearTint();
    });
  }

  /**
   * 技能释放事件处理
   * @param event 事件数据
   */
  private onSkillCast(event: SkillCastEvent): void {
    console.log('[DEBUG] onSkillCast 被调用，数据:', event);

    try {
      const skillId = event.skillId;
      const casterId = event.casterId;
      const targetIds = event.targetIds;
      const position = event.position;

      // 获取施法者精灵
      const casterSprite = this.entitySprites.get(casterId);
      if (!casterSprite) {
        console.warn('[WARN] 找不到施法者精灵:', casterId);
        return;
      }

      // 播放施法动画（使用缩放效果代替动画）
      this.scene.tweens.add({
        targets: casterSprite,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power1'
      });

      // 触发技能UI冷却
      const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
      if (skillUI) {
        skillUI.triggerCooldown();
      }

      // 如果有目标，播放技能效果
      if (targetIds && targetIds.length > 0) {
        for (const targetId of targetIds) {
          const targetSprite = this.entitySprites.get(targetId);
          if (targetSprite) {
            // 创建简单的技能效果（发光粒子）
            const particles = this.scene.add.particles(0, 0, 'white', {
              speed: { min: 50, max: 100 },
              angle: { min: 0, max: 360 },
              scale: { start: 0.5, end: 0 },
              lifespan: 500,
              blendMode: 'ADD',
              emitting: false
            });

            // 设置粒子发射器位置
            particles.setPosition(casterSprite.x, casterSprite.y);

            // 发射粒子
            particles.explode(20, targetSprite.x, targetSprite.y);

            // 一段时间后销毁粒子发射器
            this.scene.time.delayedCall(1000, () => {
              particles.destroy();
            });

            console.log('[DEBUG] 播放技能效果:', skillId, '从', casterId, '到', targetId);
          }
        }
      } else if (position) {
        // 如果有位置，播放技能效果到位置
        const screenPos = this.worldToScreenPosition(position);

        // 创建简单的技能效果（发光粒子）
        const particles = this.scene.add.particles(0, 0, 'white', {
          speed: { min: 50, max: 100 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 0 },
          lifespan: 500,
          blendMode: 'ADD',
          emitting: false
        });

        // 设置粒子发射器位置
        particles.setPosition(casterSprite.x, casterSprite.y);

        // 发射粒子
        particles.explode(20, screenPos.x, screenPos.y);

        // 一段时间后销毁粒子发射器
        this.scene.time.delayedCall(1000, () => {
          particles.destroy();
        });

        console.log('[DEBUG] 播放技能效果:', skillId, '从', casterId, '到位置', screenPos);
      }
    } catch (error) {
      console.error('[ERROR] onSkillCast 出错:', error);
    }
  }

  /**
   * 技能效果应用事件处理
   * @param event 事件数据
   */
  private onSkillEffectApplied(event: SkillEffectAppliedEvent): void {
    const effectType = event.effectType;
    const targetId = event.targetId;
    const sourceSkillId = event.sourceSkillId;

    // 获取目标精灵
    const sprite = this.entitySprites.get(targetId);
    if (!sprite) {
      return;
    }

    // 播放效果动画
    this.skillEffectView.playEffectAnimation(
      effectType,
      { x: sprite.x, y: sprite.y }
    );
  }

  /**
   * 技能冷却更新事件处理
   * @param event 事件数据
   */
  private onSkillCooldownUpdate(event: SkillCooldownUpdateEvent): void {
    const skillId = event.skillId;
    const isReady = event.progress >= 1.0;

    // 更新技能UI
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.setAvailable(isReady);
      skillUI.updateCooldownProgress(event.progress);
    }
  }

  /**
   * 实体状态变化事件处理
   * @param event 事件数据
   */
  private onEntityStateChanged(event: EntityStateChangedEvent): void {
    const entityId = event.entityId;
    const state = event.state;

    // 如果状态是死亡，处理实体死亡
    if (state === 'dead') {
      this.handleEntityDeath(entityId);
    }
  }

  /**
   * 处理实体死亡
   * @param entityId 实体ID
   */
  private handleEntityDeath(entityId: string): void {

    // 获取实体精灵
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
   * 波次变化事件处理
   * @param data 事件数据
   */
  private onWaveChanged(data: any): void {
    console.log('[DEBUG] onWaveChanged 被调用，数据:', data);

    try {
      // 确保 data.number 存在，如果不存在则使用 data.waveIndex + 1 或默认值 1
      const waveNumber = data.number || (data.waveIndex !== undefined ? data.waveIndex + 1 : 1);

      console.log('[DEBUG] 波次变化为:', waveNumber);

      // 更新波次指示器
      this.waveIndicator.setText(`Wave: ${waveNumber}`);

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

      console.log('[DEBUG] 波次提示显示完成');
    } catch (error) {
      console.error('[ERROR] onWaveChanged 出错:', error);
    }
  }

  /**
   * 波次完成事件处理
   * @param data 事件数据
   */
  private onWaveCompleted(data: any): void {
    console.log('[DEBUG] onWaveCompleted 被调用，数据:', data);

    try {
      const waveIndex = data.waveIndex;
      const waveName = data.waveName;
      const duration = data.duration;

      console.log(`[DEBUG] 波次完成: 第${waveIndex + 1}波 - ${waveName}, 用时: ${duration}ms`);

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

        // 调用战斗引擎的波次管理器开始下一波
        this.battleEngine.getWaveManager().startNextWave();

        console.log('[DEBUG] 开始下一波');
      });

      console.log('[DEBUG] 波次完成提示显示完成');
    } catch (error) {
      console.error('[ERROR] onWaveCompleted 出错:', error);
    }
  }

  /**
   * 游戏结束事件处理
   * @param event 事件数据
   */
  private onGameOver(event: GameOverEvent): void {
    const result = event.result;

    // 显示结果面板
    const resultText = result === 'victory' ? '胜利！' : '失败！';

    const panel = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      300,
      200,
      0x000000,
      0.8
    );

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

    button.on('pointerdown', () => {
      // 返回到关卡选择场景
      this.scene.scene.start('LevelSelectScene');
    });
  }

  /**
   * 销毁
   */
  public destroy(): void {
    // 移除事件监听
    this.eventManager.off(EventType.ENTITY_CREATED, this.onEntityCreated.bind(this));
    this.eventManager.off(EventType.ENTITY_MOVED, this.onEntityMoved.bind(this));
    this.eventManager.off(EventType.DAMAGE_DEALT, this.onDamageDealt.bind(this));
    this.eventManager.off(EventType.SKILL_CAST, this.onSkillCast.bind(this));
    this.eventManager.off(EventType.SKILL_EFFECT_APPLIED, this.onSkillEffectApplied.bind(this));
    this.eventManager.off(EventType.SKILL_COOLDOWN_UPDATE, this.onSkillCooldownUpdate.bind(this));
    this.eventManager.off(EventType.ENTITY_STATE_CHANGED, this.onEntityStateChanged.bind(this));
    this.eventManager.off('waveChanged', this.onWaveChanged.bind(this));
    this.eventManager.off('waveCompleted', this.onWaveCompleted.bind(this));
    this.eventManager.off(EventType.GAME_OVER, this.onGameOver.bind(this));

    // 销毁组件
    this.skillEffectView.clearAllEffects();
    for (const skillUI of this.skillUIComponents.values()) {
      skillUI.destroy();
    }
    this.touchController.destroy();

    // 销毁实体显示对象
    for (const sprite of this.entitySprites.values()) {
      sprite.destroy();
    }
    for (const healthBar of this.entityHealthBars.values()) {
      healthBar.destroy();
    }

    // 销毁UI元素
    this.statusBar.destroy();
    this.waveIndicator.destroy();
    this.skillButtonsContainer.destroy();

    // 销毁伤害数字
    this.damageTexts.clear(true, true);
  }
}
