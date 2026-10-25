import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { DIVINATION_METHODS } from '../packages/method-data/src/divinationMethods.ts';
import { CULTURE_RESEARCH, CULTURE_SOURCES, CULTURE_EVIDENCE_LABELS, CULTURE_RESEARCH_VERSION } from '../packages/method-data/src/cultureResearch.ts';

const methods = DIVINATION_METHODS.filter(method => method.status === 'ready');
const sections = methods.map((method, index) => {
  const item = CULTURE_RESEARCH[method.id];
  if (!item) throw new Error(`Missing cultural research: ${method.id}`);
  return `## ${index + 1}. ${method.title}（${method.id}）\n\n` +
    `**时代与范围：** ${item.period}\n\n` +
    `**为什么使用：** ${item.why}\n\n` +
    `**历史案例：${item.history.title}。** ${item.history.text}\n\n` +
    `**证据等级：** ${CULTURE_EVIDENCE_LABELS[item.history.evidence]}。\n\n` +
    `**人物与使用证据：** ${item.people}\n\n` +
    `**怎样借此理解文化：** ${item.lens}\n\n` +
    `**体验前：** ${item.before}\n\n**体验后：** ${item.after}\n\n` +
    `**不可混淆之处：** ${item.boundary}\n\n` +
    `**资料：** ${item.sourceIds.map(id => { const s = CULTURE_SOURCES[id]; return `[${s.title}](${s.url})`; }).join('；')}。\n`;
});
const bibliography = Object.values(CULTURE_SOURCES).map(source =>
  `- **[${source.id}] [${source.title}](${source.url})** — ${source.institution}。支持范围：${source.scope}`,
).join('\n');
const report = `# Atlas 占卜与文化研究报告\n\n研究日期：${CULTURE_RESEARCH_VERSION}。覆盖当前全部 ${methods.length} 种就绪占法，${Object.keys(CULTURE_SOURCES).length} 项资料。\n\n` +
  `## 研究原则与结论\n\n本报告先于界面接入整理，正文与应用离线文库共用同一份结构化资料。历史案例取自古籍原文、博物馆与图书馆目录、学术研究、遗产机构及具体实践社群。中文摘要与学习问题为 Atlas 编写，不复制馆方图片或整段原文。\n\n` +
  `“历史有记载”说明存在文本、器物或实践，不说明预测经过验证。名人身份分为实践者、作者、译编者、赞助者、批评者和故事人物；证据不足时明确留白。紫微的同名文本、梅花的作者题署、现代占星骰子与生命路径数的起源尤其不能混为定论。现代神谕卡与 Atlas 原创练习不包装成古代传统。\n\n` +
  `社会功能与文化视角属于基于材料的编辑性解释；同一文明内部可能有不同社群和反对意见。寺庙现行规则只代表该庙，非遗登记年份不是起源年份，出版或收藏记录不证明书中事件都实际发生。\n\n` +
  `## 产品落点\n\n每种方法操作前显示“为什么人们会用它”，可展开历史、人物、文化背景与来源。课程内附体验前后的学习问题。网页和手机使用相同数据；无 API、无账号时仍能阅读。AI 的术语解说与报告解读都提供当前方法的材料和资料 id，要求标注出处及不确定性；连接失败回退到清楚标注的离线文化文库，不假装生成了个性化解读。\n\n` +
  sections.join('\n') + `\n## 资料目录与支持范围\n\n检索与内容核对日期：${CULTURE_RESEARCH_VERSION}。外部页面可能改版或限制自动访问；应用保存的是自行编写的摘要，阅读正文不依赖这些链接在线。\n\n${bibliography}\n`;
const output = new URL('../docs/research/divination-cultures-2026-10-25.md', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== report) throw new Error('Culture report is stale; run npm run culture:report');
} else {
  mkdirSync(new URL('../docs/research/', import.meta.url), { recursive: true });
  writeFileSync(output, report);
}
console.log(`Culture research: ${methods.length} methods, ${Object.keys(CULTURE_SOURCES).length} sources; report ${process.argv.includes('--check') ? 'verified' : 'written'}.`);
