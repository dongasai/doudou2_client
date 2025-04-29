/**
 * 伤害处理事件
 */
export interface DamageDealtEvent {
    /** 目标类型 */
    targetType: 'hero' | 'bean' | 'crystal';
    /** 目标ID */
    targetId: string;
    /** 伤害值 */
    damage: number;
    /** 当前生命值 */
    currentHealth: number;
    /** 是否暴击 */
    isCritical?: boolean;
    /** 伤害来源ID */
    sourceId?: string;
    /** 伤害来源类型 */
    sourceType?: 'hero' | 'bean' | 'crystal' | 'skill';
}