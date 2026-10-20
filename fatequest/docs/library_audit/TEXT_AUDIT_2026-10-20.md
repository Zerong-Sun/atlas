# 文本质量与审校证据审计 · 2026-10-20

范围仅为游戏文本、故事作者源、编译词典、事件文本接线与审校文档。书籍原文、版权、拆章覆盖另由书籍审计负责。整改执行阶段已按逐条 effects 对照表改写 92 条双语交易结果，并补齐 4 条同类城市互动；重新编译运行词典，同时修正 story stamp parser 的连字符读取并补齐 9 条 UI stamp。没有修改事件效果、书籍原文或人工审阅结论。自动改写不充当人工签署。

## 1. 结论与证据口径

文本键已经齐全，**不能据此宣称全量文本完成校译**。当前有 92 条审计队列交易反馈和 4 条同类城市互动已自动修复；当前人工审校证据未闭环。必须独立记录：键存在、源文版本对应、双语语义与文字质量、人工签署。

| 实测对象 | 数量/状态 | 证据与限制 |
|---|---|---|
| story 单元 | 140，英文/中文各 3955 键 | `text_review_inventory.csv`，逐单元路径及文件 SHA-256 |
| 运行词典 | 英文/中文各 5556 键，双语差集 0 | `content/i18n/{en,zh}.json`；键完整不证明翻译准确；96 条效果结果已重新编译 |
| 词典有而 story 无 | 1601 键 × 2 语言，附表 3202 行 | `text_runtime_only_inventory.csv`；可能由其他生成器维护，不能称全部无源或未译；新增 `ui.volume` 已登记 |
| 显式源文 stamp | 3955 匹配、0 过期、0 缺章 | 直接读取 frontmatter（含连字符）并按工具同样的空白归一化 SHA-256 前 12 位复算 |
| 工具可读 stamp | 3955 匹配；连字符键已由 parser 正确读取 | `tools/lore/story.mjs` 的嵌套键正则支持 `\w.-`；无 stamp 会计为 missing，不再静默通过 |
| 工具报告 | `3955 current · 0 stale · 0 missing` | 当前计数可复核，但仍只证明源文 stamp 一致，不证明翻译质量或人工签署 |
| 元数据声明 | 112 translated、28 reviewed；20 proofed:true；108 自述人工校译 | 保留自述，**不据此否定过去有人读过，也不据此宣称当前逐条人工验收** |
| 可追踪人工证据 | 在本轮检索的 story 元数据与 docs 中未找到完整逐条记录 | `R1_READTHROUGH.md` 55 项未勾、seed 空；`RELEASE_CANDIDATE.md` §8 和 `AI_USAGE.md` §5 签署栏空白 |
| 英文 `.body` | 614 条；其中 >100 空白分词的 173 条 | `l10n report` 输出 long-form 0 实际只数**缺译** body，不是待人工校读数量 |
| 城市 | 103；62 无 sites，其中 38 有 market | 103 均有入城正文；不能把空探索数组称为“空白城市文本” |

### 清单文件

- `text_review_inventory.csv`：140 行故事单元；键数、缺/额外键、metadata、显式 stamp、工具漏读数、缺章 key、证据与待审状态、两份源文 SHA-256。`human_review_record` 是本次证据发现状态，不是对作者身份的判断。
- `text_confirmed_rewrite_items.csv`：92 个确定需改写 key；每行原文、路径、事件 ID、choice 序号（从 0 起）、真实 effects 和改写要求。
- `text_duplicate_candidates.csv`：7 行完整长反馈重复候选，对应 3 组；只有达到 45 字符且 key 含 `.body` 或 `result` 的完全同文才入此表，因此不代表所有近似模板。
- `text_runtime_only_inventory.csv`：1601 键的双语维护来源待定位清单；不是缺译清单。
- `text_city_content_inventory.csv`：103 城的 sites、market、入口正文 key/长度及专用短简介字段检查。
- `text_quality_review_inventory.csv`：3955 个双语 authoring key 的源/译文 hash、key 类型、保守风格标记、来源状态和证据路径；本轮机器筛出 17 个需编辑复核项（11 个短导师/道路提示、4 个制作说明混入、1 个中英文同文书案引文、1 个有意同文日期格式）。标记不是自动低质量判定。
- `text_inventory_summary.json`：机器统计汇总，`runtime_only_distinct_keys: 1601` 与 `runtime_only_language_rows: 3202` 分开记录。

## 2. 确认的问题：须改写或补齐验收证据

