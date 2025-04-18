/**
 * 技能系统接口
 * 定义游戏中所有技能的基础属性和效果
 */
interface Skill {
  /** 技能名称 - 显示在游戏中的技能名 */
  name: string;
  /** 技能类型 - 伤害/治疗/控制/增益/减益/召唤/位移/特殊 */
  type: string;
  /** 技能描述 - 详细说明技能效果 */
  description: string;
  /** 冷却时间 - 使用后需要等待的回合数 */
  cooldown: number;
  
  // 以下是可选效果参数
  /** 能量消耗 - 使用技能需要的资源点数 */
  cost?: number;
  /** 基础伤害值 - 技能造成的固定伤害 */
  damage?: number;
  /** 防御增益 - 增加的防御力数值 */
  defense_buff?: number;
  /** 减速效果 - 降低目标速度的百分比(0-100) */
  slow?: number;
  /** 治疗量 - 恢复的生命值数值 */
  heal?: number;
  /** 伤害反弹 - 反弹伤害的百分比(0-100) */
  reflect?: number;
  /** 眩晕回合 - 使目标无法行动的回合数 */
  stun?: number;
  /** 吸血效果 - 造成伤害后恢复生命值的百分比(0-100) */
  lifesteal?: number;
  /** 速度增益 - 增加的速度数值 */
  speed_buff?: number;
  /** 攻击增益 - 增加的攻击力数值 */
  attack_buff?: number;
  /** 召唤数量 - 召唤物生成的数量 */
  summon_count?: number;
  /** 效果持续 - 技能效果的持续回合数 */
  duration?: number;
}

// 导出技能类型
export type { Skill };

/**
 * 技能类型枚举
 */
export type SkillType = 'damage' | 'heal' | 'buff' | 'debuff' | 'control';

/**
 * 目标类型枚举
 */
export type TargetType = 'single' | 'multiple' | 'area' | 'self';

/**
 * 效果类型枚举
 */
export type EffectType = 'dot' | 'hot' | 'buff' | 'debuff' | 'control';

/**
 * 属性类型枚举
 */
export type AttributeType = 'attack' | 'defense' | 'speed' | 'attack_speed' | 'accuracy';

/**
 * 技能效果接口
 */
export interface SkillEffect {
    type: EffectType;
    duration: number;
    attribute?: AttributeType;
    value: number;
}

/**
 * 技能升级接口
 */
export interface SkillUpgrade {
    level: number;
    cost: number;
    damage?: number;
    cooldown?: number;
    range?: number;
}

/**
 * 连锁效果接口
 */
export interface ChainEffect {
    maxTargets: number;
    damageReduction: number;
}

/**
 * 技能配置接口
 */
export interface SkillConfig {
    id: string;
    name: string;
    type: SkillType;
    targetType: TargetType;
    description: string;
    range: number;
    cooldown: number;
    level: number;
    maxLevel: number;
    effects?: Record<string, SkillEffect>;
    upgrades?: SkillUpgrade[];
    chainEffect?: ChainEffect;
}
