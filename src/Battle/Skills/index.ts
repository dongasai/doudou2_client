/**
 * 技能系统索引文件
 * 导出所有技能相关的模块
 */

// 导出技能管理器
export { SkillManager } from './SkillManager';

// 导出效果管理器
export { EffectManager } from './EffectManager';

// 导出目标选择器
export { TargetSelector } from './TargetSelector';

// 导出类型定义
export {
  SkillType,
  TargetType,
  EffectType,
  SkillConfig,
  Skill,
  SkillCastResult,
  SkillEffect,
  SkillEffectInfo
} from './SkillTypes';
