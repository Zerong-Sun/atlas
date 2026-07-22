export type TarotSuit = "major" | "wands" | "cups" | "swords" | "pentacles";
export type Arcana = "major" | "minor";

export type TarotCard = {
  id: string;
  arcana: Arcana;
  suit: TarotSuit;
  rank: string;
  name: string;
  nameEn: string;
  image: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversedMeaning: string;
  advice: string;
  element: string;
};

const COMMONS_FILE = "https://commons.wikimedia.org/wiki/Special:Redirect/file/";

const MAJOR_DATA = [
  ["fool", "愚者", "The Fool", "RWS_Tarot_00_Fool.jpg", "0", ["开始", "自由", "信任"], ["鲁莽", "逃避", "缺乏准备"], "新的道路已经出现，真正的问题不是能不能开始，而是你是否愿意带着开放心态进入未知。", "逆位提示天真正在变成冒失，先确认边界、资源和后果。", "保留好奇，但给冒险加一个最低限度的安全绳。"],
  ["magician", "魔术师", "The Magician", "RWS_Tarot_01_Magician.jpg", "I", ["意志", "资源", "显化"], ["操控", "分散", "空谈"], "资源、语言和行动力已经在手边，适合把想法落成具体步骤。", "逆位提示能力被浪费，或有人用漂亮话掩盖真实动机。", "把注意力集中到一个清晰目标上，立刻做出可见动作。"],
  ["high-priestess", "女祭司", "The High Priestess", "RWS_Tarot_02_High_Priestess.jpg", "II", ["直觉", "隐藏", "等待"], ["秘密", "迟疑", "失联"], "信息尚未完全显现，直觉和沉默比急着表态更有价值。", "逆位提示你可能忽略了内在声音，也可能被隐瞒的信息牵制。", "先观察，再追问；把梦、预感和细节记录下来。"],
  ["empress", "皇后", "The Empress", "RWS_Tarot_03_Empress.jpg", "III", ["滋养", "丰盛", "创造"], ["消耗", "依赖", "过度照料"], "事情需要被照料、培育和美化，创造力来自稳定的感受和身体节奏。", "逆位提示付出失衡，照顾别人之前要先照顾自己的能量。", "让环境、身体和关系回到可滋养的状态。"],
  ["emperor", "皇帝", "The Emperor", "RWS_Tarot_04_Emperor.jpg", "IV", ["结构", "秩序", "权威"], ["僵硬", "控制", "失序"], "建立规则、边界和责任分工，会让局面更稳定。", "逆位提示控制欲或结构缺位，秩序需要重建而不是硬压。", "写下规则、时间线和责任人。"],
  ["hierophant", "教皇", "The Hierophant", "RWS_Tarot_05_Hierophant.jpg", "V", ["传统", "学习", "信念"], ["教条", "反叛", "空洞仪式"], "向体系、老师或成熟传统学习，会比单打独斗更快。", "逆位提示传统正在束缚你，或你只是在遵守没有生命力的形式。", "分辨哪些规则值得继承，哪些只是惯性。"],
  ["lovers", "恋人", "The Lovers", "RWS_Tarot_06_Lovers.jpg", "VI", ["选择", "关系", "价值"], ["摇摆", "诱惑", "价值冲突"], "关系或选择的核心是价值一致，而不只是情绪吸引。", "逆位提示承诺不稳、标准混乱，或在迎合他人时背离自己。", "先确认你真正选择的是什么，再谈如何推进。"],
  ["chariot", "战车", "The Chariot", "RWS_Tarot_07_Chariot.jpg", "VII", ["推进", "掌控", "胜利"], ["失控", "硬冲", "方向分裂"], "只要目标明确、意志集中，局面可以被推动。", "逆位提示两个方向同时拉扯，越用力越偏航。", "把目标压缩成一个主线，先赢下关键节点。"],
  ["strength", "力量", "Strength", "RWS_Tarot_08_Strength.jpg", "VIII", ["勇气", "温柔", "自制"], ["压抑", "胆怯", "失去耐心"], "真正的力量来自温和而持续的掌控，不是爆发式强硬。", "逆位提示你在和本能对抗，或把柔软误解为软弱。", "用耐心驯服冲动，用稳定替代硬撑。"],
  ["hermit", "隐者", "The Hermit", "RWS_Tarot_09_Hermit.jpg", "IX", ["内省", "寻找", "智慧"], ["孤立", "退缩", "过度分析"], "独处能带来答案，适合暂停外界噪声，回到核心问题。", "逆位提示躲避世界太久，洞察需要重新回到行动。", "把问题缩小，留出一段真正安静的思考时间。"],
  ["wheel", "命运之轮", "Wheel of Fortune", "RWS_Tarot_10_Wheel_of_Fortune.jpg", "X", ["周期", "转机", "变化"], ["卡住", "反复", "时机错位"], "局势正在转动，顺势调整比强行固定更有效。", "逆位提示同一模式反复出现，需要看见循环背后的选择。", "问自己：这次循环里我能改变哪个动作？"],
  ["justice", "正义", "Justice", "RWS_Tarot_11_Justice.jpg", "XI", ["公平", "因果", "判断"], ["偏见", "失衡", "逃责"], "事实、规则和后果会成为判断的中心，适合做理性决定。", "逆位提示信息不公或责任逃避，结论需要重新校准。", "列出证据，不要只靠情绪投票。"],
  ["hanged-man", "倒吊人", "The Hanged Man", "RWS_Tarot_12_Hanged_Man.jpg", "XII", ["暂停", "换位", "牺牲"], ["停滞", "拖延", "无谓牺牲"], "暂停不是失败，而是换角度后重新理解局势。", "逆位提示你可能把拖延包装成等待，或牺牲没有意义。", "换一个视角看问题，同时设定暂停期限。"],
  ["death", "死神", "Death", "RWS_Tarot_13_Death.jpg", "XIII", ["结束", "转化", "新生"], ["抗拒", "滞留", "害怕改变"], "旧阶段需要结束，腾出空间后新秩序才会出现。", "逆位提示你知道该放手，却仍在维持已失效的形式。", "认真完成告别，把能量从旧事里取回来。"],
  ["temperance", "节制", "Temperance", "RWS_Tarot_14_Temperance.jpg", "XIV", ["调和", "平衡", "疗愈"], ["失衡", "过量", "急躁"], "不同元素可以慢慢调合，温和调整会比剧烈改变更有效。", "逆位提示节奏失衡，过度、过快或过满都在消耗你。", "少一点极端，多一点持续校准。"],
  ["devil", "恶魔", "The Devil", "RWS_Tarot_15_Devil.jpg", "XV", ["束缚", "欲望", "阴影"], ["松绑", "觉察", "戒断"], "欲望、依赖或恐惧正在影响判断，关键是看清自己被什么绑住。", "逆位可能是松绑的开始，也可能是对阴影的否认。", "给诱惑命名，才能重新拿回选择权。"],
  ["tower", "高塔", "The Tower", "RWS_Tarot_16_Tower.jpg", "XVI", ["突变", "揭示", "崩塌"], ["余震", "抗拒", "延迟崩塌"], "不稳的结构会被打破，真相虽然刺眼，却能结束长期误判。", "逆位提示你感到震动却仍想维持旧结构。", "先保护核心资源，再重建更诚实的结构。"],
  ["star", "星星", "The Star", "RWS_Tarot_17_Star.jpg", "XVII", ["希望", "疗愈", "灵感"], ["失望", "怀疑", "能量枯竭"], "经历混乱之后，信心和灵感开始恢复。", "逆位提示希望感被遮住，需要先补充能量而不是强行乐观。", "给自己一点恢复期，同时保留长远愿景。"],
  ["moon", "月亮", "The Moon", "RWS_Tarot_18_Moon.jpg", "XVIII", ["迷雾", "梦境", "潜意识"], ["误解", "焦虑", "真相浮现"], "情绪和想象力很强，但事实仍在雾中，适合探索梦与潜意识。", "逆位提示混乱正在散开，但焦虑仍会扭曲判断。", "不要在夜雾里做终局决定，先收集证据。"],
  ["sun", "太阳", "The Sun", "RWS_Tarot_19_Sun.jpg", "XIX", ["清晰", "喜悦", "成功"], ["过度自信", "短暂低落", "迟来的明朗"], "事情趋于明朗，能见度、活力和表达欲都在上升。", "逆位提示光仍在，但被疲惫、自负或短期挫折遮住。", "把清楚的事说清楚，把可庆祝的进展庆祝出来。"],
  ["judgement", "审判", "Judgement", "RWS_Tarot_20_Judgement.jpg", "XX", ["觉醒", "召唤", "复盘"], ["逃避召唤", "自责", "迟迟不决"], "一个阶段到了复盘和回应召唤的时候，旧我需要被重新评估。", "逆位提示你听见召唤却不敢回应，或困在自我审判里。", "把过去总结成教训，而不是刑罚。"],
  ["world", "世界", "The World", "RWS_Tarot_21_World.jpg", "XXI", ["完成", "整合", "抵达"], ["未竟", "收尾困难", "缺少整合"], "一个循环完成，成果需要被整合、发布或正式收尾。", "逆位提示离完成只差收束，也可能是成就感尚未落地。", "把最后一公里走完，让结果被看见。"],
] as const;

