import { gameState } from '@/main';
import { LevelConfig } from '@/DesignConfig/types/Level';

// 导入关卡数据
import level1_1 from '@/DesignConfig/data/level-1/level-1-1.json';
import level1_2 from '@/DesignConfig/data/level-1/level-1-2.json';
import level1_3 from '@/DesignConfig/data/level-1/level-1-3.json';

// 导入英雄数据
import hero1 from '@/DesignConfig/data/heroes/1.json';
import hero2 from '@/DesignConfig/data/heroes/2.json';

/**
 * 战斗参数服务
 * 负责准备战斗参数
 */
export class BattleParamsService {
  // 关卡数据缓存
  private static levelDataCache: { [key: string]: LevelConfig } = {
    'level-1-1': level1_1 as LevelConfig,
    'level-1-2': level1_2 as LevelConfig,
    'level-1-3': level1_3 as LevelConfig
  };

  // 英雄数据缓存
  private static heroDataCache: { [key: number]: any } = {
    1: hero1,
    2: hero2
  };

  /**
   * 准备战斗参数
   * @returns 战斗初始化参数
   */
  public static prepareBattleParams(): any {
    // 获取选中的关卡ID
    const selectedLevelId = gameState.selectedLevel?.id || 'level-1-1';

    // 从配置表中获取关卡数据
    const level = this.getLevelData(selectedLevelId);
    if (!level) {
      throw new Error(`找不到关卡数据: ${selectedLevelId}`);
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
            learnedSkills: heroData.skills.map((s: any) => s.id)
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
}
