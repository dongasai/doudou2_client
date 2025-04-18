import fs from 'fs';
import path from 'path';

const SKILL_DIR = path.join(__dirname, '../src/SkillKernel');
const CATEGORIES = ['json'];
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
    const jsonDir = path.join(SKILL_DIR, 'json');
    
    if (!fs.existsSync(jsonDir)) {
        console.error('技能JSON目录不存在:', jsonDir);
        return;
    }

    const skills: Record<string, SkillIndexEntry> = {};
    const files = fs.readdirSync(jsonDir)
        .filter(file => file.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(jsonDir, file);
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

    index['skills'] = skills;

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`技能索引已生成: ${OUTPUT_FILE}`);
}

generateSkillIndex();