const SUITS: Record<Exclude<TarotSuit, "major">, { label: string; en: string; file: string; element: string; theme: string; shadow: string }> = {
  wands: { label: "权杖", en: "Wands", file: "Wands", element: "火", theme: "行动、热情、创意与推进力", shadow: "急躁、消耗、冲动或方向分散" },
  cups: { label: "圣杯", en: "Cups", file: "Cups", element: "水", theme: "情感、关系、直觉与滋养", shadow: "情绪淹没、依赖、投射或逃避现实" },
  swords: { label: "宝剑", en: "Swords", file: "Swords", element: "风", theme: "思考、语言、冲突与判断", shadow: "过度分析、尖锐、防御或精神压力" },
  pentacles: { label: "星币", en: "Pentacles", file: "Pents", element: "土", theme: "现实、资源、身体与长期建设", shadow: "停滞、匮乏感、执着或只看物质面" },
};

const RANKS = [
  ["ace", "一", "Ace", "01", "种子", "新的能量刚刚出现，适合启动、尝试和承接可能性。", "机会仍在，但还没有落地；需要明确你是否真的愿意投入。"],
  ["two", "二", "Two", "02", "选择", "两个力量正在形成关系，主题落在权衡、互动和初步协调。", "摇摆、拖延或互相牵制正在消耗局面。"],
  ["three", "三", "Three", "03", "生长", "能量开始向外扩展，适合合作、表达和看见初步成果。", "扩张太快或协作不稳，容易让成果分散。"],
  ["four", "四", "Four", "04", "稳定", "结构暂时稳定，适合整理边界、休息或巩固已有基础。", "稳定变成停滞，安全感可能正在限制成长。"],
  ["five", "五", "Five", "05", "冲突", "变化带来摩擦，问题需要被面对而不是粉饰。", "冲突可能内化成消耗，也可能是结束争执的信号。"],
  ["six", "六", "Six", "06", "调整", "关系、资源或状态进入修复期，适合重新分配和平衡。", "过去的模式仍在牵制现在，需要避免怀旧或不公平交换。"],
  ["seven", "七", "Seven", "07", "试炼", "需要判断、坚持或防守，局面考验你的策略和耐心。", "防御过度、幻想过多或判断疲劳会削弱你。"],
  ["eight", "八", "Eight", "08", "推进", "节奏加快，重复练习、信息流动或持续行动会带来进展。", "忙碌未必等于有效，先看方向是否正确。"],
  ["nine", "九", "Nine", "09", "积累", "经验和成果已经累积，主题是守住状态并看清代价。", "接近完成却疲惫，可能需要补能或放下过度警戒。"],
  ["ten", "十", "Ten", "10", "完成", "一个阶段达到顶点，成果、责任或负荷都来到显眼位置。", "完成之后需要释放负担，否则顶点会变成压力。"],
  ["page", "侍从", "Page", "11", "学习", "新手心态、讯息和探索欲出现，适合学习与试探。", "经验不足或消息不稳，不要急着把灵感当结论。"],
  ["knight", "骑士", "Knight", "12", "行动", "能量开始快速移动，适合推进、追求和执行。", "冲得太快会失焦，行动需要被目标驯服。"],
  ["queen", "王后", "Queen", "13", "内化", "成熟的接纳、照料和内在掌控力正在发挥作用。", "照料过度或情绪内耗，会让力量转向消耗。"],
  ["king", "国王", "King", "14", "掌控", "成熟的外在掌控、决策和领导力成为关键。", "权威若失衡，会变成控制、固执或过度现实。"],
] as const;

