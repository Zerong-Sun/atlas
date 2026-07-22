export type QimenEntry = {
  name: string;
  nature: string;
  meaning: string;
  usage: string;
};

export type QimenClassicNote = {
  source: string;
  principle: string;
  paraphrase: string;
  application: string;
  caution: string;
};

export type QimenQuestionType = {
  type: string;
  focus: string;
  usefulGod: string;
  readingKey: string;
};

export type QimenPattern = {
  id: string;
  name: string;
  category: string;
  level: "大吉" | "吉" | "平" | "凶" | "大凶";
  formation: string;
  meaning: string;
  applications: string;
  cautions: string;
  actionHint: string;
  predicate?: { type: string; heaven?: string; earth?: string; door?: string; palace?: string };
};

export type QimenRule = {
  title: string;
  steps: string[];
  note: string;
};

export type QimenDirectionTranslation = {
  palace: string;
  direction: string;
  element: string;
  spatial: string;
  action: string;
  people: string;
  timing: string;
};

export const QIMEN_PALACES: QimenEntry[] = [
  { name: "坎一宫", nature: "水 / 北 / 险陷", meaning: "主流动、阻隔、隐情、资源暗线。", usage: "问事看是否需等待、绕行或先探明信息。" },
  { name: "坤二宫", nature: "土 / 西南 / 承载", meaning: "主协作、承接、缓慢积累和现实条件。", usage: "问合作看能否落地，问人事看支持系统。" },
  { name: "震三宫", nature: "木 / 东 / 动发", meaning: "主动机、启动、突发消息和行动冲力。", usage: "问推进看启动点，也看是否躁动过快。" },
  { name: "巽四宫", nature: "木 / 东南 / 入散", meaning: "主沟通、传播、渗透、文书和风声。", usage: "问谈判、申请、传播时重点观察。" },
  { name: "中五宫", nature: "土 / 中 / 枢纽", meaning: "主中枢、卡点、系统性问题和转盘核心。", usage: "落中宫常需转寄坤宫，并看全局压力。" },
  { name: "乾六宫", nature: "金 / 西北 / 刚健", meaning: "主权力、规则、上级、结构和决断。", usage: "问组织、审批、权威资源时重点观察。" },
  { name: "兑七宫", nature: "金 / 西 / 口舌", meaning: "主表达、喜悦、交易、口舌和破损。", usage: "问沟通看说服力，也防承诺过满。" },
  { name: "艮八宫", nature: "土 / 东北 / 止蓄", meaning: "主停顿、边界、积蓄、阻隔和山门。", usage: "问时机看是否该止，问阻力看边界所在。" },
  { name: "离九宫", nature: "火 / 南 / 显明", meaning: "主曝光、文书、名声、热度和洞察。", usage: "问公开、考试、品牌、证据时重点观察。" },
];

export const QIMEN_DOORS: QimenEntry[] = [
  { name: "休门", nature: "吉 / 水 / 休养", meaning: "利休整、调解、恢复、资源回流。", usage: "适合修复关系、养势蓄力，不宜强攻。" },
  { name: "生门", nature: "吉 / 土 / 生发", meaning: "利财务、成长、恢复、经营和长期收益。", usage: "问事业财务常作积极信号，仍需看宫受制。" },
  { name: "伤门", nature: "凶 / 木 / 损伤", meaning: "主冲突、受伤、破坏、竞争与技术切入。", usage: "问竞争可用其锋，问关系需防伤害。" },
  { name: "杜门", nature: "平偏凶 / 木 / 闭塞", meaning: "主隐藏、保密、阻隔、技术和闭门研究。", usage: "宜保密筹划，不宜要求马上公开。" },
  { name: "景门", nature: "平偏吉 / 火 / 显象", meaning: "主名声、文书、展示、审美和表面热度。", usage: "问宣传考试有利，问实质需再看星神。" },
  { name: "死门", nature: "凶 / 土 / 终止", meaning: "主停滞、旧事、结束、病弱和低活性。", usage: "问发展多示阻滞，宜收尾、复盘、止损。" },
  { name: "惊门", nature: "凶 / 金 / 惊扰", meaning: "主口舌、惊恐、消息波动、官非风险。", usage: "问沟通需防误会，问危机看消息源。" },
  { name: "开门", nature: "吉 / 金 / 开启", meaning: "利事业、公开、见贵、交易、行动启动。", usage: "问工作项目常作可推进信号，看宫星配合。" },
];

