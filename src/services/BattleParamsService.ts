import { gameState } from '@/main';
import { LevelConfig } from '@/DesignConfig/Level';
import { Hero } from '@/DesignConfig/GameHero';
import { ConfigManager } from '@/Managers/ConfigManager';

/**
 * 战斗参数服务
 * 负责准备战斗参数
 */
export class BattleParamsService {
  // 配置管理器实例
  private static configManager: ConfigManager;

  // 是否已初始化
  private static initialized = false;

  /**
   * 初始化服务
   */
  private static async initialize() {
    if (this.initialized) return;

    try {
      console.log('[INFO] 开始初始化 BattleParamsService...');

      // 获取配置管理器实例
      this.configManager = ConfigManager.getInstance();

      // 确保配置管理器已加载数据
      // 由于ConfigManager在构造函数中已经开始异步加载数据，
      // 这里我们等待一小段时间，确保数据已加载完成
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 检查配置数据是否已加载
      const levels = this.configManager.getLevelsConfig();
      const heroes = this.configManager.getHeroesConfig();

      if (!levels || levels.length === 0) {
        console.warn('[WARN] 关卡配置数据未加载');
      } else {
        console.log(`[INFO] 已加载 ${levels.length} 个关卡配置`);
      }

      if (!heroes || heroes.length === 0) {
        console.warn('[WARN] 英雄配置数据未加载');
      } else {
        console.log(`[INFO] 已加载 ${heroes.length} 个英雄配置`);
      }

      this.initialized = true;
      console.log('[INFO] BattleParamsService 初始化完成');
    } catch (error) {
      console.error('[ERROR] BattleParamsService 初始化失败:', error);
    }
  }

  /**
   * 准备战斗参数
   * @returns 战斗初始化参数
   */
  public static async prepareBattleParams(): Promise<any> {
    // 确保服务已初始化
    await this.initialize();

    // 获取选中的关卡ID
    const selectedLevelId = gameState.selectedLevel?.id || 'level-1-1';

    // 从配置表中获取关卡数据
    const level = this.getLevelData(selectedLevelId);
    if (!level) {
      // 如果找不到关卡数据，使用默认数据
      console.warn(`找不到关卡数据: ${selectedLevelId}，使用默认数据`);
      return this.getDefaultBattleParams(selectedLevelId);
    }

    // 创建玩家数组
    const players = gameState.selectedHeroes.map((heroId, index) => {
      // 从配置表中获取英雄数据
      const heroData = this.getHeroData(heroId);
      if (!heroData) {
        throw new Error(`找不到英雄数据: ${heroId}`);
      }

      // 确保英雄数据中有stats属性
      const stats = heroData.stats || {} as any;

      return {
        id: `player${index + 1}`,
        name: `玩家${index + 1}`,
        hero: {
          id: heroId,
          stats: {
            hp: stats.hp || 800,
            mp: 100, // 默认值
            attack: stats.attack || 50,
            defense: stats.defense || 40,
            magicAttack: 0, // 默认值
            magicDefense: 0, // 默认值
            speed: stats.speed || 50,
            level: 1,
            exp: 0,
            gold: 0,
            equippedItems: [],
            learnedSkills: (heroData.skills || []).map((s: any) => s.id || 'fireball')
          },
          position: index + 1 // 位置从1开始
        }
      };
    });

    // 创建战斗参数
    return {
      crystal: {
        id: 1,
        name: '水晶',
        stats: {
          hp: level.crystal.maxHp,
          mp: 0,
          attack: 0,
          defense: 100,
          magicAttack: 0,
          magicDefense: 100,
          speed: 0,
          currentHP: level.crystal.maxHp,
          maxHP: level.crystal.maxHp
        },
        status: 'normal',
        positionIndex: 0,
        defenseBonus: 0
      },
      players: players,
      level: {
        chapter: parseInt(level.id.split('-')[1]) || 1,
        stage: parseInt(level.id.split('-')[2]) || 1
      }
    };
  }

  /**
   * 获取关卡数据
   * @param levelId 关卡ID
   * @returns 关卡数据
   */
  public static getLevelData(levelId: string): LevelConfig | null {
    // 确保服务已初始化
    if (!this.initialized || !this.configManager) {
      console.warn('[WARN] BattleParamsService 未初始化，无法获取关卡数据');
      return null;
    }

    // 从配置管理器获取关卡数据
    return this.configManager.getLevelConfigById(levelId) || null;
  }

