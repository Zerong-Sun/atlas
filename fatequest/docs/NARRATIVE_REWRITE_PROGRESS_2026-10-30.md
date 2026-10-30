# FateQuest 剧情与探索重写进度

本轮范围已按用户确认完成：103 座城市的入城、原有探索、独立地点、后续剧情与新探索，以及道路事件、人物开场和结局。占卜课程、图鉴正文、贴纸正文和界面提示不在本轮重写范围内。逐城结果见[城市剧情重写清单](NARRATIVE_REWRITE_CITY_LIST_2026-10-30.md)。

## 文本

- 每座城市都接入了一处新探索故事。既有探索从人物眼前要办的事写起，让路、货、家人和城市生活在对话与行动里出现。新增地点分散在 `narrative_expansion*.json` 及亚历山大港的接待事件表，双语源文保存在 `content/story/`。
- 印度洋与海上亚洲补写了港口、商铺、家院和船路；中亚与草原补写了水源、工坊、商队和邻里；中国各城补写了河岸、车道、店铺、手艺和家人的往来。杭州、燕京／大都、泉州等长线城市连同后果事件、导师和后续对话一并重写。
- 波罗道路 `ev-road-00` 至 `30`、`32` 至 `39` 共 39 条、法德兰道路 `01` 至 `35` 共 35 条与八个后续，以及“沙漠之声”，都已重写双语故事源文。法德兰的季节场景按冬季触发；沙漠之声限于罗布至沙州陆路。
- 两名人物的开场与八种结局已重写，结局针对早期结束、无盈利交易等状态作了相应表述。

文本遵循[文本要求](TEXT_REQUIREMENTS.md)：正文用具体人物与行动推动，选项结果交代实际发生的事；减少辩解、排比、对照句和凭空的警句。第一章试读与优秀游戏的比较见[试写文档](NARRATIVE_CHAPTER_PILOT_2026-10-29.md)。

## 事件与路线

- 每条新探索都接到对应城市 `sites`；既有入城与探索事件仍可触发。城市表的 103 个入城事件、279 个探索地点引用无重复、无悬空，事件解锁的路线与城市 ID 均存在。
- 瓜洲至镇江的直连按渡江船处理；洞古剌经尼罗河陆路先抵开罗；苏门答腊至占城／宾坦／爪哇采用海路，前往缅甸须经占城转陆路。相关问路文本与海陆模式同步。
- 整件商品的购买价、余额门槛和文本金额按 100 分 = 1 银核对。免费样票不再发放可交易的整件纸币；需要付费的选择都有对应余额条件。
- 新剧情不再直接发放与玩家经历、实际金额或可选年代冲突的旧贴纸和图鉴。番坊的旅行笔记改为当下可得的见闻，避免触发晚于游戏年份成书的图鉴。旧贴纸与图鉴正文保留在本轮范围外。

## 静态核对与交付

`node tools/lore/story.mjs check` 用于只读核对双语源文和文本戳；最近一次结果为 5,762 个当前键、0 个过期、0 个缺失。城市和路线引用、事件效果与需求、JSON 解析也已做静态检查。剧情物品补齐了 10 个背包显示名；税册副本在港务官验看后仍由玩家保管。作者、核查代理分别在独立源文件写作和只读复核，最终由主代理汇总事件接线与文档。

## 2026-10-31 构建与运行核对

用户确认更新游戏后，已运行 `node tools/lore/story.mjs build`，将源文编入 `content/i18n/en.json` 与 `zh.json`：分别更新 950、949 条运行时文本。`node tools/validate/validate.mjs --quiet` 全门禁通过；`node tests/test_i18n_lines.mjs` 检查 7,069／7,069 双语键完整；Godot 4.7.1 的 `tests/run_tests.gd` 内核套件通过。

剧情相关冒烟通过：`smoke_boot.gd`、`smoke_gameplay_contracts.gd`、`smoke_citynav.gd`、`smoke_dialog_usability.gd`、`smoke_journey_resume.gd`、`smoke_city_card_entry.gd`、`smoke_city_map_scene.gd`。启动检查加载 103 座城市、203 条路线、614 个事件，运行时无缺失文本键。续行测试原把“沙漠之声”放在大不里士至巴格达路，现改用可在西亚陆路发生的 `ev-road-22`，并复跑通过。

`smoke_city_life.gd` 要求独立的 `FateQuest-UI-Audit` 用户数据目录；首次在普通项目目录运行时按自身保护条件退出，随后用隔离运行器通过 3,791 项检查。完整的六方面验证、56 项冒烟和图形窗口启动结果见[验证与修复清单](QA_REPAIR_2026-10-31.md)。画面排版与逐段人工试玩仍需单独检查。

测试隔离问题：`smoke_journey_resume.gd`、`smoke_city_card_entry.gd` 和 `smoke_dialog_usability.gd` 运行时使用了正常的 Godot 用户数据目录。这次测试使 `auto`、`cairo-entry` 存档槽和 `ui.cfg` 成为测试数据；当时的 `.bak` 也来自测试。已把六个测试存档文件移至 `user://saves/.codex-test-saves-2026-10-31/` 保留，避免游戏误认它们为玩家进度。`ui.cfg` 没有测试前备份，保持当前状态。后续回归现使用 `tools/test/run_isolated_godot.mjs` 为每项测试建立独立用户目录，避免再次覆盖玩家文件。

## 参考核对

- 罗达岛测水设施：[埃及旅游和文物部](https://egymonuments.gov.eg/monuments/rawda-island-nilometer/)。
- 1253 年的君士坦丁堡仍在拉丁帝国时期：[大都会艺术博物馆](https://www.metmuseum.org/essays/constantinople-after-1261)。
- 忽鲁谟斯约 1300 年迁离大陆旧港：[Encyclopaedia Iranica](https://www.iranicaonline.org/articles/hormuz-ii/)。
- 撒马尔罕列吉斯坦现存最早经学院建于 1417–1420 年：[UNESCO 申遗资料](https://whc.unesco.org/uploads/nominations/603rev.pdf)。
