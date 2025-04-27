/**
 * 战斗回放保存测试
 * 测试战斗回放的保存功能
 */

console.log("开始战斗回放保存测试...");

// 导入场景模块
const scenario = require('./Hero1Stage1Scenario');
const fs = require('fs');
const path = require('path');

// 测试配置
const testConfig = {
  // 战斗持续时间（毫秒）
  battleDuration: 15000,
  // 回放保存目录
  replayDir: path.join(__dirname, '../../../logs/battle_replay')
};

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
  
  return `replay-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}.json`;
}

// 保存回放数据
function saveReplayData(replayData) {
  // 确保目录存在
  ensureDirectoryExists(testConfig.replayDir);
  
  // 生成文件名
  const filename = generateReplayFilename();
  const filePath = path.join(testConfig.replayDir, filename);
  
  // 保存回放数据
  fs.writeFileSync(filePath, JSON.stringify(replayData, null, 2));
  
  console.log(`回放数据已保存到: ${filePath}`);
  return filePath;
}

// 运行战斗并记录回放
function runBattleAndSaveReplay() {
  console.log("开始战斗...");
  
  // 创建回放数据结构
  const replayData = {
    replayId: `replay_${Date.now()}`,
    randomSeed: 12345,
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
  
  // 记录战斗开始事件
  replayData.events.push({
    type: 'battleStart',
    frame: 0,
    time: 0,
    data: {
      time: Date.now(),
      params: replayData.initParams,
      seed: replayData.randomSeed
    }
  });
  
  // 开始战斗
  scenario.startBattle();
  
  // 记录指令和事件
  const startTime = Date.now();
  
  // 监听事件
  scenario.eventEmitter.on('beanSpawned', (bean) => {
    const time = Date.now() - startTime;
    replayData.events.push({
      type: 'beanSpawned',
      frame: scenario.battleState.frame,
      time: time,
      data: bean
    });
  });
  
  scenario.eventEmitter.on('damageDealt', (data) => {
    const time = Date.now() - startTime;
    replayData.events.push({
      type: 'damageDealt',
      frame: scenario.battleState.frame,
      time: time,
      data: data
    });
  });
  
  // 模拟玩家指令
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
    replayData.commands.push(command);
    
    const time = Date.now() - startTime;
    replayData.events.push({
      type: 'skillCast',
      frame: scenario.battleState.frame,
      time: time,
      data: {
        casterId: 'hero_1',
        skillId: 1,
        skillName: '火球术',
        targets: ['bean_1']
      }
    });
  }, 5000);
  
  // 结束战斗并保存回放
  setTimeout(() => {
    // 记录战斗结束事件
    const endTime = Date.now();
    const battleDuration = endTime - startTime;
    
    replayData.events.push({
      type: 'battleEnd',
      frame: scenario.battleState.frame,
      time: battleDuration,
      data: {
        time: endTime,
        result: 'victory',
        duration: battleDuration
      }
    });
    
    // 更新回放数据
    replayData.metadata.battleDuration = battleDuration;
    
    console.log(`战斗结束，持续时间: ${battleDuration}ms`);
    console.log(`事件数: ${replayData.events.length}, 指令数: ${replayData.commands.length}`);
    
    // 保存回放数据
    const filePath = saveReplayData(replayData);
    
    // 验证保存的文件
    verifyReplayFile(filePath);
  }, testConfig.battleDuration);
}

// 验证回放文件
function verifyReplayFile(filePath) {
  console.log(`验证回放文件: ${filePath}`);
  
  try {
    // 读取回放文件
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const replayData = JSON.parse(fileContent);
    
    // 验证回放数据结构
    console.log("回放数据验证:");
    console.log(`- 回放ID: ${replayData.replayId}`);
    console.log(`- 随机种子: ${replayData.randomSeed}`);
    console.log(`- 战斗时长: ${replayData.metadata.battleDuration}ms`);
    console.log(`- 事件数: ${replayData.events.length}`);
    console.log(`- 指令数: ${replayData.commands.length}`);
    
    // 验证文件大小
    const stats = fs.statSync(filePath);
    console.log(`- 文件大小: ${stats.size} 字节`);
    
    console.log("回放文件验证成功");
  } catch (error) {
    console.error("回放文件验证失败:", error);
  }
}

// 运行测试
function runTest() {
  console.log("开始回放保存测试");
  
  // 确保目录存在
  ensureDirectoryExists(testConfig.replayDir);
  
  // 运行战斗并保存回放
  runBattleAndSaveReplay();
}

// 执行测试
runTest();
