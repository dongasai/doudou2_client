import type { CharacterBean } from './CharacterBean';
import type { BaseStats } from './BaseStats';
import type { Skill } from './Skill';

export interface BeanConfig extends Omit<CharacterBean, 'position'> {
    id: number;
    type: string;
    name: string;
    skill: {
        name: string;
        type: string;
        description: string;
        cooldown: number;
        damage?: number;
        defense_buff?: number;
        slow?: number;
        heal?: number;
        reflect?: number;
        stun?: number;
        lifesteal?: number;
        speed_buff?: number;
    };
    stats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
    };
}

export type { CharacterBean, BaseStats };
