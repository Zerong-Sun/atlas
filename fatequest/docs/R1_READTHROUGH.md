# R1 全分支人工通读清单 · READTHROUGH

**commit `42eef9f` · 2026-08-08 · 对应需求书 §13.2 / §13.6。**
逐项人工过一遍中英关键流程。每项默认「读中 + 读英」两遍；带 `[自动]` 标记的项已有 smoke/门禁覆盖，
仍建议抽查一句关键分支文案。勾选即完成，发现问题记录在「发现」栏并转 `QA_FIX_LIST`。

## 0. 如何执行

- 用 `godot --headless --path . --script tests/run_tests.gd` + `for t in tests/smoke_*.gd` 复跑自动门禁（26 个 smoke 全绿）。
- 人工部分按本清单顺序走一遍，固定 seed 记录在下方。
- 每读一段确认：中英一致、无缺 key、无错字、术语符合 `assets/data/glossary.json`。
- 试玩与通读共用 `docs/PLAYTEST_README.md` 的反馈表单，P0/P1 必须当天归零。

固定 seed：`__________` · 构建：`42eef9f` · 读档/新档：__________

---

## 1. 入口与全局 UI

- [ ] 书桌启动 → 新游戏/读档两个入口都可用（`smoke_boot.gd` `[自动]`）
- [ ] 角色抽取流程中英一致（抽取 → 确认 → 出生点）
- [ ] 设置页：字号 100%/200% 两种都过一遍、中英切换即时生效（`smoke_ui_overlay.gd` `[自动]`）
- [ ] 覆盖层可退出：行囊、市场、设置、图鉴按 Esc 均能关闭（`smoke_ui_overlay.gd` `[自动]`）
- [ ] HUD 常驻信息（日期/资金/声望/随从）无文字溢出
- [ ] 地图平移/缩放/迷雾/路线动画 720p 手感正常（`smoke_map_display.gd` `[自动]`）

## 2. 三身份路线（§13.2 步骤 1–2）

| 身份 | 起点 | 目标 | 通读 |
|---|---|---|---|
| 马可·波罗 `polo` | tauris | cambaluc | - [ ] 起点物品 `it-letter-of-introduction` 文案 |
| 草原旅人 `steppe` | tauris | chandu | - [ ] 起点装备/语言文案 |
| 商人 `merchant` | ormus | zayton | - [ ] 起点资金 32000 与货物文案 |

- [ ] 每个身份的抽取、确认、出发三页中英各读一遍

## 3. 十二主城后果链（12_CITY_CLOSURE_MATRIX）

每城：入口 → 导师 → 分支 A → 分支 B → resolution → 探索点 ×3。
`smoke_twelve_cities.gd` 已自动走完重要分支 `[自动]`，此处人工抽查关键句。

| 城市 | 入口 | 导师 | 通读 |
|---|---|---|---|
| 巴里黑 `balc` | `ev-balc-entry` | `ev-balc-mentor` | - [ ] 入口两分支文案 |
| 喀什噶尔 `cascar` | `ev-cascar-entry` | `ev-cascar-mentor` | - [ ] 分支 A/B 与 resolution |
| 于阗 `cotan` | `ev-cotan-entry` | `ev-cotan-mentor` | - [ ] 分支 A/B 与 resolution |
| 罗卜 `lop` | `ev-lop-entry` | `ev-lop-mentor` | - [ ] 探索点 `bazaar/shrine/caravanserai` |
| 撒马尔罕 `samarcanda` | `ev-samarcanda-entry` | `ev-samarcanda-mentor` | - [ ] 分支 A/B 与 resolution |
| 大都 `cambaluc` | `ev-cambaluc-entry` | `ev-cambaluc-mentor-iching` | - [ ] 易经导师课文案 |
| 行在 `kinsay` | `ev-kinsay-entry` | `ev-kinsay-mentor-jiaobei` | - [ ] 筊导师课文案 |
| 刺桐 `zayton` | `ev-zayton-entry` | `ev-zayton-mentor` | - [ ] `ledger/watch` 两分支 |
| 上都 `chandu` | `ev-chandu-entry` | `ev-chandu-mentor` | - [ ] 分支 A/B 与 resolution |
| 报达 `baldacum` | `ev-baldacum-entry` | `ev-baldacum-mentor-bazi` | - [ ] 八字导师课文案 |
| 忽鲁谟斯 `ormus` | `ev-ormus-entry` | `ev-ormus-mentor-astrodice` | - [ ] 星骰导师课文案 |
| 大不里士 `tauris` | `ev-tauris-entry` | `ev-tauris-mentor-tarot` | - [ ] 塔罗导师课文案 |

## 4. 二十一城深化（21_CITY_DEEPENING_MATRIX，24 条 followup）

