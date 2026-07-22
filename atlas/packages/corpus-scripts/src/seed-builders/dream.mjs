import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "dream_symbols",
  source_type: "self_authored",
  license_note: "自研占梦象征与荣格简表，伊斯兰条目仅精神反思话术",
  source_url: null,
  verbatim_allowed: false,
};

const SYMBOLS = [
  { symbol: "水", zh: "水", meaning: "情绪、潜意识、净化或淹没感。" },
  { symbol: "火", zh: "火", meaning: "激情、愤怒、转化或毁灭焦虑。" },
  { symbol: "蛇", zh: "蛇", meaning: "本能、恐惧、疗愈或隐藏威胁。" },
  { symbol: "狗", zh: "狗", meaning: "忠诚、保护、本能警觉或背叛感。" },
  { symbol: "猫", zh: "猫", meaning: "独立、直觉、神秘或边界需求。" },
  { symbol: "鱼", zh: "鱼", meaning: "潜意识资源、丰饶或未说出的感受。" },
  { symbol: "鸟", zh: "鸟", meaning: "自由、消息、灵魂升华或逃避。" },
  { symbol: "马", zh: "马", meaning: "生命力、性欲、前进动力或失控。" },
  { symbol: "龙", zh: "龙", meaning: "强大原型、权威、恐惧或祥瑞（文化语境）。" },
  { symbol: "虎", zh: "虎", meaning: "勇气、威慑、野性或未驯服的力量。" },
  { symbol: "血", zh: "血", meaning: "生命力、创伤、家族纽带或消耗。" },
  { symbol: "牙", zh: "牙", meaning: "形象焦虑、沟通力量、成长或失落。" },
  { symbol: "头发", zh: "头发", meaning: "魅力、力量、衰老焦虑或身份。" },
  { symbol: "镜子", zh: "镜子", meaning: "自我形象、真相、自恋或分裂。" },
  { symbol: "门", zh: "门", meaning: "机会、过渡、边界或未知。" },
  { symbol: "桥", zh: "桥", meaning: "过渡、连接两岸、人生阶段转换。" },
  { symbol: "楼梯", zh: "楼梯", meaning: "阶层、目标进展、上升或下降感。" },
  { symbol: "电梯", zh: "电梯", meaning: "快速升降、控制感或社会层级焦虑。" },
  { symbol: "房子", zh: "房子", meaning: "自我结构、家庭、安全感或内在房间。" },
  { symbol: "教室", zh: "教室", meaning: "学习、评价焦虑、成长课题。" },
  { symbol: "考试", zh: "考试", meaning: "自我检验、压力、怕被发现不足。" },
  { symbol: "迟到", zh: "迟到", meaning: "错过机会、时间管理、内疚。" },
  { symbol: "飞行", zh: "飞行", meaning: "自由、超越、逃避或掌控欲。" },
  { symbol: "坠落", zh: "坠落", meaning: "失控、焦虑、地位不稳或放手。" },
  { symbol: "追逐", zh: "追逐", meaning: "逃避问题、压力源、未面对的情绪。" },
  { symbol: "迷路", zh: "迷路", meaning: "方向感丧失、人生选择困惑。" },
  { symbol: "怀孕", zh: "怀孕", meaning: "新项目孕育、创造力、责任预感。" },
  { symbol: "婴儿", zh: "婴儿", meaning: "脆弱新生、纯真、需呵护的部分。" },
  { symbol: "老人", zh: "老人", meaning: "智慧、时间、祖先或衰老主题。" },
  { symbol: "死亡", zh: "死亡", meaning: "结束与重生象征，极少为字面预兆。" },
  { symbol: "婚礼", zh: "婚礼", meaning: "承诺、融合、社会期待或矛盾。" },
  { symbol: "分手", zh: "分手", meaning: "分离焦虑、界限重建、依附议题。" },
  { symbol: "钱", zh: "钱", meaning: "价值感、资源、安全感或道德焦虑。" },
  { symbol: "丢东西", zh: "丢东西", meaning: "失控、遗忘、身份或关系失落。" },
  { symbol: "电话", zh: "电话", meaning: "沟通渴望、消息、距离与连接。" },
  { symbol: "牙齿掉落", zh: "掉牙", meaning: "常见焦虑梦，关形象与无力感。" },
  { symbol: "大海", zh: "大海", meaning: "巨大情绪、未知、召唤或淹没。" },
  { symbol: "下雨", zh: "下雨", meaning: "释放、悲伤洗涤、情绪天气。" },
  { symbol: "地震", zh: "地震", meaning: "根基动摇、突发变故、潜意识震荡。" },
  { symbol: "洪水", zh: "洪水", meaning: "情绪泛滥、压力过大、难以 containment。" },
  { symbol: "森林", zh: "森林", meaning: "潜意识探索、迷失、自然本能。" },
  { symbol: "山", zh: "山", meaning: "目标、障碍、崇高或孤立。" },
  { symbol: "路", zh: "路", meaning: "人生路径、选择、旅程阶段。" },
  { symbol: "车", zh: "车", meaning: "掌控感、人生方向、动力与乘客关系。" },
  { symbol: "船", zh: "船", meaning: "情绪载体、过渡、冒险或漂泊。" },
  { symbol: "食物", zh: "食物", meaning: "滋养、欲望、文化记忆或匮乏。" },
  { symbol: "花", zh: "花", meaning: "美、短暂、关系绽放或凋零。" },
  { symbol: "衣服", zh: "衣服", meaning: "社会角色、伪装、身份与羞耻。" },
  { symbol: "裸体", zh: "裸体", meaning: "脆弱、暴露、怕被看见真实自我。" },
  { symbol: "警察", zh: "警察", meaning: "超我、规则、内疚或保护。" },
  { symbol: "医生", zh: "医生", meaning: "疗愈需求、权威、对身体焦虑。" },
  { symbol: "老师", zh: "老师", meaning: "指引、评价、内在批评者。" },
  { symbol: "陌生人", zh: "陌生人", meaning: "未知自我面向、新可能或威胁。" },
  { symbol: "前任", zh: "前任", meaning: "未了情结、比较、非必复合预兆。" },
  { symbol: "父母", zh: "父母", meaning: "根源、权威、养育模式内化。" },
  { symbol: "孩子", zh: "孩子", meaning: "内在孩童、责任、纯真或压力。" },
  { symbol: "打架", zh: "打架", meaning: "内在冲突外化、边界、压抑愤怒。" },
  { symbol: "哭泣", zh: "哭泣", meaning: "情绪释放、委屈、疗愈过程。" },
  { symbol: "笑", zh: "笑", meaning: "防御、轻松、掩饰或真正喜悦。" },
  { symbol: "黑暗", zh: "黑暗", meaning: "未知、恐惧、休息或潜意识。" },
  { symbol: "光", zh: "光", meaning: "觉察、希望、真理或暴露。" },
  { symbol: "钥匙", zh: "钥匙", meaning: "解答、权限、秘密或新机会。" },
  { symbol: "锁", zh: "锁", meaning: "防御、秘密、情感觉察闭锁。" },
  { symbol: "棺材", zh: "棺材", meaning: "结束象征、转化、对死亡的焦虑。" },
  { symbol: "花圈", zh: "花圈", meaning: "悼念、循环、对失去的加工。" },
  { symbol: "月亮", zh: "月亮", meaning: "阴柔、周期、直觉与夜间情绪。" },
  { symbol: "太阳", zh: "太阳", meaning: "意识、活力、成就或刺眼压力。" },
  { symbol: "星星", zh: "星星", meaning: "希望、指引、遥远愿望。" },
];

