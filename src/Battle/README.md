# 战斗引擎

## 特征
1. **地图**
    - 地图尺寸 3000 * 3000
    - 英雄固定在 1500,1500 点出生
    - 怪物与玩家距离200-300的点随机产生
2. **伪随机**
    - 伪随机的确定性计算
    - 随机种子使其只记录关键指令即可复现整个战斗过程
3. **状态管理**:
    - 使用确定性随机种子
    - 状态快照和回放支持
    - 断线重连机制
4. **关键帧策略**:
    - 关键帧进行操作
    - 非关键帧操作全自动根据伪随机策略生成
    - 客户端预测移动
5. **状态系统**
   - 多层buff/debuff叠加
   - 状态免疫和抵抗
   - 状态持续时间管理
   - 状态效果冲突解决
6. **逻辑帧+内部帧**
    - 逻辑帧,每秒10帧
    - 内部帧率为50帧,即:每个逻辑帧进行5次内部循环
    - 少于100ms的攻击间隔采用多段攻击法进行处理
    - 高频操作(如攻击)使用独立的时间累积机制
    - 逻辑帧的事件累计后按照顺序发送


## 模块划分

1. 战斗逻辑核心
2. 技能系统
3. Buff/Debuff系统
4. AI决策系统
5. 战斗结算系统
6. 伤害管理
7. 状态管理器

