/**
 * 战斗场景视图
 * 负责将战斗引擎的状态转换为可视化的游戏场景
 */

import Phaser from 'phaser';
import { BattleEngine } from '@/Battle/Core/BattleEngine';
import { EventManager } from '@/Battle/Core/EventManager';
import { SkillEffectView } from '@/Battle/View/SkillEffectView';
import { SkillUIComponent } from '@/Battle/View/SkillUIComponent';
import { TouchController } from '@/Battle/View/TouchController';
import { Vector2D } from '@/Battle/Types/Vector2D';
import { EntityType } from '@/Battle/Entities/Entity';

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
  private skillButtonsContainer: Phaser.GameObjects.Container;

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
   */
  private createUI(): void {
    console.log('[DEBUG] BattleSceneView.createUI 开始');

    try {
      // 创建状态栏
      console.log('[DEBUG] 调用 createStatusBar...');
      this.createStatusBar();
      console.log('[DEBUG] createStatusBar 调用成功');

      // 创建波次指示器
      console.log('[DEBUG] 调用 createWaveIndicator...');
      this.createWaveIndicator();
      console.log('[DEBUG] createWaveIndicator 调用成功');

      // 创建技能按钮
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
   */
  private createStatusBar(): void {
    // 创建状态栏容器
    this.statusBar = this.scene.add.container(10, 10);

    // 创建背景
    const bg = this.scene.add.rectangle(0, 0, 200, 60, 0x000000, 0.5);
    bg.setOrigin(0, 0);
    this.statusBar.add(bg);

    // 创建英雄头像
    const heroIcon = this.scene.add.image(20, 30, 'hero_icon');
    heroIcon.setScale(0.5);
    this.statusBar.add(heroIcon);

    // 创建生命值条背景
    const hpBarBg = this.scene.add.rectangle(60, 20, 130, 15, 0x333333);
    hpBarBg.setOrigin(0, 0);
    this.statusBar.add(hpBarBg);

    // 创建生命值条
    const hpBar = this.scene.add.rectangle(60, 20, 130, 15, 0xff0000);
    hpBar.setOrigin(0, 0);
    this.statusBar.add(hpBar);

    // 创建魔法值条背景
    const mpBarBg = this.scene.add.rectangle(60, 40, 130, 15, 0x333333);
    mpBarBg.setOrigin(0, 0);
    this.statusBar.add(mpBarBg);

    // 创建魔法值条
    const mpBar = this.scene.add.rectangle(60, 40, 130, 15, 0x0000ff);
    mpBar.setOrigin(0, 0);
    this.statusBar.add(mpBar);

    // 创建生命值文本
    const hpText = this.scene.add.text(125, 20, '100/100', {
      fontSize: '12px',
      color: '#ffffff'
    });
    hpText.setOrigin(0.5, 0);
    this.statusBar.add(hpText);

    // 创建魔法值文本
    const mpText = this.scene.add.text(125, 40, '100/100', {
      fontSize: '12px',
      color: '#ffffff'
    });
    mpText.setOrigin(0.5, 0);
    this.statusBar.add(mpText);
  }

  /**
   * 创建波次指示器
   */
  private createWaveIndicator(): void {
    // 创建波次指示器
    this.waveIndicator = this.scene.add.text(
      this.scene.cameras.main.width - 20,
      20,
      'Wave: 1',
      {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    this.waveIndicator.setOrigin(1, 0);
  }

  /**
   * 创建技能按钮
   */
  private createSkillButtons(): void {
    // 创建技能按钮容器
    this.skillButtonsContainer = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 100
    );

    // 创建技能按钮
    const skillIds = ['skill_1', 'skill_2', 'skill_3', 'skill_4'];

    // 根据屏幕宽度调整按钮间距
    const buttonSpacing = Math.min(85, this.scene.cameras.main.width / 5);

    for (let i = 0; i < skillIds.length; i++) {
      const x = (i - 1.5) * buttonSpacing;
      const skillUI = new SkillUIComponent(this.scene, x, 0, skillIds[i]);
      this.skillUIComponents.set(skillIds[i], skillUI);
    }
  }

  /**
   * 注册事件监听
   */
  private registerEventListeners(): void {
    // 监听实体创建事件
    this.eventManager.on('entityCreated', this.onEntityCreated.bind(this));

    // 监听实体移动事件
    this.eventManager.on('entityMoved', this.onEntityMoved.bind(this));

    // 监听伤害事件
    this.eventManager.on('damageDealt', this.onDamageDealt.bind(this));

    // 监听技能释放事件
    this.eventManager.on('skillCast', this.onSkillCast.bind(this));

    // 监听技能效果应用事件
    this.eventManager.on('skillEffectApplied', this.onSkillEffectApplied.bind(this));

    // 监听技能冷却完成事件
    this.eventManager.on('skillCooldownComplete', this.onSkillCooldownComplete.bind(this));

    // 监听实体死亡事件
    this.eventManager.on('entityDied', this.onEntityDied.bind(this));

    // 监听波次变化事件
    this.eventManager.on('waveChanged', this.onWaveChanged.bind(this));

    // 监听战斗结束事件
    this.eventManager.on('battleEnd', this.onBattleEnd.bind(this));
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
   * @param entityId 实体ID
   * @param currentHp 当前生命值
   * @param maxHp 最大生命值
   */
  private updateHealthBar(entityId: string, currentHp: number, maxHp: number): void {
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

    // 更新生命值条
    healthBar.clear();

    // 绘制背景
    healthBar.fillStyle(0x000000, 0.5);
    healthBar.fillRect(-25, -40, 50, 8);

    // 绘制生命值
    healthBar.fillStyle(0x00ff00);
    healthBar.fillRect(-25, -40, 50 * ratio, 8);

    // 设置位置
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
   * @param data 事件数据
   */
  private onEntityCreated(data: any): void {
    // 创建实体精灵
    const entityId = data.id;
    const entityType = data.type;
    const position = data.position;

    // 转换为屏幕坐标
    const screenPos = this.worldToScreenPosition(position);

    let sprite: Phaser.GameObjects.Sprite;

    switch (entityType) {
      case EntityType.HERO:
        sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'hero');
        sprite.play('hero_idle');

        // 如果是英雄，立即聚焦摄像机
        this.focusCameraOnHero(position);
        break;

      case EntityType.BEAN:
        sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'bean');
        sprite.play('bean_idle');
        break;

      case EntityType.CRYSTAL:
        sprite = this.scene.add.sprite(screenPos.x, screenPos.y, 'crystal');
        sprite.play('crystal_idle');
        break;

      default:
        return;
    }

    // 添加到映射
    this.entitySprites.set(entityId, sprite);

    // 创建生命值条
    const healthBar = this.scene.add.graphics();
    this.entityHealthBars.set(entityId, healthBar);

    // 更新生命值条
    this.updateHealthBar(entityId, data.stats.hp, data.stats.maxHp);
  }

  /**
   * 实体移动事件处理
   * @param data 事件数据
   */
  private onEntityMoved(data: any): void {
    const entityId = data.id;
    const position = data.position;

    // 获取实体精灵
    const sprite = this.entitySprites.get(entityId);
    if (!sprite) {
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
  }

  /**
   * 伤害事件处理
   * @param data 事件数据
   */
  private onDamageDealt(data: any): void {
    const targetId = data.targetId;
    const damage = data.damage;
    const isCritical = data.isCritical;

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
   * @param data 事件数据
   */
  private onSkillCast(data: any): void {
    const skillId = data.skillId;
    const casterId = data.casterId;
    const targetIds = data.targetIds;
    const position = data.position;

    // 获取施法者精灵
    const casterSprite = this.entitySprites.get(casterId);
    if (!casterSprite) {
      return;
    }

    // 播放施法动画
    if (casterSprite.anims.exists('hero_attack')) {
      casterSprite.play('hero_attack');
    }

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
          this.skillEffectView.playSkillEffect(
            `skill_${skillId}`,
            { x: casterSprite.x, y: casterSprite.y },
            { x: targetSprite.x, y: targetSprite.y }
          );
        }
      }
    } else if (position) {
      // 如果有位置，播放技能效果到位置
      const screenPos = this.worldToScreenPosition(position);
      this.skillEffectView.playSkillEffect(
        `skill_${skillId}`,
        { x: casterSprite.x, y: casterSprite.y },
        screenPos
      );
    }
  }

  /**
   * 技能效果应用事件处理
   * @param data 事件数据
   */
  private onSkillEffectApplied(data: any): void {
    const effectId = data.effectId;
    const targetId = data.targetId;
    const type = data.type;

    // 获取目标精灵
    const sprite = this.entitySprites.get(targetId);
    if (!sprite) {
      return;
    }

    // 播放效果动画
    this.skillEffectView.playEffectAnimation(
      type,
      { x: sprite.x, y: sprite.y }
    );
  }

  /**
   * 技能冷却完成事件处理
   * @param data 事件数据
   */
  private onSkillCooldownComplete(data: any): void {
    const skillId = data.skillId;

    // 更新技能UI
    const skillUI = this.skillUIComponents.get(`skill_${skillId}`);
    if (skillUI) {
      skillUI.setAvailable(true);
    }
  }

  /**
   * 实体死亡事件处理
   * @param data 事件数据
   */
  private onEntityDied(data: any): void {
    const entityId = data.id;

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
    const waveNumber = data.number;

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
  }

  /**
   * 战斗结束事件处理
   * @param data 事件数据
   */
  private onBattleEnd(data: any): void {
    const result = data.result;

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
    this.eventManager.off('entityCreated', this.onEntityCreated.bind(this));
    this.eventManager.off('entityMoved', this.onEntityMoved.bind(this));
    this.eventManager.off('damageDealt', this.onDamageDealt.bind(this));
    this.eventManager.off('skillCast', this.onSkillCast.bind(this));
    this.eventManager.off('skillEffectApplied', this.onSkillEffectApplied.bind(this));
    this.eventManager.off('skillCooldownComplete', this.onSkillCooldownComplete.bind(this));
    this.eventManager.off('entityDied', this.onEntityDied.bind(this));
    this.eventManager.off('waveChanged', this.onWaveChanged.bind(this));
    this.eventManager.off('battleEnd', this.onBattleEnd.bind(this));

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
