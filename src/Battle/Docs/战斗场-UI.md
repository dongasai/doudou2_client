# 战斗场UI文档

## 概述

战斗场UI是玩家在战斗过程中与游戏交互的主要界面，它提供了战斗状态的可视化展示和操作控制。本文档详细描述了战斗场UI的组成部分、功能和实现方式。

## UI组件结构

战斗场UI由以下主要组件构成：

1. **状态栏**：显示水晶HP + 英雄HP/MP
2. **波次指示器**：显示当前波次和总波次
3. **技能按钮**：显示可用技能及其冷却状态
4. **暂停按钮**：暂停游戏
5. **实体指示器**：当实体（如豆豆）在屏幕外时显示方向指示
6. **伤害数字**：显示实体受到的伤害
7. **效果动画**：显示技能和buff效果

## 实现类

战斗场UI的实现主要涉及以下类：

- `BattleSceneView`：战斗场景视图，负责创建和管理UI组件
- `UIManager`：UI管理器，负责创建和更新UI元素
- `EntityRenderer`：实体渲染器，负责渲染实体和相关效果
- `EventHandlers`：事件处理器，负责处理战斗事件并更新UI
- `SkillEffectView`：技能效果视图，负责显示技能效果

## 状态栏

状态栏显示水晶HP + 英雄HP/MP，位于屏幕顶部。

### 实现方式

```typescript
// 在UIManager中创建状态栏
private createStatusBar(): void {
  // 创建背景
  this.statusBarBg = this.scene.add.rectangle(
    this.scene.cameras.main.width / 2,
    40,
    this.scene.cameras.main.width - 20,
    70,
    0x000000,
    0.7
  );
  this.statusBarBg.setOrigin(0.5, 0.5);
  this.statusBarBg.setScrollFactor(0);

  // 创建水晶HP条
  this.crystalHpBar = this.scene.add.rectangle(
    20,
    15,
    this.scene.cameras.main.width - 60,
    12,
    0xff5555
  );
  this.crystalHpBar.setOrigin(0, 0);
  this.crystalHpBar.setScrollFactor(0);

  // 创建英雄HP条
  this.heroHpBar = this.scene.add.rectangle(
    20,
    35,
    this.scene.cameras.main.width - 60,
    12,
    0xff0000
  );
  this.heroHpBar.setOrigin(0, 0);
  this.heroHpBar.setScrollFactor(0);

  // 创建英雄MP条
  this.heroMpBar = this.scene.add.rectangle(
    20,
    55,
    this.scene.cameras.main.width - 60,
    12,
    0x0000ff
  );
  this.heroMpBar.setOrigin(0, 0);
  this.heroMpBar.setScrollFactor(0);

  // 创建文本标签
  this.crystalHpText = this.scene.add.text(
    30,
    15,
    '水晶: 1000/1000',
    { fontSize: '10px', color: '#ffffff' }
  );
  this.crystalHpText.setOrigin(0, 0.5);
  this.crystalHpText.setScrollFactor(0);

  this.heroHpText = this.scene.add.text(
    30,
    35,
    '英雄HP: 100/100',
    { fontSize: '10px', color: '#ffffff' }
  );
  this.heroHpText.setOrigin(0, 0.5);
  this.heroHpText.setScrollFactor(0);

  this.heroMpText = this.scene.add.text(
    30,
    55,
    '英雄MP: 100/100',
    { fontSize: '10px', color: '#ffffff' }
  );
  this.heroMpText.setOrigin(0, 0.5);
  this.heroMpText.setScrollFactor(0);
}

// 更新状态栏
public updateStatusBar(crystalHp: number, crystalMaxHp: number, heroHp: number, heroMaxHp: number, heroMp: number, heroMaxMp: number): void {
  // 更新水晶HP条
  const crystalHpRatio = Math.max(0, Math.min(1, crystalHp / crystalMaxHp));
  this.crystalHpBar.width = (this.scene.cameras.main.width - 60) * crystalHpRatio;
  this.crystalHpText.setText(`水晶: ${crystalHp}/${crystalMaxHp}`);

  // 更新英雄HP条
  const heroHpRatio = Math.max(0, Math.min(1, heroHp / heroMaxHp));
  this.heroHpBar.width = (this.scene.cameras.main.width - 60) * heroHpRatio;
  this.heroHpText.setText(`英雄HP: ${heroHp}/${heroMaxHp}`);

  // 更新英雄MP条
  const heroMpRatio = Math.max(0, Math.min(1, heroMp / heroMaxMp));
  this.heroMpBar.width = (this.scene.cameras.main.width - 60) * heroMpRatio;
  this.heroMpText.setText(`英雄MP: ${heroMp}/${heroMaxMp}`);
}

// 仅更新水晶HP（用于水晶受伤时）
public updateCrystalHp(hp: number, maxHp: number): void {
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
  this.crystalHpBar.width = (this.scene.cameras.main.width - 60) * hpRatio;
  this.crystalHpText.setText(`水晶: ${hp}/${maxHp}`);

  // 根据生命值百分比改变颜色
  if (hpRatio < 0.3) {
    // 生命值低于30%，显示红色
    this.crystalHpBar.fillColor = 0xff0000;
  } else if (hpRatio < 0.7) {
    // 生命值低于70%，显示黄色
    this.crystalHpBar.fillColor = 0xffff00;
  } else {
    // 生命值正常，显示浅红色
    this.crystalHpBar.fillColor = 0xff5555;
  }
}
```

