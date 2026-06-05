import { useMemo, useState } from "react";
import { MOCK_PROFILE } from "@/lib/mock/data";
import { Page } from "@/components/ui/Page";

type PillarKey = "year" | "month" | "day" | "hour";

const PILLARS: Array<{
  key: PillarKey;
  label: string;
  value: string;
  stem: string;
  branch: string;
  hidden: string;
  tenGod: string;
}> = [
  { key: "year", label: "年柱", value: "庚午", stem: "庚", branch: "午", hidden: "丁己", tenGod: "比肩 / 正官" },
  { key: "month", label: "月柱", value: "壬午", stem: "壬", branch: "午", hidden: "丁己", tenGod: "食神 / 正官" },
  { key: "day", label: "日柱", value: "庚申", stem: "庚", branch: "申", hidden: "庚壬戊", tenGod: "日主 / 比肩" },
  { key: "hour", label: "时柱", value: "癸未", stem: "癸", branch: "未", hidden: "己丁乙", tenGod: "伤官 / 正印" },
];

const AUSPICIOUS = [
  {
    name: "天德贵人",
    meaning: "主逢凶化吉、得人扶持。实际判断仍需看是否被冲破、是否得令。",
  },
  {
    name: "月德贵人",
    meaning: "偏向人缘、宽缓与调停力，常被视作柔性助力。",
  },
  {
    name: "文昌",
    meaning: "与学习、表达、文书、考试相关；命局清透时更容易体现为才思。",
  },
  {
    name: "驿马",
    meaning: "象征移动、变化、远行和工作场景转换，宜结合流年触发点看。",
  },
];

const ELEMENTS = [
  { element: "木", count: 0, role: "财星待补" },
  { element: "火", count: 2, role: "官杀成压" },
  { element: "土", count: 1, role: "印星承载" },
  { element: "金", count: 3, role: "日主本气" },
  { element: "水", count: 2, role: "食伤外放" },
];

const ANNUAL = [
  { year: 2024, pillar: "甲辰", tenGod: "偏财", note: "资源与机会出现，但需辨别长期价值。" },
  { year: 2025, pillar: "乙巳", tenGod: "正财", note: "责任感增强，适合整理合作和财务边界。" },
  { year: 2026, pillar: "丙午", tenGod: "七杀", note: "压力和推动力并临，宜把节奏交给计划而非情绪。" },
  { year: 2027, pillar: "丁未", tenGod: "正官", note: "规则、职位、承诺感被放大，可稳住主线。" },
  { year: 2028, pillar: "戊申", tenGod: "偏印", note: "适合学习、转型、研究和系统化沉淀。" },
];

const CLASSICS = [
  {
    source: "三命通会",
    text: "庚金带煞，刚健为体，得火炼而成器，得水润而有声。",
    reading: "金旺并非只看强硬，关键是火来成形、水来开声；所以这盘的指点不是猛冲，而是把表达、训练和秩序结合起来。",
  },
  {
    source: "渊海子平",
    text: "有病方为贵，无伤不是奇；格中如去病，财禄两相随。",
    reading: "命盘里的不平衡不是错误，而是判断用神和行动策略的入口。先看哪里过旺，再看如何疏通。",
  },
];

const SAMPLE_PROFILES = [
  { id: "self", label: "本人", name: MOCK_PROFILE.displayName ?? "示例用户", date: MOCK_PROFILE.birthDate ?? "1990-06-15", time: MOCK_PROFILE.birthTime ?? "14:30", place: MOCK_PROFILE.birthPlace ?? "北京" },
  { id: "friend", label: "朋友", name: "林川", date: "1994-10-08", time: "07:40", place: "上海" },
  { id: "client", label: "咨询对象", name: "陈未", date: "1988-02-19", time: "22:10", place: "成都" },
];