`smoke_21city_followups.gd` 已自动检查 24 对 `[自动]`，此处人工抽查 4 条新文案。

- [ ] `ev-kerman-a-followup`（起儿漫）
- [ ] `ev-badashan-a-followup` / `ev-badashan-b-followup`（巴达哈伤，双点）
- [ ] `ev-chamba-a-followup` / `ev-chamba-b-followup`（占城，双点）
- [ ] `ev-suju-a-followup`（苏州）

## 5. 导师课程（24 课 · 失败/跳过/成功三态）

`test_lesson_engine.gd` `[自动]` 覆盖成败判定；人工抽查 6 课的步骤与提示文案。

- [ ] `lesson-bazi` · `lesson-iching` · `lesson-tarot`
- [ ] `lesson-qimen` · `lesson-jiaobei` · `lesson-astrodice`
- [ ] 其余 18 课抽样 3 课（自行选择）

## 6. 占法使用与结果（24 法 · 480 结果文本）

`smoke_divination.gd` `[自动]` 覆盖核心占法流程；人工抽查非 MVP 占法的结果文案。

- [ ] MVP 占法：bazi / tarot / iching / geomancy / runes / lot / jiaobei / astrodice（8 法）
- [ ] 非 MVP 抽样：qimen / ziwei / liuyao / meihua / western / vedic / numerology / lenormand /
      oracle / coffee / scrying / dream / fengshui / palmistry / xiangmian / bazi-relationship（16 法）

## 7. 出行与路遇（81 road 事件 + fadlan 线）

`smoke_play.gd` / `smoke_road_followup.gd` `[自动]` 覆盖旅程；人工抽查 6 条路遇。

- [ ] `ev-road-00` ~ `ev-road-09` 抽样 3 条
- [ ] `ev-road-10` ~ `ev-road-39` 抽样 2 条
- [ ] `ev-road-fadlan` 线（伊本·法德兰同行，5 段）`ibn-fadlan-road`

## 8. 存读档、迁移与坏档恢复

- [ ] 五槽手动读写交叉核对（§13.2 步骤 8–9）
- [ ] 自动存档触发与失败提示（`smoke_save.gd` `[自动]`）
- [ ] 旧档迁移：`tests/fixtures/save_v1.json` / `save_v2.json` 读入当前版本（`smoke_save.gd` `[自动]`）
- [ ] 坏档恢复：菜单侧车深检 → 新游戏兜底（`smoke_save.gd` `[自动]`）
- [ ] 旅途中断恢复（`smoke_journey_resume.gd` `[自动]`）

## 9. 结局（8 条）

- [ ] `end-returned-to-venice`（波罗·返回威尼斯）
- [ ] `end-stayed-in-the-east`（波罗·留居东方）
- [ ] `end-witness-of-the-world`（草原·见证世界）
- [ ] `end-hundred-markets`（商人·百市）
- [ ] `end-no-return`（草原/商人·不归）
- [ ] `end-cartographer` / `end-diviner` / `end-lay-down-the-pen`（隐藏结局 3 条）

## 10. 文本与本地化

- [ ] `story check` 0 stale / 0 missing（`node tools/lore/story.mjs check` `[自动]`）
- [ ] `test_i18n_lines.mjs` ALL PASS（`[自动]`）
- [ ] 简体中文正文无繁体残留、无占位符（`ui.*` 教学文案抽查）
- [ ] 术语与 `glossary.json` 一致（筊/周易/季风/商队/驿栈等）

## 11. 性能人工项（§13.3，发布构建）

- [ ] 720p 地图平移/缩放保持 60 FPS（30 次连续测量记录机器/分辨率/缩放）
- [ ] 自动存档 < 100 ms，失败只提示不阻断入城

## 12. 范围边界（不在 R1 范围）

- 69 座 `town`/`station` 级浅分支（第二章 §14.1 任务 3 深化对象）**明确不在 R1 通读范围**；
  只验证其 `entryEvent` 存在、可进可出（`smoke_citynav` `[自动]`）。
- 易经 31–64 牌面美术（A1）不在本轮；卦符回退非阻塞。
- 第二章/第三章剧情内容不在本轮。

## 13. 文化与合规（§13.6）

- [ ] 史料来源逐段标记（`passages.json` origin）抽查 5 段
- [ ] 时代性宗教贬语标记（G24 拦截）抽查
- [ ] 生成式工具记录归档（`docs/AI_USAGE.md` 已建；甄别 `_archive/chats/index.json` 杂项对话）
- [ ] 文化审阅记录归档

---

## 发现登记

| 时间 | 位置（事件/页面） | 语言 | 严重级 P0/P1/P2 | 描述 | 负责人 | 修复版本 |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |
