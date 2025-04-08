import fs from 'fs';
import path from 'path';

const SKILL_DIR = path.join(__dirname, '../src/skill_core');
const CATEGORIES = ['mage', 'warrior', 'archer', 'support', 'control'];
const OUTPUT_FILE = path.join(SKILL_DIR, 'generate_skill_index.json');

interface SkillIndexEntry {
    id: string;
    name: string;
    type: string;
    targetType: string;
    description: string;
}

interface SkillIndex {
    [category: string]: {
        [skillId: string]: SkillIndexEntry;
    };
}

function generateSkillIndex() {
    const index: SkillIndex = {};

    for (const category of CATEGORIES) {
        const categoryDir = path.join(SKILL_DIR, category);
        if (!fs.existsSync(categoryDir)) continue;

        const skills: Record<string, SkillIndexEntry> = {};
        const files = fs.readdirSync(categoryDir)
            .filter(file => file.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(categoryDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const skillId = path.basename(file, '.json');

            skills[skillId] = {
                id: skillId,
                name: data.name,
                type: data.type,
                targetType: data.targetType,
                description: data.description
            };
        }

        if (Object.keys(skills).length > 0) {
            index[category] = skills;
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`技能索引已生成: ${OUTPUT_FILE}`);
}

generateSkillIndex();