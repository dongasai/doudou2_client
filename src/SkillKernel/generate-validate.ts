import { validateAllSkills } from './generate-validator';

console.log('开始验证技能配置...\n');

async function runValidation() {
    try {
        const result = await validateAllSkills();
        
        if (result.isValid) {
            console.log('✅ 所有技能配置验证通过!\n');
        } else {
            console.log('❌ 技能配置验证失败:\n');
            result.errors.forEach((error: string) => {
                console.log(`  ${error}`);
            });
            process.exit(1);
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('验证过程发生错误:', errorMessage);
        process.exit(1);
    }
}

runValidation(); 