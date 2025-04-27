/**
 * 二维向量接口
 * 用于表示位置、速度、加速度等
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * 二维向量工具类
 * 提供向量计算的静态方法
 */
export class Vector2DUtils {
  /**
   * 计算两点之间的距离
   * @param a 点A
   * @param b 点B
   * @returns 距离
   */
  public static distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点之间的距离平方
   * 用于性能优化，避免开方运算
   * @param a 点A
   * @param b 点B
   * @returns 距离平方
   */
  public static distanceSquared(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  /**
   * 计算向量长度
   * @param v 向量
   * @returns 长度
   */
  public static magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  /**
   * 计算向量长度平方
   * @param v 向量
   * @returns 长度平方
   */
  public static magnitudeSquared(v: Vector2D): number {
    return v.x * v.x + v.y * v.y;
  }

  /**
   * 向量归一化
   * @param v 向量
   * @returns 归一化后的向量
   */
  public static normalize(v: Vector2D): Vector2D {
    const mag = this.magnitude(v);
    if (mag === 0) {
      return { x: 0, y: 0 };
    }
    return { x: v.x / mag, y: v.y / mag };
  }

  /**
   * 向量加法
   * @param a 向量A
   * @param b 向量B
   * @returns 结果向量
   */
  public static add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   * 向量减法
   * @param a 向量A
   * @param b 向量B
   * @returns 结果向量
   */
  public static subtract(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   * 向量乘以标量
   * @param v 向量
   * @param scalar 标量
   * @returns 结果向量
   */
  public static multiply(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  /**
   * 向量点积
   * @param a 向量A
   * @param b 向量B
   * @returns 点积结果
   */
  public static dot(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * 计算两向量夹角（弧度）
   * @param a 向量A
   * @param b 向量B
   * @returns 夹角（弧度）
   */
  public static angle(a: Vector2D, b: Vector2D): number {
    const dot = this.dot(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    
    // 避免除以零
    if (magA === 0 || magB === 0) {
      return 0;
    }
    
    // 使用反余弦计算夹角
    return Math.acos(Math.min(1, Math.max(-1, dot / (magA * magB))));
  }

  /**
   * 计算向量的方向角（弧度）
   * @param v 向量
   * @returns 方向角（弧度）
   */
  public static direction(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
  }

  /**
   * 根据方向和距离创建向量
   * @param direction 方向（弧度）
   * @param magnitude 长度
   * @returns 向量
   */
  public static fromPolar(direction: number, magnitude: number): Vector2D {
    return {
      x: Math.cos(direction) * magnitude,
      y: Math.sin(direction) * magnitude
    };
  }

  /**
   * 线性插值
   * @param a 起始向量
   * @param b 目标向量
   * @param t 插值因子（0-1）
   * @returns 插值结果
   */
  public static lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
    t = Math.max(0, Math.min(1, t)); // 限制t在0-1范围内
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }
}
