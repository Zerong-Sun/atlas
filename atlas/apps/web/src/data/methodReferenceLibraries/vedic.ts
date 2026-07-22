import { getMethodDeepLibrary } from "../methodDeepLibraries";
import { groupDeepSymbols, pattern, toEntry } from "./builders";
import type { MethodReferenceLibrary } from "./types";

const deep = getMethodDeepLibrary("vedic")!;

export const VEDIC_REFERENCE: MethodReferenceLibrary = {
  id: "vedic",
  title: "吠陀占星分析库",
  symbolGroups: groupDeepSymbols(deep.symbols, [
    { id: "grahas", label: "九曜与节点", groups: ["行星", "核心", "节点"] },
    { id: "bhavas", label: "关键宫位", groups: ["宫位"] },
    { id: "nakshatras", label: "二十七宿", groups: ["星宿"] },
    { id: "dashas", label: "大运系统", groups: ["周期", "系统"] },
    { id: "yogas", label: "瑜伽格局", groups: ["Yoga", "组合", "尊卑", "相望", "转运", "分盘"] },
  ]),
  questionTypes: [
    {
      type: "心智情绪",
      focus: "内在习惯、情绪脚本、心理安全感与反应模式",
      usefulGod: "月亮、月亮宿、第四宫、月亮宫主",
      readingKey: "吠陀以月亮为核心，先看月亮星座、宫位、宿与 Dashas 权重。",
    },
    {
      type: "事业职责",
      focus: "社会角色、职业方向、权威关系与公众行动",
      usefulGod: "第十宫、太阳、土星、Dashamsha、宫主星",
      readingKey: "十宫与太阳定职责，Dashamsha 分盘细化职业呈现；土星示耐力与延迟。",
    },
    {
      type: "婚姻合作",
      focus: "伴侣品质、婚姻时机、合作模式与关系业力",
      usefulGod: "第七宫、金星、Navamsa、第七宫主",
      readingKey: "Navamsa 是婚姻潜力关键；第七宫主与 Venus 定吸引与和合质量。",
    },
    {
      type: "财富资源",
      focus: "财源结构、积累能力、财务风险与家族资源",
      usefulGod: "第二宫、第十一宫、木星、Dhana Yoga",
      readingKey: "二宫看积蓄，十一宫看收益；木星与 Dhana Yoga 示财富格局。",
    },
    {
      type: "Dasha 周期",
      focus: "当前大运主题、小运触发、阶段转换与应期",
      usefulGod: "Mahadasha 主星、Antardasha、Pratyantar、行运土星木星",
      readingKey: "大运定十年章节，小运定具体窗口；事件需大运+小运+行运三层对齐。",
    },
    {
      type: "业力课题",
      focus: "前世遗留模式、执着与释放、灵性成长方向",
      usefulGod: "Rahu、Ketu、十二宫、Kemadruma、宫主",
      readingKey: "罗睺示欲望突破，计都示放下；节点轴线定业力方向，不单断凶吉。",
    },
    {
      type: "健康体质",
      focus: "体质倾向、慢性消耗、调养方向与第六宫主题",
      usefulGod: "第六宫、火星、土星、月亮、Ascendant",
      readingKey: "六宫看疾病与日常管理；只作趋势提醒，重大健康问题需医学判断。",
    },
  ],
  analysisSteps: [
    "确认出生数据：精确到分钟的时间、地点，决定 Lagna 与月亮位置。",
    "读 Lagna 与月亮：上升定人生框架，月亮定心智情绪，二者并看不可偏废。",
    "评估行星力量：入庙、擢升、落陷、Combust、逆行，辨表达强弱而非绝对吉凶。",
    "串联宫主星：以 Bhava 宫主连接生活领域，配合 Drishti 行星视线跨宫作用。",
    "识别 Yoga 格局：Gaja Kesari、Dhana、Raja 等需结合整体与 Dasha 权重。",
    "进入 Dasha 系统：定当前 Mahadasha 与 Antardasha，明确阶段主题与触发星。",
    "叠行运触发：土星木星过宫过星作短期激活，三层（本命+大运+行运）对齐再断。",
    "输出策略：强调修行、职业与关系策略，避免宿命化，附现实复盘点。",
  ],
  relations: [
    toEntry("Drishti 视线", "跨宫影响", "行星按固定规则投射视线至其他宫位，远程影响。", "火星看第四第七第八宫，木星看第五第七第九宫，土星看第三第七第十宫。"),
    toEntry("宫主星关联", "领域串联", "宫头星座守护星落宫决定两宫主题如何流动。", "十宫主落二宫：事业与财富直接挂钩，宜走专业变现。"),
    toEntry("罗睺计都轴", "业力轴线", "罗睺示执着与非传统突破，计都示分离与灵性释放。", "罗睺落宫为欲望放大处，计都落宫为需放下处。"),
    toEntry("Combust 焦伤", "力量削弱", "行星距太阳过近被焦伤，该行星表达受阻或内化。", "水星焦伤利内省但沟通需多确认；非绝对失效。"),
    toEntry("逆行 Vakri", "能量内化", "行星逆行时议题重复、延迟或转向内在处理。", "逆行金星重审关系价值，逆行木星重审信念体系。"),
    toEntry("分盘叠读", "细化维度", "Navamsa 看婚姻内在，Dashamsha 看事业，分盘行星不宜孤立。", "本命行星在 Navamsa 落陷，婚姻需更多现实经营。"),
    toEntry("互溶 Parivartana", "宫位交换", "两宫宫主星互落对方宫位，形成资源互换。", "一宫主落十宫、十宫主落一宫：事业与自我高度绑定。"),
    toEntry("Nakshatra 心理", "宿的心理层", "二十七宿提供比星座更细的心理脚本与行为倾向。", "月亮宿定情绪反应底色，行星宿修饰该行星表达方式。"),
  ],
  patterns: [
    pattern("gaja-kesari", "Gaja Kesari Yoga", "吉祥格局", "大吉", "木星与月亮互成 Kendra（角宫）关系。", "智慧、名声、保护与贵人运增强，心智清明。", "利学术、管理、公共事务与长期声誉积累。", "若木星落陷或受克，吉象减弱需看补救。", "主动承担教导、顾问、公益角色以激活木星。"),
    pattern("dhana-yoga", "Dhana Yoga", "财富格局", "吉", "二宫、十一宫宫主星处于有力位置且互相关联。", "财源结构清晰，积累能力与机会并存。", "利理财、商业、投资收益与家族资源。", "吉不等于暴富，仍需 Dasha 支持与现实努力。", "在财富宫位主题上深耕专业技能与网络。"),
    pattern("raja-yoga", "Raja Yoga", "权威格局", "大吉", "Kendra 与 Trikona 宫主星互相关联或同宫。", "社会权威、领导力与公众认可潜力强。", "利从政、管理、创业领导与组织核心角色。", "需大运触发方能显化，本命有而运不到则潜伏。", "在大运主星有利期主动争取权责与曝光。"),
    pattern("kemadruma", "Kemadruma Yoga", "孤月之象", "凶", "月亮两侧无行星（Kendra 内无伴星）。", "情绪波动、内在孤立感、缺乏安全感。", "促使人学习自我滋养与情绪独立。", "吉神解救或月亮入庙可大幅减轻。", "建立稳定日常节律与可靠支持系统。"),
    pattern("panch-mahapurusha", "Panch Mahapurusha", "五大人格", "大吉", "火星/水星/木星/金星/土星各自入庙或擢升且居 Kendra。", "形成极端突出的个人能力与公众形象。", "利军事、商业、学术、艺术、管理等专业巅峰。", "单看 Yoga 不够，需整盘与 Dasha 验证。", "在 Yoga 所指领域全力深耕，避免分散。"),
    pattern("neecha-bhanga", "Neecha Bhanga", "落陷消除", "吉", "落陷行星满足特定解救条件（如擢升主星在 Kendra）。", "原本弱势行星获得补偿，逆境中反而出成就。", "「先苦后甜」模式，挫折后常有突破。", "解救条件需严格核验，忌随意认定。", "在落陷主题上坚持长期练习，等待 Dasha 触发。"),
    pattern("sade-sati", "Sade Sati", "土星压月", "凶", "行运土星经月亮前后三宿，约七年压力期。", "责任加重、情绪低沉、生活结构被迫重整。", "成熟化、去幻象、建长期根基。", "不是必然灾祸，需看本命月亮与土星力量。", "减速、夯实基础、避免重大冒险，土星过后收获稳固。"),
    pattern("rahu-ketu-axis", "罗睺计都轴线", "业力格局", "平", "罗睺计都对冲，激活所落宫位与星座主题。", "非传统路径、执念与放下沿轴线展开。", "罗睺方突破舒适区，计都方释放旧习。", "罗睺不等于坏，计都不等于好，看整体配合。", "每年设一个北罗睺主题练习，计都技能作资源。"),
    pattern("vargottama", "Vargottama", "分盘同座", "吉", "行星在本命与 Navamsa 同星座，力量一致性高。", "该行星主题内外一致，表达稳定可靠。", "利婚姻（Navamsa）、事业核心能力的持续发挥。", "同座不等于无挑战，仍需看相位与 Dasha。", "在 Vargottama 行星主题上作长期品牌经营。"),
    pattern("guru-chandal", "Guru Chandal", "木罗合", "凶", "木星与罗睺同宫或紧密合相。", "信念体系受非传统力量干扰，易过度乐观或道德模糊。", "利打破僵化信念，探索非主流哲学。", "财务与伦理边界需格外清晰。", "建立独立判断标准，重大决定多源验证。"),
    pattern("kal-sarpa", "Kala Sarpa", "蛇煞", "凶", "罗睺计都之间囊括全部七大行星。", "人生似被命运轴线牵引，议题集中且波动大。", "重大转型与极端经历，灵性觉醒潜力亦高。", "定义与条件有多种流派，忌恐吓式解读。", "专注节点轴线课题，以修行与策略平衡能量。"),
    pattern("budha-aditya", "Budha Aditya", "水日合", "吉", "水星与太阳同宫，心智与意志融合。", "聪明、口才、学术与商业头脑增强。", "利写作、谈判、教学、商业策划。", "若太阳焦伤水星，需防过度自信或言语冲动。", "把才智导入具体项目与可验证成果。"),
    pattern("chandra-mangal", "Chandra Mangal", "月火合", "平", "月亮与火星同宫，情绪与行动紧密联动。", "反应快、冲动强、财务冒险倾向。", "利销售、体育、急救等需即时反应领域。", "情绪驱动决策风险高，关系易起冲突。", "运动与体能渠道释放火星，重大财务决定冷静期。"),
    pattern("parivartana", "Parivartana Yoga", "互溶交换", "吉", "两宫宫主星互落对方宫位，形成直接资源交换。", "所涉两宫主题深度绑定、互相激活。", "利跨领域事业、夫妻店、资源互换型合作。", "绑定过深时一方受损则另一方受累。", "设计互惠结构，保持各宫位独立缓冲空间。"),
  ],
  ruleGroups: [
    {
      label: "Dasha 断事",
      rules: [
        {
          title: "三层运势对齐",
          steps: [
            "定当前 Mahadasha 主星：十年大章节主题。",
            "定当前 Antardasha 子星：一到三年具体触发。",
            "查行运土星、木星是否过本命关键宫主或月亮。",
            "三层同时指向同一主题时，事件发生概率显著提高。",
          ],
          note: "Dasha 是吠陀时间法核心，流年 alone 不足以断事。",
        },
        {
          title: "大运转换期",
          steps: [
            "Mahadasha 最后一年：旧主题收尾，新主题酝酿。",
            "换运前后一年：生活领域常出现明显转换信号。",
            "比较 outgoing 与 incoming 主星本性，预判新阶段风格。",
            "换运期宜总结旧章、设定新意图，避免仓促重大决定。",
          ],
          note: "换运期是观察窗口，不是必然动荡。",
        },
      ],
    },
    {
      label: "分盘解读",
      rules: [
        {
          title: "Navamsa 婚姻法",
          steps: [
            "看 Navamsa 上升与第七宫：婚姻外在呈现。",
            "看 Navamsa 金星与第七宫主：伴侣品质与吸引。",
            "对比本命第七宫：内外是否一致，不一致处为磨合点。",
            "Navamsa 行星 Vargottama 者，婚姻主题内外协调。",
          ],
          note: "Navamsa 是内在潜能盘，不是第二个命盘替代本命。",
        },
        {
          title: "Dashamsha 事业法",
          steps: [
            "看 Dashamsha 第十宫与宫主：事业细分呈现。",
            "看 Dashamsha 太阳与土星：权威与耐力表达。",
            "叠本命十宫：确认事业方向一致或互补。",
          ],
          note: "分盘细化不替代本命，Dasha 触发时才显著显化。",
        },
      ],
    },
    {
      label: "行星力量",
      rules: [
        {
          title: "Shadbala 六力概览",
          steps: [
            "入庙擢升增力，落陷失势减力，但非绝对吉凶。",
            "Combust 焦伤、逆行、敌人宫减力，需综合判断。",
            "有力行星所在宫位主题易发挥，无力者需补偿策略。",
            "Neecha Bhanga 条件满足时，落陷可逆转为优势。",
          ],
          note: "力量评估是策略基础，不作恐吓式落陷定论。",
        },
      ],
    },
  ],
  classicNotes: [
    {
      source: "Brihat Parashara Hora Shastra",
      principle: "命盘乃业力地图",
      paraphrase: "命盘显示业力倾向，Dasha 定时间，自由意志与修行决定显化程度。",
      application: "解读时始终强调策略与修行，避免把命盘读成固定判决。",
      caution: "古典文本需结合现代生活语境转译，忌恐吓式罗睺计都解读。",
    },
    {
      source: "Phaladeepika（成果之灯）",
      principle: "宫主星为核心",
      paraphrase: "宫位意义由宫主星落宫、相位与力量决定，非仅看行星落宫。",
      application: "断事先追宫主星链路，再读行星与宿的细节修饰。",
      caution: "不同流派宫主星计算偶有分歧，需统一采用整宫或分宫制。",
    },
    {
      source: "Jataka Parijata（命盘花环）",
      principle: "Yoga 需整体验证",
      paraphrase: "吉 Yoga 若主星无力或 Dasha 不支持，吉象潜伏；凶 Yoga 有解救则减轻。",
      application: "识别 Yoga 后必须叠 Dasha 与行星力量，不作孤立吉断。",
      caution: "Yoga 名称众多，忌见名断事，需核验形成条件。",
    },
    {
      source: "Saravali（吉祥集）",
      principle: "行星组合定格调",
      paraphrase: "行星同宫或互视决定该领域的基本色调——吉 star 组合主顺遂，凶星需策略。",
      application: "同宫多星时，先定主导星（力量最强者），其余作修饰。",
      caution: "凶星不等于灾祸，常示需要额外努力之处。",
    },
    {
      source: "Brihat Jataka（大命盘）",
      principle: "月亮为心智核心",
      paraphrase: "月亮位置决定心智本质，比太阳更能反映日常情绪与习惯反应。",
      application: "吠陀解读优先月亮星座、宫位、宿与 Dashas，太阳为辅助权威。",
      caution: "月亮核心不等于忽视太阳，二者分别主心智与灵魂权威。",
    },
    {
      source: "Varahamihira《Brihat Samhita》",
      principle: "宿（Nakshatra）细心理层",
      paraphrase: "二十七宿比十二星座更细，揭示潜意识动机与行为脚本。",
      application: "月亮宿定情绪底色，行星宿修饰该行星表达风格。",
      caution: "宿解读需结合 Pad 与 Lord，忌仅用宿名泛化。",
    },
    {
      source: "现代吠陀·Kn Rao",
      principle: "Dasha 是可验证的时间法",
      paraphrase: "Vimsottari Dasha 经大量案例验证，是吠陀预测最核心的时间工具。",
      application: "事件预测必须给出 Dasha 层级与行运叠加，才具可操作性。",
      caution: "时间法有误差带宽，重大决定仍需现实信息支持。",
    },
  ],
};
