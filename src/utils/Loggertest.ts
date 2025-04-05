
// @ts-ignore
import  { Logger } from './Logger.ts';

// 使用动态导入避免循环依赖
const testLogger = async () => {
    const logger = Logger.getInstance('LoggerTest');

    // 测试控制台输出
    console.log('=== 测试控制台输出 ===');
    logger.debug('调试信息');
    logger.info('普通信息', { data: 123 });
    logger.warn('警告信息');
    logger.error('错误信息', new Error('测试错误'));

    // 测试文件日志
    console.log('\n=== 测试文件日志 ===');
    logger.setFileLogging(true);
    logger.setFilePath('./logs/test.log');
    logger.info('这条信息会写入文件');
    logger.format('格式化日志测试', [
        { key: '状态', value: '运行中' },
        { key: '内存', value: '256MB' }
    ]);

    // 测试日志开关
    console.log('\n=== 测试日志开关 ===');
    logger.setFileLogging(false);
    logger.info('这条信息不会写入文件');
    logger.setFileLogging(true);
    logger.info('这条信息会再次写入文件');

    console.log('\n测试完成，请检查控制台输出和./logs/test.log文件内容');
};

testLogger().catch(console.error);
