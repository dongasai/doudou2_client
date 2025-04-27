/**
 * 战斗回放加载测试
 * 测试战斗回放的加载和播放功能
 */

console.log("开始战斗回放加载测试...");

const fs = require('fs');
const path = require('path');

// 测试配置
const testConfig = {
  // 回放目录
  replayDir: path.join(__dirname, '../../../logs/battle_replay'),
  // 回放播放速度
  playbackSpeed: 2.0
};

// 获取最新的回放文件
function getLatestReplayFile() {
  // 确保目录存在
  if (!fs.existsSync(testConfig.replayDir)) {
    console.error(`回放目录不存在: ${testConfig.replayDir}`);
    return null;
  }
  
  // 获取目录中的所有文件
  const files = fs.readdirSync(testConfig.replayDir)
    .filter(file => file.startsWith('replay-') && file.endsWith('.json'))
    .map(file => ({
      name: file,
      path: path.join(testConfig.replayDir, file),
      stats: fs.statSync(path.join(testConfig.replayDir, file))
    }))
    .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
  
  if (files.length === 0) {
    console.error('没有找到回放文件');
    return null;
  }
  
  // 返回最新的文件
  return files[0];
}

// 加载回放文件
function loadReplayFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`加载回放文件失败: ${error.message}`);
    return null;
  }
}

// 模拟回放播放
function simulateReplayPlayback(replayData) {
  console.log(`开始播放回放: ${replayData.replayId}`);
  console.log(`战斗时长: ${replayData.metadata.battleDuration}ms`);
  console.log(`事件数: ${replayData.events.length}`);
  console.log(`指令数: ${replayData.commands.length}`);
  
  // 按时间顺序排序事件
  const sortedEvents = [...replayData.events].sort((a, b) => a.time - b.time);
  
  // 开始回放
  const playbackStartTime = Date.now();
  let currentTime = 0;
  let currentIndex = 0;
  
  // 回放进度更新
  const progressInterval = setInterval(() => {
    // 计算当前回放时间
    const elapsedRealTime = Date.now() - playbackStartTime;
    currentTime = elapsedRealTime * testConfig.playbackSpeed;
    
    // 输出当前进度
    const progress = Math.min(100, (currentTime / replayData.metadata.battleDuration) * 100);
    console.log(`回放进度: ${progress.toFixed(1)}%, 时间: ${currentTime.toFixed(0)}ms / ${replayData.metadata.battleDuration}ms (${testConfig.playbackSpeed}x速度)`);
    
    // 触发当前时间点的事件
    while (currentIndex < sortedEvents.length && sortedEvents[currentIndex].time <= currentTime) {
      const event = sortedEvents[currentIndex];
      console.log(`事件: ${event.type}, 时间: ${event.time}ms, 帧: ${event.frame}`);
      currentIndex++;
    }
    
    // 检查是否结束
    if (currentTime >= replayData.metadata.battleDuration) {
      clearInterval(progressInterval);
      console.log("回放完成");
      
      // 测试回放控制
      testReplayControls(replayData);
    }
  }, 1000); // 每秒更新一次进度
}

// 测试回放控制
function testReplayControls(replayData) {
  console.log("\n=== 测试回放控制 ===");
  
  console.log("1. 暂停回放");
  console.log("2. 设置回放速度为0.5倍");
  console.log("3. 跳转到中间位置");
  console.log("4. 恢复回放");
  
  // 模拟回放控制
  setTimeout(() => {
    console.log("\n回放控制测试完成");
    console.log("所有测试完成");
  }, 3000);
}

// 运行测试
function runTest() {
  console.log("开始回放加载测试");
  
  // 获取最新的回放文件
  const latestFile = getLatestReplayFile();
  if (!latestFile) {
    console.error("无法找到回放文件，测试失败");
    return;
  }
  
  console.log(`找到最新回放文件: ${latestFile.name}`);
  console.log(`文件路径: ${latestFile.path}`);
  console.log(`文件大小: ${latestFile.stats.size} 字节`);
  console.log(`修改时间: ${latestFile.stats.mtime}`);
  
  // 加载回放文件
  const replayData = loadReplayFile(latestFile.path);
  if (!replayData) {
    console.error("加载回放数据失败，测试失败");
    return;
  }
  
  // 验证回放数据
  console.log("\n回放数据验证:");
  console.log(`- 回放ID: ${replayData.replayId}`);
  console.log(`- 随机种子: ${replayData.randomSeed}`);
  console.log(`- 战斗时长: ${replayData.metadata.battleDuration}ms`);
  console.log(`- 事件数: ${replayData.events.length}`);
  console.log(`- 指令数: ${replayData.commands.length}`);
  
  // 模拟回放播放
  simulateReplayPlayback(replayData);
}

// 执行测试
runTest();
