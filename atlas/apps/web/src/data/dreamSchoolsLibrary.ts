export interface DreamSchool {
  id: string;
  title: string;
  summary: string;
  method: string[];
  taboos: string[];
  outputStructure: string[];
}

export const DREAM_SCHOOLS: DreamSchool[] = [
  {
    id: "chinese",
    title: "中国梦占",
    summary: "以物象、人物、方位、吉凶语汇为主，保留古籍与民俗解释的原始味道。",
    method: ["先列梦中物象", "查类象与方位", "结合问事背景", "给出倾向性建议"],
    taboos: ["不断言具体灾祸日期", "不替代医学诊断", "不恐吓式解梦"],
    outputStructure: ["物象清单", "传统象征", "事类倾向", "行动建议"],
  },
  {
    id: "jungian",
    title: "荣格象征",
    summary: "把梦看作潜意识材料，重点分析阴影、原型和补偿机制。",
    method: ["识别原型意象", "联系个人生活", "探索阴影与补偿", "提出整合方向"],
    taboos: ["不将象征绝对化", "不越界心理诊断", "尊重个体差异"],
    outputStructure: ["核心意象", "原型层面", "个人关联", "整合提示"],
  },
  {
    id: "reflection",
    title: "精神反思",
    summary: "不做绝对预言，转为情绪、压力、关系与行动建议，适合 LLM 稳定输出。",
    method: ["复述梦境要素", "标注不确定性", "联系现实压力", "给出可执行反思"],
    taboos: ["不预测投资/法律/医疗结果", "不监视第三方", "不绝对化"],
    outputStructure: ["梦境复述", "情绪线索", "现实关联", "反思问题"],
  },
  {
    id: "folk",
    title: "民俗对照",
    summary: "并列周公解梦、地方说法与口传象征，展示同一符号的不同解释。",
    method: ["列出多种说法", "标注来源类型", "比较异同", "交由梦者判断"],
    taboos: ["不宣称唯一正确", "不引用现代译本逐字", "注明不确定性"],
    outputStructure: ["符号", "说法 A/B", "共同点", "反思问题"],
  },
];

export function getDreamSchool(id: string): DreamSchool | undefined {
  return DREAM_SCHOOLS.find((s) => s.id === id);
}