export const QIMEN_STARS: QimenEntry[] = [
  { name: "天蓬", nature: "水 / 凶中有智", meaning: "主欲望、风险、谋略、暗流和资源。", usage: "宜查风险与隐性动机，忌贪快贪多。" },
  { name: "天任", nature: "土 / 吉", meaning: "主承载、信用、稳定、执行和积累。", usage: "利稳步推进、土地资产、长期职责。" },
  { name: "天冲", nature: "木 / 平", meaning: "主行动、冲击、速度、突破和震动。", usage: "适合启动突破，也要控节奏和冲突。" },
  { name: "天辅", nature: "木 / 吉", meaning: "主文教、帮助、辅佐、策略与贵人。", usage: "利学习、咨询、文书和借助专业力量。" },
  { name: "天英", nature: "火 / 平偏躁", meaning: "主名声、表达、光彩、热度与虚火。", usage: "利展示传播，需防只热闹无落地。" },
  { name: "天芮", nature: "土 / 凶", meaning: "主病符、问题、负担、旧疾和瑕疵。", usage: "问健康需谨慎，问项目看历史包袱。" },
  { name: "天柱", nature: "金 / 凶", meaning: "主破败、口舌、压力、制度冲撞。", usage: "问合作防硬碰硬，问规则看约束。" },
  { name: "天心", nature: "金 / 吉", meaning: "主医药、管理、决断、技术和修正。", usage: "利诊断、治理、专业判断和修复方案。" },
  { name: "天禽", nature: "土 / 中和", meaning: "主中枢、综合、承转、整体平衡。", usage: "常随中五寄宫，看全局协调与核心矛盾。" },
];

export const QIMEN_GODS: QimenEntry[] = [
  { name: "值符", nature: "大吉 / 首领", meaning: "主核心资源、权威、贵人、主导权。", usage: "看全局主气与最高可用资源。" },
  { name: "腾蛇", nature: "凶 / 虚惊", meaning: "主缠绕、疑虑、幻象、反复和虚耗。", usage: "需辨真伪，防想象放大问题。" },
  { name: "太阴", nature: "吉 / 隐助", meaning: "主暗助、细腻、女性、隐藏资源和策划。", usage: "利幕后筹备、细节修复、柔性沟通。" },
  { name: "六合", nature: "吉 / 合作", meaning: "主合作、婚恋、契约、人和与协调。", usage: "问关系合作重点看是否受冲克。" },
  { name: "白虎", nature: "凶 / 压迫", meaning: "主伤害、冲突、压力、强势和硬风险。", usage: "问安全、争执、法律压力时需谨慎。" },
  { name: "玄武", nature: "凶 / 隐秘", meaning: "主隐瞒、暧昧、信息不明、欺诳和暗线。", usage: "问信任需查证，问财物防漏洞。" },
  { name: "九地", nature: "吉 / 稳藏", meaning: "主稳定、低调、积蓄、守成和深根。", usage: "利守势、长期布局、资产沉淀。" },
  { name: "九天", nature: "吉 / 高举", meaning: "主远景、扩张、公开、上升和高处。", usage: "利发布、远行、战略提升，但忌虚浮。" },
];

