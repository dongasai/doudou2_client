import Phaser from 'phaser';
import { Tab } from './Tab';
import { DepthLayers } from '@/Constants/DepthLayers';

/**
 * 标签页管理器
 * 管理多个标签页，实现标签页切换功能
 */
export class TabManager {
  // 场景引用
  private scene: Phaser.Scene;
  
  // 位置和尺寸
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  
  // 标签页按钮
  private tabButtons: Phaser.GameObjects.Text[] = [];
  
  // 标签页内容
  private tabs: Tab[] = [];
  
  // 当前选中的标签页索引
  private selectedTabIndex: number = -1;
  
  // 标签页容器
  private container: Phaser.GameObjects.Container;
  
  // 标签页背景
  private background: Phaser.GameObjects.Rectangle;
  
  // 标签页按钮背景
  private tabButtonsBackground: Phaser.GameObjects.Rectangle;
  
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
    
    // 初始化背景属性
    this.background = scene.add.rectangle(0, 0, 0, 0, 0);
    this.tabButtonsBackground = scene.add.rectangle(0, 0, 0, 0, 0);
    
    // 创建背景
    this.createBackground();
    
    console.log('[INFO] 标签页管理器初始化完成');
  }
  
  /**
   * 创建背景
   */
  private createBackground(): void {
    try {
      // 创建标签页内容背景（UI_BACKGROUND）
      this.background = this.scene.add.rectangle(
        0,
        40, // 标签页按钮高度
        this.width,
        this.height - 40,
        0x222222,
        0.7
      );
      this.background.setOrigin(0.5, 0);
      this.background.setDepth(DepthLayers.UI_BACKGROUND);
      this.container.add(this.background);

      // 创建标签页按钮背景（UI_ELEMENT）
      this.tabButtonsBackground = this.scene.add.rectangle(
        0,
        0,
        this.width,
        40,
        0x333333,
        0.9
      );
      this.tabButtonsBackground.setOrigin(0.5, 0);
      this.tabButtonsBackground.setDepth(DepthLayers.UI_ELEMENT);
      this.container.add(this.tabButtonsBackground);
      
      // 创建标签页按钮背景
      this.tabButtonsBackground = this.scene.add.rectangle(
        0,
        0,
        this.width,
        40,
        0x333333,
        0.9
      );
      this.tabButtonsBackground.setOrigin(0.5, 0);
      this.container.add(this.tabButtonsBackground);
      
      console.log('[INFO] 标签页背景创建完成');
    } catch (error) {
      console.error('[ERROR] 创建标签页背景失败:', error);
    }
  }
  
  /**
   * 添加标签页
   * @param title 标签页标题
   * @param tab 标签页内容
   */
  public addTab(title: string, tab: Tab): void {
    try {
      // 计算标签页按钮位置
      const tabCount = this.tabButtons.length;
      const tabWidth = this.width / (tabCount + 1);
      const tabX = -this.width / 2 + tabWidth / 2 + tabCount * tabWidth;
      
      // 创建标签页按钮
      const tabButton = this.scene.add.text(tabX, 20, title, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      tabButton.setOrigin(0.5, 0.5);
      
      // 设置交互
      tabButton.setInteractive();
      
      // 添加点击事件
      tabButton.on('pointerdown', () => {
        this.selectTab(tabCount);
      });
      
      // 添加悬停效果
      tabButton.on('pointerover', () => {
        tabButton.setStyle({ color: '#ffff00' });
      });
      
      tabButton.on('pointerout', () => {
        if (this.selectedTabIndex !== tabCount) {
          tabButton.setStyle({ color: '#ffffff' });
        }
      });
      
      // 添加到容器
      this.container.add(tabButton);
      
      // 保存标签页按钮和内容
      this.tabButtons.push(tabButton);
      this.tabs.push(tab);
      
      // 设置深度关系：按钮(UI_FOREGROUND) > 内容(UI_ELEMENT)
      tabButton.setDepth(DepthLayers.UI_FOREGROUND);
      tab.container.setDepth(DepthLayers.UI_ELEMENT);
      
      // 隐藏标签页内容
      tab.hide();
      
      console.log(`[DEBUG] 标签页${title}深度设置完成: 按钮=${10}, 内容=${tabCount}`);
      
      // 重新排列标签页按钮
      this.rearrangeTabButtons();
      
      console.log(`[INFO] 添加标签页: ${title}`);
    } catch (error) {
      console.error(`[ERROR] 添加标签页失败: ${title}`, error);
    }
  }
  
  /**
   * 重新排列标签页按钮
   */
  private rearrangeTabButtons(): void {
    try {
      const tabCount = this.tabButtons.length;
      const tabWidth = this.width / tabCount;
      
      for (let i = 0; i < tabCount; i++) {
        const tabX = -this.width / 2 + tabWidth / 2 + i * tabWidth;
        this.tabButtons[i].setPosition(tabX, 20);
      }
      
      console.log('[INFO] 重新排列标签页按钮完成');
    } catch (error) {
      console.error('[ERROR] 重新排列标签页按钮失败:', error);
    }
  }
  
  /**
   * 选择标签页
   * @param index 标签页索引
   */
  public selectTab(index: number): void {
    try {
      // 检查索引是否有效
      if (index < 0 || index >= this.tabs.length) {
        console.warn(`[WARN] 无效的标签页索引: ${index}`);
        return;
      }
      
      // 如果已经选中，不做任何操作
      if (this.selectedTabIndex === index) {
        return;
      }
      
      // 隐藏当前标签页
      if (this.selectedTabIndex !== -1) {
        this.tabs[this.selectedTabIndex].hide();
        this.tabButtons[this.selectedTabIndex].setStyle({ color: '#ffffff' });
      }
      
      // 显示新标签页
      this.tabs[index].show();
      this.tabButtons[index].setStyle({ color: '#ffff00' });
      
      // 更新选中的标签页索引
      this.selectedTabIndex = index;
      
      console.log(`[INFO] 选择标签页: ${index}`);
    } catch (error) {
      console.error(`[ERROR] 选择标签页失败: ${index}`, error);
    }
  }
  
  /**
   * 更新
   * @param time 当前时间
   * @param delta 时间增量
   */
  public update(time: number, delta: number): void {
    // 更新当前标签页
    if (this.selectedTabIndex !== -1) {
      this.tabs[this.selectedTabIndex].update(time, delta);
    }
  }
}