## 波次指示器

波次指示器显示当前波次和总波次，位于屏幕右上角。

### 实现方式

```typescript
// 在UIManager中创建波次指示器
private createWaveIndicator(): void {
  this.waveIndicator = this.scene.add.text(
    this.scene.cameras.main.width - 20,
    60,
    '波次: 1',
    { fontSize: '16px', color: '#ffffff' }
  );
  this.waveIndicator.setOrigin(1, 0);
  this.waveIndicator.setScrollFactor(0);
}

// 更新波次指示器
public updateWaveIndicator(wave: number): void {
  this.waveIndicator.setText(`波次: ${wave}`);
}
```

## 技能按钮

技能按钮显示可用技能及其冷却状态，位于屏幕底部。

### 实现方式

```typescript
// 在UIManager中创建技能按钮
private createSkillButtons(): void {
  // 技能按钮容器
  this.skillButtonsContainer = this.scene.add.container(0, 0);
  this.skillButtonsContainer.setScrollFactor(0);

  // 技能按钮背景
  const skillBg = this.scene.add.rectangle(
    this.scene.cameras.main.width / 2,
    this.scene.cameras.main.height - 50,
    this.scene.cameras.main.width,
    100,
    0x000000,
    0.7
  );
  skillBg.setOrigin(0.5, 0.5);
  this.skillButtonsContainer.add(skillBg);

  // 创建技能按钮
  const buttonSize = 80;
  const padding = 20;
  const startX = (this.scene.cameras.main.width - (buttonSize + padding) * 3) / 2;

  for (let i = 0; i < 3; i++) {
    const x = startX + i * (buttonSize + padding);
    const y = this.scene.cameras.main.height - 50;

    // 按钮背景
    const button = this.scene.add.rectangle(
      x,
      y,
      buttonSize,
      buttonSize,
      0x333333
    );
    button.setInteractive();
    this.skillButtonsContainer.add(button);

    // 技能图标
    const icon = this.scene.add.text(
      x,
      y,
      '⚡',
      { fontSize: '32px', color: '#ffffff' }
    );
    icon.setOrigin(0.5, 0.5);
    this.skillButtonsContainer.add(icon);

    // 冷却遮罩
    const cooldownMask = this.scene.add.rectangle(
      x,
      y,
      buttonSize,
      buttonSize,
      0x000000,
      0.7
    );
    cooldownMask.setOrigin(0.5, 0.5);
    cooldownMask.visible = false;
    this.skillButtonsContainer.add(cooldownMask);

    // 冷却文本
    const cooldownText = this.scene.add.text(
      x,
      y,
      '',
      { fontSize: '24px', color: '#ffffff' }
    );
    cooldownText.setOrigin(0.5, 0.5);
    cooldownText.visible = false;
    this.skillButtonsContainer.add(cooldownText);

    // 保存引用
    this.skillButtons.push({
      button,
      icon,
      cooldownMask,
      cooldownText,
      skillId: `skill_${i + 1}`
    });

    // 添加点击事件
    button.on('pointerdown', () => {
      this.onSkillButtonClicked(i);
    });
  }
}

// 更新技能冷却
public updateSkillCooldown(skillId: string, cooldown: number, maxCooldown: number): void {
  const skillButton = this.skillButtons.find(btn => btn.skillId === skillId);
  if (!skillButton) return;

  if (cooldown > 0) {
    // 显示冷却
    skillButton.cooldownMask.visible = true;
    skillButton.cooldownText.visible = true;
    skillButton.cooldownText.setText(Math.ceil(cooldown).toString());
  } else {
    // 隐藏冷却
    skillButton.cooldownMask.visible = false;
    skillButton.cooldownText.visible = false;
  }
}
```

