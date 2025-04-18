# 帧略设计


## 需要在内部帧(50fps)处理的操作：

攻击判定和伤害计算(特别是高频攻击)
精确碰撞检测
技能效果触发
角色移动插值
动画状态更新
需要精确时序的buff/debuff效果

```
技能冷却
技能释放
普通攻击
buff/debuff
```

## 应在逻辑帧(10fps)处理的操作：

游戏状态机更新
AI决策和路径规划
技能冷却计时
资源生成和回收
事件广播和网络同步
胜负条件判断
UI状态更新


```
移动
目标选择


```

## 判断标准：

是否需要高精度时序(是→内部帧)
是否影响游戏核心逻辑(否→内部帧)
是否需要保持确定性(是→逻辑帧)
是否产生网络同步事件(是→逻辑帧)



## 游戏开发中"帧"的英文术语对照：

逻辑帧 - Logic Frame / Update Frame
内部帧 - Inner Frame / Simulation Frame
渲染帧 - Render Frame
物理帧 - Physics Frame
固定帧 - Fixed Frame
可变帧 - Variable Frame
在代码实现中常用的命名：

logicFrame
innerFrame
fixedUpdate
physicsTick
renderPass