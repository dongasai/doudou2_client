import { Position } from '../../../types/Position';
import { Stats } from '../../../types/Stats';

/**
 * 技能效果类型
 */
export type EffectType = 
    | 'damage'    // 伤害
    | 'heal'      // 治疗
    | 'shield'    // 护盾
    | 'stun'      // 眩晕
    | 'slow'      // 减速
    | 'buff'      // 增益
    | 'debuff'    // 减益
    | 'summon'    // 召唤
    | 'move';     // 位移

/**
 * 技能目标类型
 */
export type TargetType = 
    | 'single'     // 单体目标
    | 'area'       // 范围目标
    | 'self'       // 自身
    | 'ally'       // 友方
    | 'all_enemy'; // 全体敌人

/**
 * 战斗单位基础接口
 */
export interface BattleUnit {
    id: number;
    currentHp: number;
    maxHp: number;
    position: Position;
    stats: Stats;
    shield?: number;
    isStunned?: boolean;
    stunDuration?: number;
    moveSpeed?: number;
    slowDuration?: number;
    onDeath?: () => void;
}

/**
 * 技能效果接口
 */
export interface SkillEffect {
    type: EffectType;
    value: number;
    target: TargetType;
    duration?: number;
    position?: Position;
    // 特殊效果
    penetration?: number;      // 穿透
    chainEffect?: boolean;     // 连锁效果
    chainCount?: number;       // 连锁次数
    lifeSteal?: number;       // 生命偷取
    healingBonus?: number;    // 治疗加成
    shieldStrength?: number;  // 护盾强度
    effectStrength?: number;  // 效果强度
    // 属性修改
    attack_buff?: number;     // 攻击力增益
    defense_buff?: number;    // 防御力增益
    speed_buff?: number;      // 速度增益
    attack_reduction?: number; // 攻击力减益
    defense_reduction?: number; // 防御力减益
    speed_reduction?: number;  // 速度减益
}

/**
 * 技能执行数据接口
 */
export interface SkillExecution {
    source: BattleUnit;
    targets: BattleUnit[];
    skill: Skill;
    effects: SkillEffect[];
}

/**
 * 技能状态接口
 */
export interface SkillState {
    cooldown: number;
    isAvailable: boolean;
    activeEffects: {
        effect: SkillEffect;
        remainingDuration: number;
    }[];
}

/**
 * 战斗事件类型
 */
export type BattleEventType = 
    | 'skill_cast'
    | 'damage_dealt'
    | 'heal_applied'
    | 'shield_applied'
    | 'stun_applied'
    | 'slow_applied'
    | 'buff_applied'
    | 'debuff_applied'
    | 'summon_requested'
    | 'unit_moved'
    | 'hero_died'
    | 'bean_defeated'
    | 'combo_triggered'
    | 'passive_triggered'; 