## 暂停按钮

暂停按钮位于屏幕右上角，点击后暂停游戏并显示暂停菜单。

### 实现方式

```typescript
// 在UIManager中创建暂停按钮
private createPauseButton(): void {
  this.pauseButton = this.scene.add.text(
    this.scene.cameras.main.width - 20,
    20,
    '⏸️',
    { fontSize: '24px', color: '#ffffff' }
  );
  this.pauseButton.setOrigin(1, 0);
  this.pauseButton.setScrollFactor(0);
  this.pauseButton.setInteractive();

  // 添加点击事件
  this.pauseButton.on('pointerdown', () => {
    this.onPauseButtonClicked();
  });
}

// 暂停按钮点击处理
private onPauseButtonClicked(): void {
  // 调用暂停回调
  if (this.onPauseCallback) {
    this.onPauseCallback();
  }

  // 显示暂停菜单
  this.showPauseMenu();
}
```

## 实体指示器

当实体（如豆豆）在屏幕外时，显示方向指示器，指向实体的位置。

### 实现方式

```typescript
// 在EntityRenderer中创建实体指示器
public createEntityIndicator(entityId: string, position: Point): void {
  // 检查实体是否已有指示器
  if (this.entityIndicators.has(entityId)) {
    return;
  }

  // 创建指示器
  const indicator = this.scene.add.text(0, 0, '👉', { fontSize: '24px' });
  indicator.setOrigin(0.5, 0.5);
  indicator.setScrollFactor(0);
  indicator.visible = false;

  // 保存指示器
  this.entityIndicators.set(entityId, {
    indicator,
    entityPosition: { ...position }
  });
}

// 更新实体指示器
public updateEntityIndicators(): void {
  const camera = this.scene.cameras.main;
  const cameraView = {
    left: camera.scrollX,
    right: camera.scrollX + camera.width,
    top: camera.scrollY,
    bottom: camera.scrollY + camera.height
  };

  // 遍历所有指示器
  this.entityIndicators.forEach((data, entityId) => {
    const { indicator, entityPosition } = data;

    // 检查实体是否在屏幕内
    const isInView = (
      entityPosition.x >= cameraView.left &&
      entityPosition.x <= cameraView.right &&
      entityPosition.y >= cameraView.top &&
      entityPosition.y <= cameraView.bottom
    );

    if (isInView) {
      // 实体在屏幕内，隐藏指示器
      indicator.visible = false;
    } else {
      // 实体在屏幕外，显示指示器
      indicator.visible = true;

      // 计算指示器位置和角度
      const centerX = camera.width / 2;
      const centerY = camera.height / 2;

      // 计算实体相对于屏幕中心的方向
      const dx = entityPosition.x - (camera.scrollX + centerX);
      const dy = entityPosition.y - (camera.scrollY + centerY);

      // 计算角度
      const angle = Math.atan2(dy, dx);

      // 计算指示器在屏幕边缘的位置
      const radius = Math.min(centerX, centerY) - 20;
      const indicatorX = centerX + radius * Math.cos(angle);
      const indicatorY = centerY + radius * Math.sin(angle);

      // 设置指示器位置和角度
      indicator.setPosition(indicatorX, indicatorY);
      indicator.setRotation(angle);
    }
  });
}
```

