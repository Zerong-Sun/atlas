-- Tradition intros for library tab (MVP seed)
insert into tradition_intros (tradition, title_zh, summary_zh, cultural_note_zh) values
  (
    'bazi',
    '八字命理',
    '以出生年、月、日、时的天干地支组合（四柱）描述个人时运结构，强调五行生克与十神关系。',
    '源于中国传统历学与命理思想，侧重趋势与时机，非宿命论。'
  ),
  (
    'western',
    '西洋占星',
    '以出生时刻与地点计算行星黄经、上升与中天的宫位结构，解读太阳月亮上升「大三元」、七大行星落座落宫、相位与行运触发。涵盖本命（性格与生命主题）、行运（时机与周期）与问事（卜卦盘）三层；语料含行星、星座、宫位、相位及托勒密《占星四书》公版脉络。',
    '现代心理占星取向，强调象征、觉察与选择空间，非宿命论。古典四元素、角续果宫与吉凶星概念供参照；无精确出生时间时宫位与上升不确定，解读应说明局限。'
  ),
  (
    'tarot',
    '塔罗占卜',
    '通过牌阵与牌义象征，映照当下情境、内在冲突与可能方向，常用三牌阵（过去/现在/趋势）。',
    '塔罗作为反思工具，牌义因流派略有差异，本应用采用自研简表。'
  ),
  (
    'iching',
    '周易占卜',
    '以六十四卦象与爻辞描述变化趋势，强调「时」与「位」的匹配，供问事对照。',
    '《周易》为公版古籍；本应用白话与注释为自研，原文引用可追溯至 chunk_id。'
  ),
  (
    'dream',
    '占梦象征',
    '从传统梦占、荣格分析与伊斯兰精神反思等角度，解读梦境象征与情绪，不作预言。',
    '占梦内容仅供文化反思；伊斯兰相关条目避免 fortune telling 表述。'
  )
on conflict (tradition) do update set
  title_zh = excluded.title_zh,
  summary_zh = excluded.summary_zh,
  cultural_note_zh = excluded.cultural_note_zh;