export const QIMEN_STEMS: QimenEntry[] = [
  { name: "乙奇", nature: "三奇 / 木", meaning: "主柔和、文书、关系、曲折求成。", usage: "利调停、协商、文案，忌被庚冲克。" },
  { name: "丙奇", nature: "三奇 / 火", meaning: "主明亮、权势、曝光、突破和热能。", usage: "利公开行动，需防过热和冒进。" },
  { name: "丁奇", nature: "三奇 / 火", meaning: "主细光、灵感、信息、女性和精巧。", usage: "利创意、信号、细节洞察与暗线沟通。" },
  { name: "戊仪", nature: "六仪 / 土", meaning: "主资本、根基、厚重、平台和显性资源。", usage: "问财与项目基础常看戊土状态。" },
  { name: "己仪", nature: "六仪 / 土", meaning: "主杂务、承载、旧账、隐性负担。", usage: "问执行看琐事和拖累，宜整理边界。" },
  { name: "庚仪", nature: "六仪 / 金", meaning: "主阻力、竞争、硬伤、敌对与变故。", usage: "常作压力点，需看是否制化或避开。" },
  { name: "辛仪", nature: "六仪 / 金", meaning: "主错误、细小损伤、精密、问题暴露。", usage: "问文书合同防瑕疵，问身体防小疾。" },
  { name: "壬仪", nature: "六仪 / 水", meaning: "主流动、远行、欲望、变化和水路。", usage: "问流动与外部机会，看是否泛滥失控。" },
  { name: "癸仪", nature: "六仪 / 水", meaning: "主隐微、等待、暗流、收束和雨露。", usage: "问隐情或延迟看癸水所落宫。" },
];

export const QIMEN_QUESTION_TYPES: QimenQuestionType[] = [
  { type: "事业项目", focus: "项目进退、岗位变动、合作推进", usefulGod: "开门、值符、日干、时干", readingKey: "先看开门与日干关系，再看值符资源和宫位生克。" },
  { type: "财务经营", focus: "收益、投入、资源周转", usefulGod: "生门、戊、财方、日干", readingKey: "生门为财路，戊为资金根基，受克则先控成本。" },
  { type: "关系合作", focus: "伴侣、客户、同事、签约", usefulGod: "六合、乙奇、日干与对方用神", readingKey: "六合看合意，乙奇看柔性沟通，冲克多则需重谈边界。" },
  { type: "出行迁移", focus: "出差、搬迁、远行、方向", usefulGod: "时干、马星、方位宫、开门", readingKey: "取所往方位与时干，吉门吉神可行，凶格宜改期。" },
  { type: "考试文书", focus: "考试、申请、合同、发表", usefulGod: "景门、天辅、丁奇、文书宫", readingKey: "景门看呈现，天辅看学习支援，丁奇看信息细节。" },
  { type: "健康修复", focus: "身体状态、恢复、调养", usefulGod: "天芮、死门、天心、日干", readingKey: "只作状态提醒；天心可示医治修正，凶象需现实就医。" },
];

export const QIMEN_ANALYSIS_STEPS = [
  "定问题：把问题限定为一个事项、一个时间段、一个主体。",
  "定局盘：记录时间地点，确认阴遁阳遁、局数和旬首。",
  "取用神：按事项取门、星、神、干，必要时取日干为问者。",
  "看宫位：观察用神落宫的五行、旺衰、空亡、入墓。",
  "看门星神：门主行动路径，星主气质能力，神主外部助阻。",
  "看干盘关系：天盘地盘干的生克、合冲、伏吟反吟。",
  "看格局：识别三奇得使、门迫、击刑、庚格等关键结构。",
  "落建议：把吉凶翻译成时机、方位、沟通和风险控制。",
];

