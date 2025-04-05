/**
 * 游戏对象基类
 * 所有游戏中的可交互对象都继承自此类
 * 提供基本的场景管理、物理系统和生命周期方法
 */
export class GameObject extends Phaser.GameObjects.Container {
    /** 游戏场景引用 */
    public scene: Phaser.Scene;
    /** 物理系统身体组件 */
    declare public body: Phaser.Physics.Arcade.Body;
    /** 对象类型 */
    public objectType: string | number;

    /**
     * 创建一个新的游戏对象实例
     * @param scene - 游戏场景实例
     * @param x - 初始X坐标
     * @param y - 初始Y坐标
     * @param texture - 对象的贴图键名（在这个游戏中通常是emoji）
     */
    protected textObject!: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
        super(scene, x, y);
        
        // 创建Text作为子对象(临时方案)
        this.textObject = scene.add.text(0, 0, text, {
            fontSize: '48px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add(this.textObject);
        this.scene = scene;
        this.objectType = '';
        
        // 将对象添加到场景显示列表
        scene.add.existing(this);
        
        // 为对象启用物理系统
        scene.physics.add.existing(this);
    }

    /**
     * 每帧更新时调用的方法
     * 子类应该重写此方法以实现具体的更新逻辑
     * @param time - 游戏开始后的总时间（毫秒）
     * @param delta - 上一帧到这一帧的时间差（毫秒）
     */
    update(time?: number, delta?: number) {
        // 子类实现具体更新逻辑
    }

    /**
     * 销毁对象时调用的方法
     * 清理对象使用的资源
     */
    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }
} 