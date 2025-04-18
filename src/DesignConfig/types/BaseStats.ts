
/**
 * 初始战斗属性接口
 * 描述所有战斗单位共有的基础属性
 */
interface BaseStats {
  /** 生命值(HP) - 决定单位的生存能力 */
  hp: number;
  /** 攻击力(ATK) - 影响普通攻击和技能伤害 */
  attack: number;
  /** 防御力(DEF) - 减少受到的伤害 */
  defense: number;
  /** 速度(SPD) - 影响行动顺序和闪避率 */
  speed: number;
}

export type { BaseStats };