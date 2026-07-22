import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { getMethodOperationLibrary } from "../methodOperationLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("iching")!;
const operationLibrary = getMethodOperationLibrary("iching")!;

const TRIGRAM_NAMES = new Set(["乾", "坤", "坎", "离", "震", "巽", "艮", "兑"]);
const BAGUA_ENTRIES = operationLibrary.symbolBank
  .filter((symbol) => TRIGRAM_NAMES.has(symbol.name))
  .map((symbol) => toEntry(symbol.name, `卦象 / ${symbol.type}`, symbol.meaning, symbol.predictionUse));

export const ICHING_REFERENCE: MethodReferenceLibrary = {
  id: "iching",
  title: "易经卦象分析库",
  symbolGroups: [
    {
      id: "bagua",
      label: "八卦取象",
      items: BAGUA_ENTRIES,
    },
    ...groupDeepSymbols(deep.symbols, [
      { id: "structure", label: "卦体结构", groups: ["卦体"] },
      { id: "yaowei", label: "爻位", groups: ["爻位"] },
      { id: "yinyang", label: "阴阳动变", groups: ["阴阳"] },
      { id: "wuxing", label: "五行生克", groups: ["五行", "生克"] },
      { id: "qigua", label: "起卦方式", groups: ["起卦"] },
      { id: "cixiang", label: "辞象", groups: ["辞象"] },
      { id: "changyong", label: "常用卦", groups: ["常用卦"] },
      { id: "yingqi", label: "时间应期", groups: ["应期"] },
    ]),
  ],
  questionTypes: [
    {
      type: "事业进退",
      focus: "是否推进、转职、签约、项目启动",
      usefulGod: "本卦、动爻、乾震",
      readingKey: "本卦见势，动爻见转折；乾主动，艮止；变卦示下一阶段落点。",
    },
    {
      type: "关系协商",
      focus: "合作、感情、谈判、承诺",
      usefulGod: "兑巽、本卦、变卦、综卦",
      readingKey: "兑主口舌承诺，巽主谈判路径；综卦看对方视角，变卦看走向。",
    },
    {
      type: "财务取舍",
      focus: "投资、借贷、成本、回款",
      usefulGod: "本卦、坎离、动爻、妻财象",
      readingKey: "坎看风险暗线，离看信息透明；动爻示资金变动节点。",
    },
    {
      type: "学习考试",
      focus: "备考、文书、证件、评审",
      usefulGod: "离、巽、本卦、五爻",
      readingKey: "离主显明，巽主渐进；五爻为尊位，看核心发挥。",
    },
    {
      type: "出行时机",
      focus: "远行、搬迁、出差、启动",
      usefulGod: "震、艮、动爻、应期",
      readingKey: "震可出发，艮宜止；应期结合七日/一月窗口定复盘。",
    },
    {
      type: "健康趋势",
      focus: "身心负荷、调养方向",
      usefulGod: "坎离、本卦",
      readingKey: "只作趋势提醒；坎险、离明，不作医疗诊断。",
    },
    {
      type: "决策二选一",
      focus: "两路径择一、是否可行",
      usefulGod: "本卦、变卦、动爻、错卦",
      readingKey: "本卦示当前，变卦示选后走向；错卦看被忽视的反面。",
    },
    {
      type: "失物寻人",
      focus: "去向、能否找回、隐藏处",
      usefulGod: "用卦、坎艮、互卦",
      readingKey: "坎主藏、艮主止；互卦看过程中段变化。",
    },
    {
      type: "变革转型",
      focus: "旧局打破、新方案启动",
      usefulGod: "泽火革、动爻、变卦",
      readingKey: "革卦示变局；动爻为触发，变卦看新局气质。",
    },
    {
      type: "反复问事",
      focus: "同一事短时多次起卦",
      usefulGod: "问意、冷却",
      readingKey: "一事一占，短时重复则卦乱；宜修正问意或隔日再问。",
    },
  ],
  analysisSteps: [
    "定问：一事一卦，问意要专，明确主体与时间窗。",
    "选法：时间起卦、三币起卦或数字起卦，记录取数来源。",
    "定本：排定本卦，读卦名卦辞，定当前大势基调。",
    "标动：找出动爻，读爻辞，定转折触发点。",
    "读变：动爻变后成变卦，读变卦卦辞，定下一阶段落点。",
    "互综错：互卦看过程，综卦看对方，错卦看盲点。",
    "生克：体用五行生克定顺逆，比和宜守。",
    "应期：结合当下/七日/一月/一季，定复盘节点与行动边界。",
  ],
  relations: [
    toEntry("本变相生", "本变", "本卦五行生变卦，事态向有利转化。", "问推进：顺势，抓动爻应期。"),
    toEntry("本变相克", "本变", "本卦克变卦或变卦克本，阻力或反噬。", "宜降级目标、改方案或等待。"),
    toEntry("动爻发用", "动变", "动爻为变化触发，事有转折。", "抓动爻位与爻辞，定应期。"),
    toEntry("卦辞定调", "辞象", "卦辞定大势语气，爻辞定具体触发。", "先卦辞后爻辞，忌单爻独断。"),
    toEntry("体生用", "生克", "体卦生用卦，主体付出、事可成但耗力。", "问推进：可成但有成本。"),
    toEntry("用生体", "生克", "用卦生体卦，外部助力，顺势。", "多数问事吉象，仍看旺衰。"),
    toEntry("体克用", "生克", "体克用，主体掌控，可成。", "问竞争：占上风，忌过刚。"),
    toEntry("用克体", "生克", "用克体，压力大，事多阻。", "宜等待、借力或换路径。"),
    toEntry("比和", "生克", "体用同五行，稳定同频。", "事缓成，宜守不宜冒进。"),
    toEntry("互卦中途", "过程", "互卦示过程中段，非初非终。", "勿以本卦单断终局。"),
    toEntry("综卦对视角", "对照", "综卦示对方或环境立场。", "谈判、关系类换位思考。"),
    toEntry("错卦阴影", "对照", "错卦示相反或盲点面。", "决策前自查所忽。"),
    toEntry("应期推窗", "时间", "动变节奏与所选时间窗交叉定窗口。", "当下/七日/一月/一季对应不同复盘粒度。"),
    toEntry("初吉终乱", "常用", "既济类卦事成将满需防松懈。", "收尾阶段尤慎。"),
  ],
  patterns: [
    pattern("dong-yao-fa", "动爻发用", "动变格", "平", "卦中有动爻，事有转折。", "关键在动爻位与爻辞。", "抓应期与行动窗口。", "动而体空则虚。", "围绕动爻制定行动。"),
    pattern("bian-gua-shi", "变卦示终", "动变格", "吉", "变卦示下一阶段落点。", "结局倾向，结合生克读。", "问结果、走向类有用。", "变卦非绝对定数。", "以变卦定复盘节点。"),
    pattern("ben-gua-jian", "本卦见势", "本卦格", "平", "本卦定当前大势。", "现状结构与主要矛盾。", "一切解读的起点。", "勿以本卦单断终局。", "先读懂本卦再论动变。"),
    pattern("yong-sheng-ti", "用生体顺", "生克格", "吉", "用卦五行生体卦。", "外部助力，事易成。", "利合作、申请、推进。", "体休囚则力减。", "顺势推进，把握窗口。"),
    pattern("ti-ke-yong", "体克用", "生克格", "吉", "体克用，主体掌控局面。", "可成，但需主动付出。", "利竞争、决策、切割。", "过刚易折。", "果断但留余地。"),
    pattern("yong-ke-ti", "用克体阻", "生克格", "凶", "用卦五行克体卦。", "压力大，事多阻。", "宜等待、借力或换路径。", "变卦生体可缓解。", "降级目标，先解压力。"),
    pattern("ti-yong-bihe", "体用比和", "生克格", "平", "体用同五行。", "稳定、同频、进展慢。", "利守成、维持。", "难有大突破。", "耐心积累，勿急。"),
    pattern("qian-ti", "乾体主动", "卦象格", "吉", "体或本卦为乾。", "主动、开创、主导。", "利启动、领导、推进。", "过刚需柔。", "主动但听反馈。"),
    pattern("kun-cheng", "坤体承载", "卦象格", "平", "体或本卦为坤。", "承载、配合、守成。", "利积累、配合、守势。", "过柔难突破。", "借力而非强攻。"),
    pattern("kan-xian", "坎象险阻", "卦象格", "凶", "坎为主象或变卦。", "险陷、进退两难、暗线。", "宜探明信息、勿冒进。", "变卦离则渐明。", "先调研再动。"),
    pattern("li-ming", "离象显明", "卦象格", "吉", "离为主象。", "显明、曝光、证据。", "利澄清、展示、依附。", "过曝则有口舌。", "把握信息窗口。"),
    pattern("gen-zhi", "艮象停止", "卦象格", "平", "艮为用或变。", "停止、边界、暂停。", "问进则宜止，问守则吉。", "艮非终局。", "设边界，等待时机。"),
    pattern("dui-kou", "兑象口舌", "卦象格", "平", "兑为用或变。", "沟通、承诺、交换。", "利谈判、和悦。", "口舌是非需防。", "书面确认承诺。"),
    pattern("zhen-dong", "震象启动", "卦象格", "吉", "震为主象或动。", "突发、惊动、出发。", "利快速启动、打破僵局。", "过震则乱。", "抓窗口果断行动。"),
    pattern("xun-jin", "巽象渐进", "卦象格", "平", "巽为用或变。", "渗透、沟通、渐进。", "利谈判、传播、学习。", "过慢则失机。", "小步推进累积。"),
    pattern("hu-gua-zhong", "互卦中途变", "互变格", "平", "互卦与体用生克不同。", "过程中段另有变化。", "勿以初判定终局。", "互克体则中途有阻。", "设中期检查点。"),
    pattern("zong-gua-dui", "综卦对视角", "对照格", "平", "综卦示对方立场。", "理解对手或环境。", "谈判、关系类有用。", "不代主卦。", "换位思考再行动。"),
    pattern("cuo-gua-yin", "错卦阴影", "对照格", "平", "错卦示盲点或反面。", "见所避或所忽。", "决策前自查。", "非主断卦。", "列出若相反则如何。"),
    pattern("tai-tong", "地天泰", "常用卦", "吉", "上下交通、顺遂。", "利合作、通达、推进。", "泰极则否。", "顺势但防骄。", "顺势推进，留后手。"),
    pattern("pi-ge", "天地否", "常用卦", "凶", "上下隔绝、阻塞。", "宜等待、换路径。", "否极泰来。", "不强行突破。", "换路径或等待时机。"),
    pattern("ji-ji-fang", "水火既济", "常用卦", "平", "事成将满。", "利收尾、防初吉终乱。", "问进行中吉，问终局慎。", "成功后仍要守成。", "收尾阶段尤慎。"),
    pattern("wei-ji-tu", "火水未济", "常用卦", "平", "事未竟成。", "仍在途中，需耐心。", "勿急断失败。", "持续投入但设检查点。", "设中期检查点。"),
    pattern("ge-bian", "泽火革", "常用卦", "平", "变革更新。", "旧局将改，抓动变。", "革故鼎新有代价。", "备Plan B。", "变革前备好缓冲。"),
    pattern("sanbi-qigua", "三币起卦", "取数格", "平", "三枚铜钱六次成卦，老阴老阳为动。", "动爻由钱币结果定。", "适合事件占问。", "与数字、时间起卦勿混用。", "记录六次投掷结果。"),
    pattern("shuzi-qigua", "数字起卦", "取数格", "平", "以数字映射上下卦与动爻。", "数源须明确。", "适合远程或快速起卦。", "混用数源则乱。", "标注数字来源。"),
    pattern("shijian-qigua", "时间起卦", "取数格", "平", "以年月日时起卦。", "时空结构定基调。", "事涉时机与节奏。", "混用数源则乱。", "标注起卦时刻。"),
    pattern("yi-shi-yi-gua", "一事一占", "规则格", "平", "同一事短时只占一次。", "重复则卦乱、心乱。", "引导专问、冷却再问。", "非禁止二次占。", "隔日或问意修正后再占。"),
    pattern("chu-ji-zhong-luan", "初吉终乱", "常用卦", "凶", "既济类：成后松懈。", "收尾阶段尤慎。", "问终局、问成功后。", "非全过程凶。", "成功后设守成机制。"),
  ],
  ruleGroups: [
    {
      label: "问占法则",
      rules: [
        {
          title: "一事一占",
          steps: ["同一事项短时只占一次。", "问意要专，不可多问合一。", "重复起卦则卦乱，宜隔日或修正问意后再占。"],
          note: "尊重用户焦虑但引导专问。",
        },
        {
          title: "起卦方式专一",
          steps: ["时间、三币、数字起卦择一为主。", "记录来源备查。", "混用则卦象与应期易乱。"],
          note: "与工作台三种模式选项对应。",
        },
      ],
    },
    {
      label: "本变动读法",
      rules: [
        {
          title: "三层结构",
          steps: ["本卦见势：定当前大势与结构。", "动爻见转折：抓触发点与应期。", "变卦见落点：定下一阶段倾向。"],
          note: "经典卦象层面，与纳甲六亲体系区分。",
        },
        {
          title: "辞象并用",
          steps: ["先读卦辞定调，再读动爻爻辞。", "变卦卦辞看下一阶段语气。", "单爻不断，须回到整体。"],
          note: "preview 工作台为模板拼装，非完整演卦。",
        },
        {
          title: "互综错对照",
          steps: ["互卦看过程中段。", "综卦看对方视角。", "错卦看盲点与反面。"],
          note: "对照卦不作主断，只作校准。",
        },
      ],
    },
    {
      label: "体用生克",
      rules: [
        {
          title: "生克优先级",
          steps: ["先定体用，再读生克。", "用生体顺，体克用可成但费力，用克体逆，比和稳。", "变卦生克可修正本卦判断。"],
          note: "比和非凶非吉，宜守。",
        },
      ],
    },
    {
      label: "正信边界",
      rules: [
        {
          title: "趋势非定数",
          steps: ["卦象示倾向与取舍，非宿命。", "医疗、法律、财务须专业意见。", "重大决定需现实信息校验。"],
          note: "作决策辅助，非替代思考。",
        },
      ],
    },
  ],
  classicNotes: [
    {
      source: "《周易》",
      principle: "观象玩辞",
      paraphrase: "以卦象与卦辞、爻辞玩占，观变化之道。",
      application: "本卦变卦动爻三层展示。",
      caution: "勿断章取义单爻。",
    },
    {
      source: "《周易·系辞》",
      principle: "穷则变，变则通",
      paraphrase: "物极必变，动爻示转折之机。",
      application: "动爻区高亮，变卦读落点。",
      caution: "变非必然，看整体生克。",
    },
    {
      source: "《周易·系辞》",
      principle: "刚柔相推而生变化",
      paraphrase: "阴阳互推成卦变，老阴老阳为动。",
      application: "三币起卦动爻规则说明。",
      caution: "各派动爻口径略异。",
    },
    {
      source: "《周易》",
      principle: "乾健坤顺",
      paraphrase: "乾主动开创，坤主承载配合。",
      application: "八卦取象与事业进退问事。",
      caution: "刚柔需互济。",
    },
    {
      source: "《周易·彖传》",
      principle: "泰否相推",
      paraphrase: "泰极则否，否极泰来，物无常盛。",
      application: "泰否常用卦格局解读。",
      caution: "勿以单卦定终身。",
    },
    {
      source: "《周易》",
      principle: "既济初吉终乱",
      paraphrase: "事将成时尤需谨慎，防成功后松懈。",
      application: "既济类卦收尾提醒。",
      caution: "非断事必败。",
    },
    {
      source: "传统占法",
      principle: "三币起卦",
      paraphrase: "三枚铜钱六次成卦，动爻由老阴老阳定。",
      application: "起卦方式选项之一。",
      caution: "与数字、时间起卦口径不同，需标注。",
    },
    {
      source: "传统占法",
      principle: "时间起卦",
      paraphrase: "以问事时刻年月日时起卦。",
      application: "起卦方式选项之一。",
      caution: "记录时刻备查。",
    },
    {
      source: "现代实务",
      principle: "趋势非定数",
      paraphrase: "卦示倾向与反思，非宿命论断。",
      application: "输出行动建议与复盘窗口。",
      caution: "忌恐吓式断语。",
    },
    {
      source: "诸象 Atlas",
      principle: "与纳甲六爻区分",
      paraphrase: "本页为经典卦象 preview 工作台；纳甲世应六亲见「纳甲六爻」。",
      application: "避免用户混淆两套断法。",
      caution: "preview 结果为模板拼装，非真实演卦。",
    },
  ],
  extraPanels: [
    {
      label: "体系区分",
      items: [
        {
          title: "易经卦象（本页）",
          subtitle: "preview",
          body: "本卦、动爻、变卦、卦辞爻辞与八卦取象；工作台按输入生成模板化 draft。入口：/methods/iching/workbench",
          hint: "经典易学视角",
        },
        {
          title: "纳甲六爻",
          subtitle: "可用",
          body: "世应、六亲、用神旺衰、纳甲配六神；见 /methods/liuyao 真实起卦。",
          hint: "事件占断视角",
        },
        {
          title: "梅花易数",
          subtitle: "preview",
          body: "体用生克、外应取象、时空取数；见 /methods/meihua。",
          hint: "邵雍体用体系",
        },
      ],
    },
    {
      label: "爻位速查",
      items: [
        { title: "初爻", subtitle: "事始", body: "启动、根基、最初条件", hint: "问「能不能开始」" },
        { title: "二爻", subtitle: "内中", body: "内部准备、基层、幕后", hint: "问「内部是否就绪」" },
        { title: "三爻", subtitle: "内外", body: "转折风险、进退犹豫", hint: "问「要不要继续」" },
        { title: "四爻", subtitle: "近君", body: "接近权力、辅助、曝光", hint: "问「能否获得支持」" },
        { title: "五爻", subtitle: "君位", body: "主导、决策、核心", hint: "问「谁主导局面」" },
        { title: "上爻", subtitle: "事终", body: "收尾、过犹不及、结局", hint: "问「结果如何收场」" },
      ],
    },
    {
      label: "时间窗对应",
      items: [
        { title: "当下", subtitle: "即时", body: "眼前决策、即时反馈、当日行动", hint: "对应 operation 窗口" },
        { title: "七日", subtitle: "短周期", body: "一周内变化、短期应验与调整", hint: "抓动爻应期" },
        { title: "一月", subtitle: "中周期", body: "一个月内趋势、阶段目标", hint: "变卦读落点" },
        { title: "一季", subtitle: "长周期", body: "季度布局、阶段复盘", hint: "本卦定大势" },
      ],
    },
  ],
};
