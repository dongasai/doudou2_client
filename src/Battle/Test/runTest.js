/**
 * 运行战斗引擎测试
 * 这个脚本模拟了战斗引擎的基本功能，用于验证实现
 */

console.log('开始运行战斗引擎测试...');
process.stdout.write('测试输出检查\n');

// 模拟战斗引擎的核心类
class MockLogger {
  debug(message) { console.log(`[DEBUG] ${message}`); }
  info(message) { console.log(`[INFO] ${message}`); }
  warn(message) { console.log(`[WARN] ${message}`); }
  error(message) { console.log(`[ERROR] ${message}`); }
}

class MockRandomManager {
  constructor(seed) {
    this.seed = seed || Date.now();
    console.log(`[INFO] 随机管理器初始化，种子: ${this.seed}`);
  }

  random() {
    return Math.random();
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

class MockEventManager {
  constructor() {
    this.listeners = new Map();
    console.log(`[INFO] 事件管理器初始化`);
  }

  on(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(handler);
    console.log(`[DEBUG] 添加事件监听器: ${eventType}`);
  }

  emit(eventType, data) {
    console.log(`[DEBUG] 触发事件: ${eventType}`);
    if (this.listeners.has(eventType)) {
      for (const handler of this.listeners.get(eventType)) {
        handler(data);
      }
    }
  }
}

class MockEntity {
  constructor(id, type, name, position) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.position = position;
    this.stats = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 5
    };
    this.alive = true;
    console.log(`[DEBUG] 创建实体: ${this.toString()}`);
  }

  getId() { return this.id; }
  getType() { return this.type; }
  getName() { return this.name; }
  getPosition() { return { ...this.position }; }
  getStats() { return { ...this.stats }; }
  isAlive() { return this.alive; }

  takeDamage(amount) {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    if (this.stats.hp <= 0) {
      this.alive = false;
    }
    console.log(`[DEBUG] 实体受伤: ${this.id}, 伤害: ${amount}, 剩余HP: ${this.stats.hp}`);
    return amount;
  }

  toString() {
    return `Entity[id=${this.id}, type=${this.type}, name=${this.name}, hp=${this.stats.hp}/${this.stats.maxHp}]`;
  }
}

class MockHero extends MockEntity {
  constructor(id, name, position, playerId) {
    super(id, 'hero', name, position);
    this.playerId = playerId;
    this.skills = [
      { id: 'skill_1', name: '火球术', cooldown: 3000, damage: 50 },
      { id: 'skill_2', name: '烈焰风暴', cooldown: 8000, damage: 80 }
    ];
    console.log(`[DEBUG] 创建英雄: ${this.toString()}`);
  }

  castSkill(skillId, target) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) {
      console.log(`[WARN] 技能不存在: ${skillId}`);
      return false;
    }

    console.log(`[INFO] 英雄${this.id}释放技能${skill.name}，目标: ${target?.getId() || '无'}`);
    return true;
  }
}

class MockBean extends MockEntity {
  constructor(id, name, position, beanType) {
    super(id, 'bean', name, position);
    this.beanType = beanType || 'normal';
    console.log(`[DEBUG] 创建豆豆: ${this.toString()}`);
  }
}

class MockCrystal extends MockEntity {
  constructor(id, name, position) {
    super(id, 'crystal', name, position);
    this.stats.hp = 1000;
    this.stats.maxHp = 1000;
    console.log(`[DEBUG] 创建水晶: ${this.toString()}`);
  }
}

class MockBattleManager {
  constructor() {
    this.logger = new MockLogger();
    this.randomManager = new MockRandomManager(12345);
    this.eventManager = new MockEventManager();
    this.entities = new Map();
    this.state = 'idle';
    this.result = 'none';

    // 注册事件监听
    this.eventManager.on('entityDeath', this.onEntityDeath.bind(this));

    console.log(`[INFO] 战斗管理器初始化完成`);
  }

  initBattle(params) {
    console.log(`[INFO] 初始化战斗`);

    // 创建水晶
    const crystal = new MockCrystal('crystal_1', '水晶', { x: 1500, y: 1500 });
    this.entities.set(crystal.getId(), crystal);

    // 创建英雄
    for (const player of params.players) {
      const hero = new MockHero(
        `hero_${player.hero.id}`,
        `英雄${player.hero.id}`,
        { x: 1500, y: 1400 },
        player.id
      );
      this.entities.set(hero.getId(), hero);
    }

    // 创建豆豆（敌人）
    for (let i = 1; i <= 5; i++) {
      const bean = new MockBean(
        `bean_${i}`,
        `豆豆${i}`,
        {
          x: 1500 + Math.cos(i * Math.PI / 2.5) * 250,
          y: 1500 + Math.sin(i * Math.PI / 2.5) * 250
        },
        'normal'
      );
      this.entities.set(bean.getId(), bean);
    }

    this.state = 'idle';
    this.result = 'none';

    console.log(`[INFO] 战斗初始化完成，实体数量: ${this.entities.size}`);
  }

