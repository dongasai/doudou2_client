/**
 * 简单的测试运行器
 * 用于测试战斗引擎的基本功能
 */

console.log('开始测试战斗引擎...');

// 导入必要的模块
try {
  // 检查战斗引擎文件是否存在
  const fs = require('fs');
  
  console.log('检查战斗引擎文件...');
  
  // 列出Battle/Core目录下的文件
  const coreFiles = fs.readdirSync('./src/Battle/Core');
  console.log('Core目录文件:', coreFiles);
  
  // 列出Battle/Entities目录下的文件
  const entitiesFiles = fs.readdirSync('./src/Battle/Entities');
  console.log('Entities目录文件:', entitiesFiles);
  
  // 列出Battle/Types目录下的文件
  const typesFiles = fs.readdirSync('./src/Battle/Types');
  console.log('Types目录文件:', typesFiles);
  
  console.log('所有文件检查完成');
  
  // 检查是否可以导入Logger
  console.log('尝试导入Logger...');
  const loggerPath = './src/Battle/Core/Logger.js';
  
  if (fs.existsSync(loggerPath)) {
    console.log('Logger文件存在，尝试导入...');
    // 尝试导入Logger
    const { logger } = require(loggerPath);
    console.log('Logger导入成功');
    
    // 使用Logger
    logger.info('测试日志消息');
  } else {
    console.log('Logger文件不存在，无法导入');
  }
  
} catch (error) {
  console.error('测试过程中发生错误:', error);
}

console.log('测试完成');
