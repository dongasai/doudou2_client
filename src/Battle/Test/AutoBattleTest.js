/**
 * 自动化战斗测试
 * 自动运行战斗并记录结果
 */

console.log("开始自动化战斗测试...");

// 导入场景模块
const scenario = require('./Hero1Stage1Scenario');

// 测试配置
const testConfig = {
  // 测试持续时间（毫秒）
  duration: 60000,
  // 技能释放间隔（毫秒）
  skillInterval: 3000,
  // 状态报告间隔（毫秒）
  statusInterval: 5000,
  // 是否保存战斗记录
  saveRecord: true,
  // 记录文件名
  recordFilename: `battle_record_${Date.now()}.json`
};

// 测试状态
const testState = {
  startTime: 0,
  lastSkillTime: 0,
  lastStatusTime: 0,
  commandHistory: []
};

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
  
  // 伤害事件
  scenario.eventEmitter.on('damageDealt', (data) => {
    console.log(`[事件] 伤害: ${data.source.name || data.source.id} -> ${data.target.name || data.target.id}, 数量=${data.damage}`);
  });
  
  // 技能释放事件
  scenario.eventEmitter.on('skillCast', (data) => {
    console.log(`[事件] 技能释放: ${data.skillName}, 施法者=${data.casterId}`);
  });
  
  // 技能命中事件
  scenario.eventEmitter.on('skillHit', (data) => {
    console.log(`[事件] 技能命中: 目标=${data.targetId}, 伤害=${data.damage}`);
  });
  
  // 豆豆死亡事件
  scenario.eventEmitter.on('beanDefeated', (data) => {
    console.log(`[事件] 豆豆击败: ${data.id}, 类型=${data.type}`);
  });
  
  // 英雄死亡事件
  scenario.eventEmitter.on('heroDied', (data) => {
    console.log(`[事件] 英雄死亡: ${data.name}`);
  });
  
  // 游戏结束事件
  scenario.eventEmitter.on('gameOver', (data) => {
    console.log(`[事件] 游戏结束: 结果=${data.result}, 原因=${data.reason}`);
    
    // 显示最终状态
    showBattleStatus();
    
    // 保存战斗记录
    if (testConfig.saveRecord) {
      saveBattleRecord();
    }
    
    // 结束测试
    console.log("测试完成");
    process.exit(0);
  });
}

// 显示战斗状态
function showBattleStatus() {
  const state = scenario.getBattleState();
  
  console.log("\n当前战斗状态:");
  console.log(`- 状态: ${state.status}, 结果: ${state.result}`);
  console.log(`- 帧: ${state.frame}, 时间: ${(state.time / 1000).toFixed(1)}秒`);
  
  if (state.hero) {
    console.log(`- 英雄: ${state.hero.name}`);
    console.log(`  HP: ${state.hero.hp}/${state.hero.maxHp}, MP: ${state.hero.mp}`);
    
    // 显示技能信息
    const hero = scenario.battleState.entities.hero;
    if (hero && hero.skills) {
      console.log("  技能:");
      for (const skill of hero.skills) {
        const cooldownRemaining = Math.max(0, skill.cooldown - (Date.now() - skill.lastCastTime));
        console.log(`    ${skill.id}. ${skill.name} - 冷却: ${(cooldownRemaining / 1000).toFixed(1)}秒, 消耗: ${skill.cost}MP`);
      }
    }
  }
  
  if (state.crystal) {
    console.log(`- 水晶: HP: ${state.crystal.hp}/${state.crystal.maxHp} (${(state.crystal.hp / state.crystal.maxHp * 100).toFixed(1)}%)`);
  }
  
  console.log(`- 豆豆: 总数=${state.beans.length}, 存活=${state.beans.filter(b => b.alive).length}`);
  console.log(`- 统计: 生成=${scenario.battleState.stats.beansSpawned}, 击败=${scenario.battleState.stats.beansDefeated}`);
  console.log(`- 伤害: 造成=${scenario.battleState.stats.damageDealt}, 受到=${scenario.battleState.stats.damageTaken}`);
}