export function BaziPage() {
  const [profileId, setProfileId] = useState(SAMPLE_PROFILES[0].id);
  const [name, setName] = useState(SAMPLE_PROFILES[0].name);
  const [birthDate, setBirthDate] = useState(SAMPLE_PROFILES[0].date);
  const [birthTime, setBirthTime] = useState(SAMPLE_PROFILES[0].time);
  const [birthPlace, setBirthPlace] = useState(SAMPLE_PROFILES[0].place);
  const [activeTerm, setActiveTerm] = useState(AUSPICIOUS[0]);

  const filled = useMemo(() => Boolean(name && birthDate && birthTime && birthPlace), [name, birthDate, birthTime, birthPlace]);
  const currentYear = new Date().getFullYear();

  const selectProfile = (id: string) => {
    const profile = SAMPLE_PROFILES.find((item) => item.id === id);
    if (!profile) return;
    setProfileId(id);
    setName(profile.name);
    setBirthDate(profile.date);
    setBirthTime(profile.time);
    setBirthPlace(profile.place);
  };

  return (
    <Page wide className="bazi-page">
      <section className="method-detail-hero">
        <p className="method-kicker">BAZI DOSSIER</p>
        <h1>八字命盘</h1>
        <p>为不同的人建立档案，输入生日、出生时间、出生地点与姓名，生成四柱、十神、神煞、古文解释和流年提示。</p>
      </section>

      <section className="bazi-profile-strip" aria-label="档案切换">
        {SAMPLE_PROFILES.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={profile.id === profileId ? "active" : ""}
            onClick={() => selectProfile(profile.id)}
          >
            <span>{profile.label}</span>
            <strong>{profile.name}</strong>
          </button>
        ))}
        <button type="button" className="bazi-add-profile">
          <span>新增</span>
          <strong>+</strong>
        </button>
      </section>

      <section className="bazi-steps" aria-label="八字测算流程">
        <span className={filled ? "done" : ""}>录入资料</span>
        <span className={filled ? "done" : ""}>生成四柱</span>
        <span>解释格局</span>
        <span>查看流年</span>
      </section>

      <section className="bazi-workbench">
        <form className="bazi-form">
          <label>
            <span>姓名</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>出生日期</span>
            <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          </label>
          <label>
            <span>出生时间</span>
            <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
          </label>
          <label>
            <span>出生地点</span>
            <input value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
          </label>
        </form>

        <div className="bazi-summary">
          <span>命盘状态</span>
          <strong>{filled ? "已生成演示盘" : "等待资料完整"}</strong>
          <p>{name || "此人"}：日主庚金，金水偏旺，火土为调候关键。此处后续可接真实排盘服务与地理时区校正。</p>
        </div>
      </section>

      <section className="pillar-board" aria-label="四柱">
        {PILLARS.map((pillar) => (
          <article className="pillar-card" key={pillar.key}>
            <span>{pillar.label}</span>
            <strong>{pillar.value}</strong>
            <dl>
              <div><dt>天干</dt><dd>{pillar.stem}</dd></div>
              <div><dt>地支</dt><dd>{pillar.branch}</dd></div>
              <div><dt>藏干</dt><dd>{pillar.hidden}</dd></div>
              <div><dt>十神</dt><dd>{pillar.tenGod}</dd></div>
            </dl>
          </article>
        ))}
      </section>

      <section className="bazi-two-col">
        <div className="bazi-panel">
          <div className="section-heading">
            <p>HOVER TERMS</p>
            <h2>神煞与术语解释</h2>
          </div>
          <div className="term-cloud">
            {AUSPICIOUS.map((term) => (
              <button
                key={term.name}
                type="button"
                onMouseEnter={() => setActiveTerm(term)}
                onFocus={() => setActiveTerm(term)}
                onClick={() => setActiveTerm(term)}
                className={activeTerm.name === term.name ? "active" : ""}
              >
                {term.name}
              </button>
            ))}
          </div>
          <p className="term-reading">{activeTerm.meaning}</p>
        </div>

        <div className="bazi-panel">
          <div className="section-heading">
            <p>FIVE PHASES</p>
            <h2>五行分布</h2>
          </div>
          <div className="element-bars">
            {ELEMENTS.map((item) => (
              <div className="element-row" key={item.element}>
                <span>{item.element}</span>
                <i style={{ width: `${Math.max(10, item.count * 28)}%` }} />
                <strong>{item.role}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="classic-section">
        <div className="section-heading">
          <p>CLASSICS</p>
          <h2>古文解释</h2>
        </div>
        <div className="classic-list">
          {CLASSICS.map((item) => (
            <article className="classic-card" key={item.source}>
              <span>{item.source}</span>
              <blockquote>{item.text}</blockquote>
              <p>{item.reading}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="annual-section">
        <div className="section-heading">
          <p>ANNUAL FLOW</p>
          <h2>流年提示</h2>
        </div>
        <div className="annual-list">
          {ANNUAL.map((item) => (
            <article className={item.year === currentYear ? "annual-card current" : "annual-card"} key={item.year}>
              <span>{item.year}</span>
              <strong>{item.pillar} · {item.tenGod}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}
