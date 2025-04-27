/**
 * 战斗引擎测试脚本
 */

console.log("开始战斗引擎测试...");

// 检查战斗引擎文件
const fs = require('fs');
const path = require('path');

// 检查核心文件
const coreDir = path.join(__dirname, '../Core');
const coreFiles = fs.readdirSync(coreDir);
console.log("核心文件:", coreFiles);

// 检查实体文件
const entitiesDir = path.join(__dirname, '../Entities');
const entityFiles = fs.readdirSync(entitiesDir);
console.log("实体文件:", entityFiles);

// 检查类型文件
const typesDir = path.join(__dirname, '../Types');
const typeFiles = fs.readdirSync(typesDir);
console.log("类型文件:", typeFiles);

// 模拟战斗过程
console.log("\n模拟战斗过程:");

// 模拟英雄
const hero = {
  id: "hero_1",
  name: "烈焰法师",
  hp: 800,
  maxHp: 800,
  attack: 50,
  defense: 40,
  skills: [
    { id: 1, name: "火球术", damage: 100, cooldown: 3000 },
    { id: 2, name: "烈焰风暴", damage: 80, cooldown: 8000 }
  ]
};

// 模拟豆豆
const beans = [
  { id: "bean_1", name: "普通豆", hp: 200, maxHp: 200, attack: 30 },
  { id: "bean_2", name: "快速豆", hp: 150, maxHp: 150, attack: 20, speed: 1.5 },
  { id: "bean_3", name: "强壮豆", hp: 300, maxHp: 300, attack: 40 }
];

// 模拟水晶
const crystal = {
  id: "crystal_1",
  name: "水晶",
  hp: 1000,
  maxHp: 1000
};

// 模拟战斗
console.log("战斗开始");
console.log(`英雄: ${hero.name}, HP: ${hero.hp}/${hero.maxHp}`);
console.log(`水晶: ${crystal.name}, HP: ${crystal.hp}/${crystal.maxHp}`);
console.log(`敌人: ${beans.map(b => b.name).join(', ')}`);

// 模拟第一回合
console.log("\n第1回合:");
console.log(`英雄${hero.name}释放技能${hero.skills[0].name}，目标: ${beans[0].name}`);
beans[0].hp -= hero.skills[0].damage;
console.log(`${beans[0].name}受到${hero.skills[0].damage}点伤害，剩余HP: ${beans[0].hp}/${beans[0].maxHp}`);

if (beans[0].hp <= 0) {
  console.log(`${beans[0].name}被击败！`);
  beans.splice(0, 1);
}

// 敌人攻击
if (beans.length > 0) {
  console.log(`${beans[0].name}攻击水晶，造成${beans[0].attack}点伤害`);
  crystal.hp -= beans[0].attack;
  console.log(`水晶剩余HP: ${crystal.hp}/${crystal.maxHp}`);
}

// 模拟第二回合
console.log("\n第2回合:");
if (beans.length > 0) {
  console.log(`英雄${hero.name}释放技能${hero.skills[1].name}，目标: 所有敌人`);
  
  // 对所有敌人造成伤害
  for (let i = 0; i < beans.length; i++) {
    beans[i].hp -= hero.skills[1].damage;
    console.log(`${beans[i].name}受到${hero.skills[1].damage}点伤害，剩余HP: ${beans[i].hp}/${beans[i].maxHp}`);
    
    if (beans[i].hp <= 0) {
      console.log(`${beans[i].name}被击败！`);
      beans.splice(i, 1);
      i--;
    }
  }
}

// 检查战斗结果
console.log("\n战斗结果:");
if (beans.length === 0) {
  console.log("胜利！所有敌人都被击败了");
} else if (crystal.hp <= 0) {
  console.log("失败！水晶被摧毁了");
} else {
  console.log("战斗继续...");
  console.log(`剩余敌人: ${beans.length}`);
  console.log(`水晶HP: ${crystal.hp}/${crystal.maxHp}`);
  console.log(`英雄HP: ${hero.hp}/${hero.maxHp}`);
}

console.log("\n测试完成");
