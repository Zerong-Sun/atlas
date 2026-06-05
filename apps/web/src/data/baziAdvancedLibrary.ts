export type BaziRuleEntry = {
  id: string;
  name: string;
  condition: string;
  meaning: string;
  use: string;
  caution: string;
};

export const BAZI_TEN_GOD_COMBINATIONS: BaziRuleEntry[] = [
  { id: "sha-yin", name: "杀印相生", condition: "七杀透出或有力，同时印星能化杀生日主。", meaning: "压力、规则、竞争转化为学习、资质和权力承接。", use: "事业、考试、管理、专业资格。", caution: "日主太弱且印不接杀，则压力先表现为焦虑。" },
  { id: "shi-shen-sheng-cai", name: "食神生财", condition: "食神有气并生财星，财星不被严重冲克。", meaning: "技能、表达、产品能力转化为收入。", use: "经营、创作、自由职业、销售转化。", caution: "食神太过会懒散，财太旺会透支产出。" },
  { id: "shang-guan-pei-yin", name: "伤官配印", condition: "伤官显露，同时印星制化并承接才华。", meaning: "锋芒、创意和表达被学历、资质、体系收束。", use: "研究、创意、技术、内容、咨询。", caution: "无印则易伤官见官，表现为冲撞规则。" },
  { id: "cai-guan", name: "财官相生", condition: "财星生官星，官星有根或得令。", meaning: "资源、经营、现实投入带来职位、信誉或秩序。", use: "升职、合作、婚姻稳定、企业经营。", caution: "身弱财官旺，容易被责任和成本压住。" },
  { id: "guan-yin", name: "官印相生", condition: "官星生印星，印星生日主。", meaning: "规则、组织、学历、贵人形成正向通道。", use: "体制、考试、职称、管理岗位。", caution: "过旺则保守，缺食伤则行动表达不足。" },
  { id: "bi-jie-duo-cai", name: "比劫夺财", condition: "比肩劫财旺而财星弱或受冲。", meaning: "竞争、分利、人情消耗财务资源。", use: "合伙、借贷、分账、团队利益。", caution: "身弱见比劫也可能是帮扶，不能一概为凶。" },
  { id: "shang-guan-jian-guan", name: "伤官见官", condition: "伤官与正官并见且无印财通关。", meaning: "表达、反叛、技术锋芒冲撞规则权威。", use: "职场冲突、合同争议、考试纪律。", caution: "若有印制伤或财通关，可转为改革能力。" },
  { id: "cai-xing-huai-yin", name: "财星坏印", condition: "财星旺而克印，印星为用。", meaning: "现实利益、消费或关系压力削弱学习与保护。", use: "学业、证照、母系支持、健康恢复。", caution: "印为忌时，财坏印反可推动现实化。" },
];

export const BAZI_PATTERN_DETAILS: BaziRuleEntry[] = [
  { id: "zheng-guan-ge", name: "正官格", condition: "月令主气为正官，官星清透不杂。", meaning: "重秩序、名誉、责任、规范路径。", use: "适合组织、管理、制度化成长。", caution: "忌伤官冲破，亦忌官杀混杂。" },
  { id: "qi-sha-ge", name: "七杀格", condition: "月令七杀有力，需制化得宜。", meaning: "压力强、竞争强，成格则有决断与权柄。", use: "攻坚、管理、风险岗位、竞赛。", caution: "无制化则先论压力、危险和焦虑。" },
  { id: "cai-ge", name: "财格", condition: "月令财星当令，日主能任财。", meaning: "资源、经营、市场、现实收益为主轴。", use: "商业、资产、交易、家庭责任。", caution: "身弱财旺，得财反成负担。" },
  { id: "yin-ge", name: "印格", condition: "月令印星当令且不被财破。", meaning: "学习、资质、保护、文化传承强。", use: "研究、教育、证照、贵人。", caution: "印旺无泄，容易迟滞保守。" },
  { id: "shi-shang-ge", name: "食伤格", condition: "月令食神或伤官当令，泄秀有情。", meaning: "表达、技术、生产、创意输出明显。", use: "内容、技术、产品、教育、表演。", caution: "须看是否生财或配印，否则输出分散。" },
  { id: "cong-ge", name: "从格", condition: "日主极弱无根，顺从旺势。", meaning: "不以扶身为先，而以顺势借势为用。", use: "环境强、平台强、借势发展。", caution: "见根破从时判断会完全改变。" },
  { id: "zhuan-wang", name: "专旺格", condition: "一行极旺成势，日主同党成局。", meaning: "专注、极致、气势纯粹。", use: "专业深耕、单点突破。", caution: "忌逆势强克，宜顺泄其气。" },
];

