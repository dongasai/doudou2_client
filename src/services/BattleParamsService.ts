import { gameState } from '@/main';
import { LevelConfig } from '@/DesignConfig/types/Level';

/**
 * 战斗参数服务
 * 负责准备战斗参数
 */
export class BattleParamsService {
  // 关卡数据缓存
  private static levelDataCache: { [key: string]: LevelConfig } = {};

  // 英雄数据缓存
  private static heroDataCache: { [key: number]: any } = {};

  // 是否已初始化
  private static initialized = false;

  /**
   * 初始化服务
   */
  private static async initialize() {
    if (this.initialized) return;

    try {
      // 使用硬编码的方式初始化数据
      // 这是一个临时解决方案，理想情况下应该从配置文件中加载数据

      // 初始化关卡数据
      this.levelDataCache['level-1-1'] = {
        id: 'level-1-1',
        name: '第一章-第一关',
        description: '基础难度关卡',
        difficulty: 1.0,
        crystal: {
          position: { x: 400, y: 300 },
          maxHp: 1000
        },
        beanRatios: [
          { type: '暴躁豆', weight: 3 },
          { type: '毒豆', weight: 1 }
        ],
        totalBeans: 30,
        spawnInterval: 1000,
        attrFactors: {
          hp: 1.0,
          attack: 1.0,
          defense: 1.0,
          speed: 1.0
        },
        victoryCondition: {
          type: 'allDefeated'
        },
        defeatCondition: {
          type: 'crystalDestroyed'
        },
        background: 'grassland',
        availableHeroSlots: 3
      };

      // 初始化英雄数据
      this.heroDataCache[1] = {
        id: 1,
        name: '烈焰法师',
        emoji: '🔥',
        type: 'mage',
        skills: [
          {
            id: 'fireball',
            cooldown: 3000,
            cost: 40,
            range: 400,
            baseDamage: 100,
            burnDamage: 20,
            burnDuration: 3000
          },
          {
            id: 'flame_storm',
            cooldown: 8000,
            cost: 80,
            range: 350,
            baseDamage: 80,
            duration: 5000
          }
        ],
        stats: {
          hp: 800,
          mp: 200,
          attack: 50,
          defense: 40,
          magicAttack: 120,
          magicDefense: 60,
          speed: 50
        }
      };

      this.initialized = true;
      console.log('BattleParamsService 初始化完成');
    } catch (error) {
      console.error('BattleParamsService 初始化失败:', error);
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

      return {
        id: `player${index + 1}`,
        name: `玩家${index + 1}`,
        hero: {
          id: heroId,
          stats: {
            hp: heroData.stats.hp,
            mp: heroData.stats.mp || 100,
            attack: heroData.stats.attack,
            defense: heroData.stats.defense,
            magicAttack: heroData.stats.magicAttack || 0,
            magicDefense: heroData.stats.magicDefense || 0,
            speed: heroData.stats.speed || 50,
            level: 1,
            exp: 0,
            gold: 0,
            equippedItems: [],
            learnedSkills: heroData.skills.map((s: any) => s.id || 'fireball')
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
    // 从缓存中获取关卡数据
    return this.levelDataCache[levelId] || null;
  }

  /**
   * 获取英雄数据
   * @param heroId 英雄ID
   * @returns 英雄数据
   */
  public static getHeroData(heroId: number): any {
    // 从缓存中获取英雄数据
    return this.heroDataCache[heroId] || null;
  }

  /**
   * 获取默认战斗参数
   * @param levelId 关卡ID
   * @returns 默认战斗参数
   */
  private static getDefaultBattleParams(levelId: string): any {
    // 解析关卡ID，获取章节和关卡编号
    const parts = levelId.split('-');
    const chapter = parseInt(parts[1]) || 1;
    const stage = parseInt(parts[2]) || 1;

    // 创建默认关卡数据
    const defaultLevel = {
      id: levelId,
      name: `第${chapter}章-第${stage}关`,
      description: '基础难度关卡',
      difficulty: 1.0,
      crystal: {
        maxHp: 1000
      },
      beanRatios: [
        { type: '暴躁豆', weight: 3 },
        { type: '毒豆', weight: 1 }
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

    // 创建默认英雄数据
    const defaultHero = {
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

    // 创建玩家数组
    const players = gameState.selectedHeroes.map((heroId, index) => {
      return {
        id: `player${index + 1}`,
        name: `玩家${index + 1}`,
        hero: {
          id: heroId,
          stats: {
            hp: defaultHero.stats.hp,
            mp: defaultHero.stats.mp,
            attack: defaultHero.stats.attack,
            defense: defaultHero.stats.defense,
            magicAttack: defaultHero.stats.magicAttack,
            magicDefense: defaultHero.stats.magicDefense,
            speed: defaultHero.stats.speed,
            level: 1,
            exp: 0,
            gold: 0,
            equippedItems: [],
            learnedSkills: defaultHero.skills.map(s => s.id)
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
          hp: defaultLevel.crystal.maxHp,
          mp: 0,
          attack: 0,
          defense: 100,
          magicAttack: 0,
          magicDefense: 100,
          speed: 0,
          currentHP: defaultLevel.crystal.maxHp,
          maxHP: defaultLevel.crystal.maxHp
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
