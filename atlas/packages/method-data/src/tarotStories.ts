/** Modern teaching analogies for all 78 cards. These do not claim to describe the printed artwork. */
const MAJOR: Record<string, string> = {
  fool: "旅人背起轻行囊走到陌生路口，先看看脚下再迈第一步",
  magician: "手艺人把桌上的几样工具摆好，选一件今天就能完成的事",
  "high-priestess": "守门人听见门后有声音，没有急着推门，先留意遗漏的线索",
  empress: "园丁每天浇一点水，让花圃有时间长出自己的模样",
  emperor: "建屋者先画梁柱和边界，才请大家一起动工",
  hierophant: "学徒照着旧书学会一套手法，再问它为何这样做",
  lovers: "两人站在分岔路口，先说清彼此真正重视什么",
  chariot: "车夫握住两条缰绳，把奔向不同方向的力量拉回同一条路",
  strength: "驯兽者放轻声音，耐心比一时用力更能让伙伴安定",
  hermit: "夜路上的人举起小灯，退后一步才看清地图",
  wheel: "转轮来到新的刻度，摊主调整货架迎接不同的人流",
  justice: "仲裁者把两边的记录摊开，先核事实再下判断",
  "hanged-man": "修桥人暂停敲打，从桥下换个角度发现松动的木楔",
  death: "园丁拔去枯枝，腾出的土地终于能播下新种",
  temperance: "调茶人一滴一滴加水，试出两种味道合适的比例",
  devil: "旅人发现绳结只是松松地绕着手，先承认自己为何一直没解开",
  tower: "旧墙倒下后，屋主先保护人和物，再找出地基的裂缝",
  star: "雨后有人在院里接水，慢慢恢复修补家园的信心",
  moon: "夜行人看见远处模糊的影子，等天亮再决定该不该走近",
  sun: "晨光照进工坊，成品的优点与瑕疵都清楚可见",
  judgement: "钟声响起，旅人翻看旧日笔记，决定这次如何回应邀请",
  world: "长途归来的织工缝好最后一针，把整幅布展开",
};

const SUITS: Record<string, string> = {
  wands: "工坊里的一束火光象征行动与热情",
  cups: "桌上的一杯水象征感受与关系",
  swords: "案上的一把尺象征思考、语言与判断",
  pentacles: "掌心的一枚种子象征资源、身体与长期建设",
};
const RANKS: Record<string, string> = {
  ace: "新的机会刚冒头，先决定是否接住它",
  two: "两个方向同时出现，先比较各自的代价",
  three: "第一步已有回应，试着邀请合适的人同行",
  four: "小小的成果可以停放，先把基础稳住",
  five: "意见开始碰撞，先找出真正争的是哪件事",
  six: "旧失衡需要调整，看看谁给予、谁接收",
  seven: "站在试炼关口，先辨认需要守住的边界",
  eight: "事情转快，把重复的动作练稳再加速",
  nine: "成果逐渐积累，也要看见疲惫与防备",
  ten: "阶段到达顶点，决定哪些负担该放下",
  page: "一位学徒带来消息，先学习再下结论",
  knight: "一位骑手准备出发，先把目标说清",
  queen: "照料者稳定局面，也记得照顾自身",
  king: "负责人做出决定，给权力配上责任",
};

export function getTarotCardStory(id: string, name: string, reversed = false): string {
  const scene = MAJOR[id] ?? (() => {
    const [suit, rank] = id.split("-");
    return suit && rank && SUITS[suit] && RANKS[rank] ? `${SUITS[suit]}；${RANKS[rank]}` : "读者先观察眼前的符号，再问它和现实中的哪件事有关";
  })();
  return `想象这样一幕：${scene}。${name}${reversed ? "逆位时，问一问这股力量是受阻、过量，还是转向内在；先找证据，别把逆位等同于坏结果。" : "正位时，找出你现在能做的一个具体动作。"}`;
}

export function buildTarotSpreadStory(cards: Array<{ id: string; name: string; position: string; reversed: boolean }>): string {
  if (!cards.length) return "";
  const first = cards[0]!;
  const middle = cards[Math.floor(cards.length / 2)]!;
  const last = cards[cards.length - 1]!;
  if (cards.length === 1) return `这次只有一张牌：${first.position}的${first.name}。${getTarotCardStory(first.id, first.name, first.reversed)}把它当作一个待验证的问题，写下今天能做的第一步。`;
  return `把牌阵想成一段三幕故事：开场的「${first.position}」出现${first.name}${first.reversed ? "逆位" : "正位"}，提醒你先看事情从哪里开始；故事中段的「${middle.position}」出现${middle.name}${middle.reversed ? "逆位" : "正位"}，请辨认此刻的阻力或资源；收束处的「${last.position}」出现${last.name}${last.reversed ? "逆位" : "正位"}，把牌义转成下一步可观察的行动。每张牌的具体场景和解释见下方，牌阵描述的是提问顺序，不是已经写好的结局。`;
}