const JUNG_ARCHETYPES = [
  { name: "人格面具", brief: "社会角色与外在形象，梦中常表现为制服、舞台、表演。" },
  { name: "阴影", brief: "被否认的自我部分，常以追捕者、怪物或令人不适的人物出现。" },
  { name: "阿尼玛", brief: "男性内在女性气质，常表现为神秘女性、灵感或情绪波动。" },
  { name: "阿尼姆斯", brief: "女性内在男性气质，常表现为导师、战士或理性声音。" },
  { name: "自性", brief: "整体性与中心，常表现为曼陀罗、中心空间、智者或完整感。" },
  { name: "英雄", brief: "克服困难的原型，梦中历险、战斗、考验常见。" },
  { name: "智者", brief: "指引与意义，常表现为老人、导师、书籍或奇异向导。" },
  { name: "母亲", brief: "滋养与包容，也可为吞噬性母亲（过度保护）。" },
  { name: "父亲", brief: "秩序、权威、保护或严苛规则内化。" },
  { name: "孩童", brief: "新生可能与脆弱，神孩或受伤孩童皆常见。" },
  { name: "骗徒", brief: "打破常规、幽默与变革，提醒勿过于僵化。" },
  { name: "变形者", brief: "变化与流动，梦中人物或场景突变。" },
];

