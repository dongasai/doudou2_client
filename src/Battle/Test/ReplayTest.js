/**
 * 战斗回放测试脚本
 * 用于测试战斗回放功能
 */

console.log("开始战斗回放测试...");

// 创建模拟的战斗引擎
class MockBattleEngine {
  constructor() {
    this.isRecording = false;
    this.isReplaying = false;
    this.replayData = null;
    this.currentTime = 0;
    this.events = [];
    this.commands = [];
    
    console.log("模拟战斗引擎初始化");
  }
  
  // 初始化战斗
  initBattle(params, seed) {
    this.battleParams = params;
    this.randomSeed = seed || Date.now();
    this.isRecording = true;
    this.currentTime = 0;
    this.events = [];
    this.commands = [];
    
    // 创建回放数据结构
    this.replayData = {
      replayId: `replay_${Date.now()}`,
      randomSeed: this.randomSeed,
      initParams: params,
      commands: [],
      events: [],
      metadata: {
        recordTime: Date.now(),
        battleDuration: 0,
        chapter: params.level.chapter,
        stage: params.level.stage,
        players: params.players.map(p => p.id),
        version: '1.0.0'
      }
    };
    
    console.log(`初始化战斗，随机种子: ${this.randomSeed}`);
  }
  
  // 开始战斗
  startBattle() {
    this.battleStartTime = Date.now();
    
    // 添加战斗开始事件
    this.addEvent('battleStart', {
      time: this.battleStartTime,
      params: this.battleParams,
      seed: this.randomSeed
    }, 0, 0);
    
    console.log("战斗开始");
    
    // 模拟战斗进行
    this.simulateBattle();
  }
  
  // 模拟战斗进行
  simulateBattle() {
    // 模拟添加指令
    this.addCommand({
      frame: 10,
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 1,
        targetType: 'enemy',
        targetId: 1
      }
    });
    
    // 模拟添加事件
    this.addEvent('damageDealt', {
      source: { id: 'hero_1', name: '烈焰法师' },
      target: { id: 'bean_1', name: '普通豆' },
      amount: 100,
      type: 'magical'
    }, 10, 1000);
    
    this.addEvent('entityDeath', {
      entity: { id: 'bean_1', name: '普通豆' },
      killer: { id: 'hero_1', name: '烈焰法师' }
    }, 10, 1000);
    
