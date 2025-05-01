/**
 * 配置管理器
 * 负责加载和管理游戏配置数据
 */
export class ConfigManager {
  // 单例实例
  private static instance: ConfigManager;

  // 配置数据
  private levelsConfig: any[] = [];
  private heroesConfig: any[] = [];
  private beansConfig: any[] = [];

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
      const levelConfigs: any[] = [];
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
            const filePath = `/DesignConfig/data/level-${chapter.id}/${fileName}.json`;
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
      console.log('[INFO] 回退到硬编码的关卡配置...');

      // 回退到硬编码的关卡配置
      this.levelsConfig = [
        {
          id: 1,
          name: '新手村',
          description: '适合初学者的简单关卡，了解游戏基本操作和机制。敌人较弱，资源丰富，是练习的好地方。',
          difficulty: '简单',
          image: 'level_1',
          unlockCondition: '默认解锁',
          rewards: ['100金币', '经验值+50', '初级装备箱'],
          enemies: ['普通豆豆', '小型豆豆'],
          bossName: '豆豆队长',
          mapSize: '小',
          estimatedTime: '5分钟',
          rawConfig: {
            id: "level-1-1",
            name: "第一章-第一关",
            description: "基础难度关卡",
            difficulty: 1.0,
            crystal: { maxHp: 1000 },
            beanRatios: [
              {"type": "暴躁豆", "weight": 3},
              {"type": "毒豆", "weight": 1}
            ],
            totalBeans: 30,
            spawnInterval: 1000,
            attrFactors: {
              hp: 1.0, attack: 1.0, defense: 1.0, speed: 1.0
            },
            victoryCondition: { type: "allDefeated" },
            defeatCondition: { type: "crystalDestroyed" },
            background: "grassland",
            availableHeroSlots: 3
          }
        },
        {
          id: 2,
          name: '森林迷宫',
          description: '茂密的森林中隐藏着各种危险，需要谨慎前进。敌人开始变得更强，并且会使用一些特殊技能。',
          difficulty: '中等',
          image: 'level_2',
          unlockCondition: '完成新手村',
          rewards: ['200金币', '经验值+100', '中级装备箱', '森林之心'],
          enemies: ['普通豆豆', '精英豆豆', '森林豆豆'],
          bossName: '森林守护者',
          mapSize: '中',
          estimatedTime: '10分钟',
          rawConfig: {
            id: "level-1-2",
            name: "第一章-第二关",
            description: "初级难度关卡",
            difficulty: 1.2,
            crystal: { maxHp: 950 },
            beanRatios: [
              {"type": "暴躁豆", "weight": 2},
              {"type": "毒豆", "weight": 1},
              {"type": "闪电豆", "weight": 1}
            ],
            totalBeans: 35,
            spawnInterval: 950,
            attrFactors: {
              hp: 1.1, attack: 1.1, defense: 1.0, speed: 1.0
            },
            victoryCondition: { type: "allDefeated" },
            defeatCondition: { type: "crystalDestroyed" },
            background: "grassland",
            availableHeroSlots: 3
          }
        },
        {
          id: 3,
          name: '火山堡垒',
          description: '炙热的火山环境，地面会造成持续伤害。强大的火系敌人盘踞于此，需要特殊策略才能通过。',
          difficulty: '困难',
          image: 'level_3',
          unlockCondition: '完成森林迷宫',
          rewards: ['500金币', '经验值+200', '高级装备箱', '火焰宝石'],
          enemies: ['火焰豆豆', '熔岩豆豆', '精英火焰豆豆'],
          bossName: '火山之王',
          mapSize: '大',
          estimatedTime: '15分钟',
          rawConfig: {
            id: "level-1-3",
            name: "第一章-第三关",
            description: "进阶难度关卡",
            difficulty: 1.3,
            crystal: { maxHp: 900 },
            beanRatios: [
              {"type": "暴躁豆", "weight": 2},
              {"type": "毒豆", "weight": 1},
              {"type": "闪电豆", "weight": 1},
              {"type": "铁甲豆", "weight": 1}
            ],
            totalBeans: 40,
            spawnInterval: 900,
            attrFactors: {
              hp: 1.15, attack: 1.1, defense: 1.1, speed: 1.0
            },
            victoryCondition: { type: "allDefeated" },
            defeatCondition: { type: "crystalDestroyed" },
            background: "grassland",
            availableHeroSlots: 3
          }
        },
        {
          id: 4,
          name: '冰封峡谷',
          description: '极寒的环境会减缓角色移动速度，冰系敌人能够冻结目标。需要保持移动并合理使用解冻技能。',
          difficulty: '困难',
          image: 'level_4',
          unlockCondition: '完成火山堡垒',
          rewards: ['500金币', '经验值+250', '高级装备箱', '冰霜宝石'],
          enemies: ['冰霜豆豆', '冰晶豆豆', '精英冰霜豆豆'],
          bossName: '冰霜巨人',
          mapSize: '中',
          estimatedTime: '15分钟',
          rawConfig: {
            id: "level-1-4",
            name: "第一章-第四关",
            description: "高级难度关卡",
            difficulty: 1.4,
            crystal: { maxHp: 850 },
            beanRatios: [
              {"type": "暴躁豆", "weight": 1},
              {"type": "毒豆", "weight": 1},
              {"type": "闪电豆", "weight": 2},
              {"type": "铁甲豆", "weight": 2}
            ],
            totalBeans: 45,
            spawnInterval: 850,
            attrFactors: {
              hp: 1.2, attack: 1.15, defense: 1.15, speed: 1.05
            },
            victoryCondition: { type: "allDefeated" },
            defeatCondition: { type: "crystalDestroyed" },
            background: "snowfield",
            availableHeroSlots: 3
          }
        },
        {
          id: 5,
          name: '豆豆王国',
          description: '豆豆们的大本营，这里聚集了各种类型的豆豆精英。最终的挑战，需要充分利用所有已学技能。',
          difficulty: '噩梦',
          image: 'level_5',
          unlockCondition: '完成前四个关卡',
          rewards: ['1000金币', '经验值+500', '传说装备箱', '豆豆王冠'],
          enemies: ['所有类型豆豆', '豆豆精英卫队'],
          bossName: '豆豆国王',
          mapSize: '超大',
          estimatedTime: '30分钟',
          rawConfig: {
            id: "level-1-5",
            name: "第一章-第五关",
            description: "终极挑战关卡",
            difficulty: 1.5,
            crystal: { maxHp: 800 },
            beanRatios: [
              {"type": "暴躁豆", "weight": 1},
              {"type": "毒豆", "weight": 1},
              {"type": "闪电豆", "weight": 1},
              {"type": "铁甲豆", "weight": 1},
              {"type": "精英豆", "weight": 2}
            ],
            totalBeans: 50,
            spawnInterval: 800,
            attrFactors: {
              hp: 1.25, attack: 1.2, defense: 1.2, speed: 1.1
            },
            victoryCondition: { type: "allDefeated" },
            defeatCondition: { type: "crystalDestroyed" },
            background: "castle",
            availableHeroSlots: 3
          }
        }
      ];

