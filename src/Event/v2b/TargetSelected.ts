/**
 * 目标选择事件
 * 从视图层传递到战斗引擎的目标选择信息
 */
export interface TargetSelectedEvent {
    /** 目标ID */
    targetId: string;
    /** 目标类型 */
    targetType: 'hero' | 'bean' | 'crystal' | 'position';
    /** 目标位置（如果是位置目标） */
    position?: { x: number; y: number };
    /** 关联的技能ID */
    skillId?: string;
    /** 施法者ID */
    casterId?: string;
    /** 选择时间戳 */
    timestamp: number;
}
