import { LevelConfig } from '@/DesignConfig/Level';
import { Hero } from '@/DesignConfig/GameHero';
import { CharacterBean } from '@/DesignConfig/CharacterBean';
import { Chapter } from '@/DesignConfig/Chapter';
import {Bean} from "@/DesignConfig/GameBean";



/**
 * 配置管理器
 * 负责加载和管理游戏配置数据
 */
export class ConfigManager {
  // 单例实例
  private static instance: ConfigManager;

  // 配置数据
  private chaptersConfig: Chapter[] = [];
  private levelsConfig: LevelConfig[] = [];
  private heroesConfig: Hero[] = [];
  private beansConfig: Bean[] = [];

  /**
   * 私有构造函数，防止外部直接创建实例
   */
  private constructor() {
    // 初始化配置
    console.log('[INFO] ConfigManager 构造函数被调用');
    this.initConfigs().catch(error => {
      console.error('[ERROR] 配置初始化失败:', error);
    });
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

      // 先加载章节配置
      await this.loadChaptersConfig();

      // 并行加载其他配置
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
   * 加载章节配置
   */
  private async loadChaptersConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载章节配置...');

      // 加载章节配置文件
      const chaptersData = await this.loadJsonFileWithXHR('/DesignConfig/chapters.json');

      if (chaptersData && Array.isArray(chaptersData)) {
        this.chaptersConfig = chaptersData;
        console.log(`[INFO] 章节配置加载完成，共加载 ${chaptersData.length} 个章节配置`);
      } else {
        console.error('[ERROR] 章节配置格式不正确，应为数组');
        throw new Error('章节配置格式不正确');
      }
    } catch (error) {
      console.error('[ERROR] 加载章节配置失败:', error);
      throw new Error('未能从配置文件加载章节配置');
    }
  }

  /**
   * 加载关卡配置
   */
  private async loadLevelsConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载关卡配置...');

      // 使用动态方式加载关卡配置文件
      const levelConfigs: LevelConfig[] = [];

      // 检查章节配置是否已加载
      if (this.chaptersConfig.length === 0) {
        throw new Error('章节配置未加载，无法加载关卡配置');
      }

      // 遍历所有章节和关卡
      for (const chapter of this.chaptersConfig) {
        for (const level of chapter.levels) {
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

            console.log(`[INFO] 解析关卡ID: ${levelData.id}`);

            // 直接使用从文件加载的数据
            const levelConfig: LevelConfig = levelData;

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

      // 按ID排序（字符串比较）
      levelConfigs.sort((a, b) => a.id.localeCompare(b.id));

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
   * 加载英雄配置
   */
  private async loadHeroesConfig(): Promise<void> {
    try {
      console.log('[INFO] 开始加载英雄配置...');

      // 尝试从配置文件加载英雄数据
      const heroConfigs: Hero[] = [];

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

        if (beansData && beansData.beans && Array.isArray(beansData.beans)) {
          this.beansConfig = beansData.beans;
          console.log(`[INFO] 豆豆配置加载完成，共加载 ${beansData.beans.length} 个豆豆配置`);
          return;
        } else {
          console.error(`[ERROR] 豆豆配置格式不正确，应包含beans数组`);
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
   * 获取所有章节配置
   */
  public getChaptersConfig(): Chapter[] {
    return this.chaptersConfig;
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
  public getHeroesConfig(): Hero[] {
    return this.heroesConfig;
  }

  /**
   * 获取所有豆豆配置
   */
  public getBeansConfig(): CharacterBean[] {
    return this.beansConfig;
  }

  /**
   * 根据ID获取章节配置
   * @param id 章节ID
   */
  public getChapterConfigById(id: number): Chapter | undefined {
    return this.chaptersConfig.find(chapter => chapter.id === id);
  }

  /**
   * 根据ID获取关卡配置
   * @param id 关卡ID
   */
  public getLevelConfigById(id: string): LevelConfig | undefined {
    return this.levelsConfig.find(level => level.id === id);
  }

  /**
   * 根据ID获取英雄配置
   * @param id 英雄ID
   */
  public getHeroConfigById(id: number): Hero | undefined {
    return this.heroesConfig.find(hero => hero.id === id);
  }

  /**
   * 根据ID获取豆豆配置
   * @param id 豆豆ID
   */
  public getBeanConfigById(id: number): Bean  {
    let  b= this.beansConfig.find(bean => bean.id === id);
    if(b){
      return b;
    }
    throw new Error('[getBeanConfigById] <id> not found');

  }
}
