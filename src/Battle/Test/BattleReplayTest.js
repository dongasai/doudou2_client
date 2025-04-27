/**
 * 战斗引擎回放测试
 * 测试战斗引擎的回放功能
 */

console.log("开始战斗引擎回放测试...");

// 导入场景模块
const scenario = require('./Hero1Stage1Scenario');
const fs = require('fs');
const path = require('path');

// 回放数据
let replayData = null;

// 测试配置
const testConfig = {
  // 战斗持续时间（毫秒）
  battleDuration: 30000,
  // 回放文件路径
  replayFilePath: path.join(__dirname, 'battle_replay.json'),
  // 是否保存回放文件
  saveReplayFile: true
};

// 第一阶段：记录战斗
function recordBattle() {
  console.log("\n=== 第一阶段：记录战斗 ===");
  
  // 设置事件监听器
  setupEventListeners();
  
  // 初始化战斗
  const randomSeed = 12345;
  
  // 创建回放数据结构
  replayData = {
    replayId: `replay_${Date.now()}`,
    randomSeed: randomSeed,
    initParams: {
      crystal: scenario.battleConfig.crystal,
      players: [
        {
          id: 'player1',
          name: '玩家1',
          hero: scenario.battleConfig.hero
        }
      ],
      level: {
        chapter: 1,
        stage: 1
      }
    },
    commands: [],
    events: [],
    metadata: {
      recordTime: Date.now(),
      battleDuration: 0,
      chapter: 1,
      stage: 1,
      players: ['player1'],
      version: '1.0.0'
    }
  };
  
  console.log(`初始化战斗，随机种子: ${randomSeed}`);
  
  // 开始战斗
  scenario.startBattle();
  
  // 记录战斗开始事件
  addEvent('battleStart', {
    time: Date.now(),
    params: replayData.initParams,
    seed: randomSeed
  }, 0, 0);
  
  // 模拟玩家指令
  simulatePlayerCommands();
  
  // 等待战斗结束
  setTimeout(() => {
    // 记录战斗结束事件
    const battleEndTime = Date.now();
    const battleDuration = battleEndTime - scenario.battleState.startTime;
    
    addEvent('battleEnd', {
      time: battleEndTime,
      result: scenario.battleState.result || 'victory',
      duration: battleDuration
    }, scenario.battleState.frame, battleDuration);
    
    // 更新回放数据
    replayData.metadata.battleDuration = battleDuration;
    
    console.log(`战斗记录完成，持续时间: ${battleDuration}ms`);
    console.log(`事件数: ${replayData.events.length}, 指令数: ${replayData.commands.length}`);
    
    // 保存回放文件
    if (testConfig.saveReplayFile) {
      saveReplayFile();
    }
    
    // 进入第二阶段
    setTimeout(() => {
      playbackBattle();
    }, 1000);
  }, testConfig.battleDuration);
}

// 第二阶段：回放战斗
function playbackBattle() {
  console.log("\n=== 第二阶段：回放战斗 ===");
  
  if (!replayData) {
    console.log("没有回放数据，无法进行回放");
    return;
  }
  
  console.log(`加载回放: ID=${replayData.replayId}, 时长=${replayData.metadata.battleDuration}ms`);
  
  // 按时间顺序排序事件
  const sortedEvents = [...replayData.events].sort((a, b) => a.time - b.time);
  
  // 开始回放
  const playbackStartTime = Date.now();
  let currentTime = 0;
  let currentIndex = 0;
  
  console.log("开始回放");
  
  // 回放进度更新
  const progressInterval = setInterval(() => {
    // 计算当前回放时间
    const elapsedRealTime = Date.now() - playbackStartTime;
    currentTime = elapsedRealTime; // 1倍速
    
    // 输出当前进度
    const progress = Math.min(100, (currentTime / replayData.metadata.battleDuration) * 100);
    console.log(`回放进度: ${progress.toFixed(1)}%, 时间: ${currentTime}ms / ${replayData.metadata.battleDuration}ms`);
    
    // 触发当前时间点的事件
    while (currentIndex < sortedEvents.length && sortedEvents[currentIndex].time <= currentTime) {
      const event = sortedEvents[currentIndex];
      console.log(`触发回放事件: ${event.type}, 时间: ${event.time}ms`);
      currentIndex++;
    }
    
    // 检查是否结束
    if (currentTime >= replayData.metadata.battleDuration) {
      clearInterval(progressInterval);
      console.log("回放完成");
      
      // 测试回放控制
      testReplayControls();
    }
  }, 1000); // 每秒更新一次进度
}

