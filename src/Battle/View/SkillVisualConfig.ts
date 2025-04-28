/**
 * 技能视觉效果配置
 * 将技能数据与视觉效果映射
 */

import { SkillType, EffectType } from '../Skills/SkillTypes';

/**
 * 技能视觉效果接口
 */
export interface SkillVisualEffect {
  id: string;                 // 效果ID
  name: string;               // 效果名称
  type: SkillType;            // 技能类型
  emoji: string;              // 表情符号
  castEmoji?: string;         // 施法时的表情符号
  hitEmoji?: string;          // 命中时的表情符号
  duration: number;           // 持续时间（毫秒）
  scale?: number;             // 缩放比例
  color?: string;             // 颜色
  travelSpeed?: number;       // 移动速度
  rotationSpeed?: number;     // 旋转速度
  particleEmoji?: string;     // 粒子效果使用的表情符号
  alpha?: number;             // 透明度
  [key: string]: any;         // 其他自定义属性
}

/**
 * 技能UI配置接口
 */
export interface SkillUIConfig {
  id: string;                 // 技能ID
  name: string;               // 技能名称
  description: string;        // 技能描述
  emoji: string;              // 表情符号（用作图标）
  cooldown: number;           // 冷却时间（秒）
  cost: number;               // 消耗
  type: string;               // 类型
  color?: string;             // 颜色
  borderColor?: string;       // 边框颜色
  [key: string]: any;         // 其他自定义属性
}

/**
 * 技能视觉配置接口
 */
export interface SkillVisualConfig {
  id: string;                 // 技能ID
  visualEffect: SkillVisualEffect; // 视觉效果
  uiConfig: SkillUIConfig;    // UI配置
}

/**
 * 技能视觉配置映射
 */
export const skillVisualConfigs: Record<string, SkillVisualConfig> = {
  // 火球术
  'skill_1': {
    id: 'skill_1',
    visualEffect: {
      id: 'fireball_effect',
      name: '火球效果',
      type: SkillType.DAMAGE,
      emoji: '🔥',
      castEmoji: '💥',
      hitEmoji: '💥',
      particleEmoji: '✨',
      duration: 500,
      scale: 1.2,
      color: '#ff0000',
      travelSpeed: 300,
      rotationSpeed: 5,
      alpha: 0.8
    },
    uiConfig: {
      id: 'skill_1',
      name: '火球术',
      description: '向目标发射一个火球，造成魔法伤害',
      emoji: '🔥',
      cooldown: 5,
      cost: 20,
      type: 'damage',
      color: '#ff0000',
      borderColor: '#aa0000'
    }
  },

  // 冰霜新星
  'skill_2': {
    id: 'skill_2',
    visualEffect: {
      id: 'frost_nova_effect',
      name: '冰霜新星效果',
      type: SkillType.DAMAGE,
      emoji: '❄️',
      castEmoji: '❄️',
      hitEmoji: '☃️',
      particleEmoji: '❄️',
      duration: 800,
      scale: 1.5,
      color: '#00ffff',
      alpha: 0.7
    },
    uiConfig: {
      id: 'skill_2',
      name: '冰霜新星',
      description: '释放一道冰霜冲击波，对周围敌人造成伤害并减速',
      emoji: '❄️',
      cooldown: 8,
      cost: 35,
      type: 'aoe',
      color: '#00ffff',
      borderColor: '#0088aa'
    }
  },

  // 治疗术
  'skill_3': {
    id: 'skill_3',
    visualEffect: {
      id: 'heal_effect',
      name: '治疗效果',
      type: SkillType.HEAL,
      emoji: '💚',
      castEmoji: '💚',
      hitEmoji: '💖',
      particleEmoji: '💗',
      duration: 600,
      scale: 1.0,
      color: '#00ff00',
      alpha: 0.9
    },
    uiConfig: {
      id: 'skill_3',
      name: '治疗术',
      description: '治疗目标，恢复生命值',
      emoji: '💚',
      cooldown: 10,
      cost: 40,
      type: 'heal',
      color: '#00ff00',
      borderColor: '#00aa00'
    }
  },

  // 闪电链
  'skill_4': {
    id: 'skill_4',
    visualEffect: {
      id: 'lightning_chain_effect',
      name: '闪电链效果',
      type: SkillType.DAMAGE,
      emoji: '⚡',
      castEmoji: '⚡',
      hitEmoji: '⚡',
      particleEmoji: '✨',
      duration: 700,
      scale: 1.1,
      color: '#ffff00',
      alpha: 1.0
    },
    uiConfig: {
      id: 'skill_4',
      name: '闪电链',
      description: '释放一道闪电，在敌人之间跳跃，造成伤害',
      emoji: '⚡',
      cooldown: 12,
      cost: 50,
      type: 'chain',
      color: '#ffff00',
      borderColor: '#aaaa00'
    }
  }
};

/**
 * 效果类型视觉配置
 */
export const effectTypeVisualConfigs: Record<EffectType, any> = {
  [EffectType.DAMAGE]: {
    color: '#ff0000',
    emoji: '💥',
    particleEmoji: '✨'
  },
  [EffectType.HEAL]: {
    color: '#00ff00',
    emoji: '💚',
    particleEmoji: '💗'
  },
  [EffectType.DOT]: {
    color: '#ff5500',
    emoji: '🔥',
    particleEmoji: '💨'
  },
  [EffectType.HOT]: {
    color: '#55ff00',
    emoji: '💚',
    particleEmoji: '💗'
  },
  [EffectType.BUFF]: {
    color: '#00ffff',
    emoji: '⬆️',
    particleEmoji: '✨'
  },
  [EffectType.DEBUFF]: {
    color: '#ff00ff',
    emoji: '⬇️',
    particleEmoji: '💨'
  },
  [EffectType.CONTROL]: {
    color: '#0000ff',
    emoji: '🔒',
    particleEmoji: '❄️'
  },
  [EffectType.SUMMON]: {
    color: '#ffff00',
    emoji: '🧙',
    particleEmoji: '✨'
  },
  [EffectType.MOVEMENT]: {
    color: '#ffffff',
    emoji: '🏃',
    particleEmoji: '💨'
  },
  [EffectType.SPECIAL]: {
    color: '#ff00ff',
    emoji: '🌟',
    particleEmoji: '✨'
  }
};

/**
 * 获取技能视觉配置
 * @param skillId 技能ID
 * @returns 技能视觉配置
 */
export function getSkillVisualConfig(skillId: string): SkillVisualConfig | undefined {
  return skillVisualConfigs[skillId];
}

/**
 * 获取效果类型视觉配置
 * @param effectType 效果类型
 * @returns 效果类型视觉配置
 */
export function getEffectTypeVisualConfig(effectType: EffectType): any {
  return effectTypeVisualConfigs[effectType];
}
