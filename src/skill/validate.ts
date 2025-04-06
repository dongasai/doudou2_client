import { validateAllSkills } from './validator';

async function runValidation() {
    console.log('开始验证技能配置...\n');

    const result = await validateAllSkills();

    if (result.isValid) {
        console.log('✅ 所有技能配置验证通过!\n');
    } else {
        console.log('❌ 技能配置验证失败!\n');
        result.errors.forEach(error => {
            console.log(`- ${error}`);
        });
        console.log('\n总计错误数:', result.errors.length);
        process.exit(1);
    }
}

runValidation().catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
}); 