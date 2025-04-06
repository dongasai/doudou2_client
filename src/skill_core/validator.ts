import { 
    SkillConfig, 
    SkillType, 
    TargetType, 
    EffectType, 
    AttributeType,
    SkillEffect,
    BuffEffect,
    DebuffEffect
} from './type';

interface SkillIndexEntry {
    id: string;
    name: string;
    type: SkillType;
    targetType: TargetType;
    description: string;
}

interface SkillCategory {
    [skillId: string]: SkillIndexEntry;
}

interface SkillIndex {
    [category: string]: SkillCategory;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

const skillIndex = require('./skill_index.json') as SkillIndex;

/**
 * 技能类型验证
 */
const VALID_SKILL_TYPES: SkillType[] = ['damage', 'heal', 'buff', 'debuff', 'control'];

/**
 * 目标类型验证
 */
const VALID_TARGET_TYPES: TargetType[] = ['single', 'multiple', 'area', 'self'];

/**
 * 效果类型验证
 */
const VALID_EFFECT_TYPES: EffectType[] = ['dot', 'hot', 'buff', 'debuff', 'control'];

/**
 * 属性类型验证
 */
const VALID_ATTRIBUTE_TYPES: AttributeType[] = ['attack', 'defense', 'speed', 'attack_speed', 'accuracy'];

/**
 * 技能分类验证
 */
const VALID_CATEGORIES = ['mage', 'warrior', 'archer', 'support', 'control'];

/**
 * 验证技能索引
 */
function validateSkillIndex(): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: []
    };

    // 验证顶层分类
    Object.keys(skillIndex).forEach(category => {
        if (!VALID_CATEGORIES.includes(category)) {
            result.errors.push(`无效的技能分类: ${category}`);
            result.isValid = false;
        }

        const skills = skillIndex[category];
        Object.keys(skills).forEach(skillId => {
            const skill = skills[skillId];

            // 验证必需字段
            if (!skill.id) {
                result.errors.push(`技能缺少ID: ${category}/${skillId}`);
                result.isValid = false;
            }

            if (!skill.name) {
                result.errors.push(`技能缺少名称: ${category}/${skillId}`);
                result.isValid = false;
            }

            if (!skill.description) {
                result.errors.push(`技能缺少描述: ${category}/${skillId}`);
                result.isValid = false;
            }

            // 验证技能类型
            if (!skill.type || !VALID_SKILL_TYPES.includes(skill.type)) {
                result.errors.push(`无效的技能类型: ${category}/${skillId} - ${skill.type}`);
                result.isValid = false;
            }

            // 验证目标类型
            if (!skill.targetType || !VALID_TARGET_TYPES.includes(skill.targetType)) {
                result.errors.push(`无效的目标类型: ${category}/${skillId} - ${skill.targetType}`);
                result.isValid = false;
            }

            // 验证ID一致性
            if (skill.id !== skillId) {
                result.errors.push(`技能ID不一致: ${category}/${skillId} - ${skill.id}`);
                result.isValid = false;
            }
        });
    });

    return result;
}

/**
 * 验证技能配置
 */
async function validateSkillConfig(category: string, skillId: string): Promise<ValidationResult> {
    const result: ValidationResult = {
        isValid: true,
        errors: []
    };

    try {
        // 动态导入技能配置
        const configModule = await import(`./${category}/${skillId}.json`);
        const config: SkillConfig = configModule.default;

        // 验证基础字段
        if (!config.id || config.id !== skillId) {
            result.errors.push(`技能ID不一致: ${config.id} !== ${skillId}`);
            result.isValid = false;
        }

        if (!config.name) {
            result.errors.push(`技能缺少名称`);
            result.isValid = false;
        }

        if (!config.description) {
            result.errors.push(`技能缺少描述`);
            result.isValid = false;
        }

        // 验证数值字段
        if (config.range < 0) {
            result.errors.push(`技能范围不能为负: ${config.range}`);
            result.isValid = false;
        }

        if (config.cooldown < 0) {
            result.errors.push(`冷却时间不能为负: ${config.cooldown}`);
            result.isValid = false;
        }

        // 验证等级字段
        if (config.level < 1) {
            result.errors.push(`初始等级不能小于1: ${config.level}`);
            result.isValid = false;
        }

        if (config.maxLevel < config.level) {
            result.errors.push(`最大等级不能小于初始等级: ${config.maxLevel} < ${config.level}`);
            result.isValid = false;
        }

        // 验证升级配置
        if (config.upgrades) {
            config.upgrades.forEach((upgrade, index) => {
                if (upgrade.level !== index + 2) {
                    result.errors.push(`升级等级不连续: 期望 ${index + 2}, 实际 ${upgrade.level}`);
                    result.isValid = false;
                }

                if (upgrade.cost <= 0) {
                    result.errors.push(`升级消耗必须大于0: 等级 ${upgrade.level}`);
                    result.isValid = false;
                }
            });
        }

        // 验证效果配置
        if (config.effects) {
            Object.entries(config.effects).forEach(([effectId, effect]) => {
                if (!VALID_EFFECT_TYPES.includes(effect.type)) {
                    result.errors.push(`无效的效果类型: ${effectId} - ${effect.type}`);
                    result.isValid = false;
                }

                if (effect.duration <= 0) {
                    result.errors.push(`效果持续时间必须大于0: ${effectId}`);
                    result.isValid = false;
                }

                // 检查属性类型（仅对buff和debuff效果）
                if ((effect.type === 'buff' || effect.type === 'debuff') && 
                    !VALID_ATTRIBUTE_TYPES.includes((effect as BuffEffect | DebuffEffect).attribute)) {
                    result.errors.push(`无效的属性类型: ${effectId} - ${(effect as BuffEffect | DebuffEffect).attribute}`);
                    result.isValid = false;
                }
            });
        }

        // 验证连锁效果
        if (config.chainEffect) {
            if (config.chainEffect.maxTargets < 2) {
                result.errors.push(`连锁目标数必须大于1: ${config.chainEffect.maxTargets}`);
                result.isValid = false;
            }

            if (config.chainEffect.damageReduction <= 0 || config.chainEffect.damageReduction >= 1) {
                result.errors.push(`伤害衰减必须在0-1之间: ${config.chainEffect.damageReduction}`);
                result.isValid = false;
            }
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        result.errors.push(`加载技能配置失败: ${errorMessage}`);
        result.isValid = false;
    }

    return result;
}

/**
 * 验证所有技能
 */
export async function validateAllSkills(): Promise<ValidationResult> {
    const result: ValidationResult = {
        isValid: true,
        errors: []
    };

    // 首先验证索引
    const indexResult = validateSkillIndex();
    if (!indexResult.isValid) {
        result.errors.push(...indexResult.errors);
        result.isValid = false;
    }

    // 验证每个技能的完整配置
    for (const category of VALID_CATEGORIES) {
        const skills = skillIndex[category];
        if (skills) {
            for (const skillId of Object.keys(skills)) {
                const configResult = await validateSkillConfig(category, skillId);
                if (!configResult.isValid) {
                    result.errors.push(`技能验证失败: ${category}/${skillId}`);
                    result.errors.push(...configResult.errors.map(err => `  - ${err}`));
                    result.isValid = false;
                }
            }
        }
    }

    return result;
}

// 导出验证常量供其他模块使用
export const VALIDATORS = {
    VALID_SKILL_TYPES,
    VALID_TARGET_TYPES,
    VALID_EFFECT_TYPES,
    VALID_ATTRIBUTE_TYPES,
    VALID_CATEGORIES
}; 