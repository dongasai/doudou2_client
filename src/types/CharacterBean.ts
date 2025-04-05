import type { Skill } from './Skill';
import type { BaseStats } from './BaseStats';


/**
 * 角色豆豆基础属性接口
 * 描述游戏中的豆豆角色基本配置
 */
interface CharacterBean {
  /** 唯一ID - 用于标识不同豆豆 */
  id: string | number;
  /** 豆豆名称 - 显示在游戏中的名称 */
  name: string;
  /** 豆豆类型 - 近战/远程/防御/治疗等类型 */
  type: string;
  /** 技能配置 - 包含豆豆的主动/被动技能 */
  skill: Skill;
  /** 基础属性 - 包含生命值/攻击力/防御力等战斗属性 */
  stats: BaseStats;
  /** 移动速度 */
  speed: number;
  /** 当前位置 */
  position: {
    x: number;
    y: number;
  };
}

export type { CharacterBean };