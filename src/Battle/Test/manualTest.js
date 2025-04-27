/**
 * 手动测试战斗引擎
 * 
 * 由于我们无法直接运行TypeScript代码，这个脚本提供了一个简单的方法来验证战斗引擎的实现。
 * 它会检查所有必要的文件是否存在，并输出一个简单的报告。
 */

const fs = require('fs');
const path = require('path');

// 战斗引擎源代码目录
const battleDir = path.resolve(__dirname, '..');

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// 获取文件内容
function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// 检查文件内容是否包含特定字符串
function checkFileContains(filePath, searchString) {
  const content = getFileContent(filePath);
  return content.includes(searchString);
}

// 检查目录中的文件数量
function countFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  return fs.readdirSync(dirPath).length;
}

// 检查战斗引擎的实现
function checkBattleEngine() {
  console.log('开始检查战斗引擎实现...');
  
  // 检查核心目录
  const coreDir = path.join(battleDir, 'Core');
  console.log(`核心目录: ${coreDir}`);
  console.log(`核心目录存在: ${checkFileExists(coreDir)}`);
  console.log(`核心目录文件数量: ${countFilesInDir(coreDir)}`);
  
  // 检查实体目录
  const entitiesDir = path.join(battleDir, 'Entities');
  console.log(`实体目录: ${entitiesDir}`);
  console.log(`实体目录存在: ${checkFileExists(entitiesDir)}`);
  console.log(`实体目录文件数量: ${countFilesInDir(entitiesDir)}`);
  
  // 检查类型目录
  const typesDir = path.join(battleDir, 'Types');
  console.log(`类型目录: ${typesDir}`);
  console.log(`类型目录存在: ${checkFileExists(typesDir)}`);
  console.log(`类型目录文件数量: ${countFilesInDir(typesDir)}`);
  
  // 检查核心文件
  const coreFiles = [
    'BattleEngine.ts',
    'BattleManager.ts',
    'DamageManager.ts',
    'EntityManager.ts',
    'EventManager.ts',
    'FrameManager.ts',
    'Logger.ts',
    'RandomManager.ts',
    'SkillManager.ts',
    'WaveManager.ts'
  ];
  
  console.log('\n检查核心文件:');
  coreFiles.forEach(file => {
    const filePath = path.join(coreDir, file);
    console.log(`${file}: ${checkFileExists(filePath) ? '存在' : '不存在'}`);
    
    if (checkFileExists(filePath)) {
      // 检查文件内容
      const hasExport = checkFileContains(filePath, 'export class');
      console.log(`  - 包含导出类: ${hasExport ? '是' : '否'}`);
      
      // 检查文件大小
      const stats = fs.statSync(filePath);
      console.log(`  - 文件大小: ${stats.size} 字节`);
    }
  });
  
  // 检查实体文件
  const entityFiles = [
    'Entity.ts',
    'Hero.ts',
    'Bean.ts',
    'Crystal.ts'
  ];
  
  console.log('\n检查实体文件:');
  entityFiles.forEach(file => {
    const filePath = path.join(entitiesDir, file);
    console.log(`${file}: ${checkFileExists(filePath) ? '存在' : '不存在'}`);
    
    if (checkFileExists(filePath)) {
      // 检查文件内容
      const hasExport = checkFileContains(filePath, 'export class');
      console.log(`  - 包含导出类: ${hasExport ? '是' : '否'}`);
      
      // 检查文件大小
      const stats = fs.statSync(filePath);
      console.log(`  - 文件大小: ${stats.size} 字节`);
    }
  });
  
  // 检查类型文件
  const typeFiles = [
    'Vector2D.ts'
  ];
  
  console.log('\n检查类型文件:');
  typeFiles.forEach(file => {
    const filePath = path.join(typesDir, file);
    console.log(`${file}: ${checkFileExists(filePath) ? '存在' : '不存在'}`);
    
    if (checkFileExists(filePath)) {
      // 检查文件内容
      const hasExport = checkFileContains(filePath, 'export');
      console.log(`  - 包含导出: ${hasExport ? '是' : '否'}`);
      
      // 检查文件大小
      const stats = fs.statSync(filePath);
      console.log(`  - 文件大小: ${stats.size} 字节`);
    }
  });
  
  console.log('\n检查完成');
}

// 执行检查
checkBattleEngine();
