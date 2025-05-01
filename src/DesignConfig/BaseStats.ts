/**
 * 初始战斗属性接口
 * 描述所有战斗单位共有的基础属性
 */
interface BaseStats {
  /** 生命值(HP) - 决定单位的生存能力 */
  hp: number;
  /** 魔法值(MP) - 决定技能释放能力 */  
  mp: number;
  /** 攻击力(ATK) - 影响普通攻击和技能伤害 */
  attack: number;
  /** 防御力(DEF) - 减少受到的物理伤害 */
  defense: number;
  /** 魔法攻击力(MATK) - 影响魔法技能伤害 */
  magicAttack: number;
  /** 魔法防御力(MDEF) - 减少受到的魔法伤害 */  
  magicDefense: number;
  /** 速度(SPD) - 影响行动顺序和闪避率 */
  speed: number;
}

export type { BaseStats };