/**
 * 深度层级常量
 * 用于管理游戏中不同元素的渲染层级，防止层级冲突
 */

export enum DepthLayers {
  // 背景层 (0-999)
  BACKGROUND = 0,
  BACKGROUND_DECORATION = 500,
  
  // 游戏世界层 (1000-1999)
  WORLD_GROUND = 1000,
  WORLD_OBJECT = 1200,
  WORLD_ENTITY = 1500,
  WORLD_EFFECT = 1800,
  
  // 游戏UI层 (2000-2999)
  UI_BACKGROUND = 2000,
  UI_ELEMENT = 2500,
  UI_FOREGROUND = 2800,
  
  // 系统UI层 (3000-3999)
  SYSTEM_NOTIFICATION = 3000,
  SYSTEM_POPUP = 3500,
  SYSTEM_MODAL = 3800,
  
  // 最上层 (9000+)
  TOP_LAYER = 9000,
  DEBUG_LAYER = 9999
}
