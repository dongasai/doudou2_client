/**
 * 1号英雄（烈焰法师）第一关测试脚本
 * 用于无界面测试战斗引擎功能
 */

import { battleEngine } from '../Core/BattleEngine';
import { logger, LogLevel } from '../Core/Logger';
import { BattleCommand } from '../../DesignConfig/BattleCommand';
import { BattleInitParams } from '../../DesignConfig/BattleInitParams';

// 设置日志级别
logger.setLogLevel(LogLevel.DEBUG);
logger.setConsoleOutput(true);

console.log('开始1号英雄（烈焰法师）第一关测试...');

// 创建战斗初始化参数
const battleParams: BattleInitParams = {
  crystal: {
    id: 1,
    name: '水晶',
    stats: {
      hp: 1000,
      mp: 0,
      attack: 0,
      defense: 50,
      magicAttack: 0,
      magicDefense: 50,
      speed: 0,
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
        id: 1, // 烈焰法师
        stats: {
          hp: 800,
          attack: 50,
          defense: 40,
          speed: 50,
          level: 1,
          exp: 0,
          gold: 0,
          equippedItems: [],
          learnedSkills: [1, 2] // 火球术和烈焰风暴
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

// 测试战斗指令序列
const testCommands: BattleCommand[] = [
  // 10秒后施放火球术
  {
    frame: 100, // 第10秒的第一帧
    playerId: 'player1',
    type: 'castSkill',
    data: {
      heroId: 1,
      skillId: 1, // 火球术
      targetType: 'enemy',
      targetId: 1 // 假设第一个敌人的ID是1
    }
  },
  // 15秒后施放烈焰风暴
  {
    frame: 150, // 第15秒的第一帧
    playerId: 'player1',
    type: 'castSkill',
    data: {
      heroId: 1,
      skillId: 2, // 烈焰风暴
      targetType: 'position',
      targetPos: 1600 // 假设目标位置在(1600,1600)
    }
  },
  // 20秒后更换位置
  {
    frame: 200, // 第20秒的第一帧
    playerId: 'player1',
    type: 'changePosition',
    data: {
      heroId: 1,
      newPos: 2 // 移动到位置2
    }
  }
];

// 添加事件监听器
function setupEventListeners() {
  // 这里应该添加事件监听器
  // 实际实现中，应该通过事件管理器添加
  console.log('设置事件监听器...');
}

// 运行测试
function runTest() {
  // 初始化战斗
  battleEngine.initBattle(battleParams);

  // 设置事件监听器
  setupEventListeners();

  // 开始战斗
  battleEngine.startBattle();
  console.log('战斗开始');

  // 发送测试指令
  testCommands.forEach(command => {
    setTimeout(() => {
      console.log(`发送指令: ${command.type}, 帧号: ${command.frame}`);
      battleEngine.sendCommand(command);
    }, command.frame * 100); // 每帧100ms，所以乘以100转换为毫秒
  });

  // 每5秒输出一次战斗状态
  const statsInterval = setInterval(() => {
    const stats = battleEngine.getBattleStats();
    console.log('战斗状态:', JSON.stringify(stats, null, 2));

    // 检查战斗是否结束
    if (battleEngine.getBattleState() === 'completed') {
      clearInterval(statsInterval);
      console.log('战斗结束');
      console.log('战斗结果:', battleEngine.getBattleResult());

      // 获取回放数据
      const replayData = battleEngine.getReplayData();
      console.log('回放数据:', JSON.stringify(replayData, null, 2));

      // 保存日志
      logger.saveLogsToFile();
    }
  }, 5000);

  // 60秒后如果战斗还没结束，强制结束
  setTimeout(() => {
    if (battleEngine.getBattleState() !== 'completed') {
      console.log('测试超时，强制结束战斗');
      battleEngine.stopBattle();
      clearInterval(statsInterval);

      // 获取回放数据
      const replayData = battleEngine.getReplayData();
      console.log('回放数据:', JSON.stringify(replayData, null, 2));

      // 保存日志
      logger.saveLogsToFile();
    }
  }, 60000);
}

// 运行测试
runTest();

// 导出一个空对象，使其成为一个模块
export {};
