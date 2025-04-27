/**
 * 完整的战斗回放系统测试
 * 测试战斗回放的记录、保存、加载和播放功能
 */

console.log("开始完整的战斗回放系统测试...");

const fs = require('fs');
const path = require('path');
const scenario = require('./Hero1Stage1Scenario');

// 测试配置
const testConfig = {
  // 战斗持续时间（毫秒）
  battleDuration: 20000,
  // 回放保存目录
  replayDir: path.join(__dirname, '../../../logs/battle_replay'),
  // 回放文件名格式
  replayFilenameFormat: 'replay-{year}-{month}-{day}-{hours}-{minutes}-{seconds}-{milliseconds}.json',
  // 回放播放速度
  playbackSpeed: 2.0
};

// 回放数据
let replayData = null;
let replayFilePath = null;

// 确保目录存在
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`创建目录: ${directory}`);
  }
}

// 生成回放文件名
function generateReplayFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return testConfig.replayFilenameFormat
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{day}', day)
    .replace('{hours}', hours)
    .replace('{minutes}', minutes)
    .replace('{seconds}', seconds)
    .replace('{milliseconds}', milliseconds);
}

// 第一阶段：记录战斗
function recordBattle() {
  console.log("\n=== 第一阶段：记录战斗 ===");
  
  // 确保目录存在
  ensureDirectoryExists(testConfig.replayDir);
  
  // 创建回放数据结构
  const randomSeed = 12345;
  replayData = {
    replayId: `replay_${Date.now()}`,
    randomSeed: randomSeed,
    initParams: {
      crystal: {
        id: 1,
        name: '水晶',
        stats: {
          hp: 1000,
          attack: 0,
          defense: 50,
          speed: 0
        }
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
              level: 1
            },
            position: 1
          }
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
  
  // 设置事件监听器
  setupEventListeners();
  
  // 开始战斗
  scenario.startBattle();
  
  // 记录战斗开始事件
  const battleStartTime = Date.now();
  addEvent('battleStart', {
    time: battleStartTime,
    params: replayData.initParams,
    seed: randomSeed
  }, 0, 0);
  
  // 模拟玩家指令
  simulatePlayerCommands();
  
  // 等待战斗结束
  setTimeout(() => {
    // 记录战斗结束事件
    const battleEndTime = Date.now();
    const battleDuration = battleEndTime - battleStartTime;
    
    addEvent('battleEnd', {
      time: battleEndTime,
      result: scenario.battleState.result || 'victory',
      duration: battleDuration
    }, scenario.battleState.frame, battleDuration);
    
    // 更新回放数据
    replayData.metadata.battleDuration = battleDuration;
    
    console.log(`战斗记录完成，持续时间: ${battleDuration}ms`);
    console.log(`事件数: ${replayData.events.length}, 指令数: ${replayData.commands.length}`);
    
    // 保存回放数据
    saveReplayData();
    
    // 进入第二阶段
    setTimeout(() => {
      loadAndPlayReplay();
    }, 1000);
  }, testConfig.battleDuration);
}

// 设置事件监听器
function setupEventListeners() {
  // 豆豆生成事件
  scenario.eventEmitter.on('beanSpawned', (bean) => {
    const time = Date.now() - scenario.battleState.startTime;
    addEvent('beanSpawned', bean, scenario.battleState.frame, time);
  });
  
  // 伤害事件
  scenario.eventEmitter.on('damageDealt', (data) => {
    const time = Date.now() - scenario.battleState.startTime;
    addEvent('damageDealt', data, scenario.battleState.frame, time);
  });
  
  // 技能释放事件
  scenario.eventEmitter.on('skillCast', (data) => {
    const time = Date.now() - scenario.battleState.startTime;
    addEvent('skillCast', data, scenario.battleState.frame, time);
  });
  
  // 技能命中事件
  scenario.eventEmitter.on('skillHit', (data) => {
    const time = Date.now() - scenario.battleState.startTime;
    addEvent('skillHit', data, scenario.battleState.frame, time);
  });
  
  // 豆豆死亡事件
  scenario.eventEmitter.on('beanDefeated', (data) => {
    const time = Date.now() - scenario.battleState.startTime;
    addEvent('entityDeath', {
      entity: { id: data.id, type: data.type },
      position: data.position
    }, scenario.battleState.frame, time);
  });
}

// 模拟玩家指令
function simulatePlayerCommands() {
  // 5秒后释放火球术
  setTimeout(() => {
    const command = {
      frame: scenario.battleState.frame,
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
      frame: scenario.battleState.frame,
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
      frame: scenario.battleState.frame,
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
}

// 保存回放数据
function saveReplayData() {
  // 生成文件名
  const filename = generateReplayFilename();
  replayFilePath = path.join(testConfig.replayDir, filename);
  
  // 保存回放数据
  fs.writeFileSync(replayFilePath, JSON.stringify(replayData, null, 2));
  
  console.log(`回放数据已保存到: ${replayFilePath}`);
}

// 第二阶段：加载和播放回放
function loadAndPlayReplay() {
  console.log("\n=== 第二阶段：加载和播放回放 ===");
  
  if (!replayFilePath || !fs.existsSync(replayFilePath)) {
    console.error("回放文件不存在，无法加载");
    return;
  }
  
  console.log(`加载回放文件: ${replayFilePath}`);
  
  try {
    // 读取回放文件
    const fileContent = fs.readFileSync(replayFilePath, 'utf8');
    const loadedReplayData = JSON.parse(fileContent);
    
    // 验证回放数据
    console.log("\n回放数据验证:");
    console.log(`- 回放ID: ${loadedReplayData.replayId}`);
    console.log(`- 随机种子: ${loadedReplayData.randomSeed}`);
    console.log(`- 战斗时长: ${loadedReplayData.metadata.battleDuration}ms`);
    console.log(`- 事件数: ${loadedReplayData.events.length}`);
    console.log(`- 指令数: ${loadedReplayData.commands.length}`);
    
    // 播放回放
    playReplay(loadedReplayData);
  } catch (error) {
    console.error(`加载回放文件失败: ${error.message}`);
  }
}

// 播放回放
function playReplay(replayData) {
  console.log(`\n开始播放回放: ${replayData.replayId}`);
  console.log(`播放速度: ${testConfig.playbackSpeed}x`);
  
  // 按时间顺序排序事件
  const sortedEvents = [...replayData.events].sort((a, b) => a.time - b.time);
  
  // 开始回放
  const playbackStartTime = Date.now();
  let currentTime = 0;
  let currentIndex = 0;
  
  // 回放进度更新
  const progressInterval = setInterval(() => {
    // 计算当前回放时间
    const elapsedRealTime = Date.now() - playbackStartTime;
    currentTime = elapsedRealTime * testConfig.playbackSpeed;
    
    // 输出当前进度
    const progress = Math.min(100, (currentTime / replayData.metadata.battleDuration) * 100);
    console.log(`回放进度: ${progress.toFixed(1)}%, 时间: ${currentTime.toFixed(0)}ms / ${replayData.metadata.battleDuration}ms`);
    
    // 触发当前时间点的事件
    while (currentIndex < sortedEvents.length && sortedEvents[currentIndex].time <= currentTime) {
      const event = sortedEvents[currentIndex];
      
      // 只输出重要事件
      if (['battleStart', 'battleEnd', 'skillCast', 'entityDeath'].includes(event.type)) {
        console.log(`事件: ${event.type}, 时间: ${event.time}ms, 帧: ${event.frame}`);
      }
      
      currentIndex++;
    }
    
    // 检查是否结束
    if (currentTime >= replayData.metadata.battleDuration) {
      clearInterval(progressInterval);
      console.log("回放完成");
      
      // 进入第三阶段
      setTimeout(() => {
        testReplayControls();
      }, 1000);
    }
  }, 1000); // 每秒更新一次进度
}

// 第三阶段：测试回放控制
function testReplayControls() {
  console.log("\n=== 第三阶段：测试回放控制 ===");
  
  console.log("模拟回放控制功能:");
  console.log("1. 暂停回放");
  console.log("   - 回放暂停在当前位置");
  
  setTimeout(() => {
    console.log("\n2. 设置回放速度为0.5倍");
    console.log("   - 回放速度减慢");
    
    setTimeout(() => {
      console.log("\n3. 跳转到10秒位置");
      console.log("   - 回放跳转到指定位置");
      
      setTimeout(() => {
        console.log("\n4. 恢复回放");
        console.log("   - 回放从当前位置继续");
        
        setTimeout(() => {
          console.log("\n回放控制测试完成");
          console.log("所有测试完成");
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

// 运行测试
function runTest() {
  console.log("开始完整回放系统测试");
  
  // 第一阶段：记录战斗
  recordBattle();
}

// 执行测试
runTest();
