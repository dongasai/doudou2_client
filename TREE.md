# 客户端代码文件结构

```
📦 src
├── 📂 Battle
    ├── 📂 Constants
    │   └── 📄 DepthLayers.ts
    ├── 📂 Core
    │   ├── 📄 BattleEngine.ts
    │   ├── 📄 BattleManager.ts
    │   ├── 📄 DamageManager.ts
    │   ├── 📄 EntityManager.ts
    │   ├── 📄 EventManager.ts
    │   ├── 📄 FrameManager.ts
    │   ├── 📄 Logger.ts
    │   ├── 📄 RandomManager.ts
    │   ├── 📄 ReplayManager.ts
    │   ├── 📄 SkillManager.ts
    │   └── 📄 WaveManager.ts
    ├── 📂 Entities
    │   ├── 📄 Bean.ts
    │   ├── 📄 Crystal.ts
    │   ├── 📄 Entity.ts
    │   └── 📄 Hero.ts
    ├── 📂 Events
    │   └── 📄 ReplayEvents.ts
    ├── 📂 Skills
    │   ├── 📄 EffectManager.ts
    │   ├── 📄 index.ts
    │   ├── 📄 SkillManager.ts
    │   ├── 📄 SkillTypes.ts
    │   └── 📄 TargetSelector.ts
    ├── 📂 Test
    │   ├── 📄 AutoBattleTest.js
    │   ├── 📄 BattleReplayTest.js
    │   ├── 📄 BattleTestTool.js
    │   ├── 📄 compile.js
    │   ├── 📄 FullReplayTest.js
    │   ├── 📄 Hero1Stage1Scenario.js
    │   ├── 📄 Hero1Stage1Test.ts
    │   ├── 📄 LoadReplayTest.js
    │   ├── 📄 manualTest.js
    │   ├── 📄 runBattleTest.js
    │   ├── 📄 runScenarioTest.js
    │   ├── 📄 runTest.js
    │   ├── 📄 SaveReplayTest.js
    │   ├── 📄 simple.js
    │   └── 📄 testRunner.js
    ├── 📂 Types
    │   ├── 📄 BattleStats.ts
    │   ├── 📄 EventData.ts
    │   └── 📄 Vector2D.ts # 二维向量工具类 提供向量计算的静态方法 export class
    └── 📂 View
    │   ├── 📄 BattleSceneView copy.ts
    │   ├── 📄 BattleSceneView.old.ts
    │   ├── 📄 BattleSceneView.ts
    │   ├── 📄 CameraController.ts
    │   ├── 📄 EntityRenderer.ts
    │   ├── 📄 EventHandlers.ts
    │   ├── 📄 index.ts
    │   ├── 📄 SkillEffectView.ts
    │   ├── 📄 SkillUIComponent.ts
    │   ├── 📄 SkillVisualConfig.ts
    │   ├── 📄 TouchController.ts
    │   └── 📄 UIManager.ts
├── 📂 DesignConfig
    ├── 📂 data
    │   ├── 📂 heroes
    │   ├── 📂 level-1
    │   ├── 📂 skills
    │   └── 📂 stage
    ├── 📂 types
    │   ├── 📄 BaseStats.ts
    │   ├── 📄 BattleCommand.ts
    │   ├── 📄 BattleInitParams.ts
    │   ├── 📄 BattleReplay.ts
    │   ├── 📄 Beans.ts
    │   ├── 📄 CharacterBean.ts
    │   ├── 📄 Crystal.ts
    │   ├── 📄 GameHero.ts
    │   ├── 📄 index.ts
    │   ├── 📄 Item.ts
    │   ├── 📄 Level.ts
    │   ├── 📄 Skill.ts
    │   └── 📄 Stage.ts
    └── 📄 ConfigManager.ts # 配置管理器 负责加载和管理游戏配置数据 export class
├── 📂 Event
    ├── 📂 b2v
    │   ├── 📄 BeanDefeated.ts
    │   ├── 📄 BeanMoved.ts
    │   ├── 📄 BeanSpawned.ts
    │   ├── 📄 BuffApplied.ts
    │   ├── 📄 BuffRemoved.ts
    │   ├── 📄 ControlEffectApplied.ts
    │   ├── 📄 ControlEffectRemoved.ts
    │   ├── 📄 CrystalCreated.ts
    │   ├── 📄 DamageDealt.ts
    │   ├── 📄 EntityCreated.ts
    │   ├── 📄 EntityMoved.ts
    │   ├── 📄 EntityStateChanged.ts
    │   ├── 📄 EntityStatsChanged.ts
    │   ├── 📄 GameOver.ts
    │   ├── 📄 HeroCreated.ts
    │   ├── 📄 HeroDied.ts
    │   ├── 📄 SkillCast.ts
    │   ├── 📄 SkillCooldownUpdate.ts
    │   ├── 📄 SkillEffectApplied.ts
    │   └── 📄 SkillHit.ts
    ├── 📂 v2b
    │   ├── 📄 GamePauseResume.ts
    │   ├── 📄 MoveCommand.ts
    │   ├── 📄 PlayerInput.ts
    │   ├── 📄 SkillSelected.ts
    │   └── 📄 TargetSelected.ts
    ├── 📂 validation
    ├── 📄 EventTypes.ts
    └── 📄 EventUsageExample.ts
├── 📂 Managers
    └── 📄 ConfigManager.ts # 配置管理器 负责加载和管理游戏配置数据 export class
├── 📂 Scenes
    ├── 📄 BattleScene.ts # 战斗场景 负责战斗的视觉展示、动画效果和用户输入处理 export class
    ├── 📄 EncyclopediaScene.ts # 百科视图场景 提供关卡、英雄、豆豆的详细信息 export class
    ├── 📄 HeroSelectScene.ts # 英雄选择场景 玩家可以在此选择要使用的英雄 export class
    ├── 📄 LevelSelectScene.ts # 关卡选择场景 玩家可以在此选择要挑战的关卡 export class
    └── 📄 MainMenuScene.ts # 主菜单场景 游戏的入口场景，提供开始游戏、设置等选项 export class
├── 📂 services
    └── 📄 BattleParamsService.ts # 战斗参数服务 负责准备战斗参数 export class
├── 📂 SkillKernel
    ├── 📂 json
    ├── 📂 type
    │   ├── 📂 constraints
    │   │   ├── 📄 BattleCrySkill.ts
    │   │   ├── 📄 FireballSkill.ts
    │   │   ├── 📄 FlameStormSkill.ts
    │   │   ├── 📄 FrostNovaSkill.ts
    │   │   ├── 📄 HealSkill.ts
    │   │   ├── 📄 PiercingArrowSkill.ts
    │   │   ├── 📄 QuickShotSkill.ts
    │   │   ├── 📄 SpeedBoostSkill.ts
    │   │   └── 📄 StunShotSkill.ts
    │   ├── 📄 BaseSkillConfig.ts
    │   ├── 📄 ChainEffect.ts
    │   ├── 📄 Index.ts
    │   ├── 📄 Skill.ts
    │   ├── 📄 SkillEffects.ts
    │   └── 📄 SkillUpgrades.ts
    ├── 📄 generate-validate.ts
    ├── 📄 generate-validator.ts
    └── 📄 type.ts
├── 📂 UI
    ├── 📂 Encyclopedia
    │   ├── 📄 HeroesTab.ts # 英雄标签页 显示游戏中的英雄信息 export class
    │   └── 📄 LevelsTab.ts # 关卡标签页 显示游戏中的关卡信息 export class
    ├── 📄 Tab.ts
    └── 📄 TabManager.ts # 标签页管理器 管理多个标签页，实现标签页切换功能 export class
├── 📂 utils
    └── 📄 Logger.ts
└── 📄 main.ts
```