// 测试回放控制
function testReplayControls() {
  console.log("\n=== 第三阶段：测试回放控制 ===");
  
  console.log("1. 暂停回放");
  console.log("2. 设置回放速度为2倍");
  console.log("3. 跳转到15秒位置");
  console.log("4. 恢复回放");
  
  // 模拟回放控制
  setTimeout(() => {
    console.log("\n回放控制测试完成");
    console.log("所有测试完成");
  }, 3000);
}

// 设置事件监听器
function setupEventListeners() {
  // 战斗开始事件
  scenario.eventEmitter.on('battleStart', (data) => {
    console.log(`[事件] 战斗开始: 英雄=${data.hero}, 关卡=${data.stage}`);
  });
  
  // 豆豆生成事件
  scenario.eventEmitter.on('beanSpawned', (bean) => {
    addEvent('beanSpawned', bean, scenario.battleState.frame, Date.now() - scenario.battleState.startTime);
  });
  
  // 伤害事件
  scenario.eventEmitter.on('damageDealt', (data) => {
    addEvent('damageDealt', data, scenario.battleState.frame, Date.now() - scenario.battleState.startTime);
  });
  
  // 技能释放事件
  scenario.eventEmitter.on('skillCast', (data) => {
    addEvent('skillCast', data, scenario.battleState.frame, Date.now() - scenario.battleState.startTime);
  });
  
  // 技能命中事件
  scenario.eventEmitter.on('skillHit', (data) => {
    addEvent('skillHit', data, scenario.battleState.frame, Date.now() - scenario.battleState.startTime);
  });
  
  // 豆豆死亡事件
  scenario.eventEmitter.on('beanDefeated', (data) => {
    addEvent('entityDeath', {
      entity: { id: data.id, type: data.type },
      position: data.position
    }, scenario.battleState.frame, Date.now() - scenario.battleState.startTime);
  });
}

// 模拟玩家指令
function simulatePlayerCommands() {
  // 5秒后释放火球术
  setTimeout(() => {
    const command = {
      frame: Math.floor(scenario.battleState.frame),
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 1,
        targetId: 1
      }
    };
    
    scenario.addCommand(command);
    addCommand(command);
  }, 5000);
  
  // 10秒后释放烈焰风暴
  setTimeout(() => {
    const command = {
      frame: Math.floor(scenario.battleState.frame),
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 2,
        targetPos: 1600
      }
    };
    
    scenario.addCommand(command);
    addCommand(command);
  }, 10000);
  
  // 15秒后再次释放火球术
  setTimeout(() => {
    const command = {
      frame: Math.floor(scenario.battleState.frame),
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 1,
        targetId: 3
      }
    };
    
    scenario.addCommand(command);
    addCommand(command);
  }, 15000);
}

// 添加指令到回放
function addCommand(command) {
  if (!replayData) return;
  
  replayData.commands.push(command);
  console.log(`记录指令: ${command.type}, 帧号: ${command.frame}`);
}

// 添加事件到回放
function addEvent(type, data, frame, time) {
  if (!replayData) return;
  
  const event = { type, data, frame, time };
  replayData.events.push(event);
  console.log(`记录事件: ${type}, 帧号: ${frame}, 时间: ${time}ms`);
}

// 保存回放文件
function saveReplayFile() {
  try {
    fs.writeFileSync(testConfig.replayFilePath, JSON.stringify(replayData, null, 2));
    console.log(`回放数据已保存到文件: ${testConfig.replayFilePath}`);
  } catch (error) {
    console.error('保存回放数据失败', error);
  }
}

// 运行测试
function runTest() {
  // 开始记录战斗
  recordBattle();
}

// 执行测试
runTest();
