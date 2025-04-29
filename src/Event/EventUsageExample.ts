/**
 * 事件系统使用示例
 * 展示如何使用修改后的事件系统
 */

import { EventManager } from '../Battle/Core/EventManager';
import { EventType } from './EventTypes';
import { BeanMovedEvent } from './b2v/BeanMoved';
import { SkillCastEvent } from './b2v/SkillCast';
import { DamageDealtEvent } from './b2v/DamageDealt';
import { EntityMovedEvent } from './b2v/EntityMoved';
import { BuffAppliedEvent } from './b2v/BuffApplied';
import { PlayerInputEvent } from './v2b/PlayerInput';

// 创建事件管理器实例
const eventManager = new EventManager(true);

// 示例1：使用枚举类型监听事件
eventManager.on(EventType.BEAN_MOVED, (event: BeanMovedEvent) => {
  console.log(`豆豆移动: ID=${event.beanId}, 位置=(${event.position.x}, ${event.position.y})`);
});

// 示例2：使用枚举类型触发事件
const beanMovedEvent: BeanMovedEvent = {
  beanId: 'bean_1',
  position: { x: 100, y: 200 }
};
eventManager.emit(EventType.BEAN_MOVED, beanMovedEvent);

// 示例3：使用枚举类型一次性监听事件
eventManager.once(EventType.SKILL_CAST, (event: SkillCastEvent) => {
  console.log(`技能释放: ID=${event.skillId}, 施法者=${event.casterId}`);
});

// 示例4：使用字符串类型监听事件（向后兼容）
eventManager.on('damageDealt', (event: DamageDealtEvent) => {
  console.log(`伤害: 目标=${event.targetId}, 数值=${event.damage}`);
});

// 示例5：监听实体移动事件
eventManager.on(EventType.ENTITY_MOVED, (event: EntityMovedEvent) => {
  console.log(`实体移动: ID=${event.entityId}, 类型=${event.entityType}, 位置=(${event.position.x}, ${event.position.y})`);
});

// 示例6：监听Buff应用事件
eventManager.on(EventType.BUFF_APPLIED, (event: BuffAppliedEvent) => {
  console.log(`Buff应用: 目标=${event.targetId}, 类型=${event.buffType}, 持续=${event.duration}ms`);
});

// 示例7：监听玩家输入事件
eventManager.on(EventType.PLAYER_INPUT, (event: PlayerInputEvent) => {
  console.log(`玩家输入: 类型=${event.inputType}, 位置=(${event.position.x}, ${event.position.y})`);
});

// 示例8：移除特定事件类型的所有监听器
eventManager.removeAllListeners(EventType.BEAN_MOVED);

// 示例9：移除所有事件监听器
eventManager.removeAllEventListeners();
