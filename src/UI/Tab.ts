import Phaser from 'phaser';

/**
 * 标签页基类
 * 所有标签页内容都应该继承这个类
 */
export abstract class Tab {
  // 场景引用
  protected scene: Phaser.Scene;
  
  // 位置和尺寸
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  
  // 内容容器
  protected container: Phaser.GameObjects.Container;
  
  // 是否可见
  protected visible: boolean = false;
  
  /**
   * 构造函数
   * @param scene 场景
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // 创建容器
    this.container = scene.add.container(x, y);
    
    // 初始化内容
    this.init();
    
    // 默认隐藏
    this.hide();
    
    console.log('[INFO] 标签页初始化完成');
  }
  
  /**
   * 初始化内容
   * 子类应该重写这个方法，创建标签页内容
   */
  protected abstract init(): void;
  
  /**
   * 显示标签页
   */
  public show(): void {
    this.container.setVisible(true);
    this.visible = true;
    this.onShow();
  }
  
  /**
   * 隐藏标签页
   */
  public hide(): void {
    this.container.setVisible(false);
    this.visible = false;
    this.onHide();
  }
  
  /**
   * 显示时的回调
   * 子类可以重写这个方法，在标签页显示时执行特定操作
   */
  protected onShow(): void {
    // 默认实现为空
  }
  
  /**
   * 隐藏时的回调
   * 子类可以重写这个方法，在标签页隐藏时执行特定操作
   */
  protected onHide(): void {
    // 默认实现为空
  }
  
  /**
   * 更新
   * @param time 当前时间
   * @param delta 时间增量
   */
  public update(time: number, delta: number): void {
    // 只有在可见时才更新
    if (this.visible) {
      this.updateContent(time, delta);
    }
  }
  
  /**
   * 更新内容
   * 子类可以重写这个方法，更新标签页内容
   * @param time 当前时间
   * @param delta 时间增量
   */
  protected updateContent(time: number, delta: number): void {
    // 默认实现为空
  }
}
