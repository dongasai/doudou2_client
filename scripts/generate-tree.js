const fs = require('fs');
const path = require('path');

// 需要忽略的目录和文件
const IGNORE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage'
];

// 只关注的文件扩展名
const CODE_EXTENSIONS = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.vue',
    '.proto'
];

// 读取文件中的类注释
function getClassComment(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // 匹配类上方的多行注释
        const match = content.match(/\/\*\*\s*\n([^*]|\*[^/])*\*\/\s*\n\s*export\s+(default\s+)?class/);
        if (match) {
            return match[0]
                .replace(/\/\*\*|\*\/|\*/g, '') // 移除注释符号
                .split('\n') // 分割成行
                .map(line => line.trim()) // 移除空白
                .filter(line => line && !line.startsWith('@')) // 移除空行和装饰器行
                .join(' ') // 合并成一行
                .trim(); // 移除首尾空白
        }
        // 匹配类上方的单行注释
        const singleLineMatch = content.match(/\/\/[^\n]*\n\s*export\s+(default\s+)?class/);
        if (singleLineMatch) {
            return singleLineMatch[0]
                .replace(/\/\//, '')
                .trim();
        }
        return '';
    } catch (error) {
        return '';
    }
}

function generateTree(dir, prefix = '', isLast = true) {
    let output = '';
    const files = fs.readdirSync(dir);
    const filteredFiles = files.filter(file => {
        const fullPath = path.join(dir, file);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        if (isDirectory) {
            return !IGNORE_DIRS.includes(file);
        }
        return CODE_EXTENSIONS.includes(path.extname(file));
    }).sort((a, b) => {
        // 目录排在前面，文件排在后面
        const aPath = path.join(dir, a);
        const bPath = path.join(dir, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    filteredFiles.forEach((file, index) => {
        const isLastItem = index === filteredFiles.length - 1;
        const fullPath = path.join(dir, file);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        const connector = isLastItem ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');

        if (isDirectory) {
            output += `${prefix}${connector}📂 ${file}\n`;
            output += generateTree(fullPath, newPrefix, isLastItem);
        } else {
            const comment = getClassComment(fullPath);
            const commentStr = comment ? ` # ${comment}` : '';
            output += `${prefix}${connector}📄 ${file}${commentStr}\n`;
        }
    });

    return output;
}

function main() {
    const srcDir = path.resolve(__dirname, '../src');
    const treeContent = `# 客户端代码文件结构\n\n\`\`\`\n📦 src\n${generateTree(srcDir)}\`\`\`\n`;
    fs.writeFileSync(path.join(__dirname, '../TREE.md'), treeContent);
    console.log('代码树已生成到 TREE.md');
}

main(); 