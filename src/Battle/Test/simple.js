// 简单测试脚本
console.log("Hello, World!");
process.stdout.write("Direct output test\n");

// 检查文件系统
const fs = require('fs');
const path = require('path');

// 列出当前目录
const files = fs.readdirSync('.');
console.log("Files in current directory:", files);

// 列出Battle目录
const battleFiles = fs.readdirSync('./src/Battle');
console.log("Files in Battle directory:", battleFiles);

// 输出完成
console.log("Test completed");
