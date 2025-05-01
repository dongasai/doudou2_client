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
    this.loadConfigs();
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
   * 加载所有配置
   */
  private loadConfigs(): void {
    try {
      console.log('[INFO] 开始加载配置数据');
      
      // 加载关卡配置
      this.loadLevelsConfig();
      
      // 加载英雄配置
      this.loadHeroesConfig();
      
      // 加载豆豆配置
      this.loadBeansConfig();
      
      console.log('[INFO] 配置数据加载完成');
    } catch (error) {
      console.error('[ERROR] 加载配置数据失败:', error);
    }
  }
  
  /**
   * 加载关卡配置
   */
  private loadLevelsConfig(): void {
    try {
      // 模拟从配置表加载数据
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
          estimatedTime: '5分钟'
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
          estimatedTime: '10分钟'
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
          estimatedTime: '15分钟'
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
          estimatedTime: '15分钟'
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
          estimatedTime: '30分钟'
        }
      ];
      
      console.log('[INFO] 关卡配置加载完成');
    } catch (error) {
      console.error('[ERROR] 加载关卡配置失败:', error);
    }
  }
  
  /**
   * 加载英雄配置
   */
  private loadHeroesConfig(): void {
    try {
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
  private loadBeansConfig(): void {
    try {
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