// 释放技能
function castSkill() {
  const hero = scenario.battleState.entities.hero;
  if (!hero || !hero.alive) return;
  
  // 查找可用的技能
  const availableSkills = hero.skills.filter(skill => {
    const cooldownRemaining = Math.max(0, skill.cooldown - (Date.now() - skill.lastCastTime));
    return cooldownRemaining === 0 && hero.stats.mp >= skill.cost;
  });
  
  if (availableSkills.length === 0) return;
  
  // 优先使用伤害高的技能
  availableSkills.sort((a, b) => b.baseDamage - a.baseDamage);
  const skill = availableSkills[0];
  
  // 构建指令
  const command = {
    type: 'castSkill',
    data: {
      heroId: 1,
      skillId: skill.id
    }
  };
  
  // 如果是单体技能，需要目标ID
  if (skill.targetType === 'single') {
    // 选择第一个存活的豆豆
    const aliveBeans = scenario.battleState.entities.beans.filter(b => b.alive);
    if (aliveBeans.length > 0) {
      const firstBean = aliveBeans[0];
      command.data.targetId = parseInt(firstBean.id.replace('bean_', ''));
      console.log(`自动选择目标: ${firstBean.id} (${firstBean.name})`);
    } else {
      return;
    }
  } else if (skill.targetType === 'area') {
    // 区域技能，选择豆豆最集中的位置
    const aliveBeans = scenario.battleState.entities.beans.filter(b => b.alive);
    if (aliveBeans.length > 0) {
      // 简单计算：使用第一个豆豆的位置
      command.data.targetPos = aliveBeans[0].position.x;
      console.log(`自动选择目标位置: (${aliveBeans[0].position.x.toFixed(0)}, ${aliveBeans[0].position.y.toFixed(0)})`);
    } else {
      return;
    }
  }
  
  // 发送指令
  scenario.addCommand(command);
  testState.commandHistory.push({
    timestamp: Date.now(),
    command: command
  });
  
  console.log(`释放技能: ${skill.name}`);
  testState.lastSkillTime = Date.now();
}

// 保存战斗记录
function saveBattleRecord() {
  const fs = require('fs');
  const path = require('path');
  
  const recordPath = path.join(__dirname, testConfig.recordFilename);
  
  const record = {
    timestamp: Date.now(),
    duration: scenario.battleState.time,
    status: scenario.battleState.status,
    result: scenario.battleState.result,
    stats: scenario.battleState.stats,
    commands: testState.commandHistory,
    finalState: scenario.getBattleState()
  };
  
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  console.log(`战斗记录已保存到: ${recordPath}`);
}

// 运行测试
function runTest() {
  // 设置事件监听器
  setupEventListeners();
  
  // 记录开始时间
  testState.startTime = Date.now();
  
  // 开始战斗
  scenario.startBattle();
  
  console.log("战斗开始！");
  
  // 主循环
  const testInterval = setInterval(() => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - testState.startTime;
    
    // 检查测试是否超时
    if (elapsedTime >= testConfig.duration) {
      console.log(`测试超时，已运行${testConfig.duration / 1000}秒`);
      clearInterval(testInterval);
      
      // 显示最终状态
      showBattleStatus();
      
      // 保存战斗记录
      if (testConfig.saveRecord) {
        saveBattleRecord();
      }
      
      // 结束测试
      console.log("测试完成");
      process.exit(0);
      return;
    }
    
    // 检查是否需要释放技能
    if (currentTime - testState.lastSkillTime >= testConfig.skillInterval) {
      castSkill();
    }
    
    // 检查是否需要显示状态
    if (currentTime - testState.lastStatusTime >= testConfig.statusInterval) {
      showBattleStatus();
      testState.lastStatusTime = currentTime;
    }
  }, 100);
}

// 执行测试
runTest();