| ID / 优先级 | key / 路径 | 可复核示例与问题 | 后续验收 |
|---|---|---|---|
| TX-01 / P1 | 92 key 详见 `text_confirmed_rewrite_items.csv`；例如 `ev.ev_aden_a.choice_2_result`，`content/story/aden/zh.md:133` | “银钱易手，囊中为之或增或减。”共 53 条；“一注钱款进出，得失皆在掌中。”共 39 条。亚丁该分支明确 `coins:-900, goods pepper:+1`，却不说明确定付款数量。 | **自动改写已完成**：按每条真实 effects 写明付款/收入方向和数量，物品结果写明数量；中英文已重编译。仍需中文叙事、英文自然度和玩家可读性的人工签署。 |
| TX-02 / P1 | `ev.ev_kiovia_mentor_runes.choice_1_result`，`content/story/t2-div-wire/zh.md:387`；同文另见卡法同 key 族 | “你在路上用去 7 日光阴。”对应 `days-learning-runes`，实际是学习耗时；同时固定学费 -5000 写成“或增或减”。英文也用 `before the way is clear again` 泛化语境。 | 说明在此学习七日、学费与所得知识；与卡法分别核对本地人物/场景。此项包含于 TX-01 的 92 项，不重复计数。 |
| TX-03 / P0 验收证据 | `tools/lore/story.mjs` parseDoc/check；`text_review_inventory.csv` | 已修复含连字符 stamp 的静默漏读；无 stamp 现在会计为 missing，当前 3955/0/0。 | 保持 parser 回归；发布门禁是否把 missing 设为阻断由产品策略决定，不能以当前全量通过代替人工审阅。 |
| TX-04 / P1 | `content/story/ui_city_market_polish/zh.md` 7 key；`content/story/ui_dialog_polish/zh.md` 2 key | 9 个 UI key 已补齐逐条 source hash stamp。 | 仍需双语校对、记录人/日期/结论；有章仍须留审阅证据。 |
| TX-05 / P0 验收证据 | 140 单元；`R1_READTHROUGH.md`；`RELEASE_CANDIDATE.md` §8 | `reviewed`、`proofed` 和“人工校译”自述没有对应当前文本版本的逐条可追踪签署；历史清单未勾选。 | 建立 key + 源文hash + 译文hash + 审阅人 + 日期 + 结论 + 问题/复核链接。可以批次签署，但必须列出所覆盖键与版本。 |
| TX-06 / P1 文档 | `TEXT_REQUIREMENTS.md` 原 §1/§4.1/§10、`L10N_PLAN.md` 原当前基线 | 同文档一处说 12 主城多轮完成、一处说至少缺 47 页；3179/1838 与 5465/3763 旧数被当当前数；24 课既“仍占位”又“完成”。 | 本轮已改：历史接线完成与当前质量待验收分列；更新当前统计；不重复安排已完成的结构生产。 |

## 3. 候选人工复核：不自动判错，不机械替换

| ID / 优先级 | key / 路径 | 原文/现象 | 为什么需人工判断 |
|---|---|---|---|
| RV-01 / P2 | `ev.ev_tanpiju_a_followup.body`，`content/story/tanpiju/zh.md:166` | “他说潭州之富，因行在在近” | “行在”是地名，后一“在”也可能承担语法作用；自动去重会误伤专名。句式确实拗口，建议编辑改为“因距行在不远”，对照英文 `because Kinsay is near`。不能未经判读列成确凿重复字。 |
| RV-02 / P2 | `ev.kinsay.battuta_a.body` 及其 result，`content/story/battuta/zh.md:559`；其他 key 使用“伊斯兰” | 同一宗教既称“回教”，又称“伊斯兰”；书案另有“回回教” | 可能是史料叙述语域区别；应由术语/文化复核决定叙述层与引用层规则，不能全库替换。 |
| RV-03 / P2 | `text_duplicate_candidates.csv`，尤其 3 条 `ev.ev_road_*_counsel.choice_2_result` | `You walk on. The matter is marked and will not be forgotten.` | 离开动作可复用；但若改变不同 flag，应核对玩家是否得到足够具体反馈。完整重复本身不等于错误。 |
| RV-04 / P2 | `book.zhenghe.passage`，`annex.meta_fmt`、`ui.hud.date`、`ui.lang_en` | 原始比较中英同文 4 键 | 两个格式串、语言自称 `English`、中文书案引文各有原因。不能把它们统称未翻译；引文的英文读者说明由书案文本审阅决定，本轮不改引文。 |
| RV-05 / P2 | `content/i18n/{en,zh}.json` 的 1601 非 story 键 | 词典有字符串，story 中找不到；新增 `ui.volume` 已登记 | 需要逐组定位生成器/旧源、建立版本与人工校读路径；不应为追求统一误删合法生成文本。 |
| RV-06 / P2 | `book.battuta.blurb`，`content/story/books/zh.md:70` | “我们按段落取证，不整章硬绑，好让每条引证一眼可核。” | 面向玩家简介混入制作流程说明。需编辑决定是否改为书的旅途主题和可读内容；书籍史料覆盖结论另由书籍审计处理。 |

