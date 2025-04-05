# 客户端代码文件结构

```
📦 src
├── 📂 assets
├── 📂 core
    ├── 📂 battle
    │   ├── 📄 BattleManager.ts # 战斗管理器 负责整体战斗流程控制 export class
    │   ├── 📄 DamageManager.ts # 伤害管理器 负责处理战斗中的伤害计算和应用 export class
    │   ├── 📄 EventManager.ts # 战斗事件管理器 负责处理战斗中的事件分发和监听 export class
    │   └── 📄 WaveManager.ts # 波次管理器 负责管理战斗中的敌人波次生成 export class
    ├── 📄 BattleManager.ts # 战斗管理器 负责处理战斗的核心逻辑，与展示层分离 export class
    ├── 📄 ConfigLoader.ts # 游戏配置加载器 负责加载和管理游戏中的各种配置数据 export class
    └── 📄 Game.ts
├── 📂 objects
    ├── 📂 hero
    │   ├── 📄 Hero.ts # 英雄基类 游戏中的英雄单位，具有属性、等级和技能系统 export class
    │   ├── 📄 HeroLevel.ts # 英雄等级类 管理英雄的等级和经验值系统 export class
    │   ├── 📄 HeroSkill.ts
    │   └── 📄 HeroStats.ts
    ├── 📄 Bean.ts # 豆豆类 作为游戏中的基础敌人单位，从四面八方攻击水晶 具有生命值、伤害值和移动速度属性 export class
    ├── 📄 Crystal.ts # 水晶类 作为游戏中的核心防守目标 具有生命值和血条显示，需要被英雄保护 export class
    ├── 📄 GameObject.ts # 游戏对象基类 所有游戏中的可交互对象都继承自此类 提供基本的场景管理、物理系统和生命周期方法 export class
    └── 📄 Hero.ts
├── 📂 scenes
    └── 📄 BattleScene.ts # 战斗场景 负责战斗的视觉展示、动画效果和用户输入处理 export class
├── 📂 types
    └── 📄 battle.ts
├── 📂 utils
└── 📄 main.ts
```
