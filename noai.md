# 日志助手,战斗引擎

1. 日志可写入文件
2. 日志可console输出
2. 有是否写入文件开关,可随时开关
3. 可控制写入那个文件

@/GAME.md  阅读文档 ,进行开发,只进行单机开发,一个玩家控制所有英雄;
这是手机游戏,触屏操作;
实现战斗引擎,进行无界面调试,走通已有的英雄/技能/关卡配置

技能释放指令,不应复杂,应该是只有:释放人,释放技能ID,释放目标

战斗引擎事件的数据,创建数据格式interface,不同事件不同的,对事件数据进行格式声明

[2025-04-29T05:46:00.934Z] [INFO] 波次完成: 第NaN波 - undefined, 用时: undefinedms


[DEBUG] 检测到水晶状态: {hp: undefined, maxHp: undefined}hp: undefinedmaxHp: undefined

src/Battle/View/BattleSceneView.ts 事件监听,还有未使用EventType的
[11](11)

战斗场景,增加屏幕外豆豆指示器,当豆豆已出现屏幕外时,显示指示器,当豆豆进入屏幕时,隐藏指示器

