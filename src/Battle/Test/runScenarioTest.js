/**
 * 运行战斗场景测试
 * 使用Hero1Stage1Scenario模拟战斗过程
 */

console.log("开始运行战斗场景测试...");

// 导入场景模块
const scenario = require('./Hero1Stage1Scenario');

// 注册事件监听器
function setupEventListeners() {
  // 战斗开始事件
  scenario.eventEmitter.on('battleStart', (data) => {
    console.log(`[事件] 战斗开始: 英雄=${data.hero}, 关卡=${data.stage}`);
  });
  
  // 豆豆生成事件
  scenario.eventEmitter.on('beanSpawned', (bean) => {
    console.log(`[事件] 豆豆生成: ${bean.name}, ID=${bean.id}`);
  });
  
  // 豆豆移动事件（太频繁，不输出）
  // scenario.eventEmitter.on('beanMoved', (data) => {
  //   console.log(`[事件] 豆豆移动: ID=${data.id}, 位置=(${data.position.x.toFixed(0)}, ${data.position.y.toFixed(0)})`);
  // });
  
  // 伤害事件
  scenario.eventEmitter.on('damageDealt', (data) => {
    console.log(`[事件] 伤害: ${data.source.name || data.source.id} -> ${data.target.name || data.target.id}, 数量=${data.damage}`);
  });
  
  // 技能释放事件
  scenario.eventEmitter.on('skillCast', (data) => {
    console.log(`[事件] 技能释放: ID=${data.skillId}, 名称=${data.skillName}, 施法者=${data.casterId}`);
  });
  
  // 技能命中事件
  scenario.eventEmitter.on('skillHit', (data) => {
    console.log(`[事件] 技能命中: ID=${data.skillId}, 目标=${data.targetId}, 伤害=${data.damage}`);
  });
  
  // 豆豆死亡事件
  scenario.eventEmitter.on('beanDefeated', (data) => {
    console.log(`[事件] 豆豆击败: ID=${data.id}, 类型=${data.type}`);
  });
  
  // 英雄死亡事件
  scenario.eventEmitter.on('heroDied', (data) => {
    console.log(`[事件] 英雄死亡: ID=${data.id}, 名称=${data.name}`);
  });
  
  // 游戏结束事件
  scenario.eventEmitter.on('gameOver', (data) => {
    console.log(`[事件] 游戏结束: 结果=${data.result}, 原因=${data.reason}`);
  });
}

// 模拟玩家指令
function simulatePlayerCommands() {
  // 5秒后释放火球术
  setTimeout(() => {
    scenario.addCommand({
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 1,
        targetId: 1
      }
    });
  }, 5000);
  
  // 10秒后释放烈焰风暴
  setTimeout(() => {
    scenario.addCommand({
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 2,
        targetPos: 1600
      }
    });
  }, 10000);
  
  // 15秒后再次释放火球术
  setTimeout(() => {
    scenario.addCommand({
      type: 'castSkill',
      data: {
        heroId: 1,
        skillId: 1,
        targetId: 3
      }
    });
  }, 15000);
}

// 定期输出战斗状态
function setupStatusReporting() {
  const statusInterval = setInterval(() => {
    const state = scenario.getBattleState();
    
    // 如果战斗已结束，停止状态报告
    if (state.status === 'completed') {
      clearInterval(statusInterval);
      return;
    }
    
    console.log("\n当前战斗状态:");
    console.log(`- 帧: ${state.frame}, 时间: ${(state.time / 1000).toFixed(1)}秒`);
    console.log(`- 英雄: HP=${state.hero.hp}/${state.hero.maxHp}, MP=${state.hero.mp}`);
    console.log(`- 水晶: HP=${state.crystal.hp}/${state.crystal.maxHp}`);
    console.log(`- 豆豆: 总数=${state.beans.length}, 存活=${state.beans.filter(b => b.alive).length}`);
    console.log(`- 统计: 生成=${scenario.battleState.stats.beansSpawned}, 击败=${scenario.battleState.stats.beansDefeated}`);
  }, 5000); // 每5秒输出一次
}

// 运行测试
function runTest() {
  // 设置事件监听器
  setupEventListeners();
  
  // 设置状态报告
  setupStatusReporting();
  
  // 开始战斗
  scenario.startBattle();
  
  // 模拟玩家指令
  simulatePlayerCommands();
  
  console.log("测试运行中...");
}

// 执行测试
runTest();