  /**
   * 获取英雄数据
   * @param heroId 英雄ID
   * @returns 英雄数据
   */
  public static getHeroData(heroId: number): Hero | null {
    // 确保服务已初始化
    if (!this.initialized || !this.configManager) {
      console.warn('[WARN] BattleParamsService 未初始化，无法获取英雄数据');
      return null;
    }

    // 从配置管理器获取英雄数据
    return this.configManager.getHeroConfigById(heroId) || null;
  }

  /**
   * 获取默认战斗参数
   * @param levelId 关卡ID
   * @returns 默认战斗参数
   */
  private static getDefaultBattleParams(levelId: string): any {
    console.log(`[INFO] 使用默认战斗参数，关卡ID: ${levelId}`);

    // 解析关卡ID，获取章节和关卡编号
    const parts = levelId.split('-');
    const chapter = parseInt(parts[1]) || 1;
    const stage = parseInt(parts[2]) || 1;

    // 尝试从配置管理器获取第一个关卡和英雄作为默认值
    let defaultLevel = null;
    let defaultHero = null;

    if (this.configManager) {
      // 获取所有关卡，选择第一个作为默认值
      const levels = this.configManager.getLevelsConfig();
      if (levels && levels.length > 0) {
        defaultLevel = levels[0];
        console.log(`[INFO] 使用配置中的第一个关卡作为默认值: ${defaultLevel.name}`);
      }

      // 获取所有英雄，选择第一个作为默认值
      const heroes = this.configManager.getHeroesConfig();
      if (heroes && heroes.length > 0) {
        defaultHero = heroes[0];
        console.log(`[INFO] 使用配置中的第一个英雄作为默认值: ${defaultHero.name}`);
      }
    }

    // 如果无法从配置管理器获取，使用硬编码的默认值
    if (!defaultLevel) {
      defaultLevel = {
        id: levelId,
        name: `第${chapter}章-第${stage}关`,
        description: '基础难度关卡',
        difficulty: 1.0,
        crystal: {
          position: { x: 1500, y: 1500 },
          maxHp: 1000
        },
        beanRatios: [
          { type: 1, weight: 3 },
          { type: 2, weight: 1 }
        ],
        totalBeans: 30,
        spawnInterval: 1000,
        attrFactors: {
          hp: 1.0,
          attack: 1.0,
          defense: 1.0,
          speed: 1.0
        }
      };
      console.log('[INFO] 使用硬编码的默认关卡数据');
    }

    if (!defaultHero) {
      defaultHero = {
        id: 1,
        name: '烈焰法师',
        stats: {
          hp: 800,
          mp: 200,
          attack: 50,
          defense: 40,
          magicAttack: 120,
          magicDefense: 60,
          speed: 50
        },
        skills: [
          { id: 'fireball', name: '火球术' },
          { id: 'flame_storm', name: '烈焰风暴' }
        ]
      };
      console.log('[INFO] 使用硬编码的默认英雄数据');
    }

    // 创建玩家数组
    const players = gameState.selectedHeroes.map((heroId, index) => {
      // 尝试从配置管理器获取英雄数据
      let heroData = null;
      if (this.configManager) {
        heroData = this.configManager.getHeroConfigById(heroId);
      }

      // 如果找不到，使用默认英雄数据
      if (!heroData) {
        heroData = defaultHero;
      }

      // 确保英雄数据中有stats属性
      const stats = (heroData.stats || {}) as any;

      return {
        id: `player${index + 1}`,
        name: `玩家${index + 1}`,
        hero: {
          id: heroId,
          stats: {
            hp: stats.hp || 800,
            mp: 100, // 默认值
            attack: stats.attack || 50,
            defense: stats.defense || 40,
            magicAttack: 0, // 默认值
            magicDefense: 0, // 默认值
            speed: stats.speed || 50,
            level: 1,
            exp: 0,
            gold: 0,
            equippedItems: [],
            learnedSkills: (heroData.skills || []).map((s: any) => s.id || 'fireball')
          },
          position: index + 1 // 位置从1开始
        }
      };
    });

    // 获取水晶最大生命值
    const crystalMaxHp = defaultLevel.crystal && defaultLevel.crystal.maxHp ?
      defaultLevel.crystal.maxHp : 1000;

    // 创建战斗参数
    return {
      crystal: {
        id: 1,
        name: '水晶',
        stats: {
          hp: crystalMaxHp,
          mp: 0,
          attack: 0,
          defense: 100,
          magicAttack: 0,
          magicDefense: 100,
          speed: 0,
          currentHP: crystalMaxHp,
          maxHP: crystalMaxHp
        },
        status: 'normal',
        positionIndex: 0,
        defenseBonus: 0
      },
      players: players,
      level: {
        chapter: chapter,
        stage: stage
      }
    };
  }
}
