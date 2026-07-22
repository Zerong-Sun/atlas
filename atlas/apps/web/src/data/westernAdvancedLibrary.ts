export const WESTERN_HOUSES: Record<number, { theme: string; domains: string[] }> = {
  1: { theme: "自我与外在表现", domains: ["人格", "外貌", "生命活力"] },
  2: { theme: "资源与价值观", domains: ["金钱", "所有物", "自我价值"] },
  3: { theme: "沟通与学习", domains: [" siblings", "短途", "思维"] },
  4: { theme: "家庭与根基", domains: ["父母", "房产", "内在安全感"] },
  5: { theme: "创造与恋爱", domains: ["子女", "娱乐", "投机"] },
  6: { theme: "工作与健康", domains: ["日常", "服务", "习惯"] },
  7: { theme: "伴侣与合作", domains: ["婚姻", "公开敌人", "契约"] },
  8: { theme: "共享与转化", domains: ["遗产", "性", "心理深度"] },
  9: { theme: "信念与远行", domains: ["高等教育", "哲学", "长途"] },
  10: { theme: "事业与公众", domains: ["地位", "名誉", "野心"] },
  11: { theme: "社群与愿景", domains: ["朋友", "团体", "希望"] },
  12: { theme: "潜意识与疗愈", domains: ["隐藏", "灵性", "退隐"] },
};

export const WESTERN_ASPECTS: Record<string, { tone: string; reading: string }> = {
  合相: { tone: "融合", reading: "两股能量合一，主题被强化，需留意过度。" },
  六合: { tone: "和谐", reading: "机会与协助，宜主动配合。" },
  刑相: { tone: "张力", reading: "内在摩擦与成长压力，需调整策略。" },
  拱相: { tone: "流畅", reading: "天赋与资源自然流动，宜善用之。" },
  冲相: { tone: "对立", reading: "两极拉扯，宜寻求平衡而非极端。" },
};

export const WESTERN_PLANET_IN_SIGN: Record<string, string> = {
  太阳: "核心意志与生命主题",
  月亮: "情绪需求与安全感",
  水星: "思维、沟通与学习方式",
  金星: "关系、审美与吸引模式",
  火星: "行动力、欲望与冲突方式",
  木星: "扩张、机会与信念",
  土星: "限制、责任与长期结构",
  天王星: "突变、独立与创新",
  海王星: "梦想、直觉与边界模糊",
  冥王星: "深层转化与权力议题",
};

export function getHouseReading(num: number): string {
  const h = WESTERN_HOUSES[num];
  return h ? `${h.theme}：${h.domains.join("、")}` : "";
}

export function getAspectReading(aspect: string): string {
  return WESTERN_ASPECTS[aspect]?.reading ?? "";
}
