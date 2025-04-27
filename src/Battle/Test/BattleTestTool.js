/**
 * 战斗引擎测试工具
 * 提供命令行界面，用于测试和调试战斗引擎
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const scenario = require('./Hero1Stage1Scenario');

// 创建命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 测试工具状态
const toolState = {
  running: false,
  autoMode: false,
  logLevel: 'normal', // 'minimal', 'normal', 'verbose'
  battleInterval: null,
  lastStatusTime: 0,
  commandHistory: []
};

// 显示帮助信息
function showHelp() {
  console.log("\n战斗引擎测试工具命令:");
  console.log("  start                - 开始战斗");
  console.log("  status               - 显示当前战斗状态");
  console.log("  cast <skillId> [targetId] - 释放技能");
  console.log("  auto <on|off>        - 开启/关闭自动模式");
  console.log("  log <level>          - 设置日志级别 (minimal, normal, verbose)");
  console.log("  save <filename>      - 保存战斗记录到文件");
  console.log("  exit                 - 退出测试工具");
  console.log("  help                 - 显示此帮助信息");
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
    console.log(`  位置: (${state.hero.position.x.toFixed(0)}, ${state.hero.position.y.toFixed(0)})`);
    
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
  
  // 显示存活的豆豆
  if (toolState.logLevel === 'verbose') {
    console.log("\n存活的豆豆:");
    const aliveBeans = state.beans.filter(b => b.alive);
    for (let i = 0; i < Math.min(aliveBeans.length, 10); i++) {
      const bean = aliveBeans[i];
      console.log(`  ${bean.id}: ${bean.type}, HP: ${bean.hp}/${bean.maxHp}, 位置: (${bean.position.x.toFixed(0)}, ${bean.position.y.toFixed(0)})`);
    }
    if (aliveBeans.length > 10) {
      console.log(`  ... 还有 ${aliveBeans.length - 10} 个豆豆 ...`);
    }
  }
}

// 释放技能
function castSkill(skillId, targetId) {
  if (!toolState.running) {
    console.log("战斗尚未开始，无法释放技能");
    return;
  }
  
  const hero = scenario.battleState.entities.hero;
  if (!hero || !hero.alive) {
    console.log("英雄不存在或已阵亡，无法释放技能");
    return;
  }
  
  // 查找技能
  const skill = hero.skills.find(s => s.id === parseInt(skillId));
  if (!skill) {
    console.log(`技能不存在: ${skillId}`);
    return;
  }
  
  // 检查冷却
  const cooldownRemaining = Math.max(0, skill.cooldown - (Date.now() - skill.lastCastTime));
  if (cooldownRemaining > 0) {
    console.log(`技能${skill.name}冷却中，剩余${(cooldownRemaining / 1000).toFixed(1)}秒`);
    return;
  }
  
  // 检查魔法值
  if (hero.stats.mp < skill.cost) {
    console.log(`魔法值不足，无法释放${skill.name}，需要${skill.cost}点魔法值，当前${hero.stats.mp}点`);
    return;
  }
  
  // 构建指令
  const command = {
    type: 'castSkill',
    data: {
      heroId: 1,
      skillId: parseInt(skillId)
    }
  };
  
  // 如果是单体技能，需要目标ID
  if (skill.targetType === 'single') {
    if (!targetId) {
      // 如果没有指定目标，选择第一个存活的豆豆
      const aliveBeans = scenario.battleState.entities.beans.filter(b => b.alive);
      if (aliveBeans.length > 0) {
        const firstBean = aliveBeans[0];
        targetId = firstBean.id.replace('bean_', '');
        console.log(`自动选择目标: ${firstBean.id} (${firstBean.name})`);
      } else {
        console.log("没有可用的目标");
        return;
      }
    }
    command.data.targetId = parseInt(targetId);
  } else if (skill.targetType === 'area') {
    // 区域技能，选择豆豆最集中的位置
    const aliveBeans = scenario.battleState.entities.beans.filter(b => b.alive);
    if (aliveBeans.length > 0) {
      // 简单计算：使用第一个豆豆的位置
      command.data.targetPos = aliveBeans[0].position.x;
      console.log(`自动选择目标位置: (${aliveBeans[0].position.x.toFixed(0)}, ${aliveBeans[0].position.y.toFixed(0)})`);
    } else {
      console.log("没有可用的目标");
      return;
    }
  }
  
  // 发送指令
  scenario.addCommand(command);
  toolState.commandHistory.push({
    timestamp: Date.now(),
    command: command
  });
  
  console.log(`释放技能: ${skill.name}`);
}

// 自动模式
function toggleAutoMode(mode) {
  if (mode === 'on') {
    toolState.autoMode = true;
    console.log("自动模式已开启");
    
    // 设置自动释放技能的定时器
    const autoSkillInterval = setInterval(() => {
      if (!toolState.running || !toolState.autoMode) {
        clearInterval(autoSkillInterval);
        return;
      }
      
      const hero = scenario.battleState.entities.hero;
      if (!hero || !hero.alive) return;
      
      // 查找可用的技能
      const availableSkills = hero.skills.filter(skill => {
        const cooldownRemaining = Math.max(0, skill.cooldown - (Date.now() - skill.lastCastTime));
        return cooldownRemaining === 0 && hero.stats.mp >= skill.cost;
      });
      
      if (availableSkills.length > 0) {
        // 优先使用伤害高的技能
        availableSkills.sort((a, b) => b.baseDamage - a.baseDamage);
        const skill = availableSkills[0];
        
        console.log(`[自动] 释放技能: ${skill.name}`);
        castSkill(skill.id);
      }
    }, 1000); // 每秒检查一次
  } else {
    toolState.autoMode = false;
    console.log("自动模式已关闭");
  }
}

// 设置日志级别
function setLogLevel(level) {
  if (['minimal', 'normal', 'verbose'].includes(level)) {
    toolState.logLevel = level;
    console.log(`日志级别设置为: ${level}`);
  } else {
    console.log(`无效的日志级别: ${level}，可用选项: minimal, normal, verbose`);
  }
}

// 保存战斗记录
function saveBattleRecord(filename) {
  if (!filename) {
    filename = `battle_record_${Date.now()}.json`;
  }
  
  if (!filename.endsWith('.json')) {
    filename += '.json';
  }
  
  const recordPath = path.join(__dirname, filename);
  
  const record = {
    timestamp: Date.now(),
    duration: scenario.battleState.time,
    status: scenario.battleState.status,
    result: scenario.battleState.result,
    stats: scenario.battleState.stats,
    commands: toolState.commandHistory,
    finalState: scenario.getBattleState()
  };
  
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  console.log(`战斗记录已保存到: ${recordPath}`);
}

// 设置事件监听器
function setupEventListeners() {
  // 只在verbose模式下输出详细事件
  if (toolState.logLevel === 'verbose') {
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
  }
  
  // 在normal和verbose模式下输出重要事件
  if (toolState.logLevel !== 'minimal') {
    // 技能释放事件
    scenario.eventEmitter.on('skillCast', (data) => {
      console.log(`[事件] 技能释放: ${data.skillName}, 施法者=${data.casterId}`);
    });
    
    // 豆豆死亡事件
    scenario.eventEmitter.on('beanDefeated', (data) => {
      console.log(`[事件] 豆豆击败: ${data.id}, 类型=${data.type}`);
    });
    
    // 英雄死亡事件
    scenario.eventEmitter.on('heroDied', (data) => {
      console.log(`[事件] 英雄死亡: ${data.name}`);
    });
  }
  
  // 在所有模式下输出关键事件
  // 游戏结束事件
  scenario.eventEmitter.on('gameOver', (data) => {
    console.log(`[事件] 游戏结束: 结果=${data.result}, 原因=${data.reason}`);
    
    // 显示最终状态
    showBattleStatus();
    
    // 停止战斗循环
    if (toolState.battleInterval) {
      clearInterval(toolState.battleInterval);
      toolState.battleInterval = null;
    }
    
    toolState.running = false;
  });
}

// 开始战斗
function startBattle() {
  if (toolState.running) {
    console.log("战斗已经在进行中");
    return;
  }
  
  // 设置事件监听器
  setupEventListeners();
  
  // 开始战斗
  scenario.startBattle();
  toolState.running = true;
  
  console.log("战斗开始！");
  
  // 定期显示状态
  toolState.battleInterval = setInterval(() => {
    const currentTime = Date.now();
    
    // 每5秒显示一次状态
    if (currentTime - toolState.lastStatusTime >= 5000) {
      showBattleStatus();
      toolState.lastStatusTime = currentTime;
    }
  }, 1000);
}

// 处理命令
function processCommand(input) {
  const args = input.trim().split(/\s+/);
  const command = args[0].toLowerCase();
  
  switch (command) {
    case 'start':
      startBattle();
      break;
      
    case 'status':
      showBattleStatus();
      break;
      
    case 'cast':
      if (args.length < 2) {
        console.log("用法: cast <skillId> [targetId]");
      } else {
        castSkill(args[1], args[2]);
      }
      break;
      
    case 'auto':
      if (args.length < 2 || !['on', 'off'].includes(args[1].toLowerCase())) {
        console.log("用法: auto <on|off>");
      } else {
        toggleAutoMode(args[1].toLowerCase());
      }
      break;
      
    case 'log':
      if (args.length < 2) {
        console.log("用法: log <level> (minimal, normal, verbose)");
      } else {
        setLogLevel(args[1].toLowerCase());
      }
      break;
      
    case 'save':
      saveBattleRecord(args[1]);
      break;
      
    case 'exit':
      console.log("退出测试工具");
      if (toolState.battleInterval) {
        clearInterval(toolState.battleInterval);
      }
      rl.close();
      process.exit(0);
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      console.log(`未知命令: ${command}`);
      showHelp();
      break;
  }
}

// 主循环
function main() {
  console.log("战斗引擎测试工具");
  console.log("输入 'help' 查看可用命令");
  
  rl.setPrompt('> ');
  rl.prompt();
  
  rl.on('line', (input) => {
    processCommand(input);
    rl.prompt();
  }).on('close', () => {
    console.log("退出测试工具");
    process.exit(0);
  });
}

// 启动测试工具
main();