export const QIMEN_RELATIONS: QimenEntry[] = [
  { name: "门迫", nature: "门克宫", meaning: "行动方式与环境不合，容易费力或被迫。", usage: "建议换方法、换场域，避免硬推。" },
  { name: "击刑", nature: "宫位受刑", meaning: "内部结构有摩擦，易急躁、损耗或失序。", usage: "先处理规则和边界，再推进事项。" },
  { name: "空亡", nature: "落空", meaning: "象意暂不落实，消息虚、资源空或时机未到。", usage: "宜查证、等待、补材料，不宜马上定论。" },
  { name: "入墓", nature: "收敛入库", meaning: "力量被收藏，事情难展开，需钥匙或外力打开。", usage: "问财可为入库，问行动多示迟滞。" },
  { name: "伏吟", nature: "重复不动", meaning: "局势原地回旋，旧问题重复出现。", usage: "适合复盘修正，不宜期待快速变化。" },
  { name: "反吟", nature: "反复动荡", meaning: "事态翻转、来回、迁动，稳定性不足。", usage: "宜留备选方案，避免一次押死。" },
];

export const QIMEN_PATTERNS: QimenPattern[] = [
  { id: "long-hui-shou", name: "龙回首", category: "三奇吉格", level: "大吉", formation: "天盘乙奇加地盘戊仪，或乙奇得生扶而回归戊土根基。", meaning: "旧资源回头、贵人复顾、文书关系有修复机会。", applications: "利求职复联、旧客回款、关系缓和、方案二次提交。", cautions: "若临凶门凶神或落空亡，只代表消息回头，不等于马上成事。", actionHint: "主动复盘旧线索，用柔性文本、礼貌拜访、补材料打开入口。" },
  { id: "niao-die-xue", name: "鸟跌穴", category: "三奇吉格", level: "吉", formation: "天盘丙奇加地盘戊仪，火明入土库，光落有根。", meaning: "名声、机会、消息落到可承接的平台，利显化与成交。", applications: "利发表、宣传、面试、投标、融资曝光、找关键负责人。", cautions: "火土过燥则虚热，需看生门、开门与戊土是否受制。", actionHint: "把亮点落成具体材料、报价、日程和负责人。" },
  { id: "qing-long-tao-zou", name: "青龙逃走", category: "三奇凶格", level: "凶", formation: "天盘乙奇加地盘辛仪，乙木受辛金暗伤。", meaning: "原本可用的关系、文书、柔性资源走失或变质。", applications: "防客户流失、合同瑕疵、口头承诺改变、女性/文案相关误差。", cautions: "不是必败，若天辅、六合、生门同助，可改为补救与重谈。", actionHint: "先查版本、证据、联系人和权限，避免只靠感情牌。" },
  { id: "bai-hu-chang-kuang", name: "白虎猖狂", category: "三奇凶格", level: "大凶", formation: "天盘辛仪加地盘乙奇，辛金反伤乙木，常并白虎、伤门加重。", meaning: "硬冲突压倒柔性资源，易有伤害、责难、处罚、破损。", applications: "争议、诉讼、投诉、事故、安全、关系撕裂类问题重点观察。", cautions: "用于风险提醒，不作恐吓；现实安全、医疗、法律判断优先。", actionHint: "降级冲突，保留证据，暂停正面硬碰，找第三方规则介入。" },
  { id: "san-qi-de-shi", name: "三奇得使", category: "核心吉格", level: "大吉", formation: "乙丙丁三奇临值使门，且不受迫、刑、墓、空严重破坏。", meaning: "机会、名望、信息被行动入口承接，谋事有成形条件。", applications: "利开局、求名、申请、见贵、签约、发布。", cautions: "须看用神相关；无关宫位得奇只作背景资源。", actionHint: "抓值使所指路径行动，优先用门象对应的现实渠道。" },
  { id: "yu-nv-shou-men", name: "玉女守门", category: "门奇吉格", level: "吉", formation: "丁奇临值使门或吉门，常配太阴、六合更稳。", meaning: "细节、暗助、女性贵人、文书信号守住入口。", applications: "利私下沟通、创作、邀约、信息差、关系修复。", cautions: "忌大张旗鼓，临惊门腾蛇防暧昧误解。", actionHint: "小范围精修方案，先私聊确认，再公开推进。" },
  { id: "tian-dun", name: "天遁", category: "遁格", level: "大吉", formation: "丙奇、开门、天盘吉神会合，得天时与公开通道。", meaning: "上级、政策、曝光、远景资源打开。", applications: "利见贵、升迁、发布、争取名额、官方流程。", cautions: "临空亡则名有而实未至。", actionHint: "走公开、正式、高层或平台化路线。" },
  { id: "di-dun", name: "地遁", category: "遁格", level: "吉", formation: "乙奇、生门、九地或坤艮土宫相会。", meaning: "地利、资产、库存、长期资源可承接。", applications: "利置业、仓储、经营、养护、稳态合作。", cautions: "推进慢，忌催逼。", actionHint: "先稳现金流、场地、合同和基础设施。" },
  { id: "ren-dun", name: "人遁", category: "遁格", level: "吉", formation: "丁奇、休门、太阴或六合相会，得人和。", meaning: "人情、协商、照护、幕后支持有效。", applications: "利谈判、修复、求助、内部协调。", cautions: "过度依赖人情会削弱规则保障。", actionHint: "找中间人、老关系、私下协调窗口。" },
  { id: "yun-dun", name: "云遁", category: "遁格", level: "吉", formation: "奇门遇九天、景门或离宫，象在高处与传播。", meaning: "声量、传播、远程渠道带来机会。", applications: "利线上发布、品牌扩散、远方消息。", cautions: "易虚浮，需落到转化指标。", actionHint: "把曝光转成名单、预约、报价或文档。" },
  { id: "feng-dun", name: "风遁", category: "遁格", level: "吉", formation: "奇门遇巽宫、杜门或天辅，象在渗透与策略。", meaning: "信息穿透、研究、技术路线有效。", applications: "利调研、谈判、秘密筹划、技术突破。", cautions: "临玄武防信息不实。", actionHint: "低调搜集证据，小步试探。" },
  { id: "hu-dun", name: "虎遁", category: "遁格", level: "平", formation: "奇门遇白虎、伤门或庚辛，但有制化。", meaning: "以强硬、纪律、竞争打开局面。", applications: "利维权、竞标、攻坚、训练。", cautions: "无制则转为伤害与官非。", actionHint: "用规则和证据硬推进，避免情绪冲撞。" },
  { id: "long-dun", name: "龙遁", category: "遁格", level: "吉", formation: "乙奇、生发之门与震巽木宫相得。", meaning: "生机回升，适合启动、复苏、拓客。", applications: "利新品、学习、关系重启、市场开拓。", cautions: "木旺无制则急躁分散。", actionHint: "从一个明确增长点启动。" },
  { id: "gui-dun", name: "鬼遁", category: "遁格", level: "凶", formation: "奇仪入玄武、死门、杜门、阴暗受制之地。", meaning: "隐情、欺瞒、旧病旧账、不可见成本浮现。", applications: "用于查风险、审计、失物、隐秘关系。", cautions: "不可仅凭此格指控他人。", actionHint: "做证据链、权限审查和第三方核验。" },
  { id: "geng-jia-ri-gan", name: "庚加日干", category: "庚格", level: "凶", formation: "天盘庚加地盘日干。", meaning: "外部阻力、竞争者、硬规则压到问者。", applications: "防阻碍、追责、竞争、延期。", cautions: "若用神为竞争攻坚，庚也可作刀锋。", actionHint: "先识别谁在施压，再决定避、制、借法。" },
  { id: "ri-gan-jia-geng", name: "日干加庚", category: "庚格", level: "凶", formation: "天盘日干加地盘庚。", meaning: "问者主动碰到阻力，或自己把问题推向硬碰硬。", applications: "关系冲突、谈判破裂、项目卡审批时常见。", cautions: "可通过改路径、换时间、换角色缓和。", actionHint: "减少正面冲突，改成材料、流程、第三人沟通。" },
  { id: "fu-yin", name: "伏吟", category: "全局结构", level: "凶", formation: "星门伏原宫，天盘地盘同位或大体不动。", meaning: "旧事重来、原地盘旋、进展迟缓。", applications: "利复盘、修旧、守成，不利求快。", cautions: "若问失物、旧人，伏吟反而提示仍在旧处。", actionHint: "回到原问题、原文件、原负责人处处理。" },
  { id: "fan-yin", name: "反吟", category: "全局结构", level: "凶", formation: "星门冲对宫，盘面大幅对冲。", meaning: "反复、迁动、翻转、计划不稳。", applications: "搬迁、出行、离合、变更类事项明显。", cautions: "动中有机，静守反受扰。", actionHint: "保留备选方案和撤退路线。" },
  { id: "men-po", name: "门迫", category: "关系结构", level: "凶", formation: "门五行克落宫五行。", meaning: "行动方式压迫环境，费力且容易被迫。", applications: "项目推进、沟通、出行择方需重点降权。", cautions: "吉门受迫仍吉力打折。", actionHint: "换方法、换入口、换方位。" },
  { id: "ji-xing", name: "击刑", category: "关系结构", level: "凶", formation: "宫位、干支触发自刑或刑伤结构。", meaning: "内耗、急躁、失序、局部损伤。", applications: "防操作失误、团队内耗、身体损伤。", cautions: "小事可表现为烦躁和返工。", actionHint: "先定规则、流程和边界。" },
  { id: "ru-mu", name: "入墓", category: "关系结构", level: "平", formation: "用神或关键干落墓库之宫。", meaning: "力量收藏，行动迟滞；问财可为入库。", applications: "财物、档案、库存、旧案、身体恢复。", cautions: "须分收藏与困住。", actionHint: "找钥匙：权限、凭证、时间点或开启条件。" },
  { id: "kong-wang", name: "空亡", category: "关系结构", level: "凶", formation: "用神落旬空。", meaning: "信息未实、资源未到、承诺悬空。", applications: "问消息、合同、到款、关系确认要谨慎。", cautions: "冲实、填实之时可转实。", actionHint: "等待确认，不用空消息做最终决策。", predicate: { type: "kongWang" } },
  { id: "yi-qi-de-shi", name: "乙奇得使", category: "门奇吉格", level: "吉", formation: "乙奇临值使门。", meaning: "柔性资源被行动入口承接。", applications: "利协商、文书、关系修复。", cautions: "须看用神相关。", actionHint: "走私下沟通渠道。", predicate: { type: "stemOnDoor", heaven: "乙", earth: "" } },
  { id: "bing-qi-de-shi", name: "丙奇得使", category: "门奇吉格", level: "吉", formation: "丙奇临值使门。", meaning: "曝光与突破被行动入口承接。", applications: "利发布、面试、宣传。", cautions: "火土过燥则虚热。", actionHint: "把亮点落成具体材料。", predicate: { type: "stemOnDoor", heaven: "丙", earth: "" } },
  { id: "geng-jia-shi-gan", name: "庚加时干", category: "庚格", level: "凶", formation: "天盘庚加地盘时干。", meaning: "阻力在时机与执行层面显现。", applications: "防延期、审批卡顿。", cautions: "可换时间或角色。", actionHint: "改走流程与第三人沟通。", predicate: { type: "stemCombo", heaven: "庚", earth: "时" } },
  { id: "kai-men-qian", name: "开门临乾", category: "门宫格", level: "吉", formation: "开门落乾六宫。", meaning: "事业、规则、上级通道打开。", applications: "利见贵、审批、公开项目。", cautions: "需看门迫与空亡。", actionHint: "走正式、高层路线。", predicate: { type: "doorAtPalace", door: "开门", palace: "乾六" } },
  { id: "sheng-men-kun", name: "生门临坤", category: "门宫格", level: "吉", formation: "生门落坤二宫。", meaning: "财路与落地平台相合。", applications: "利经营、置业、协作。", cautions: "推进偏慢。", actionHint: "先稳基础再扩张。", predicate: { type: "doorAtPalace", door: "生门", palace: "坤二" } },
];

