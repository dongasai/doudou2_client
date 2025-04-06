# 技能数据层重构方案

## 目标
分离技能数据层和展示层，使技能配置"只处理技能数据，不负责展示"

## 当前问题
- 技能配置文件(如quick_shot.json)中混杂了展示相关字段：
  - emoji
  - description  
  - name
- 这些展示字段应该属于展示层

## 重构方案

### 1. 修改技能配置文件
从技能配置文件中移除展示相关字段，只保留核心数据字段：

```json
// 修改前
{
    "id": "quick_shot",
    "name": "快速射击", // 数据层中文名称
    "type": "damage",
    "targetType": "single",
    "range": 500,
    "cooldown": 2000,
    "emoji": "🏹",  // 移除
    "description": "快速射出一箭，有较高的暴击率",  // 移除
    // 其他数据字段...
}

// 修改后
{
    "id": "quick_shot", 
    "type": "damage",
    "targetType": "single",
    "range": 500,
    "cooldown": 2000,
    // 只保留数据字段...
}
```

### 2. 创建展示配置(后续步骤)
展示相关字段可以迁移到：
- 单独的展示配置文件
- 数据库表
- 前端本地化文件

### 3. 修改验证逻辑
更新validator.ts，移除对展示字段的验证

## 数据层命名规范
- `id`: 技能唯一标识符(小写蛇形命名)
- `name`: 数据层中文名称(用于内部逻辑)
- 移除`emoji`和`description`等纯展示字段

## 实施步骤
1. 修改所有技能json配置文件，添加technicalName
2. 移除emoji和description等展示字段
3. 更新验证逻辑
4. 创建展示配置结构