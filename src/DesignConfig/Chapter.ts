/**
 * 章节配置接口
 */
export interface Chapter {
  /** 章节ID */
  id: number;
  /** 章节名称 */
  name: string;
  /** 章节描述 */
  description: string;
  /** 章节包含的关卡ID列表 */
  levels: number[];
  /** 解锁条件 */
  unlockCondition: string;
}
