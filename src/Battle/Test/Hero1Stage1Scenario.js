/**
 * 1号英雄（烈焰法师）第一关测试场景
 * 提供更详细的战斗模拟，用于测试战斗引擎
 */

console.log("加载1号英雄（烈焰法师）第一关测试场景...");

// 导入必要的模块
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// 创建事件发射器
const eventEmitter = new EventEmitter();

// 战斗配置
const battleConfig = {
  // 关卡配置
  stage: {
    id: "stage-1-1",
    name: "第一章-第一关",
    difficulty: 1.0,
    totalBeans: 30,
    spawnInterval: 1000,
    beanRatios: [
      { type: "普通豆", weight: 3 },
      { type: "毒豆", weight: 1 }
    ]
  },
  
  // 英雄配置
  hero: {
    id: 1,
    name: "烈焰法师",
    emoji: "🔥",
    type: "mage",
    stats: {
      hp: 800,
      mp: 200,
      attack: 50,
      defense: 40,
      magicAttack: 120,
      magicDefense: 60,
      speed: 50
    },
    skills: [
      {
        id: 1,
        name: "火球术",
        type: "damage",
        targetType: "single",
        cooldown: 3000,
        cost: 40,
        range: 400,
        baseDamage: 100,
        burnDamage: 20,
        burnDuration: 3000,
        description: "发射火球造成100点基础伤害，并有20%暴击率"
      },
      {
        id: 2,
        name: "烈焰风暴",
        type: "damage",
        targetType: "area",
        cooldown: 8000,
        cost: 80,
        range: 350,
        baseDamage: 80,
        duration: 5000,
        description: "召唤持续5秒的火焰风暴，每秒造成80点伤害"
      }
    ]
  },
  
  // 豆豆配置
  beans: {
    "普通豆": {
      hp: 200,
      attack: 30,
      defense: 20,
      speed: 50,
      attackInterval: 2000,
      attackRange: 50
    },
    "毒豆": {
      hp: 150,
      attack: 20,
      defense: 15,
      speed: 60,
      attackInterval: 2500,
      attackRange: 100,
      poisonDamage: 5,
      poisonDuration: 4000
    }
  },
  
  // 水晶配置
  crystal: {
    hp: 1000,
    defense: 50
  }
};

// 战斗状态
const battleState = {
  frame: 0,
  time: 0,
  status: 'idle',
  result: 'none',
  entities: {
    hero: null,
    crystal: null,
    beans: []
  },
  stats: {
    beansSpawned: 0,
    beansDefeated: 0,
    damageDealt: 0,
    damageTaken: 0
  },
  commands: []
};

// 创建实体
function createEntities() {
  // 创建英雄
  battleState.entities.hero = {
    id: `hero_${battleConfig.hero.id}`,
    type: 'hero',
    name: battleConfig.hero.name,
    emoji: battleConfig.hero.emoji,
    position: { x: 1500, y: 1500 },
    stats: { ...battleConfig.hero.stats, currentHp: battleConfig.hero.stats.hp },
    skills: battleConfig.hero.skills.map(skill => ({
      ...skill,
      lastCastTime: 0,
      currentCooldown: 0
    })),
    alive: true
  };
  
  // 创建水晶
  battleState.entities.crystal = {
    id: 'crystal_1',
    type: 'crystal',
    name: '水晶',
    position: { x: 1500, y: 1500 },
    stats: { 
      hp: battleConfig.crystal.hp,
      currentHp: battleConfig.crystal.hp,
      defense: battleConfig.crystal.defense
    },
    alive: true
  };
  
  console.log(`创建英雄: ${battleState.entities.hero.name}`);
  console.log(`创建水晶: HP=${battleState.entities.crystal.stats.currentHp}`);
}