    // 模拟更多指令和事件
    this.addCommand({
      frame: 20,
      playerId: 'player1',
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 2,
        targetType: 'area',
        targetPos: 1600
      }
    });
    
    this.addEvent('skillCast', {
      casterId: 'hero_1',
      skillId: 2,
      skillName: '烈焰风暴',
      targets: ['bean_2', 'bean_3']
    }, 20, 2000);
    
    this.addEvent('damageDealt', {
      source: { id: 'hero_1', name: '烈焰法师' },
      target: { id: 'bean_2', name: '快速豆' },
      amount: 80,
      type: 'magical'
    }, 20, 2000);
    
    this.addEvent('damageDealt', {
      source: { id: 'hero_1', name: '烈焰法师' },
      target: { id: 'bean_3', name: '强壮豆' },
      amount: 80,
      type: 'magical'
    }, 20, 2000);
    
    // 模拟波次事件
    this.addEvent('waveStart', {
      waveIndex: 0,
      waveName: '第一波',
      totalEnemies: 10,
      time: this.battleStartTime
    }, 1, 100);
    
    this.addEvent('waveCompleted', {
      waveIndex: 0,
      waveName: '第一波',
      duration: 15000,
      time: this.battleStartTime + 15000
    }, 150, 15000);
    
    // 模拟战斗结束
    this.battleEndTime = this.battleStartTime + 30000; // 30秒后结束
    this.replayData.metadata.battleDuration = 30000;
    
    this.addEvent('battleEnd', {
      time: this.battleEndTime,
      result: 'victory',
      duration: 30000
    }, 300, 30000);
    
    console.log("战斗模拟完成");
  }
  
  // 添加指令
  addCommand(command) {
    this.commands.push(command);
    this.replayData.commands.push(command);
    console.log(`添加指令: ${command.type}, 帧号: ${command.frame}`);
  }
  
  // 添加事件
  addEvent(type, data, frame, time) {
    const event = { type, data, frame, time };
    this.events.push(event);
    this.replayData.events.push(event);
    console.log(`添加事件: ${type}, 帧号: ${frame}, 时间: ${time}ms`);
  }
  
  // 停止战斗
  stopBattle() {
    this.isRecording = false;
    console.log("战斗停止");
    return this.replayData;
  }
  
  // 加载回放
  loadReplay(replayData) {
    this.replayData = replayData;
    this.isReplaying = true;
    this.currentTime = 0;
    console.log(`加载回放: ID=${replayData.replayId}, 时长=${replayData.metadata.battleDuration}ms`);
  }
  
  // 开始回放
  startReplay() {
    if (!this.isReplaying || !this.replayData) {
      console.log("未加载回放数据，无法开始回放");
      return;
    }
    
    console.log("开始回放");
    this.playbackStartTime = Date.now();
    
    // 模拟回放进度
    this.simulateReplayProgress();
  }
  
  // 模拟回放进度
  simulateReplayProgress() {
    // 按时间顺序排序事件
    const sortedEvents = [...this.replayData.events].sort((a, b) => a.time - b.time);
    
    // 模拟回放进度
    let currentIndex = 0;
    
    const progressInterval = setInterval(() => {
      // 计算当前回放时间
      const elapsedRealTime = Date.now() - this.playbackStartTime;
      this.currentTime = elapsedRealTime; // 1倍速
      
      // 输出当前进度
      const progress = Math.min(100, (this.currentTime / this.replayData.metadata.battleDuration) * 100);
      console.log(`回放进度: ${progress.toFixed(1)}%, 时间: ${this.currentTime}ms / ${this.replayData.metadata.battleDuration}ms`);
      
      // 触发当前时间点的事件
      while (currentIndex < sortedEvents.length && sortedEvents[currentIndex].time <= this.currentTime) {
        const event = sortedEvents[currentIndex];
        console.log(`触发回放事件: ${event.type}, 时间: ${event.time}ms`);
        currentIndex++;
      }
      
      // 检查是否结束
      if (this.currentTime >= this.replayData.metadata.battleDuration) {
        clearInterval(progressInterval);
        console.log("回放完成");
      }
    }, 1000); // 每秒更新一次进度
  }
  
  // 暂停回放
  pauseReplay() {
    console.log("暂停回放");
  }
  
  // 恢复回放
  resumeReplay() {
    console.log("恢复回放");
  }
  
  // 设置回放速度
  setReplaySpeed(speed) {
    console.log(`设置回放速度: ${speed}x`);
  }
  
  // 跳转到指定时间
  seekToTime(time) {
    this.currentTime = time;
    console.log(`跳转到时间: ${time}ms`);
  }
}

// 创建测试数据
const testBattleParams = {
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
};

// 运行测试
function runTest() {
  console.log("开始回放测试");
  
  // 创建模拟战斗引擎
  const battleEngine = new MockBattleEngine();
  
  // 第一阶段：记录战斗
  console.log("\n=== 第一阶段：记录战斗 ===");
  
  // 初始化战斗
  battleEngine.initBattle(testBattleParams, 12345);
  
  // 开始战斗
  battleEngine.startBattle();
  
  // 停止战斗，获取回放数据
  const replayData = battleEngine.stopBattle();
  
  console.log(`回放数据生成完成，事件数: ${replayData.events.length}, 指令数: ${replayData.commands.length}`);
  
  // 第二阶段：回放战斗
  console.log("\n=== 第二阶段：回放战斗 ===");
  
  // 加载回放
  battleEngine.loadReplay(replayData);
  
  // 开始回放
  battleEngine.startReplay();
  
  // 测试回放控制
  setTimeout(() => {
    console.log("\n=== 测试回放控制 ===");
    
    // 暂停回放
    battleEngine.pauseReplay();
    
    // 设置回放速度
    battleEngine.setReplaySpeed(2.0);
    
    // 跳转到指定时间
    battleEngine.seekToTime(15000);
    
    // 恢复回放
    battleEngine.resumeReplay();
  }, 5000);
}

// 执行测试
runTest();