export const BAZI_SHA_LIBRARY: BaziRuleEntry[] = [
  { id: "tian-yi", name: "天乙贵人", condition: "按日干查贵人地支，命局或岁运见之。", meaning: "贵人、解厄、帮助、转圜空间。", use: "困难事项中看可求助之人。", caution: "受冲空则贵力减弱。" },
  { id: "wen-chang", name: "文昌", condition: "按日干取文昌位，命局或岁运见之。", meaning: "学习、文书、表达、考试灵感。", use: "考试、申请、写作、证照。", caution: "仍需印星和食伤配合。" },
  { id: "tao-hua", name: "桃花", condition: "申子辰见酉，寅午戌见卯，亥卯未见子，巳酉丑见午。", meaning: "吸引力、社交、审美、人缘。", use: "关系、曝光、销售、内容传播。", caution: "忌与劫财、七杀、咸池泛滥同断为感情风险。" },
  { id: "yi-ma", name: "驿马", condition: "申子辰马在寅，寅午戌马在申，亥卯未马在巳，巳酉丑马在亥。", meaning: "迁动、出差、变化、远方机会。", use: "搬迁、旅行、岗位变动。", caution: "逢冲动更明显，逢合可能走不动。" },
  { id: "hua-gai", name: "华盖", condition: "三合局墓库位为华盖。", meaning: "孤高、审美、宗教哲学、专业沉浸。", use: "艺术、研究、灵性、独处能力。", caution: "关系题中可能表现为距离感。" },
  { id: "yang-ren", name: "羊刃", condition: "阳干帝旺位多称羊刃。", meaning: "强势、执行、锋利、风险并存。", use: "竞争、体能、管理、手术刀式问题。", caution: "忌再逢冲刑，注意安全与冲动。" },
  { id: "kong-wang", name: "空亡", condition: "以日柱旬空查地支。", meaning: "落空、未落实、心理距离、延迟。", use: "承诺、财物、关系确认。", caution: "填实、冲实时可转实。" },
];

export const BAZI_LUCK_INTERACTIONS: BaziRuleEntry[] = [
  { id: "yun-year-trigger", name: "运年触发", condition: "大运定十年背景，流年冲合刑害原局关键柱。", meaning: "大运像气候，流年像事件按钮。", use: "判断某年为何显化。", caution: "无原局伏笔，岁运很难凭空生事。" },
  { id: "useful-god-arrives", name: "用神到位", condition: "大运或流年出现用神，并能到达月令、日主或事项宫。", meaning: "补足命局所需，事项更容易推进。", use: "事业、财务、关系窗口。", caution: "用神被合走、冲坏、空亡时需降权。" },
  { id: "忌神引动", name: "忌神引动", condition: "大运流年加强命局失衡处。", meaning: "旧问题放大，常表现为压力、冲突或健康提醒。", use: "风险预警和策略收缩。", caution: "忌神也可能带来必要训练，不只读坏。" },
  { id: "he-chong-original", name: "合冲原局", condition: "岁运与原局夫妻宫、事业宫、财星官星发生合冲。", meaning: "关系、岗位、资金结构被触发。", use: "婚恋、换岗、投资、搬迁。", caution: "合有羁绊也有合作，冲有破坏也有启动。" },
];

export const BAZI_CLASSIC_CONDITION_MAP: BaziRuleEntry[] = [
  { id: "yue-ling-first", name: "先看月令", condition: "任何命盘先取月支季节与主气。", meaning: "月令决定旺衰和格局入口。", use: "映射到页面：日主旺衰、格局、调候优先展示。", caution: "不能只用年柱生肖断事。" },
  { id: "qiang-ruo-yong", name: "强弱取用", condition: "日主强弱确定后，再论扶抑、泄耗、通关、调候。", meaning: "同一十神在不同强弱下含义相反。", use: "将十神解释绑定日主强弱。", caution: "避免把财官印食固定为吉凶。" },
  { id: "ge-ju-then-cai-guan", name: "格局既成方论财官", condition: "月令格局成立且用神有力。", meaning: "先判断结构是否成立，再细看财官名利。", use: "格局卡片显示成格/破格条件。", caution: "格局未成时先看补救。" },
  { id: "sui-yun-bing-lin", name: "岁运并临", condition: "大运与流年同柱或同类力量重叠。", meaning: "阶段主题被加倍，事件感更强。", use: "流年列表标注强触发年份。", caution: "吉凶仍看该柱是否为喜用。" },
];
