# 豆豆防御战 - 战斗引擎

## 概述

这是豆豆防御战游戏的战斗引擎，负责处理游戏的核心战斗逻辑，包括：

- 帧管理（逻辑帧和内部帧）
- 实体管理（英雄、豆豆、水晶）
- 技能系统
- 伤害计算
- 波次管理
- 事件系统
- 伪随机系统
- 回放功能

战斗引擎与视图层完全分离，可以进行无界面调试。

## 特征
1. **地图**
    - 地图尺寸 3000 * 3000
    - 英雄固定在 1500,1500 点出生
    - 怪物与玩家距离200-300的点随机产生
2. **伪随机**
    - 伪随机的确定性计算
    - 随机种子使其只记录关键指令即可复现整个战斗过程
3. **状态管理**:
    - 使用确定性随机种子
    - 状态快照和回放支持
    - 断线重连机制
4. **关键帧策略**:
    - 关键帧进行操作
    - 非关键帧操作全自动根据伪随机策略生成
    - 客户端预测移动
5. **状态系统**
   - 多层buff/debuff叠加
   - 状态免疫和抵抗
   - 状态持续时间管理
   - 状态效果冲突解决
6. **逻辑帧+内部帧**
    - 逻辑帧,每秒10帧
    - 内部帧率为50帧,即:每个逻辑帧进行5次内部循环
    - 少于100ms的攻击间隔采用多段攻击法进行处理
    - 高频操作(如攻击)使用独立的时间累积机制
    - 逻辑帧的事件累计后按照顺序发送

## 模块划分

1. 战斗逻辑核心
2. 技能系统
3. Buff/Debuff系统
4. AI决策系统
5. 战斗结算系统
6. 伤害管理
7. 状态管理器

## 使用方法

### 初始化战斗引擎

```typescript
import { battleEngine } from './Battle/Core/BattleEngine';
import { BattleInitParams } from './DesignConfig/types/BattleInitParams';

// 创建战斗初始化参数
const battleParams: BattleInitParams = {
  crystal: {
    id: 1,
    name: '水晶',
    stats: {
      currentHP: 1000,
      maxHP: 1000
    },
    status: 'normal',
    positionIndex: 0,
    defenseBonus: 0
  },
  players: [
    {
      id: 'player1',
      name: '玩家1',
      hero: {
        id: 1,
        stats: {
          hp: 800,
          attack: 50,
          defense: 40,
          speed: 50,
          level: 1,
          exp: 0,
          gold: 0,
          equippedItems: [],
          learnedSkills: [1, 2]
        },
        position: 1
      }
    }
  ],
  level: {
    chapter: 1,
    stage: 1
  }
};

// 初始化战斗
battleEngine.initBattle(battleParams);

// 开始战斗
battleEngine.startBattle();
```

### 发送战斗指令

```typescript
import { BattleCommand } from './DesignConfig/types/BattleCommand';

// 施放技能指令
const castSkillCommand: BattleCommand = {
  frame: 30, // 在第30帧生效
  playerId: 'player1',
  type: 'castSkill',
  data: {
    heroId: 1,
    skillId: 1,
    targetType: 'enemy',
    targetId: 1
  }
};

// 发送指令
battleEngine.sendCommand(castSkillCommand);
```

### 获取战斗状态

```typescript
// 获取战斗状态
const battleState = battleEngine.getBattleState();

// 获取战斗结果
const battleResult = battleEngine.getBattleResult();

// 获取战斗统计数据
const battleStats = battleEngine.getBattleStats();
```

### 回放功能

```typescript
// 获取回放数据
const replayData = battleEngine.getReplayData();

// 加载回放
battleEngine.loadReplay(replayData);

// 设置回放速度（2倍速）
battleEngine.setReplaySpeed(2.0);

// 开始回放
battleEngine.startBattle();
```

## 无界面调试

可以使用测试脚本进行无界面调试：

```bash
# 运行测试脚本
ts-node src/Battle/Test/BattleTest.ts
```

## 日志系统

战斗引擎内置了日志系统，可以记录战斗过程中的各种事件和状态变化：

```typescript
import { logger, LogLevel } from './Battle/Core/Logger';

// 设置日志级别
logger.setLogLevel(LogLevel.DEBUG);

// 启用控制台输出
logger.setConsoleOutput(true);

// 启用文件输出
logger.setFileOutput(true, './battle_log.txt');

// 保存日志到文件
logger.saveLogsToFile();
```

## 已实现的模块

- `Core/` - 核心系统
  - `BattleEngine.ts` - 战斗引擎入口
  - `BattleManager.ts` - 战斗管理器
  - `FrameManager.ts` - 帧管理器
  - `EntityManager.ts` - 实体管理器
  - `SkillManager.ts` - 技能管理器
  - `DamageManager.ts` - 伤害管理器
  - `WaveManager.ts` - 波次管理器
  - `EventManager.ts` - 事件管理器
  - `RandomManager.ts` - 随机数管理器
  - `Logger.ts` - 日志系统

- `Entities/` - 实体类
  - `Entity.ts` - 实体基类
  - `Hero.ts` - 英雄实体
  - `Bean.ts` - 豆豆实体
  - `Crystal.ts` - 水晶实体

- `Types/` - 类型定义
  - `Vector2D.ts` - 二维向量

- `Test/` - 测试脚本
  - `BattleTest.ts` - 战斗引擎测试脚本