export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_DATA.map(([id, name, nameEn, file, rank, keywords, reversedKeywords, upright, reversed, advice]) => ({
    id,
    arcana: "major" as const,
    suit: "major" as const,
    rank,
    name,
    nameEn,
    image: `${COMMONS_FILE}${file}`,
    keywords: [...keywords],
    reversedKeywords: [...reversedKeywords],
    upright,
    reversedMeaning: reversed,
    advice,
    element: "灵魂",
  })),
  ...Object.entries(SUITS).flatMap(([suitKey, suit]) =>
    RANKS.map(([rankId, rankZh, rankEn, fileNo, rankTheme, uprightRank, reversedRank]) => {
      const name = `${suit.label}${rankZh}`;
      return {
        id: `${suitKey}-${rankId}`,
        arcana: "minor" as const,
        suit: suitKey as Exclude<TarotSuit, "major">,
        rank: rankZh,
        name,
        nameEn: `${rankEn} of ${suit.en}`,
        image: `${COMMONS_FILE}${suit.file}${fileNo}.jpg`,
        keywords: [rankTheme, ...suit.theme.split("、").slice(0, 2)],
        reversedKeywords: [suit.shadow.split("、")[0], "阻滞", "失衡"],
        upright: `${name}把「${rankTheme}」放进${suit.theme}之中：${uprightRank}`,
        reversedMeaning: `${name}逆位时，${suit.shadow}会盖过原本的推进力：${reversedRank}`,
        advice: `用${suit.element}元素的方式处理它：先承认${suit.theme}，再避免${suit.shadow}。`,
        element: suit.element,
      };
    })
  ),
];

