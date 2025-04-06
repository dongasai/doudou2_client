import { BattleUnit, TargetType } from './types/skill';
import { Skill } from '../../types/Skill';
import { BattleManager } from './BattleManager';

/**
 * 目标选择器
 * 负责根据技能类型选择合适的目标
 */
export class TargetSelector {
    private static instance: TargetSelector;
    private battleManager: BattleManager;

    private constructor() {
        this.battleManager = BattleManager.getInstance();
    }

    public static getInstance(): TargetSelector {
        if (!TargetSelector.instance) {
            TargetSelector.instance = new TargetSelector();
        }
        return TargetSelector.instance;
    }

    /**
     * 选择技能目标
     * @param source 技能来源
     * @param skill 技能配置
     * @returns 目标列表
     */
    public selectTargets(source: BattleUnit, skill: Skill): BattleUnit[] {
        const targetType = this.getTargetType(skill);
        const targets: BattleUnit[] = [];

        switch (targetType) {
            case 'single':
                // 单体目标,选择最近的敌人
                targets.push(this.selectNearestTarget(source));
                break;

            case 'area':
                // 范围目标,选择范围内的所有敌人
                targets.push(...this.selectAreaTargets(source, skill.range || 100));
                break;

            case 'self':
                // 自身
                targets.push(source);
                break;

            case 'ally':
                // 友方单位,选择血量最低的队友
                targets.push(...this.selectAllies(source));
                break;

            case 'all_enemy':
                // 全体敌人
                targets.push(...this.selectAllEnemies(source));
                break;
        }

        return targets;
    }

    /**
     * 获取技能目标类型
     */
    public getTargetType(skill: Skill): TargetType {
        switch (skill.type) {
            case '伤害':
                return skill.range ? 'area' : 'single';
            case '治疗':
                return 'ally';
            case '控制':
                return skill.range ? 'area' : 'single';
            case '增益':
                return skill.target === '自身' ? 'self' : 'ally';
            case '减益':
                return skill.range ? 'area' : 'single';
            case '召唤':
                return 'self';
            default:
                return 'single';
        }
    }

    /**
     * 选择最近的敌方目标
     */
    private selectNearestTarget(source: BattleUnit): BattleUnit {
        const enemies = this.selectAllEnemies(source);
        if (enemies.length === 0) {
            return source; // 没有敌人时返回自身
        }

        // 计算距离并选择最近的目标
        let nearest = enemies[0];
        let minDistance = this.calculateDistance(source, nearest);

        enemies.forEach(enemy => {
            const distance = this.calculateDistance(source, enemy);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });

        return nearest;
    }

    /**
     * 选择范围内的敌方目标
     */
    private selectAreaTargets(source: BattleUnit, range: number): BattleUnit[] {
        const enemies = this.selectAllEnemies(source);
        return enemies.filter(enemy => {
            const distance = this.calculateDistance(source, enemy);
            return distance <= range;
        });
    }

    /**
     * 选择友方目标
     */
    private selectAllies(source: BattleUnit): BattleUnit[] {
        const allies: BattleUnit[] = [];
        if ('isHero' in source) {
            // 如果源是英雄,选择其他英雄
            this.battleManager.getHeroes().forEach((hero, id) => {
                if (id !== source.id) {
                    allies.push(hero);
                }
            });
        } else {
            // 如果源是豆豆,选择其他豆豆
            this.battleManager.getBeans().forEach((bean, id) => {
                if (id !== source.id) {
                    allies.push(bean);
                }
            });
        }
        return allies;
    }

    /**
     * 选择所有敌方目标
     */
    private selectAllEnemies(source: BattleUnit): BattleUnit[] {
        if ('isHero' in source) {
            // 如果源是英雄,选择所有豆豆
            return Array.from(this.battleManager.getBeans().values());
        } else {
            // 如果源是豆豆,选择所有英雄
            return Array.from(this.battleManager.getHeroes().values());
        }
    }

    /**
     * 计算两个单位之间的距离
     */
    private calculateDistance(unit1: BattleUnit, unit2: BattleUnit): number {
        const dx = unit1.position.x - unit2.position.x;
        const dy = unit1.position.y - unit2.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
} 