// 生成豆豆
function spawnBean() {
  if (battleState.stats.beansSpawned >= battleConfig.stage.totalBeans) {
    return null;
  }
  
  // 根据权重随机选择豆豆类型
  const totalWeight = battleConfig.stage.beanRatios.reduce((sum, ratio) => sum + ratio.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedType = battleConfig.stage.beanRatios[0].type;
  
  for (const ratio of battleConfig.stage.beanRatios) {
    random -= ratio.weight;
    if (random <= 0) {
      selectedType = ratio.type;
      break;
    }
  }
  
  // 获取豆豆配置
  const beanConfig = battleConfig.beans[selectedType];
  
  // 随机生成位置（在水晶周围的圆环上）
  const angle = Math.random() * Math.PI * 2;
  const distance = 250; // 生成距离
  const position = {
    x: 1500 + Math.cos(angle) * distance,
    y: 1500 + Math.sin(angle) * distance
  };
  
  // 创建豆豆
  const bean = {
    id: `bean_${battleState.stats.beansSpawned + 1}`,
    type: 'bean',
    beanType: selectedType,
    name: selectedType,
    position: position,
    stats: { ...beanConfig, currentHp: beanConfig.hp },
    target: 'crystal_1',
    lastAttackTime: 0,
    alive: true
  };
  
  // 添加到豆豆列表
  battleState.entities.beans.push(bean);
  battleState.stats.beansSpawned++;
  
  console.log(`生成豆豆: ${bean.name}, ID=${bean.id}, 位置=(${position.x.toFixed(0)}, ${position.y.toFixed(0)})`);
  
  // 触发豆豆生成事件
  eventEmitter.emit('beanSpawned', bean);
  
  return bean;
}

// 计算两点之间的距离
function distance(pos1, pos2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 更新实体位置
function updatePositions(deltaTime) {
  // 更新豆豆位置
  for (const bean of battleState.entities.beans) {
    if (!bean.alive) continue;
    
    // 获取目标
    let target = null;
    if (bean.target === 'crystal_1') {
      target = battleState.entities.crystal;
    } else if (bean.target.startsWith('hero_')) {
      target = battleState.entities.hero;
    }
    
    if (!target || !target.alive) continue;
    
    // 计算方向
    const dx = target.position.x - bean.position.x;
    const dy = target.position.y - bean.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // 如果已经到达攻击范围，停止移动
    if (dist <= bean.stats.attackRange) {
      continue;
    }
    
    // 移动豆豆
    const speed = bean.stats.speed * (deltaTime / 1000);
    bean.position.x += (dx / dist) * speed;
    bean.position.y += (dy / dist) * speed;
    
    // 触发豆豆移动事件
    eventEmitter.emit('beanMoved', {
      id: bean.id,
      position: bean.position
    });
  }
}

// 处理攻击
function processAttacks(currentTime) {
  // 豆豆攻击
  for (const bean of battleState.entities.beans) {
    if (!bean.alive) continue;
    
    // 获取目标
    let target = null;
    if (bean.target === 'crystal_1') {
      target = battleState.entities.crystal;
    } else if (bean.target.startsWith('hero_')) {
      target = battleState.entities.hero;
    }
    
    if (!target || !target.alive) continue;
    
    // 检查是否在攻击范围内
    const dist = distance(bean.position, target.position);
    if (dist > bean.stats.attackRange) continue;
    
    // 检查攻击冷却
    if (currentTime - bean.lastAttackTime < bean.stats.attackInterval) continue;
    
    // 执行攻击
    bean.lastAttackTime = currentTime;
    
    // 计算伤害
    let damage = bean.stats.attack;
    if (target.stats.defense) {
      // 简单的伤害减免公式
      const reduction = target.stats.defense / (target.stats.defense + 100);
      damage = Math.max(1, Math.floor(damage * (1 - reduction)));
    }
    
    // 应用伤害
    target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
    battleState.stats.damageTaken += damage;
    
    console.log(`${bean.name}攻击${target.name}，造成${damage}点伤害，目标剩余HP: ${target.stats.currentHp}`);
    
    // 触发伤害事件
    eventEmitter.emit('damageDealt', {
      source: bean,
      target: target,
      damage: damage,
      type: 'physical'
    });
    
    // 检查目标是否死亡
    if (target.stats.currentHp <= 0) {
      target.alive = false;
      
      if (target.type === 'crystal') {
        console.log(`水晶被摧毁！`);
        battleState.status = 'completed';
        battleState.result = 'defeat';
        
        // 触发游戏结束事件
        eventEmitter.emit('gameOver', {
          result: 'defeat',
          reason: '水晶被摧毁'
        });
      } else if (target.type === 'hero') {
        console.log(`英雄${target.name}阵亡！`);
        
        // 触发英雄死亡事件
        eventEmitter.emit('heroDied', {
          id: target.id,
          name: target.name
        });
      }
    }
    
    // 特殊效果（如毒豆的毒素效果）
    if (bean.beanType === '毒豆' && target.alive) {
      console.log(`${target.name}被毒豆毒素影响，将在接下来的${bean.stats.poisonDuration / 1000}秒内每秒受到${bean.stats.poisonDamage}点伤害`);
      
      // 这里简化处理，实际应该添加一个持续效果
    }
  }
}

// 处理技能释放
function processSkillCast(currentTime) {
  // 检查是否有技能释放指令
  const skillCommands = battleState.commands.filter(cmd => cmd.type === 'castSkill' && !cmd.processed);
  
  for (const command of skillCommands) {
    const hero = battleState.entities.hero;
    if (!hero || !hero.alive) continue;
    
    // 查找技能
    const skill = hero.skills.find(s => s.id === command.data.skillId);
    if (!skill) {
      console.log(`技能不存在: ${command.data.skillId}`);
      command.processed = true;
      continue;
    }
    
    // 检查冷却
    if (currentTime - skill.lastCastTime < skill.cooldown) {
      console.log(`技能${skill.name}冷却中，剩余${((skill.lastCastTime + skill.cooldown) - currentTime) / 1000}秒`);
      continue;
    }
    
    // 检查魔法值
    if (hero.stats.mp < skill.cost) {
      console.log(`魔法值不足，无法释放${skill.name}，需要${skill.cost}点魔法值`);
      command.processed = true;
      continue;
    }
    
    // 查找目标
    let targets = [];
    if (skill.targetType === 'single') {
      // 单体目标
      const targetId = command.data.targetId;
      const target = battleState.entities.beans.find(b => b.id === `bean_${targetId}`);
      if (target && target.alive) {
        targets.push(target);
      }
    } else if (skill.targetType === 'area') {
      // 区域目标
      const centerX = command.data.targetPos || 1500;
      const centerY = command.data.targetPos || 1500;
      const center = { x: centerX, y: centerY };
      const radius = 150; // 技能影响范围
      
      // 查找范围内的所有豆豆
      targets = battleState.entities.beans.filter(bean => {
        if (!bean.alive) return false;
        return distance(bean.position, center) <= radius;
      });
    }
    
    if (targets.length === 0) {
      console.log(`没有有效目标，无法释放${skill.name}`);
      command.processed = true;
      continue;
    }
    
    // 消耗魔法值
    hero.stats.mp -= skill.cost;
    
    // 更新冷却
    skill.lastCastTime = currentTime;
    
    console.log(`英雄${hero.name}释放技能${skill.name}，目标数量: ${targets.length}`);
    
    // 触发技能释放事件
    eventEmitter.emit('skillCast', {
      casterId: hero.id,
      skillId: skill.id,
      skillName: skill.name,
      targets: targets.map(t => t.id)
    });
    
    // 应用技能效果
    for (const target of targets) {
      // 计算伤害
      let damage = skill.baseDamage;
      
      // 考虑魔法攻击力加成
      damage += hero.stats.magicAttack * 0.5;
      
      // 考虑目标魔法防御
      if (target.stats.magicDefense) {
        const reduction = target.stats.magicDefense / (target.stats.magicDefense + 100);
        damage = Math.max(1, Math.floor(damage * (1 - reduction)));
      }
      
      // 应用伤害
      target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
      battleState.stats.damageDealt += damage;
      
      console.log(`${target.name}受到${damage}点伤害，剩余HP: ${target.stats.currentHp}`);
      
      // 触发技能命中事件
      eventEmitter.emit('skillHit', {
        skillId: skill.id,
        casterId: hero.id,
        targetId: target.id,
        damage: damage
      });
      
      // 检查目标是否死亡
      if (target.stats.currentHp <= 0) {
        target.alive = false;
        battleState.stats.beansDefeated++;
        
        console.log(`${target.name}被击败！`);
        
        // 触发豆豆死亡事件
        eventEmitter.emit('beanDefeated', {
          id: target.id,
          type: target.beanType,
          position: target.position
        });
      }
      
      // 特殊效果（如火球术的灼烧效果）
      if (skill.id === 1 && target.alive) {
        console.log(`${target.name}被火球术灼烧，将在接下来的${skill.burnDuration / 1000}秒内每秒受到${skill.burnDamage}点伤害`);
        
        // 这里简化处理，实际应该添加一个持续效果
      }
    }
    
    // 标记指令为已处理
    command.processed = true;
  }
}

// 检查胜利条件
function checkVictoryCondition() {
  // 检查是否所有豆豆都被击败
  if (battleState.stats.beansDefeated >= battleConfig.stage.totalBeans && 
      battleState.stats.beansSpawned >= battleConfig.stage.totalBeans) {
    console.log(`所有豆豆都被击败了！`);
    battleState.status = 'completed';
    battleState.result = 'victory';
    
    // 触发游戏结束事件
    eventEmitter.emit('gameOver', {
      result: 'victory',
      reason: '所有敌人都被击败'
    });
    
    return true;
  }
  
  return false;
}

// 更新战斗状态
function updateBattle(deltaTime, currentTime) {
  // 更新帧号
  battleState.frame++;
  battleState.time += deltaTime;
  
  // 生成豆豆
  if (battleState.time % battleConfig.stage.spawnInterval < deltaTime && 
      battleState.stats.beansSpawned < battleConfig.stage.totalBeans) {
    spawnBean();
  }
  
  // 更新位置
  updatePositions(deltaTime);
  
  // 处理攻击
  processAttacks(currentTime);
  
  // 处理技能释放
  processSkillCast(currentTime);
  
  // 检查胜利条件
  checkVictoryCondition();
}

// 添加指令
function addCommand(command) {
  battleState.commands.push({
    ...command,
    processed: false,
    timestamp: Date.now()
  });
  
  console.log(`添加指令: ${command.type}, 数据:`, command.data);
}

// 获取战斗状态
function getBattleState() {
  return {
    frame: battleState.frame,
    time: battleState.time,
    status: battleState.status,
    result: battleState.result,
    stats: { ...battleState.stats },
    hero: battleState.entities.hero ? {
      id: battleState.entities.hero.id,
      name: battleState.entities.hero.name,
      hp: battleState.entities.hero.stats.currentHp,
      maxHp: battleState.entities.hero.stats.hp,
      mp: battleState.entities.hero.stats.mp,
      position: { ...battleState.entities.hero.position },
      alive: battleState.entities.hero.alive
    } : null,
    crystal: battleState.entities.crystal ? {
      id: battleState.entities.crystal.id,
      hp: battleState.entities.crystal.stats.currentHp,
      maxHp: battleState.entities.crystal.stats.hp,
      alive: battleState.entities.crystal.alive
    } : null,
    beans: battleState.entities.beans.map(bean => ({
      id: bean.id,
      type: bean.beanType,
      hp: bean.stats.currentHp,
      maxHp: bean.stats.hp,
      position: { ...bean.position },
      alive: bean.alive
    }))
  };
}

// 开始战斗
function startBattle() {
  if (battleState.status !== 'idle') {
    console.log(`无法开始战斗，当前状态: ${battleState.status}`);
    return;
  }
  
  // 创建实体
  createEntities();
  
  // 更新状态
  battleState.status = 'running';
  battleState.time = 0;
  battleState.frame = 0;
  
  console.log(`战斗开始！`);
  
  // 触发战斗开始事件
  eventEmitter.emit('battleStart', {
    time: Date.now(),
    hero: battleState.entities.hero.name,
    stage: battleConfig.stage.name
  });
  
  // 开始战斗循环
  let lastTime = Date.now();
  const frameInterval = 100; // 100ms per frame (10fps)
  
  const battleLoop = setInterval(() => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // 更新战斗状态
    updateBattle(deltaTime, currentTime);
    
    // 检查战斗是否结束
    if (battleState.status === 'completed') {
      clearInterval(battleLoop);
      console.log(`战斗结束，结果: ${battleState.result}`);
      
      // 输出战斗统计
      console.log(`战斗统计:`);
      console.log(`- 总帧数: ${battleState.frame}`);
      console.log(`- 战斗时长: ${(battleState.time / 1000).toFixed(1)}秒`);
      console.log(`- 生成豆豆数: ${battleState.stats.beansSpawned}`);
      console.log(`- 击败豆豆数: ${battleState.stats.beansDefeated}`);
      console.log(`- 造成伤害: ${battleState.stats.damageDealt}`);
      console.log(`- 受到伤害: ${battleState.stats.damageTaken}`);
      
      if (battleState.entities.hero && battleState.entities.hero.alive) {
        console.log(`- 英雄剩余HP: ${battleState.entities.hero.stats.currentHp}/${battleState.entities.hero.stats.hp}`);
        console.log(`- 英雄剩余MP: ${battleState.entities.hero.stats.mp}/${battleState.entities.hero.stats.mp}`);
      }
      
      if (battleState.entities.crystal && battleState.entities.crystal.alive) {
        console.log(`- 水晶剩余HP: ${battleState.entities.crystal.stats.currentHp}/${battleState.entities.crystal.stats.hp}`);
      }
    }
  }, frameInterval);
}

// 导出模块
module.exports = {
  battleConfig,
  battleState,
  startBattle,
  addCommand,
  getBattleState,
  eventEmitter
};
