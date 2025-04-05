/**
 * 物品类型枚举
 */
export enum ItemType {
  Weapon = 'weapon',    // 武器
  Armor = 'armor',      // 防具
  Accessory = 'accessory', // 饰品
  Consumable = 'consumable' // 消耗品
}

/**
 * 属性类型枚举
 */
export enum StatType {
  Attack = 'attack',    // 攻击力
  Defense = 'defense',  // 防御力
  HP = 'hp'             // 生命值
}

/**
 * 物品效果接口
 */
export interface Effect {
  stat: StatType;       // 影响的属性类型
  value: number;        // 影响的值
}

/**
 * 物品基础接口
 */
export interface Item {
  id: string;           // 物品ID
  name: string;         // 物品名称
  type: ItemType;       // 物品类型
  effect: Effect;       // 物品效果
  price: number;        // 物品价格
}

/**
 * 物品数据集合接口
 */
export interface ItemsData {
  items: Item[];        // 物品数组
}