export const QIMEN_ZHIFU_ZHISHI_RULES: QimenRule[] = [
  { title: "值符定位", steps: ["取起局时辰干支，定其所在旬。", "旬首皆以甲为首：甲子、甲戌、甲申、甲午、甲辰、甲寅。", "旬首所遁六仪所在宫，为值符初始宫。", "值符随天盘星转，代表本局最高主气、权威、资源。"], note: "产品解读中，值符不是单独吉凶，而是全局主导力量。" },
  { title: "值使定位", steps: ["值使为旬首所在宫原始八门。", "按时干推动八门落宫，值使门为行动入口。", "问事优先看值使与用神关系，再看门迫、空亡、格局。"], note: "值使适合翻译成现实路径：找谁、走什么流程、从哪里切入。" },
];

export const QIMEN_DUN_RULES: QimenRule[] = [
  { title: "阴遁阳遁", steps: ["冬至后至夏至前用阳遁，阳气生发，九星九门顺布。", "夏至后至冬至前用阴遁，阴气收藏，九星九门逆布。", "边界日以节气交节时刻为准，而不是民用日期零点。"], note: "当前产品生成器使用日期近似；高精度版应接入逐年节气时刻。" },
  { title: "拆补法", steps: ["以二十四节气为局数依据。", "每节气十五日分上中下三元，每元五日。", "不足或超过部分按节气前后拆分补足。"], note: "拆补法简单稳定，适合多数时家奇门排盘。" },
  { title: "置闰法", steps: ["当节气与六十甲子三元错位过大时设置闰奇。", "以冬至、夏至前后累积误差校正局序。", "置闰会影响局数，不改变四柱本身。"], note: "不同流派有差异；产品需标注采用口径，避免混盘。" },
];

