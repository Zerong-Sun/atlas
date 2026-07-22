export const ZIWEI_PALACES: Record<string, { theme: string; domains: string[] }> = {
  命宫: { theme: "人格主轴", domains: ["性格", "人生方向", "整体格局"] },
  兄弟: { theme: "同辈关系", domains: ["手足", "同事", "合作"] },
  夫妻: { theme: "伴侣互动", domains: ["婚姻", "合作对象", "吸引模式"] },
  子女: { theme: "创造与后代", domains: ["子女", "作品", "投资"] },
  财帛: { theme: "财务模式", domains: ["收入", "理财", "资源"] },
  疾厄: { theme: "健康压力", domains: ["体质", "隐患", "生活习惯"] },
  迁移: { theme: "外出变动", domains: ["旅行", "环境", "公众形象"] },
  仆役: { theme: "下属朋友", domains: ["团队", "社交", "服务"] },
  官禄: { theme: "事业路径", domains: ["职业", "地位", "成就"] },
  田宅: { theme: "家庭资产", domains: ["房产", "家族", "根基"] },
  福德: { theme: "精神享受", domains: ["兴趣", "福报", "心态"] },
  父母: { theme: "长辈文书", domains: ["父母", "上司", "证件"] },
};

export const ZIWEI_MAJOR_STARS: Record<string, { nature: string; reading: string }> = {
  紫微: { nature: "帝星", reading: "统御、组织、核心意志；宜担责不宜独断。" },
  天机: { nature: "谋略", reading: "策划、变动、学习；宜灵活忌犹豫。" },
  太阳: { nature: "光明", reading: "外放、名声、父性；宜公开忌过度消耗。" },
  武曲: { nature: "财星", reading: "执行、财务、决断；宜务实忌刚硬。" },
  天同: { nature: "福星", reading: "享受、温和、人缘；宜顺势忌懒散。" },
  廉贞: { nature: "囚星", reading: "规则、欲望、边界；宜有原则忌极端。" },
  天府: { nature: "库星", reading: "守成、积累、管理；宜稳健忌封闭。" },
  太阴: { nature: "富星", reading: "内在、滋养、资产；宜细腻忌情绪化。" },
  贪狼: { nature: "欲望", reading: "社交、才艺、桃花；宜节制忌分散。" },
  巨门: { nature: "暗星", reading: "口舌、研究、争议；宜深度忌是非。" },
  天相: { nature: "印星", reading: "协调、服务、贵人；宜辅佐忌依赖。" },
  天梁: { nature: "荫星", reading: "庇护、化解、长辈；宜助人忌说教。" },
  七杀: { nature: "将星", reading: "破局、压力、改革；宜果断忌孤行。" },
  破军: { nature: "耗星", reading: "破旧立新、变动；宜转型忌破坏。" },
};

export const ZIWEI_MUTAGEN: Record<string, string> = {
  禄: "资源流入、收益机会、顺遂之处",
  权: "权责上升、掌控压力、主导议题",
  科: "名誉文书、信用背书、学习曝光",
  忌: "卡点执念、风险债务、需化解之处",
};

export function getPalaceReading(name: string): string {
  const p = ZIWEI_PALACES[name];
  return p ? `${p.theme}：${p.domains.join("、")}` : "";
}

export function getStarReading(name: string): string {
  return ZIWEI_MAJOR_STARS[name]?.reading ?? `${name}：结合宫位与三方四正解读。`;
}