export function getTarotDeck(mode: "major" | "full") {
  return mode === "major" ? TAROT_DECK.filter((card) => card.arcana === "major") : TAROT_DECK;
}

export function getCardMeaning(card: TarotCard, reversed: boolean) {
  return reversed ? card.reversedMeaning : card.upright;
}

export function buildTarotCombination(cards: Array<TarotCard & { position: string; reversed: boolean }>) {
  if (cards.length === 0) return "抽牌后会在这里生成这组牌的整体脉络。";
  const majorCount = cards.filter((card) => card.arcana === "major").length;
  const reversedCount = cards.filter((card) => card.reversed).length;
  const elements = Array.from(new Set(cards.map((card) => card.element))).join("、");
  const center = cards[Math.floor(cards.length / 2)];
  const sequence = cards.map((card) => `${card.position}见${card.name}${card.reversed ? "逆位" : "正位"}`).join("，");

  const gravity =
    majorCount >= Math.ceil(cards.length / 2)
      ? "大阿卡那占比高，说明这不是单纯的日常波动，而是牵涉选择、阶段或人格主题。"
      : "小阿卡那占比高，说明答案更落在具体行动、关系互动和现实安排上。";
  const friction =
    reversedCount === 0
      ? "牌面整体顺位，能量流动较直接。"
      : reversedCount >= Math.ceil(cards.length / 2)
        ? "逆位较多，重点不是没有机会，而是能量被卡住、延迟或误用。"
        : "少量逆位像提醒音，指出推进中需要修正的地方。";

  return `${sequence}。核心牌是${center.name}，主题元素集中在${elements}。${gravity}${friction}`;
}
