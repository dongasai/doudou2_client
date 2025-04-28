import Phaser from 'phaser';
import { BattleScene } from '@/scenes/BattleScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { LevelSelectScene } from '@/scenes/LevelSelectScene';
import { HeroSelectScene } from '@/scenes/HeroSelectScene';

/**
 * 游戏配置
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 430,
  height: 930,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    MainMenuScene,
    LevelSelectScene,
    HeroSelectScene,
    BattleScene
  ]
};

/**
 * 游戏实例
 */
export const game = new Phaser.Game(config);

// 添加调试日志
console.log('游戏实例创建成功:', game);

// 将游戏实例添加到全局窗口对象中，便于调试
(window as any).gameInstance = game;

/**
 * 游戏全局状态
 */
export const gameState = {
  // 玩家数据
  player: {
    id: 'player1',
    name: '玩家1',
    unlockedHeroes: [1, 2, 3], // 已解锁的英雄ID
    unlockedLevels: ['level-1-1', 'level-1-2', 'level-1-3'], // 已解锁的关卡ID
    gold: 1000, // 金币
    gems: 50 // 宝石
  },

  // 当前选择的关卡
  selectedLevel: null as any,

  // 当前选择的英雄
  selectedHeroes: [] as number[],

  // 游戏设置
  settings: {
    soundVolume: 0.7,
    musicVolume: 0.5,
    vibration: true,
    autoSkill: false
  },

  // 保存游戏状态到本地存储
  saveState() {
    try {
      localStorage.setItem('doudou_game_state', JSON.stringify({
        player: this.player,
        settings: this.settings
      }));
      console.log('游戏状态已保存');
    } catch (error) {
      console.error('保存游戏状态失败:', error);
    }
  },

  // 从本地存储加载游戏状态
  loadState() {
    try {
      const savedState = localStorage.getItem('doudou_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.player = parsedState.player || this.player;
        this.settings = parsedState.settings || this.settings;
        console.log('游戏状态已加载');
      }
    } catch (error) {
      console.error('加载游戏状态失败:', error);
    }
  },

  // 重置游戏状态
  resetState() {
    this.selectedLevel = null;
    this.selectedHeroes = [];
  }
};

// 初始化时加载游戏状态
window.addEventListener('DOMContentLoaded', () => {
  gameState.loadState();
});