## 伤害数字

当实体受到伤害时，在实体上方显示伤害数字。

### 实现方式

```typescript
// 在EntityRenderer中显示伤害数字
public showDamageNumber(position: Point, amount: number, isCritical: boolean): void {
  // 创建伤害文本
  const text = this.scene.add.text(
    position.x,
    position.y - 20,
    amount.toString(),
    {
      fontSize: isCritical ? '24px' : '16px',
      color: isCritical ? '#ff0000' : '#ffffff',
      fontStyle: isCritical ? 'bold' : 'normal'
    }
  );
  text.setOrigin(0.5, 0.5);

  // 创建动画
  this.scene.tweens.add({
    targets: text,
    y: position.y - 50,
    alpha: 0,
    duration: 1000,
    onComplete: () => {
      text.destroy();
    }
  });
}
```

## 效果动画

当技能或buff生效时，显示相应的效果动画。

### 实现方式

```typescript
// 在SkillEffectView中播放效果动画
public playEffectAnimation(effectType: string, position: Point): void {
  let particles;

  switch (effectType) {
    case 'fire':
      // 创建火焰粒子
      particles = this.scene.add.particles('fire');
      particles.createEmitter({
        x: position.x,
        y: position.y,
        speed: { min: 20, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        lifespan: 1000,
        quantity: 20
      });
      break;

    case 'ice':
      // 创建冰霜粒子
      particles = this.scene.add.particles('ice');
      particles.createEmitter({
        x: position.x,
        y: position.y,
        speed: { min: 10, max: 50 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        lifespan: 1500,
        quantity: 15
      });
      break;

    case 'heal':
      // 创建治疗粒子
      particles = this.scene.add.particles('heal');
      particles.createEmitter({
        x: position.x,
        y: position.y,
        speed: { min: 30, max: 80 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 0 },
        lifespan: 1200,
        quantity: 10
      });
      break;

    default:
      // 默认粒子效果
      particles = this.scene.add.particles('default');
      particles.createEmitter({
        x: position.x,
        y: position.y,
        speed: { min: 20, max: 70 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        lifespan: 800,
        quantity: 8
      });
      break;
  }

  // 设置自动销毁
  if (particles) {
    this.scene.time.delayedCall(2000, () => {
      particles.destroy();
    });
  }
}
```

## 事件处理

战斗场UI通过事件系统与战斗逻辑交互，主要处理以下事件：

1. `entityCreated`：实体创建事件，创建实体精灵
2. `entityMoved`：实体移动事件，更新实体位置
3. `entityStateChanged`：实体状态变化事件，更新实体状态
4. `entityStatsChanged`：实体属性变化事件，更新实体属性
5. `buffApplied`：buff应用事件，显示buff效果
6. `buffRemoved`：buff移除事件，移除buff效果
7. `skillUsed`：技能使用事件，显示技能效果
8. `waveStarted`：波次开始事件，更新波次指示器
9. `gameOver`：游戏结束事件，显示结算界面

### 实现方式