export const QIMEN_TIMING_RULES: QimenRule[] = [
  { title: "应期主轴", steps: ["先看用神旺衰：旺相应快，休囚应慢。", "再看冲合填实：空亡待填，入墓待冲开，合住待冲，冲动待合。", "门主行动速度：开、生、伤、景较快，休、杜、死较慢，惊门多突发消息。", "宫位定时间象：一宫一数，可转为日、时、月，须按问题时窗缩放。"], note: "应期输出为窗口，不给绝对承诺日期。" },
  { title: "常用取法", steps: ["近期小事取时、日。", "项目合作取日、旬、月。", "财务经营取月、季。", "长期关系或事业取月、年，并看复盘节点。"], note: "同盘多应期并见时，取与用神和问题最相关者。" },
];

export const QIMEN_DIRECTION_TRANSLATIONS: QimenDirectionTranslation[] = [
  { palace: "坎一宫", direction: "北", element: "水", spatial: "低处、水边、流动渠道、隐蔽处", action: "查资料、等消息、走线上或暗线", people: "中年男性、流动职业、信息中介", timing: "一数，常取一日、一周或子时" },
  { palace: "坤二宫", direction: "西南", element: "土", spatial: "平地、社区、仓库、后勤、母系空间", action: "承接、协作、补材料、稳基础", people: "母亲、女性长辈、后勤支持者", timing: "二数，常取二日、两周或未申时" },
  { palace: "震三宫", direction: "东", element: "木", spatial: "门口、路口、新场地、声音震动处", action: "启动、通知、抢先行动", people: "长男、执行者、主动发声者", timing: "三数，常取三日或卯时" },
  { palace: "巽四宫", direction: "东南", element: "木", spatial: "风口、文书处、网络传播、通道", action: "谈判、渗透、发邮件、做调研", people: "长女、顾问、文案、传播者", timing: "四数，常取四日或辰巳时" },
  { palace: "中五宫", direction: "中", element: "土", spatial: "中心、平台、系统枢纽、会议桌", action: "统筹、定规则、先解决核心卡点", people: "负责人、协调者、系统管理员", timing: "五数，常取五日或阶段中点" },
  { palace: "乾六宫", direction: "西北", element: "金", spatial: "高处、办公室、机构、权力场", action: "找上级、走规则、做决断", people: "父亲、领导、男性贵人、监管者", timing: "六数，常取六日或戌亥时" },
  { palace: "兑七宫", direction: "西", element: "金", spatial: "口舌场、交易处、娱乐社交、缺口", action: "谈条件、报价、修补承诺", people: "少女、销售、发言者、客户", timing: "七数，常取七日或酉时" },
  { palace: "艮八宫", direction: "东北", element: "土", spatial: "山、门槛、边界、库存、静止处", action: "暂停、设限、积蓄、守住底线", people: "少男、守门人、保管者", timing: "八数，常取八日或丑寅时" },
  { palace: "离九宫", direction: "南", element: "火", spatial: "明亮处、屏幕、展台、证据公开处", action: "展示、发布、照明真相、做品牌", people: "中女、媒体、审美表达者、证人", timing: "九数，常取九日或午时" },
];

