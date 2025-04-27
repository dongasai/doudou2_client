/**
 * 编译战斗引擎的TypeScript文件
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 战斗引擎源代码目录
const srcDir = path.resolve(__dirname, '..');
// 输出目录
const outDir = path.resolve(__dirname, '../../../dist/Battle');

// 创建输出目录
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 编译TypeScript文件
function compileTypeScript() {
  console.log('开始编译战斗引擎...');
  
  // 创建输出目录
  createDir(outDir);
  createDir(path.join(outDir, 'Core'));
  createDir(path.join(outDir, 'Entities'));
  createDir(path.join(outDir, 'Types'));
  createDir(path.join(outDir, 'Test'));
  
  // 执行tsc命令
  const tscCmd = 'npx tsc --project tsconfig.json';
  
  exec(tscCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`编译错误: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`编译警告: ${stderr}`);
    }
    
    console.log('编译完成');
    console.log('输出目录:', outDir);
  });
}

// 执行编译
compileTypeScript();
