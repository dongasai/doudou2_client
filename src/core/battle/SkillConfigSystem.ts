import { Skill, SkillType, SkillTargetType, SkillTriggerType } from '../../types/Skill';

/**
 * 技能配置系统
 * 负责管理和加载技能配置
 */
export class SkillConfigSystem {
    private static instance: SkillConfigSystem;
    private skillConfigs: Map<number, Skill>;
    private skillUpgrades: Map<number, SkillUpgrade[]>;

    private constructor() {
        this.skillConfigs = new Map();
        this.skillUpgrades = new Map();
        this.initializeSkillConfigs();
    }

    public static getInstance(): SkillConfigSystem {
        if (!SkillConfigSystem.instance) {
            SkillConfigSystem.instance = new SkillConfigSystem();
        }
        return SkillConfigSystem.instance;
    }

    /**
     * 初始化技能配置
     */
    private initializeSkillConfigs(): void {
        // 法师技能
        this.registerSkill({
            id: 1001,
            name: '火球术',
            type: '伤害',
            description: '向目标发射一个火球,造成伤害',
            target: '单体',
            triggerType: '主动',
            cooldown: 2,
            damage: 50,
            cost: 20,
            level: 1,
            max_level: 5
        });

        this.registerSkill({
            id: 1002,
            name: '烈焰风暴',
            type: '伤害',
            description: '在目标区域释放烈焰风暴,造成持续伤害',
            target: '范围',
            triggerType: '主动',
            cooldown: 5,
            damage: 30,
            duration: 3,
            range: 200,
            cost: 50,
            level: 1,
            max_level: 5
        });

        // 战士技能
        this.registerSkill({
            id: 2001,
            name: '盾击',
            type: '控制',
            description: '用盾牌击打目标,造成伤害并眩晕',
            target: '单体',
            triggerType: '主动',
            cooldown: 3,
            damage: 30,
            stun: 1,
            cost: 30,
            level: 1,
            max_level: 5
        });

        this.registerSkill({
            id: 2002,
            name: '守护',
            type: '增益',
            description: '增加自身防御力',
            target: '自身',
            triggerType: '主动',
            cooldown: 4,
            defense_buff: 50,
            duration: 3,
            cost: 40,
            level: 1,
            max_level: 5
        });

        // 射手技能
        this.registerSkill({
            id: 3001,
            name: '快射',
            type: '伤害',
            description: '快速射出一箭',
            target: '单体',
            triggerType: '主动',
            cooldown: 1,
            damage: 40,
            cost: 15,
            level: 1,
            max_level: 5
        });

        this.registerSkill({
            id: 3002,
            name: '穿云',
            type: '伤害',
            description: '射出一支穿透箭',
            target: '单体',
            triggerType: '主动',
            cooldown: 4,
            damage: 60,
            penetration: 0.3,
            cost: 45,
            level: 1,
            max_level: 5
        });

        // 初始化技能升级配置
        this.initializeSkillUpgrades();
    }

    /**
     * 初始化技能升级配置
     */
    private initializeSkillUpgrades(): void {
        // 火球术升级配置
        this.registerSkillUpgrades(1001, [
            {
                level: 2,
                cost: 100,
                damage: 65,
                cooldown: 2
            },
            {
                level: 3,
                cost: 200,
                damage: 85,
                cooldown: 1
            },
            {
                level: 4,
                cost: 300,
                damage: 110,
                cooldown: 1
            },
            {
                level: 5,
                cost: 500,
                damage: 140,
                cooldown: 1,
                chain_effect: true
            }
        ]);

        // 烈焰风暴升级配置
        this.registerSkillUpgrades(1002, [
            {
                level: 2,
                cost: 150,
                damage: 40,
                duration: 3
            },
            {
                level: 3,
                cost: 300,
                damage: 50,
                duration: 4
            },
            {
                level: 4,
                cost: 450,
                damage: 65,
                duration: 4
            },
            {
                level: 5,
                cost: 700,
                damage: 80,
                duration: 5,
                range: 250
            }
        ]);

        // 其他技能的升级配置...
    }

    /**
     * 注册技能配置
     */
    private registerSkill(config: Skill): void {
        this.skillConfigs.set(config.id, config);
    }

    /**
     * 注册技能升级配置
     */
    private registerSkillUpgrades(skillId: number, upgrades: SkillUpgrade[]): void {
        this.skillUpgrades.set(skillId, upgrades);
    }

    /**
     * 获取技能配置
     */
    public getSkillConfig(skillId: number): Skill | undefined {
        return this.skillConfigs.get(skillId);
    }

    /**
     * 获取技能升级配置
     */
    public getSkillUpgrades(skillId: number): SkillUpgrade[] | undefined {
        return this.skillUpgrades.get(skillId);
    }

    /**
     * 获取技能升级后的配置
     */
    public getUpgradedSkillConfig(skillId: number, level: number): Skill | undefined {
        const baseConfig = this.getSkillConfig(skillId);
        if (!baseConfig || level <= 1) return baseConfig;

        const upgrades = this.getSkillUpgrades(skillId);
        if (!upgrades) return baseConfig;

        const upgrade = upgrades.find(u => u.level === level);
        if (!upgrade) return baseConfig;

        // 合并基础配置和升级配置
        return {
            ...baseConfig,
            ...upgrade
        };
    }

    /**
     * 检查技能是否可以升级
     */
    public canUpgradeSkill(skillId: number, currentLevel: number): boolean {
        const config = this.getSkillConfig(skillId);
        if (!config) return false;

        const upgrades = this.getSkillUpgrades(skillId);
        if (!upgrades) return false;

        return currentLevel < config.max_level!;
    }

    /**
     * 获取技能升级所需消耗
     */
    public getUpgradeCost(skillId: number, targetLevel: number): number {
        const upgrades = this.getSkillUpgrades(skillId);
        if (!upgrades) return 0;

        const upgrade = upgrades.find(u => u.level === targetLevel);
        return upgrade ? upgrade.cost : 0;
    }
}

/**
 * 技能升级配置接口
 */
interface SkillUpgrade {
    level: number;           // 升级后等级
    cost: number;           // 升级消耗
    damage?: number;        // 升级后伤害
    heal?: number;         // 升级后治疗
    cooldown?: number;     // 升级后冷却
    duration?: number;     // 升级后持续时间
    range?: number;        // 升级后范围
    chain_effect?: boolean; // 升级后是否获得连锁效果
    [key: string]: any;    // 其他可能的升级属性
} 