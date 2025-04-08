import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import * as fse from 'fs-extra';

const SOURCE_DIR = path.join(__dirname, '../src/skill_core');

// 读取忽略规则
function loadIgnorePatterns(): string[] {
  const ignoreFile = path.join(SOURCE_DIR, '.ignorelist');
  if (!fs.existsSync(ignoreFile)) {
    return [];
  }
  
  const content = fs.readFileSync(ignoreFile, 'utf-8');
  return content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// 检查是否应该忽略
function shouldIgnore(filePath: string, patterns: string[]): boolean {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const fileName = path.basename(filePath);
  
  // 精确匹配文件名
  if (patterns.includes(fileName)) {
    return true;
  }
  
  // 使用更严格的glob匹配
  return patterns.some(pattern =>
    minimatch(relativePath, pattern, {
      dot: true,
      matchBase: false, // 禁用宽松的base匹配
      nocase: true,
      noglobstar: true // 禁用**匹配
    })
  );
}
const TARGET_DIR = path.join(__dirname, '../../doudou2/src/skill');

// 清理目标目录(保留.gitkeep等特殊文件)
async function cleanTargetDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;
  
  const keepFiles = ['.gitkeep'];
  const files = await fs.promises.readdir(dirPath);
  
  for (const file of files) {
    if (!keepFiles.includes(file)) {
      const fullPath = path.join(dirPath, file);
      await fse.remove(fullPath);
    }
  }
}

// 确保目标目录存在
async function ensureDirectoryExists(dirPath: string) {
  await cleanTargetDir(dirPath);
  if (!fs.existsSync(dirPath)) {
    await fse.mkdirp(dirPath);
  }
}

// 递归复制目录结构
async function copyDirectoryRecursive(source: string, target: string, fileFilter: (file: string) => boolean) {
  // 创建目标目录
  ensureDirectoryExists(target);

  // 读取忽略规则
  const ignorePatterns = loadIgnorePatterns();

  // 读取源目录内容
  const items = fs.readdirSync(source);

  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);

    // 检查是否应该忽略
    if (shouldIgnore(sourcePath, ignorePatterns)) {
      console.log(`Ignored: ${path.relative(SOURCE_DIR, sourcePath)} (matched ignore pattern)`);
      continue;
    }

    if (stat.isDirectory()) {
      // 如果是目录则递归处理
      await copyDirectoryRecursive(sourcePath, targetPath, fileFilter);
    } else if (fileFilter(item)) {
      // 如果是文件且符合过滤条件则复制
      await fse.ensureDir(path.dirname(targetPath));
      await fse.copy(sourcePath, targetPath);
      console.log(`Copied: ${path.relative(SOURCE_DIR, sourcePath)} -> ${path.relative(TARGET_DIR, targetPath)}`);
    }
  }
}

// 同步json文件
async function syncJsonFiles() {
  const sourceJsonDir = path.join(SOURCE_DIR, 'json');
  const targetJsonDir = path.join(TARGET_DIR, 'json');
  await copyDirectoryRecursive(sourceJsonDir, targetJsonDir, file => file.endsWith('.json'));
}

// 同步type文件
async function syncTypeFiles() {
  const sourceTypeDir = path.join(SOURCE_DIR, 'type');
  const targetTypeDir = path.join(TARGET_DIR, 'type');
  await copyDirectoryRecursive(sourceTypeDir, targetTypeDir, file => file.endsWith('.ts'));
}

// 主函数
async function main() {
  try {
    console.log('Starting skill core sync...');
    await ensureDirectoryExists(TARGET_DIR);
    await syncJsonFiles();
    await syncTypeFiles();
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

main();