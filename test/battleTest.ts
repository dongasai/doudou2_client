import { BattleManager } from '@/battle/BattleManager';
import { EventManager } from '@/Core/EventManager';

/**
 * 战斗系统测试脚本
 */
const testBattle = async () => {
    // 获取战斗引擎实例
    const battleManager = BattleManager.getInstance();
    const eventManager = EventManager.getInstance();

    // 设置事件监听
    eventManager.on('battle_started', () => {
        console.log('战斗开始');
    });

    eventManager.on('damage_dealt', (data: any) => {
        console.log('造成伤害:', data);
    });

    eventManager.on('hero_died', (heroId: number) => {
        console.log('英雄阵亡:', heroId);
    });

    eventManager.on('bean_defeated', (beanId: number) => {
        console.log('豆豆被击败:', beanId);
    });

    eventManager.on('wave_complete', () => {
        console.log('波次完成');
    });

    eventManager.on('game_over', (data: any) => {
        console.log('游戏结束:', data);
    });

    // 设置测试参数
    const level = 'level-1-1'; // 第1章第1关
    const heroId = 1;    // 1号英雄

    try {
        // 初始化战斗
        await battleManager.initBattle(level, heroId);
        console.log('战斗初始化成功');

        // 开始战斗
        battleManager.startBattle();

        // 5秒后检查战斗状态
        setTimeout(() => {
            const heroes = battleManager.getHeroes();
            const beans = battleManager.getBeans();
            const crystal = battleManager.getCrystal();

            console.log('当前战斗状态:', {
                level: battleManager.getCurrentLevel(),
                heroes,
                beans,
                crystal,
                isPaused: battleManager.isPausedState()
            });

            // 暂停战斗
            battleManager.pauseBattle();
            console.log('战斗已暂停');

            // 2秒后恢复战斗
            setTimeout(() => {
                battleManager.resumeBattle();
                console.log('战斗已恢复');
            }, 2000);
        }, 5000);

    } catch (error) {
        console.error('战斗初始化失败:', error);
    }
};

// 运行测试
console.log('开始测试战斗系统...');
console.log('测试关卡: level-1-1');
console.log('测试英雄: 1号英雄');
testBattle().catch(error => {
    console.error('测试执行失败:', error);
});