export const QIMEN_CLASSIC_NOTES: QimenClassicNote[] = [
  { source: "烟波钓叟歌", principle: "三奇六仪为骨", paraphrase: "奇仪是盘面骨架，三奇多看机会，六仪多看现实条件。", application: "产品解读先把天盘地盘干转成资源、阻力和可用路径。", caution: "不可只凭单一干定吉凶。" },
  { source: "烟波钓叟歌", principle: "吉门合吉神", paraphrase: "门、星、神、宫需共同判断，吉象相会才更稳。", application: "结果区按门星神宫分层显示，避免一句话断事。", caution: "吉门受迫也要降级。" },
  { source: "奇门遁甲统宗", principle: "用神为断事之主", paraphrase: "不同问题取不同用神，用神错则全盘偏。", application: "先让用户选事项类型，再展示对应取用逻辑。", caution: "复杂问题需拆成多个事项。" },
  { source: "奇门遁甲统宗", principle: "宫生克定处境", paraphrase: "落宫像环境，生扶则顺，克泄刑迫则费力。", application: "每个主象都解释它与落宫的配合度。", caution: "旺衰需结合时令。" },
  { source: "遁甲符应经", principle: "符使为局中枢", paraphrase: "值符和值使常提示主导力量与行动入口。", application: "奇门页突出值符、值使，作为全局摘要入口。", caution: "中枢不等于唯一答案。" },
  { source: "遁甲符应经", principle: "方位可转为行动", paraphrase: "奇门重时空，方位不只是方向，也可表示切入路径。", application: "把方位建议转译成沟通、渠道、场景选择。", caution: "现实安全优先于方位建议。" },
  { source: "御定奇门宝鉴", principle: "格局须分主次", paraphrase: "同盘多格并见时，先取与用神相关者。", application: "页面按“相关格局”而不是堆砌全部术语。", caution: "避免术语轰炸用户。" },
  { source: "御定奇门宝鉴", principle: "占验重应期", paraphrase: "断法不仅看吉凶，还要看何时显现。", application: "输出建议中加入短期、观察期、复盘点。", caution: "应期只作窗口参考。" },
];

export function getQimenLibrary() {
  return {
    palaces: QIMEN_PALACES,
    doors: QIMEN_DOORS,
    stars: QIMEN_STARS,
    gods: QIMEN_GODS,
    stems: QIMEN_STEMS,
    questionTypes: QIMEN_QUESTION_TYPES,
    analysisSteps: QIMEN_ANALYSIS_STEPS,
    relations: QIMEN_RELATIONS,
    patterns: QIMEN_PATTERNS,
    zhiFuZhiShiRules: QIMEN_ZHIFU_ZHISHI_RULES,
    dunRules: QIMEN_DUN_RULES,
    timingRules: QIMEN_TIMING_RULES,
    directionTranslations: QIMEN_DIRECTION_TRANSLATIONS,
    classicNotes: QIMEN_CLASSIC_NOTES,
  };
}