      console.log('[INFO] 已回退到硬编码的关卡配置，共加载 ' + this.levelsConfig.length + ' 个关卡');
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
      const heroConfigs: any[] = [];

      // 定义要加载的英雄文件列表
      const heroIds = [1, 2, 3];

      for (const heroId of heroIds) {
        try {
          // 尝试加载英雄配置
          const heroData = await this.loadJsonFileWithXHR(`/DesignConfig/data/heroes/hero-${heroId}.json`);

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

      console.log('[INFO] 未能从配置文件加载英雄配置，使用硬编码数据...');

      // 模拟从配置表加载数据
      this.heroesConfig = [
        {
          id: 1,
          name: '法师',
          description: '强大的魔法使用者，擅长远程攻击和控制技能。虽然生命值较低，但魔法伤害极高。',
          type: '魔法',
          image: 'hero_wizard',
          stats: {
            hp: 800,
            mp: 1000,
            attack: 50,
            defense: 30,
            speed: 40
          },
          skills: [
            {
              name: '火球术',
              description: '向敌人发射一个火球，造成魔法伤害',
              cooldown: 3
            },
            {
              name: '冰霜新星',
              description: '释放冰霜能量，对周围敌人造成伤害并减速',
              cooldown: 8
            },
            {
              name: '魔法护盾',
              description: '创造一个魔法护盾，吸收一定量的伤害',
              cooldown: 15
            }
          ],
          unlockCondition: '默认解锁'
        },
        {
          id: 2,
          name: '战士',
          description: '强壮的近战战斗专家，拥有高生命值和防御力。擅长冲锋陷阵，吸引敌人火力。',
          type: '物理',
          image: 'hero_warrior',
          stats: {
            hp: 1200,
            mp: 500,
            attack: 80,
            defense: 70,
            speed: 30
          },
          skills: [
            {
              name: '旋风斩',
              description: '快速旋转武器，对周围敌人造成物理伤害',
              cooldown: 5
            },
            {
              name: '战吼',
              description: '发出震慑敌人的吼叫，降低周围敌人的攻击力',
              cooldown: 10
            },
            {
              name: '坚韧不屈',
              description: '激活后一段时间内受到的伤害减少',
              cooldown: 20
            }
          ],
          unlockCondition: '完成新手村'
        },
        {
          id: 3,
          name: '弓箭手',
          description: '精通远程攻击的专家，攻击速度快，机动性强。虽然防御较弱，但能够快速消灭敌人。',
          type: '物理',
          image: 'hero_archer',
          stats: {
            hp: 900,
            mp: 600,
            attack: 70,
            defense: 40,
            speed: 80
          },
          skills: [
            {
              name: '快速射击',
              description: '连续射出多支箭，对单个敌人造成高伤害',
              cooldown: 4
            },
            {
              name: '毒箭',
              description: '射出带有毒素的箭，造成持续伤害',
              cooldown: 8
            },
            {
              name: '逃脱',
              description: '快速后退一段距离，摆脱敌人的追击',
              cooldown: 12
            }
          ],
          unlockCondition: '完成森林迷宫'
        }
      ];

      console.log('[INFO] 英雄配置加载完成');
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
      const beanConfigs: any[] = [];

      // 定义要加载的豆豆文件列表
      const beanTypes = ['normal', 'fire', 'ice', 'poison', 'electric', 'armored', 'boss'];

      for (const beanType of beanTypes) {
        try {
          // 尝试加载豆豆配置
          const beanData = await this.loadJsonFileWithXHR(`/DesignConfig/data/beans/bean-${beanType}.json`);

          if (beanData) {
            beanConfigs.push(beanData);
            console.log(`[INFO] 已加载豆豆配置: ${beanData.name}`);
          }
        } catch (error) {
          console.error(`[ERROR] 加载豆豆配置失败 (类型: ${beanType}):`, error);
        }
      }

      // 如果成功加载了豆豆配置，使用它们
      if (beanConfigs.length > 0) {
        this.beansConfig = beanConfigs;
        console.log(`[INFO] 豆豆配置加载完成，共加载 ${beanConfigs.length} 个豆豆配置`);
        return;
      }

      console.log('[INFO] 未能从配置文件加载豆豆配置，使用硬编码数据...');

      // 模拟从配置表加载数据
      this.beansConfig = [
        {
          id: 1,
          name: '普通豆豆',
          description: '最常见的豆豆类型，没有特殊能力，但数量众多。通常成群结队地出现。',
          type: '普通',
          image: 'bean_normal',
          stats: {
            hp: 50,
            attack: 10,
            defense: 5,
            speed: 30
          },
          abilities: ['基础攻击'],
          drops: ['小型能量核心', '豆豆碎片'],
          firstAppearLevel: '新手村'
        },
        {
          id: 2,
          name: '火焰豆豆',
          description: '生活在火山地区的豆豆，能够喷射火焰进行攻击。接触它们会受到灼烧伤害。',
          type: '火系',
          image: 'bean_fire',
          stats: {
            hp: 80,
            attack: 15,
            defense: 8,
            speed: 25
          },
          abilities: ['基础攻击', '火焰喷射', '灼烧光环'],
          drops: ['火焰核心', '豆豆碎片', '火焰精华'],
          firstAppearLevel: '火山堡垒'
        },
        {
          id: 3,
          name: '冰霜豆豆',
          description: '栖息在寒冷地区的豆豆，能够释放冰霜魔法。它们的攻击会减缓目标移动速度。',
          type: '冰系',
          image: 'bean_ice',
          stats: {
            hp: 70,
            attack: 12,
            defense: 10,
            speed: 20
          },
          abilities: ['基础攻击', '冰霜射线', '冻结光环'],
          drops: ['冰霜核心', '豆豆碎片', '冰霜精华'],
          firstAppearLevel: '冰封峡谷'
        },
        {
          id: 4,
          name: '毒素豆豆',
          description: '生活在沼泽地区的豆豆，能够释放毒素。它们的攻击会造成持续伤害。',
          type: '毒系',
          image: 'bean_poison',
          stats: {
            hp: 60,
            attack: 8,
            defense: 7,
            speed: 35
          },
          abilities: ['基础攻击', '毒素喷射', '毒雾'],
          drops: ['毒素核心', '豆豆碎片', '毒素精华'],
          firstAppearLevel: '森林迷宫'
        }
      ];

      console.log('[INFO] 豆豆配置加载完成');
    } catch (error) {
      console.error('[ERROR] 加载豆豆配置失败:', error);
    }
  }

  /**
   * 获取所有关卡配置
   */
  public getLevelsConfig(): any[] {
    return this.levelsConfig;
  }

  /**
   * 获取所有英雄配置
   */
  public getHeroesConfig(): any[] {
    return this.heroesConfig;
  }

  /**
   * 获取所有豆豆配置
   */
  public getBeansConfig(): any[] {
    return this.beansConfig;
  }

  /**
   * 根据ID获取关卡配置
   * @param id 关卡ID
   */
  public getLevelConfigById(id: number): any {
    return this.levelsConfig.find(level => level.id === id);
  }

  /**
   * 根据ID获取英雄配置
   * @param id 英雄ID
   */
  public getHeroConfigById(id: number): any {
    return this.heroesConfig.find(hero => hero.id === id);
  }

  /**
   * 根据ID获取豆豆配置
   * @param id 豆豆ID
   */
  public getBeanConfigById(id: number): any {
    return this.beansConfig.find(bean => bean.id === id);
  }
}