  startBattle() {
    if (this.state !== 'idle') {
      console.log(`[WARN] 无法开始战斗，当前状态: ${this.state}`);
      return;
    }

    this.state = 'running';
    console.log(`[INFO] 战斗开始`);

    // 触发战斗开始事件
    this.eventManager.emit('battleStart', {
      time: Date.now()
    });

    // 模拟战斗进行
    this.simulateBattle();
  }

  simulateBattle() {
    console.log(`[INFO] 模拟战斗进行中...`);

    // 模拟英雄攻击豆豆
    const heroes = Array.from(this.entities.values()).filter(e => e.getType() === 'hero');
    const beans = Array.from(this.entities.values()).filter(e => e.getType() === 'bean');

    if (heroes.length > 0 && beans.length > 0) {
      const hero = heroes[0];
      const bean = beans[0];

      // 英雄释放技能
      hero.castSkill('skill_1', bean);

      // 豆豆受到伤害
      bean.takeDamage(50);

      // 触发伤害事件
      this.eventManager.emit('damageDealt', {
        source: hero,
        target: bean,
        amount: 50,
        type: 'magical'
      });

      // 检查豆豆是否死亡
      if (!bean.isAlive()) {
        this.eventManager.emit('entityDeath', {
          entity: bean,
          killer: hero
        });
      }
    }

    // 模拟豆豆攻击水晶
    const crystal = Array.from(this.entities.values()).find(e => e.getType() === 'crystal');

    if (crystal && beans.length > 0) {
      const bean = beans[0];

      // 豆豆攻击水晶
      console.log(`[INFO] 豆豆${bean.getId()}攻击水晶`);

      // 水晶受到伤害
      crystal.takeDamage(10);

      // 触发伤害事件
      this.eventManager.emit('damageDealt', {
        source: bean,
        target: crystal,
        amount: 10,
        type: 'physical'
      });

      // 检查水晶是否被摧毁
      if (!crystal.isAlive()) {
        this.result = 'defeat';
        this.endBattle();
      }
    }

    // 检查是否所有豆豆都被击败
    const remainingBeans = Array.from(this.entities.values()).filter(e => e.getType() === 'bean' && e.isAlive());

    if (remainingBeans.length === 0) {
      this.result = 'victory';
      this.endBattle();
    }
  }

  endBattle() {
    this.state = 'completed';
    console.log(`[INFO] 战斗结束，结果: ${this.result}`);

    // 触发战斗结束事件
    this.eventManager.emit('battleEnd', {
      result: this.result,
      time: Date.now()
    });
  }

  onEntityDeath(event) {
    console.log(`[INFO] 实体死亡: ${event.entity.getId()}, 击杀者: ${event.killer?.getId() || '无'}`);
  }

  getState() {
    return this.state;
  }

  getResult() {
    return this.result;
  }

  getBattleStats() {
    const heroes = Array.from(this.entities.values()).filter(e => e.getType() === 'hero');
    const beans = Array.from(this.entities.values()).filter(e => e.getType() === 'bean');
    const crystal = Array.from(this.entities.values()).find(e => e.getType() === 'crystal');

    return {
      heroStats: heroes.map(hero => ({
        id: hero.getId(),
        name: hero.getName(),
        hp: hero.getStats().hp,
        maxHp: hero.getStats().maxHp
      })),
      beanStats: beans.map(bean => ({
        id: bean.getId(),
        name: bean.getName(),
        hp: bean.getStats().hp,
        maxHp: bean.getStats().maxHp,
        alive: bean.isAlive()
      })),
      crystalStats: crystal ? {
        hp: crystal.getStats().hp,
        maxHp: crystal.getStats().maxHp
      } : null
    };
  }
}

// 创建战斗管理器
const battleManager = new MockBattleManager();

// 创建战斗初始化参数
const battleParams = {
  crystal: {
    id: 1,
    name: '水晶',
    stats: {
      hp: 1000,
      maxHp: 1000
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
          speed: 50
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
  console.log('开始测试...');

  // 初始化战斗
  battleManager.initBattle(battleParams);

  // 开始战斗
  battleManager.startBattle();

  // 输出战斗状态
  console.log('战斗状态:', battleManager.getState());
  console.log('战斗结果:', battleManager.getResult());
  console.log('战斗统计:', JSON.stringify(battleManager.getBattleStats(), null, 2));

  console.log('测试完成');
}

// 执行测试
runTest();