本轮扫描未发现足以直接定案的普通错别字或旧身份名残留；“白图泰式/波罗式”当前 zh 词典均为 0。未发现不等于已全量人工证无错。书名“行记”和叙述“行纪”属于不同语境，未列为术语错误。

## 4. 短简介和空城的真实缺口

- **独立短简介未建立**：103 城记录均无 brief/short/summary/intro/description 字段。`game/ui/city_detail_card.gd` 直接取入口事件 `body`；已有正文长度 54–373 英文词，不能一律充当可扫读简介。建议新增独立双语短简介要求：地点特征、可做的事、下一步线索；正文照常保留。
- **62 城无 sites 不等于无故事**：全部 103 城有入口正文；62 中 38 有市集。应将“没有可探索地点”与“没有任何可读文案”分开验收。某些城市还有导师，不可只看 sites。
- **专属市集介绍不足**：78 城带 market，仅亚历山大和刺桐有 `city.<id>.market.name/desc` 两类专属键。其余 76 城可以正常展示商品与通用市集 UI，但本地风物与集市人物不是由商品清单自动补齐。为用户期待的饮食、歌舞、饰品和热情接待体验，应按城市另立地方文本包；不将现有通用回退误报为 raw-key 错误。
- **多轮页数不是质量**：已接线批次不重复重写；先核对“人物发言/舞种/具体货物/下一步”是否实写进每个相关分支，再决定局部扩写。此次未冒称逐篇完成全部 431 事件的文学评审。

## 5. 本轮文档修订与验证

已更新 `TEXT_REQUIREMENTS.md` 和 `L10N_PLAN.md`：当前数量与历史快照分离；取消“当前仍缺 47 页”等过时待办；课程入库与人工文化校读分离；明确 stamp 仅表源文版本；补人工记录格式与短简介/76 市集地方介绍缺口；将“ASCII 机翻率”和“中英同文即运行回退”等不准确判据改为字符泄漏及逐条同文判断。未把任何待签项勾成完成。

## 5. 整改执行记录

本轮执行了 `node tools/lore/rewrite_confirmed_feedback.mjs`。脚本读取 `text_confirmed_rewrite_items.csv` 中的事件 effects，只替换已确认的模糊金额/货物句，不改事件数据。它更新了 92 个中文结果和对应英文结果，共 184 个语言条目，并运行 `node tools/lore/story.mjs build` 重新生成 `content/i18n/{en,zh}.json`。导师学习分支另将“在路上用去 N 日”改成明确的学习耗时。

随后按同一规则修复了 4 个城市互动的确定性效果描述：古里交易补明付款 1500 钱币和一袋胡椒；三处纸钞/杭州扇互动补明获得的 1 件物品。对应中英文已重新编译，未改事件 effects。`tools/lore/build_text_quality_inventory.py` 生成的 3955 键审阅库记录了这些变更后的 hash。

脚本是可重复的、幂等的，不会批量盖掉其他审阅状态；只为本次实际变更的双语 key 同步源文 stamp。剩余人工工作是：按当前 hash 逐条通读，确认“钱币”是否符合 UI 的货币称谓，检查中文历史语域与英文叙事自然度，并记录审阅人、日期、结论和回归路径。

只读验证结果：

- `node tools/lore/l10n.mjs report --lang zh`：5556/5556；其 long-form 0 的实际含义已说明。
- `node tools/lore/story.mjs check`：3955 current / 0 stale / 0 missing；连字符 parser 与无章计数已纳入门禁。
- `node tests/test_i18n_lines.mjs`：ALL CHECKS PASSED；这是结构/键/术语门禁结果，不是人工校译结论。
- 机器清单逐单元双语键数均相等，显式 hash 按 source prose 归一化复算；文件 hash 将此清单绑定到本次文本版本。

建议次序：先修验收证据与检查器缺口；然后对 96 条已自动修复的效果反馈进行人工签署；按 `text_quality_review_inventory.csv` 复核 17 个风格标记（其中 11 个短提示需结合界面判断）；随后处理候选与优先城市短简介/地方介绍；最后进行带 seed/版本/逐键范围的双语人工通读。
