/**
 * 战斗指令类型
 */
export type BattleCommandType = 
  | 'learnSkill'    // 学习技能
  | 'changePosition' // 更换位置
  | 'useItem'       // 使用道具
  | 'castSkill';    // 施放技能

/**
 * 技能目标类型
 */
export type SkillTargetType = 
  | 'enemy'     // 敌方目标
  | 'ally'      // 友方英雄
  | 'position'  // 指定位置
  | 'self';     // 自身

/**
 * 基础战斗指令接口
 */
export interface BaseBattleCommand {
  /** 生效帧号(每秒10帧) */
  frame: number;
  /** 玩家ID */
  playerId: string;
  /** 指令类型 */
  type: BattleCommandType;
}

/**
 * 学习技能指令
 */
export interface LearnSkillCommand extends BaseBattleCommand {
  type: 'learnSkill';
  data: {
    heroId: number;    // 英雄ID
    skillId: number;   // 技能ID  
  };
}

/**
 * 更换位置指令 
 */
export interface ChangePositionCommand extends BaseBattleCommand {
  type: 'changePosition';
  data: {
    heroId: number;    // 英雄ID
    newPos: number;    // 新位置(1-5)
  };
}

/**
 * 使用道具指令
 */
export interface UseItemCommand extends BaseBattleCommand {
  type: 'useItem';
  data: {
    itemId: number;    // 道具ID
    target?: number;   // 目标ID(可选)
  };
}

/**
 * 施放技能指令
 */
export interface CastSkillCommand extends BaseBattleCommand {
  type: 'castSkill';
  data: {
    heroId: number;       // 英雄ID
    skillId: number;      // 技能ID
    targetType: SkillTargetType; // 目标类型
    targetId?: number;    // 目标ID(可选)
    targetPos?: number;   // 目标位置(可选)
  };
}

/**
 * 战斗指令联合类型
 */
export type BattleCommand = 
  | LearnSkillCommand
  | ChangePositionCommand
  | UseItemCommand
  | CastSkillCommand;