const ISLAM_REFLECTION = [
  "梦境可视为内心状态与信仰生活的反映，宜以感恩、忏悔与寻求智慧态度面对，而非断言吉凶。",
  "若梦境引发不安，可通过祈祷、记念与信任托付来缓解焦虑，避免过度迷信字面预兆。",
  "好梦感恩、噩梦求庇护的传统，强调精神修养而非命运赌博。",
  "重复梦境提示持续关注某内心课题，可与师长或信仰社群讨论伦理生活。",
];

const CHINESE_DREAM = [
  { topic: "周公简意", text: "传统梦书重象征联想，宜结合问事者生活语境，不可机械对应吉凶。" },
  { topic: "谐音", text: "鱼（余）、蝙蝠（福）等谐音象征在文化梦境解读中常见。" },
  { topic: "反梦", text: "部分传统认为凶梦或反示吉，需审慎，宜作反思而非预测。" },
];

export function buildDreamChunks() {
  const chunks = [];

  for (const s of SYMBOLS) {
    chunks.push(
      makeChunk({
        id: `dream-symbol-${s.symbol}`,
        ...SOURCE,
        tradition: "dream",
        chapter: "象征",
        section: s.zh,
        original_text: "",
        translation_zh: `梦中出现「${s.zh}」：${s.meaning}`,
        annotation_zh: "中国梦占象征库，供标签匹配与检索。",
        keywords: [s.zh, "梦境", "象征", "占梦"],
      }),
      makeChunk({
        id: `dream-symbol-${s.symbol}-apply`,
        ...SOURCE,
        tradition: "dream",
        chapter: "象征",
        section: `${s.zh}·应用`,
        original_text: "",
        translation_zh: `结合梦者近期情绪与生活事件理解「${s.zh}」，避免脱离语境的万能解释。`,
        annotation_zh: "应用句模板，生成时绑定用户梦境描述。",
        keywords: [s.zh, "应用", "梦境"],
      }),
    );
  }

  for (const j of JUNG_ARCHETYPES) {
    chunks.push(
      makeChunk({
        id: `dream-jung-${j.name}`,
        ...SOURCE,
        tradition: "dream",
        chapter: "荣格原型",
        section: j.name,
        original_text: "",
        translation_zh: `【${j.name}】${j.brief}`,
        annotation_zh: "荣格分析心理学简表，非学术全文，供多视角解释之一。",
        keywords: [j.name, "荣格", "原型", "梦境"],
      }),
    );
  }

  for (let i = 0; i < ISLAM_REFLECTION.length; i++) {
    chunks.push(
      makeChunk({
        id: `dream-islam-reflect-${i + 1}`,
        ...SOURCE,
        tradition: "dream",
        chapter: "伊斯兰视角",
        section: "精神反思",
        original_text: "",
        translation_zh: ISLAM_REFLECTION[i],
        annotation_zh: "合规：禁止 fortune telling 表述，仅精神反思与伦理生活。",
        keywords: ["伊斯兰", "精神反思", "梦境"],
      }),
    );
  }

  for (const c of CHINESE_DREAM) {
    chunks.push(
      makeChunk({
        id: `dream-zhongguo-${c.topic}`,
        ...SOURCE,
        tradition: "dream",
        chapter: "中国传统的梦",
        section: c.topic,
        original_text: "",
        translation_zh: c.text,
        annotation_zh: "传统梦占视角，与荣格、精神反思并列供用户选择。",
        keywords: ["中国梦占", c.topic, "梦境"],
      }),
    );
  }

  const emotions = [
    { name: "恐惧", note: "常指向未处理焦虑，宜记录触发情境。" },
    { name: "喜悦", note: "可能反映需求满足或补偿性梦境。" },
    { name: "悲伤", note: "哀伤处理、失落认同或情绪释放。" },
    { name: "愤怒", note: "边界被侵、压抑敌意或无力感。" },
    { name: "羞耻", note: "暴露梦、评价焦虑与自我形象。" },
    { name: "平静", note: "整合阶段、修复或暂时和解。" },
  ];
  for (const e of emotions) {
    chunks.push(
      makeChunk({
        id: `dream-emotion-${e.name}`,
        ...SOURCE,
        tradition: "dream",
        chapter: "情绪",
        section: e.name,
        original_text: "",
        translation_zh: `梦中${e.name}：${e.note}`,
        annotation_zh: "情绪标签与梦象联合分析。",
        keywords: [e.name, "情绪", "梦境"],
      }),
    );
  }

  return chunks;
}
