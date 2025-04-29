/**
 * 事件类型定义
 * 集中管理所有事件类型
 */

// 从战斗引擎到视图层的事件类型
import { BeanDefeatedEvent } from './b2v/BeanDefeated';
import { BeanMovedEvent } from './b2v/BeanMoved';
import { BeanSpawnedEvent } from './b2v/BeanSpawned';
import { BuffAppliedEvent } from './b2v/BuffApplied';
import { BuffRemovedEvent } from './b2v/BuffRemoved';
import { ControlEffectAppliedEvent } from './b2v/ControlEffectApplied';
import { ControlEffectRemovedEvent } from './b2v/ControlEffectRemoved';
import { CrystalCreatedEvent } from './b2v/CrystalCreated';
import { DamageDealtEvent } from './b2v/DamageDealt';
import { EntityMovedEvent } from './b2v/EntityMoved';
import { EntityStateChangedEvent } from './b2v/EntityStateChanged';
import { EntityStatsChangedEvent } from './b2v/EntityStatsChanged';
import { GameOverEvent } from './b2v/GameOver';
import { HeroCreatedEvent } from './b2v/HeroCreated';
import { HeroDiedEvent } from './b2v/HeroDied';
import { SkillCastEvent } from './b2v/SkillCast';
import { SkillCooldownUpdateEvent } from './b2v/SkillCooldownUpdate';
import { SkillEffectAppliedEvent } from './b2v/SkillEffectApplied';
import { SkillHitEvent } from './b2v/SkillHit';

// 从视图层到战斗引擎的事件类型
import { GamePauseResumeEvent } from './v2b/GamePauseResume';
import { MoveCommandEvent } from './v2b/MoveCommand';
import { PlayerInputEvent } from './v2b/PlayerInput';
import { SkillSelectedEvent } from './v2b/SkillSelected';
import { TargetSelectedEvent } from './v2b/TargetSelected';

// 事件类型枚举
export enum EventType {
  // 战斗引擎到视图层的事件
  BEAN_DEFEATED = 'beanDefeated',
  BEAN_MOVED = 'beanMoved',
  BEAN_SPAWNED = 'beanSpawned',
  BUFF_APPLIED = 'buffApplied',
  BUFF_REMOVED = 'buffRemoved',
  CONTROL_EFFECT_APPLIED = 'controlEffectApplied',
  CONTROL_EFFECT_REMOVED = 'controlEffectRemoved',
  CRYSTAL_CREATED = 'crystalCreated',
  DAMAGE_DEALT = 'damageDealt',
  ENTITY_MOVED = 'entityMoved',
  ENTITY_STATE_CHANGED = 'entityStateChanged',
  ENTITY_STATS_CHANGED = 'entityStatsChanged',
  GAME_OVER = 'gameOver',
  HERO_CREATED = 'heroCreated',
  HERO_DIED = 'heroDied',
  SKILL_CAST = 'skillCast',
  SKILL_COOLDOWN_UPDATE = 'skillCooldownUpdate',
  SKILL_EFFECT_APPLIED = 'skillEffectApplied',
  SKILL_HIT = 'skillHit',
  
  // 视图层到战斗引擎的事件
  GAME_PAUSE_RESUME = 'gamePauseResume',
  MOVE_COMMAND = 'moveCommand',
  PLAYER_INPUT = 'playerInput',
  SKILL_SELECTED = 'skillSelected',
  TARGET_SELECTED = 'targetSelected'
}

// 事件数据类型映射
export interface EventDataMap {
  // 战斗引擎到视图层的事件
  [EventType.BEAN_DEFEATED]: BeanDefeatedEvent;
  [EventType.BEAN_MOVED]: BeanMovedEvent;
  [EventType.BEAN_SPAWNED]: BeanSpawnedEvent;
  [EventType.BUFF_APPLIED]: BuffAppliedEvent;
  [EventType.BUFF_REMOVED]: BuffRemovedEvent;
  [EventType.CONTROL_EFFECT_APPLIED]: ControlEffectAppliedEvent;
  [EventType.CONTROL_EFFECT_REMOVED]: ControlEffectRemovedEvent;
  [EventType.CRYSTAL_CREATED]: CrystalCreatedEvent;
  [EventType.DAMAGE_DEALT]: DamageDealtEvent;
  [EventType.ENTITY_MOVED]: EntityMovedEvent;
  [EventType.ENTITY_STATE_CHANGED]: EntityStateChangedEvent;
  [EventType.ENTITY_STATS_CHANGED]: EntityStatsChangedEvent;
  [EventType.GAME_OVER]: GameOverEvent;
  [EventType.HERO_CREATED]: HeroCreatedEvent;
  [EventType.HERO_DIED]: HeroDiedEvent;
  [EventType.SKILL_CAST]: SkillCastEvent;
  [EventType.SKILL_COOLDOWN_UPDATE]: SkillCooldownUpdateEvent;
  [EventType.SKILL_EFFECT_APPLIED]: SkillEffectAppliedEvent;
  [EventType.SKILL_HIT]: SkillHitEvent;
  
  // 视图层到战斗引擎的事件
  [EventType.GAME_PAUSE_RESUME]: GamePauseResumeEvent;
  [EventType.MOVE_COMMAND]: MoveCommandEvent;
  [EventType.PLAYER_INPUT]: PlayerInputEvent;
  [EventType.SKILL_SELECTED]: SkillSelectedEvent;
  [EventType.TARGET_SELECTED]: TargetSelectedEvent;
}