```typescript
// 在EventHandlers中注册事件监听
private registerEventListeners(): void {
  const bindEventHandler = (eventType: string, handler: Function) => {
    this.battleEngine.getEventManager().on(eventType, (event: any) => {
      handler.call(this, event);
    });
  };

  // 战斗引擎到视图层的实体事件
  bindEventHandler(EventType.ENTITY_CREATED, this.onEntityCreated);
  bindEventHandler(EventType.ENTITY_MOVED, this.onEntityMoved);
  bindEventHandler(EventType.ENTITY_STATE_CHANGED, this.onEntityStateChanged);
  bindEventHandler(EventType.ENTITY_STATS_CHANGED, this.onEntityStatsChanged);
  bindEventHandler('entityStatsChanged', this.onEntityStatsChanged);
  bindEventHandler(EventType.BUFF_APPLIED, this.onBuffApplied);
  bindEventHandler(EventType.BUFF_REMOVED, this.onBuffRemoved);

  // 战斗引擎到视图层的技能事件
  bindEventHandler(EventType.SKILL_USED, this.onSkillUsed);
  bindEventHandler(EventType.SKILL_COOLDOWN_UPDATED, this.onSkillCooldownUpdated);

  // 战斗引擎到视图层的波次事件
  bindEventHandler(EventType.WAVE_STARTED, this.onWaveStarted);
  bindEventHandler(EventType.WAVE_COMPLETED, this.onWaveCompleted);

  // 战斗引擎到视图层的游戏事件
  bindEventHandler(EventType.GAME_OVER, this.onGameOver);
}
```

## 性能优化

为了确保战斗场UI的流畅运行，采取了以下性能优化措施：

1. **对象池**：使用对象池管理频繁创建和销毁的对象，如伤害数字和效果动画
2. **事件节流**：对频繁触发的事件进行节流处理，减少UI更新频率
3. **懒加载**：延迟加载不立即需要的资源
4. **视图裁剪**：只渲染摄像机视野内的实体
5. **帧率控制**：根据场景需求设置不同的帧率，战斗场景30fps，其他场景10fps

## 适配不同设备

战斗场UI支持不同分辨率的设备，主要通过以下方式实现：

1. **相对定位**：使用相对于屏幕尺寸的位置计算
2. **自适应布局**：根据屏幕尺寸调整UI元素大小和位置
3. **响应式设计**：在小屏幕设备上简化UI元素

## BattleSceneView中的UI更新

`BattleSceneView`类负责协调战斗引擎和UI管理器，确保UI显示的数据与战斗状态保持同步。

### 实现方式

```typescript
/**
 * 更新UI
 */
private updateUI(): void {
  try {
    // 获取战斗状态
    const battleStats = this.battleEngine.getBattleStats();

    // 获取水晶状态
    const crystalHp = battleStats.crystalStats?.hp || 1000;
    const crystalMaxHp = battleStats.crystalStats?.maxHp || 1000;

    // 获取英雄状态
    let heroHp = 100;
    let heroMaxHp = 100;
    let heroMp = 100;
    let heroMaxMp = 100;

    if (battleStats.heroStats && battleStats.heroStats.length > 0) {
      const hero = battleStats.heroStats[0];
      heroHp = hero.hp || heroHp;
      heroMaxHp = hero.maxHp || heroMaxHp;
      heroMp = hero.mp || heroMp;
      heroMaxMp = hero.maxMp || heroMaxMp;
    }

    // 更新状态栏，同时显示水晶HP和英雄HP/MP
    this.uiManager.updateStatusBar(
      crystalHp,
      crystalMaxHp,
      heroHp,
      heroMaxHp,
      heroMp,
      heroMaxMp
    );

    // console.log(`[INFO] 更新UI - 水晶: ${crystalHp}/${crystalMaxHp}, 英雄: HP=${heroHp}/${heroMaxHp}, MP=${heroMp}/${heroMaxMp}`);

    // 更新波次指示器
    if (battleStats.currentWave) {
      this.uiManager.updateWaveIndicator(battleStats.currentWave.number);
    } else {
      // 使用默认值更新波次指示器
      this.uiManager.updateWaveIndicator(1);
    }
  } catch (error) {
    console.error('[ERROR] 更新UI失败:', error);
  }
}
```

## 后续优化方向

1. **水晶生命值百分比显示**：使玩家能够更直观地了解水晶的生命状态
2. **优化UI更新逻辑**：减少不必要的更新，提高性能
3. **添加水晶受伤的视觉效果**：使玩家更容易看到水晶受到伤害
4. **添加水晶破碎效果**：使水晶受到伤害时有更明显的视觉反馈
5. **添加水晶生命值低于一定百分比时的警告效果**：提醒玩家注意保护水晶
