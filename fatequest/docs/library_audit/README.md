# 资料库审阅与整改总表

**2026-10-20。** 对照当前文件、需求、引用及代码检查美术、音乐、游戏文本和拆书成果。本文给出执行顺序，四份分域报告及 CSV 给出逐项证据。本轮完成审计、统一风格和可安全接入的生产修复；正式出图、听审和人工签署仍未自动完成。

## 状态口径

- **缺文件/缺内容**：明确规格或体验需要，当前不存在；附预期路径或内容范围。
- **占位/错配/确定改写**：已有产物，但有可复核的不符合项；写明问题及验收条件。
- **有但接入不完整**：文件可用，不代表正确场景会调用；先修映射，避免重复制作。
- **待复核/待签署**：当前证据不足。机器检查、代理视觉抽检、作者自述和人类编辑签署分别记录。
- **历史已交付**：保留当时结论及日期；不作为当前版本全量验收。

P0 表示影响正确性、验收可信度或来源使用判断的优先问题；P1 为内容体验与接入整改；P2 为后续完善。未审不等于低质量，候选疑点不等于确定错误。

共同生产规范见[统一风格与生产 Prompt](STYLE_BIBLE_2026-10-20.md)。所有新文本、图片、音乐和音效必须引用其中一个 prompt，并在输出后记录 hash、来源和审阅范围。

## 可执行整改清单

