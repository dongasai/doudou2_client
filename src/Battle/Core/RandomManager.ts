/**
 * 随机数管理器
 * 提供基于种子的确定性伪随机数生成
 * 确保在相同种子下，战斗过程可以完全重现
 */

import { logger } from './Logger';

export class RandomManager {
  private seed: number;
  private state: number;
  private callCount: number = 0;

  /**
   * 构造函数
   * @param seed 随机种子
   */
  constructor(seed: number) {
    this.seed = seed;
    this.state = seed;
    logger.debug(`随机数管理器初始化，种子: ${seed}`);
  }

  /**
   * 获取当前种子
   */
  public getSeed(): number {
    return this.seed;
  }

  /**
   * 重置随机数生成器状态
   * @param seed 新种子（可选，默认使用初始种子）
   */
  public reset(seed?: number): void {
    this.state = seed !== undefined ? seed : this.seed;
    this.callCount = 0;
    logger.debug(`随机数管理器重置，种子: ${this.state}`);
  }

  /**
   * 生成[0, 1)范围内的随机浮点数
   * 使用xorshift算法生成伪随机数
   */
  public random(): number {
    // xorshift算法
    let x = this.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state = x;

    // 转换为[0, 1)范围的浮点数
    const result = (x >>> 0) / 4294967296;
    this.callCount++;
    
    return result;
  }

  /**
   * 生成指定范围内的随机整数
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   */
  public randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * 生成指定范围内的随机浮点数
   * @param min 最小值（包含）
   * @param max 最大值（不包含）
   */
  public randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * 从数组中随机选择一个元素
   * @param array 数组
   */
  public randomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot select from an empty array');
    }
    const index = this.randomInt(0, array.length - 1);
    return array[index];
  }

  /**
   * 根据权重随机选择一个元素
   * @param array 元素数组
   * @param weights 对应的权重数组
   */
  public weightedRandom<T>(array: T[], weights: number[]): T {
    if (array.length === 0 || array.length !== weights.length) {
      throw new Error('Invalid array or weights');
    }

    // 计算权重总和
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // 生成随机值
    let value = this.randomFloat(0, totalWeight);
    
    // 选择元素
    for (let i = 0; i < array.length; i++) {
      value -= weights[i];
      if (value <= 0) {
        return array[i];
      }
    }
    
    // 防止浮点误差导致没有选中元素
    return array[array.length - 1];
  }

  /**
   * 随机打乱数组
   * @param array 要打乱的数组
   * @returns 打乱后的新数组
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * 生成随机布尔值
   * @param probability true的概率（0-1）
   */
  public randomBool(probability: number = 0.5): boolean {
    return this.random() < probability;
  }

  /**
   * 获取随机数生成器的调用次数
   */
  public getCallCount(): number {
    return this.callCount;
  }

  /**
   * 获取当前随机数生成器的状态
   * 可用于保存游戏状态
   */
  public getState(): { seed: number, state: number, callCount: number } {
    return {
      seed: this.seed,
      state: this.state,
      callCount: this.callCount
    };
  }

  /**
   * 设置随机数生成器的状态
   * 用于恢复游戏状态
   */
  public setState(state: { seed: number, state: number, callCount: number }): void {
    this.seed = state.seed;
    this.state = state.state;
    this.callCount = state.callCount;
    logger.debug(`随机数管理器状态已恢复，种子: ${this.seed}, 状态: ${this.state}, 调用次数: ${this.callCount}`);
  }
}
