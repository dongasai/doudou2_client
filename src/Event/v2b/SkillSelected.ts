/**
 * 技能选择事件
 * 从视图层传递到战斗引擎的技能选择信息
 */
export interface SkillSelectedEvent {
    /** 技能ID */
    skillId: string;
    /** 施法者ID */
    casterId: string;
    /** 选择时间戳 */
    timestamp: number;
    /** 是否需要选择目标 */
    requiresTarget: boolean;
}