| ID | 优先级 / 状态 | 工作与范围 | 验收出口 / 负责角色 | 证据 |
|---|---|---|---|---|
| LIB-01 | P0 / 已修复，待内容签署 | 修易经六爻位掩码与文王序映射，核对正文、主变卦及牌面 | 程序回归已通过：64种唯一映射，0→坤2、63→乾1；占法编辑仍需签署卦名/变卦 | [美术 P0-01](ART_AUDIT_2026-10-20.md) · [映射测试](../../tests/smoke_iching_deck.gd) |
| LIB-02 | P0 / 已修复，待门禁策略确认 | 修story stamp解析及无章判定：254条漏读、9条无章却算current | parser已支持连字符，9条UI stamp已补齐；`story check` 当前3955/0/0；仍需决定缺章是否阻断发布 | [文本 TX-03/04](TEXT_AUDIT_2026-10-20.md) |
| LIB-03 | P0 / 证据未闭合 | 建立当前版本的文本及素材审阅记录；撤销无证据的“全量通过”表述 | 内容负责人：ID、源/成品hash、审阅人/身份、日期、范围、结论、复核链接完整 | [文本 TX-05](TEXT_AUDIT_2026-10-20.md) |
| LIB-04 | P0 / 来源待核 | 核对法德兰2012、朱拜尔1952/2020译本使用依据；旧总公域声明已撤下 | 资料负责人：逐版本依据可追溯；未明确前不扩大该底本复用，必要时换底本重校 | [书籍 B01](BOOK_SOURCE_AUDIT_2026-10-20.md) |
| LIB-05 | P1 / 自动改写完成，待人工签署 | 审计队列92条交易反馈，加上4条同类城市互动，均已按真实effects写明付款/收入、数量和物品；学习七日已改成学习耗时 | 192个双语条目已同步，可重复脚本、key级审阅库和回归通过；仍需逐条语言/历史语域签署 | [92条逐键表](text_confirmed_rewrite_items.csv) · [key级审阅库](text_quality_review_inventory.csv) · [改写测试](../../tests/test_confirmed_feedback.mjs) |
| LIB-06 | P1 / 确定重校 | 平托13段对原文/OCR/译文，先处理8段替换字符；保持desk_only | 资料+译审：清除乱码、语义通顺、逐段原文定位，重审后才作城市证据 | [书籍 B02](BOOK_SOURCE_AUDIT_2026-10-20.md) |
| LIB-07 | P1 / 占位替换 | 易经31–64共34张正式牌面；43/44中文标题缺失、侧注裁切 | 美术+占法编辑：卦名六爻正确，缩略图清晰，无占位字样，通过LIB-01 | [美术 P1-03](ART_AUDIT_2026-10-20.md) |
| LIB-08 | P1 / 缺文件 | 当前运行RWS塔罗78张已补齐；云岭暮光替代profile仍缺38张；旧con/mazu18张先按角色需求重定出图矩阵 | 美术：78个RWS牌ID对应且不混入旧profile；人物按当前绑定表预算，旧矩阵与44无图角色不重复相加 | [缺文件路径表](art_inventory.csv) · [塔罗来源](../assets/decks/tarot/SOURCES.md) |
| LIB-09 | P1 / 错配及未拆图 | 重绘法兰克遗孀；拆分/重做多人导师、搬运工/卫士及三条带场景；审查跨文化同图复用 | 美术+叙事：人物ID、年龄/性别/衣饰/道具、单人构图对应；保持已有错误肖像隔离 | [美术 P0-02/P1-01/02](ART_AUDIT_2026-10-20.md) |
| LIB-10 | P1 / 加载器已接入，场景语义待验 | 塔罗40、雷诺曼36、占星骰34已有图形的真实展示路径；城市场景语义映射 | 牌组 resolver 和12项 smoke 已通过；逐ID视觉、实际窗口和城市场景语义仍待验 | [美术 P1-05/06](ART_AUDIT_2026-10-20.md) · [牌组测试](../../tests/smoke_divination_decks.gd) |
| LIB-11 | P1 / 接线已补，待场景回归 | 事件/站点换声景；区分海陆、晴雨及河海港；海鸟、6类SFX、latin使用范围 | AudioDirector 已接站点/路线上下文；需真实窗口核对站点切换、读档和重复切换 | [音频接线1–4/9](AUDIO_AUDIT_2026-10-20.md) · [音频 smoke](../../tests/smoke_audio_runtime.gd) |
| LIB-12 | P1 / 调度已补，待听审 | color零乘数、sacred第5槽丢失、环境重启、SFX序列；16文件端点风险 | color、四槽保留、缓存、六声部SFX和骰/签延时已修；循环3遍、多轨/跨文化过渡仍需实听 | [音频技术及接线检查](AUDIO_AUDIT_2026-10-20.md) |
| LIB-13 | P1 / 质量未审 | 37成品+11类SFX逐项听审，含文化音色、sacred语义、现代声源和混音 | 音频/文化审阅人：记录设备、版本、单曲和场景组合；需重制项按实听结论另列 | [48项听审队列](audio_inventory.csv) |
| LIB-14 | P1 / 来源及功能缺口 | 补12环境音来源链、4搜索页详情链接、输入输出hash和稳定seed；补音量UI及持久化；明确混响需求 | 音频+程序：可复现构建；真实设备重启恢复音量；替代铃声/现代市集来源不隐去 | [音频来源与A1–A8](AUDIO_AUDIT_2026-10-20.md) |
| LIB-15 | P1 / 地方内容缺口 | 103城独立短简介；76市集地方介绍；62无sites城市分批明确探索内容 | 叙事+设计：优先当前路线，写具体人物、饮食、舞种、饰品、商品和离城线索；承诺有互动及史源 | [103城逐项表](text_city_content_inventory.csv) |
| LIB-16 | P1 / 拆书不完整 | 10库补可回查原文/拆章；法德兰选集拆作者年代；瀛涯中文OCR及章节映射 | 资料编辑：书名/版本/作者/年代/页章锚点正确，不把选集全算同一作者见闻 | [书籍 B03–05](BOOK_SOURCE_AUDIT_2026-10-20.md) |
| LIB-17 | P1 / 精读与接入未闭合 | 462段逐条复核；5精读卡继续完成，突尼斯哭泣待定位、苏门答腊婚礼未接入 | 资料+叙事：来源引文、转述、演绎分开；卡片关联剧情和效果，实玩能读能继续 | [462段复核表](book_passage_review.csv) |
| LIB-18 | P1 / 文本审校未闭合 | 按140单元建立双语通读；先玩法关键分支，再课程/术语/文化表达 | 译审+试玩：记录版本、键范围、seed及路径；不以页数、键数或metadata代替质量 | [140单元队列](text_review_inventory.csv) |
| LIB-19 | P2 / 候选复核 | 7行重复候选、地名拗口、宗教术语、书介制作语言；定位1601运行键维护源 | 编辑+工具维护：逐条决定保留/改写，不能机械删重复或将格式串判未译 | [文本候选](TEXT_AUDIT_2026-10-20.md) · [运行键表](text_runtime_only_inventory.csv) |
| LIB-20 | P2 / 视觉未审 | 剩余图像、SVG渲染、商品图标、UI、坐骑、贴纸与缩略图 | 美术+QA：按CSV逐项填写；真实尺寸辨识性、文化语义、来源与导出范围通过 | [美术完整表](art_inventory.csv) |
| LIB-21 | P0 / 标签门禁 | 角色图片标签数据库：性别、文化背景、年龄段、服饰/道具、来源依据、适用引用和SHA256；阻止文化/性别错误回退 | 美术+程序：23个接受stem全有标签；330项 Godot mapping 检查通过；未知角色保持空图 | [角色审计](CULTURAL_REVIEW_AUDIT_2026-10-20.md) · [portrait_review_inventory.csv](portrait_review_inventory.csv) |
| LIB-22 | P1 / 历史文化待审 | 103城市、54人物、61商品、60舞种/音乐、307宗教/礼仪文本逐项核对；原367行 `source_needed` 已拆成333个稳定来源候选和34个明确游戏演绎 | 历史/文化编辑：逐条核对候选 URL 与主张，补书名/章节或明确游戏演绎，填写审阅人、日期和结论；候选仍保持“待专家” | [文化队列](cultural_review_queue.csv) · [队列摘要](cultural_review_summary.json) · [来源注册表](../../tools/art/historical_source_registry.json) · [来源核验](historical_source_verification.json) |
| LIB-23 | P1 / 来源门禁已建立，待逐条专家复核 | 13个稳定一手/官方/学术来源入口；333条队列行有 `source_url/source_title/source_accessed_at`，34条明确没有外部来源 | 工具+历史文化编辑：结构核验必须为0错误；URL可访问性、年代/地点/仪式匹配和最终改写结论仍需人审 | [来源登记](../../tools/art/historical_source_registry.json) · [离线核验脚本](../../tools/art/verify_historical_sources.py) |
| LIB-24 | P0 / 风格基线 | 统一文本、视觉、音乐的 prompt、来源、hash 和跨域复核流程 | 内容+美术+音频+QA：新产物均引用风格圣经并完成对应验收字段 | [STYLE_BIBLE](STYLE_BIBLE_2026-10-20.md) |

以上任务范围有重叠，数量不能求和作为总缺口。负责人按职能列出，未虚构实际领任务或签署人员。优先解决LIB-01–04，再推进确定改写/错配及当前游玩路线的内容。

## 清单规模与读取方式

| 文件 | 行数（不含表头） | 用途 |
|---|---:|---|
| [art_inventory.csv](art_inventory.csv) | 2374 | 2356实际文件（含元数据/导入侧文件）+18预期缺文件；当前塔罗78张齐备，筛选缺图、错配、未目检 |
| [audio_inventory.csv](audio_inventory.csv) | 48 | 37 OGG+11类SFX；技术指标、接线、未听审状态 |
| [text_review_inventory.csv](text_review_inventory.csv) | 140 | 双语单元、hash、stamp、元数据声明、审校证据 |
| [text_quality_review_inventory.csv](text_quality_review_inventory.csv) | 3955 | 逐 key 源/译文 hash、key 类型、保守风格标记、来源状态和证据路径 |
| [text_confirmed_rewrite_items.csv](text_confirmed_rewrite_items.csv) | 92 | 确定重写文本，逐键对应effects |
| [text_runtime_only_inventory.csv](text_runtime_only_inventory.csv) | 3202 | 1601非story运行键×2语言，维护源待定位 |
| [text_city_content_inventory.csv](text_city_content_inventory.csv) | 103 | 城市入口、探索点、市集和独立短简介缺口 |
| [text_duplicate_candidates.csv](text_duplicate_candidates.csv) | 7 | 3组完整重复候选，非自动错误判定 |
| [book_inventory.csv](book_inventory.csv) | 16 | 底本、原文、拆章、书案及显式引用范围 |
| [book_passage_review.csv](book_passage_review.csv) | 462 | 全部places/stories条目、原文锚点、hash与复核事项 |
| [portrait_review_inventory.csv](portrait_review_inventory.csv) | 23 | 运行时接受的人像标签、引用、SHA256和审阅状态 |
| [cultural_review_queue.csv](cultural_review_queue.csv) | 585 | 城市、人物、商品、舞种/音乐、宗教/礼仪逐项历史文化队列，含来源 URL 候选和三态来源决定 |
| [historical_source_verification.json](historical_source_verification.json) | — | 来源字段结构核验摘要：367条请求、333条候选 URL、34条明确游戏演绎、0错误 |
| [TEXT_STYLE_PROMPTS.md](TEXT_STYLE_PROMPTS.md) | — | 新撰剧情、双语译写和游记卡片的统一提示词与交付门槛 |

## 本轮验证与边界

文件清单核对存在性、唯一性、hash和计数；图像做解码及限定样本代理视觉检查；音频做解码指标和调用链检查；文本做键/stamp独立核对及确定问题抽检；书籍做本地来源、章节及引用核对。各域报告记录具体方法。

不声称逐篇完成431事件文学评审、逐段读完16本原书、全库图像人类验收或任何音频实听。缺少历史签署与历史从未审阅不是同一结论。后续须提交新产物及相应证据再关闭条目，不能仅将本表改成“已完成”。

本轮执行关闭：LIB-01 的编号链和牌组/音频/文本的可测试接入；LIB-02 的 parser 与9条缺章记录；LIB-05 的自动改写和 key 级审阅库。仍开放：正式缺图与占位、逐项视觉签署、48项听审、书籍版本依据、人工双语通读和实际窗口回归。提交前复核通过：9份CSV行数一致；2374条美术清单行（2356个实际文件、18个预期缺文件）唯一、存在性及当前hash一致；96条效果反馈的双语文本已同步；3955条 key 的源/译文 hash、风格标记和来源状态已生成；文本/音频/书段hash及报告本地链接有效；见闻卡锚点检查、4项塔罗来源抽样回归、文本结构检查和Godot核心套件通过。`story check`当前3955 current / 0 stale / 0 missing，未把它扩大解释为人工审校通过。
