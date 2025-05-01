import { LevelConfig as DesignLevelConfig } from '@/DesignConfig/Level';
import { Hero } from '@/DesignConfig/GameHero';
import { CharacterBean } from '@/DesignConfig/CharacterBean';

/**
 * 关卡配置接口
 * 用于UI显示的扩展配置
 */
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  image: string;
  unlockCondition: string;
  rewards: string[];
  enemies: string[];
  bossName: string;
  mapSize: string;
  estimatedTime: string;
  rawConfig: DesignLevelConfig;
}

/**
 * 英雄配置接口
 * 用于UI显示的扩展配置
 */
export interface HeroConfig extends Hero {
  image: string;
  unlockCondition: string;
}

/**
 * 豆豆配置接口
 * 用于UI显示的扩展配置
 */
export interface BeanConfig extends CharacterBean {
  abilities: string[];
  drops: string[];
  firstAppearLevel: string;
}

/**
 * 配置管理器
 * 负责加载和管理游戏配置数据
 */
export class ConfigManager {
  // 单例实例
  private static instance: ConfigManager;

  // 配置数据
  private levelsConfig: LevelConfig[] = [];
  private heroesConfig: HeroConfig[] = [];
  private beansConfig: BeanConfig[] = [];

  /**
   * 私有构造函数，防止外部直接创建实例
   */
  private constructor() {
    // 初始化配置
    this.initConfigs();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 初始化配置
   * 注意：所有配置加载方法都是异步的
   */
  private async initConfigs(): Promise<void> {
    try {
      console.log('[INFO] 开始初始化配置数据');

      // 并行加载所有配置
      await Promise.all([
        this.loadLevelsConfig(),
        this.loadHeroesConfig(),
        this.loadBeansConfig()
      ]);

      console.log('[INFO] 配置数据初始化完成');
    } catch (error) {
      console.error('[ERROR] 初始化配置数据失败:', error);
    }
  }

  // loadConfigs方法已被initConfigs替代

  /**
   * 加载关卡配置
   */
  private async loadLevelsConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载关卡配置...');

      // 使用动态方式加载关卡配置文件
      const levelConfigs: LevelConfig[] = [];
      let idCounter = 1;

      // 定义要加载的关卡章节和数量
      const chapters = [
        { id: 1, levels: 5 } // 第一章有5个关卡
      ];

      // 遍历所有章节和关卡
      for (const chapter of chapters) {
        for (let level = 1; level <= chapter.levels; level++) {
          try {
            // 构建文件路径
            const fileName = `level-${chapter.id}-${level}`;
            const filePath = `/DesignConfig/level-${chapter.id}/${fileName}.json`;
            console.log(`[INFO] 正在加载关卡配置: ${fileName}`);

            // 使用XMLHttpRequest加载JSON文件
            const levelData = await this.loadJsonFileWithXHR(filePath);

            if (!levelData) {
              console.error(`[ERROR] 无法加载关卡配置: ${fileName}`);
              continue;
            }

            // 检查必要的字段
            if (!levelData.id || !levelData.name) {
              console.error(`[ERROR] 关卡配置缺少必要字段: ${fileName}`, levelData);
              continue;
            }

            console.log(`[INFO] 解析关卡ID: 第${chapter.id}章-第${level}关`);

            // 创建UI友好的关卡配置
            const levelConfig = {
              id: idCounter++,
              name: levelData.name || `第${chapter.id}章-第${level}关`,
              description: levelData.description || '关卡描述未提供',
              difficulty: this.getDifficultyText(levelData.difficulty || 1.0),
              image: `level_${level}`,
              unlockCondition: level === 1 ? '默认解锁' : `完成第${level-1}关`,
              rewards: this.getRewardsByLevel(level),
              enemies: this.getBeanTypesFromRatios(levelData.beanRatios || []),
              bossName: this.getBossNameByLevel(level),
              mapSize: this.getMapSizeFromBeanCount(levelData.totalBeans || 30),
              estimatedTime: this.getEstimatedTimeFromBeanCount(levelData.totalBeans || 30),
              rawConfig: levelData
            };

            levelConfigs.push(levelConfig);
            console.log(`[INFO] 已加载关卡配置: ${levelConfig.name}`);
          } catch (error) {
            console.error(`[ERROR] 加载关卡配置失败 (第${chapter.id}章-第${level}关):`, error);
          }
        }
      }

      console.log(`[INFO] 关卡配置加载完成，成功加载 ${levelConfigs.length} 个关卡配置`);

      if (levelConfigs.length === 0) {
        throw new Error('未能成功加载任何关卡配置');
      }

      // 按ID排序
      levelConfigs.sort((a, b) => a.id - b.id);

      // 设置关卡配置
      this.levelsConfig = levelConfigs;

      console.log('[INFO] 关卡配置加载完成，共加载 ' + this.levelsConfig.length + ' 个关卡');
    } catch (error) {
      console.error('[ERROR] 加载关卡配置失败:', error);
      throw new Error('未能从配置文件加载关卡配置');
    }
  }

  /**
   * 使用XMLHttpRequest加载JSON文件
   * @param filePath JSON文件路径
   * @returns JSON数据
   */
  private loadJsonFileWithXHR(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`[INFO] 尝试使用XMLHttpRequest加载JSON文件: ${filePath}`);

      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', filePath, true);

      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const jsonData = JSON.parse(xhr.responseText);
            console.log(`[INFO] JSON文件加载成功: ${filePath}`);
            resolve(jsonData);
          } catch (parseError) {
            console.error(`[ERROR] 解析JSON文件失败 ${filePath}:`, parseError);
            console.error(`[ERROR] 文件内容: ${xhr.responseText.substring(0, 100)}...`);
            reject(parseError);
          }
        } else {
          const error = new Error(`HTTP错误: ${xhr.status}`);
          console.error(`[ERROR] 加载JSON文件失败 ${filePath}:`, error);
          reject(error);
        }
      };

      xhr.onerror = function() {
        const error = new Error('网络错误');
        console.error(`[ERROR] 加载JSON文件失败 ${filePath}:`, error);
        reject(error);
      };

      xhr.send();
    });
  }

  /**
   * 根据难度系数获取难度文本
   * @param difficulty 难度系数
   * @returns 难度文本
   */
  private getDifficultyText(difficulty: number): string {
    if (difficulty < 1.1) return '简单';
    if (difficulty < 1.3) return '中等';
    if (difficulty < 1.5) return '困难';
    return '噩梦';
  }

  /**
   * 根据豆豆比例获取豆豆类型列表
   * @param beanRatios 豆豆比例配置
   * @returns 豆豆类型列表
   */
  private getBeanTypesFromRatios(beanRatios: {type: string, weight: number}[]): string[] {
    return beanRatios.map(ratio => ratio.type);
  }

  /**
   * 根据豆豆数量获取地图大小描述
   * @param beanCount 豆豆数量
   * @returns 地图大小描述
   */
  private getMapSizeFromBeanCount(beanCount: number): string {
    if (beanCount < 30) return '小';
    if (beanCount < 40) return '中';
    if (beanCount < 50) return '大';
    return '超大';
  }

  /**
   * 根据豆豆数量估计关卡时间
   * @param beanCount 豆豆数量
   * @returns 估计时间描述
   */
  private getEstimatedTimeFromBeanCount(beanCount: number): string {
    const minutes = Math.ceil(beanCount / 6);
    return `${minutes}分钟`;
  }

  /**
   * 根据关卡等级获取奖励
   * @param level 关卡等级
   * @returns 奖励列表
   */
  private getRewardsByLevel(level: number): string[] {
    switch (level) {
      case 1:
        return ['100金币', '经验值+50', '初级装备箱'];
      case 2:
        return ['200金币', '经验值+100', '中级装备箱', '森林之心'];
      case 3:
        return ['300金币', '经验值+150', '高级装备箱', '火焰宝石'];
      case 4:
        return ['400金币', '经验值+200', '高级装备箱', '冰霜宝石'];
      case 5:
        return ['500金币', '经验值+250', '传说装备箱', '豆豆王冠'];
      default:
        return [`${level * 100}金币`, `经验值+${level * 50}`, '装备箱'];
    }
  }

  /**
   * 根据关卡等级获取BOSS名称
   * @param level 关卡等级
   * @returns BOSS名称
   */
  private getBossNameByLevel(level: number): string {
    switch (level) {
      case 1:
        return '豆豆队长';
      case 2:
        return '森林守护者';
      case 3:
        return '火山之王';
      case 4:
        return '冰霜巨人';
      case 5:
        return '豆豆国王';
      default:
        return `第${level}关BOSS`;
    }
  }

  /**
   * 加载英雄配置
   */
  private async loadHeroesConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载英雄配置...');

      // 尝试从配置文件加载英雄数据
      const heroConfigs: HeroConfig[] = [];

      // 定义要加载的英雄文件列表
      const heroIds = [1, 2, 3];

      for (const heroId of heroIds) {
        try {
          // 尝试加载英雄配置
          const heroData = await this.loadJsonFileWithXHR(`/DesignConfig/heroes/${heroId}.json`);

          if (heroData) {
            heroConfigs.push(heroData);
            console.log(`[INFO] 已加载英雄配置: ${heroData.name}`);
          }
        } catch (error) {
          console.error(`[ERROR] 加载英雄配置失败 (ID: ${heroId}):`, error);
        }
      }

      // 如果成功加载了英雄配置，使用它们
      if (heroConfigs.length > 0) {
        this.heroesConfig = heroConfigs;
        console.log(`[INFO] 英雄配置加载完成，共加载 ${heroConfigs.length} 个英雄配置`);
        return;
      }

      console.log('[ERROR] 未能从配置文件加载英雄配置');
      throw new Error('未能从配置文件加载英雄配置');
    } catch (error) {
      console.error('[ERROR] 加载英雄配置失败:', error);
    }
  }

  /**
   * 加载豆豆配置
   */
  private async loadBeansConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载豆豆配置...');

      // 尝试从配置文件加载豆豆数据
      try {
        // 尝试加载豆豆配置（单一文件）
        const beansData = await this.loadJsonFileWithXHR(`/DesignConfig/beans.json`);

        if (beansData && Array.isArray(beansData)) {
          this.beansConfig = beansData;
          console.log(`[INFO] 豆豆配置加载完成，共加载 ${beansData.length} 个豆豆配置`);
          return;
        } else {
          console.error(`[ERROR] 豆豆配置格式不正确，应为数组`);
        }
      } catch (error) {
        console.error(`[ERROR] 加载豆豆配置失败:`, error);
      }

      console.log('[ERROR] 未能从配置文件加载豆豆配置');
      throw new Error('未能从配置文件加载豆豆配置');
    } catch (error) {
      console.error('[ERROR] 加载豆豆配置失败:', error);
    }
  }

  /**
   * 获取所有关卡配置
   */
  public getLevelsConfig(): LevelConfig[] {
    return this.levelsConfig;
  }

  /**
   * 获取所有英雄配置
   */
  public getHeroesConfig(): HeroConfig[] {
    return this.heroesConfig;
  }

  /**
   * 获取所有豆豆配置
   */
  public getBeansConfig(): BeanConfig[] {
    return this.beansConfig;
  }

  /**
   * 根据ID获取关卡配置
   * @param id 关卡ID
   */
  public getLevelConfigById(id: number): LevelConfig | undefined {
    return this.levelsConfig.find(level => level.id === id);
  }

  /**
   * 根据ID获取英雄配置
   * @param id 英雄ID
   */
  public getHeroConfigById(id: number): HeroConfig | undefined {
    return this.heroesConfig.find(hero => hero.id === id);
  }

  /**
   * 根据ID获取豆豆配置
   * @param id 豆豆ID
   */
  public getBeanConfigById(id: number): BeanConfig | undefined {
    return this.beansConfig.find(bean => bean.id === id);
  }
}
