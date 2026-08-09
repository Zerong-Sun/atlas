# 项目现状 · STATUS

**2026-08-09 复核 · Steam EA 阶段。** 这是唯一的「现在到哪一步」权威页；`PLAN.md` 讲下一步，`ROADMAP.md` 讲阶段顺序。三份不重复。

---

## 1. 一句话

**七项流程的引擎、数据、恢复与自动验证已闭环；正式文本和正式美术需求已落档，当前以
明确占位运行。下一阶段只做优化、正式内容替换与人工发布验收。**

总需求与量产规划：[`FATEQUEST_ENGINE_REQUIREMENTS.md`](FATEQUEST_ENGINE_REQUIREMENTS.md)。

---

## 2. 数据

| 表 | 条数 | 状态 |
|---|---|---|
| cities | 102 | ✅ 12 主城六件全套 |
| routes | 204 | ✅ 三条线实测可走完 |
| events | 415 | ✅ 含十二主城后果链、site/mentor 多轮、**21 city 深化 24 followup** · 0 桩 |
| goods | 60 | ✅ 可买卖，60 条译名齐 |
| retainers | 54 | ✅ 招募／契约／货格联动已做 |
| divinations / lessons / catalog | 24 / 24 / 24 | ✅ 8 类学习玩法；旅程年代门禁；全法可在附录练习 |
| archetypes / eras / endings / transports | 8 / 4 / 8 / 9 | ✅ 全部接入玩法 |

**门禁含 G33 全绿**（advisory WARN 均为既有已知项），新增人物、死亡与占法目录内核测试；
界面 smoke（含 `smoke_divination_annex`）全绿。

### 2.0 2026-08-09 核心系统重做

| 系统 | 状态 |
|---|---|
| 人物抽取 | ✅ 四年代场景；每次并列三位完整候选；生辰、年龄、起点和命格确认后锁定 |
| 死亡与传承 | ✅ 五阶段可见预警、救治窗口、不可复活终局、游记/降级地图/一件遗物传承；存档 v4 |
| 占卜学习 | ✅ 8 类规则覆盖 24 课；24 条目录与史源；方法专属仪式动效；后世方法仅附录可练 |
| 地图 | ✅ 真实经纬度、海岸河海矢量、1–8× 平移缩放、经纬网、比例尺、坐标与羊皮纸表达 |
| 立意审查 | ✅ [`CORE_DESIGN_REVIEW.md`](CORE_DESIGN_REVIEW.md)；明确 16 法通用适配器与文化史复核仍是 P0 |

六维验证与修复记录：[`CORE_SYSTEM_VERIFICATION_2026-08-09.md`](CORE_SYSTEM_VERIFICATION_2026-08-09.md)。

---

### 2.1 2026-07-30 新引擎

| 系统 | 状态 |
|---|---|
| 开篇随机人物抽取、三次重抽、起点同步 | ✅ |
| 身份背景给 2–3 已知城市；城市/道路知识分离 | ✅ |
| `queue_event` 持久化后果 FIFO + 刺桐三分支示例 | ✅ |
| `fatequest-worldmap` 海岸线/河流/海域矢量运行时接入 | ✅ |
| 已知城市点击详情卡 | ✅ |
| 交通方式 → 目的地简介 → 确定出发 → 动画 | ✅ |
| 抵达自动档 + 五手动槽位 | ✅ v3 SHA-256、header sidecar、`.bak`、损坏拒载与恢复 |
| 24 占法数据驱动练习；通过才学习，可跳过 | ✅ 六类规则、重试、两败辅助；正式文案/美术占位 |
| 路线方向、许可、货格、encounter、旅途中断恢复 | ✅ 核心二次校验 + 专项读档 smoke |
| `showWhen` / `resultText` / 学习失败效果 / 随从职业条件 | ✅ 已接线并有静态或运行测试 |
| 十二主城选择后果链 | ✅ 24 条重要分支、48 个后果页；G28 无反馈/断链门禁通过 |
| 十二主城 site/mentor 多轮互动 | ✅ 12 城各 3 site + 1 mentor 配 followup 后果页（共 50 个），含刺桐/报达/大不里士导师双路径；G28 通过，专项 smoke 覆盖 |
| 21 city 探索点深化 | ✅ 2026-08-06 · 24 followup（枢纽 chamba/badashan/tanpiju 双点）；G31 + `smoke_21city_followups.gd`；矩阵 [`21_CITY_DEEPENING_MATRIX.md`](21_CITY_DEEPENING_MATRIX.md) |
| T1 正式中英文本 | ✅ 2026-08-06 · 24 课 steps/clues/options 迁 i18n；16 非 MVP 占法 480 条结果文本；新增流程 UI 硬编码中文全部迁移 `ui.*`；文化校读 G7 术语一致 0 告警 |
| Q2 手动测试修复（2026-08-02） | ✅ 见 §2.2 |

---

### 2.2 2026-08-02 Q2 手动测试修复

| 问题 | 修复 |
|---|---|
| 地图无法平移／点击城市 | `main.tscn` 根节点 `mouse_filter=IGNORE`，事件穿透到地图 |
| 出行页按钮随字号溢出屏幕 | `travel_confirm.gd`／`city_detail_card.gd` 加 `clip_contents` + `_fit_scroll()`，按钮行始终可见 |
| 道路面板无法返回地图 | `_show_roads` 顶部加「回到地图」按钮；无路时给出引导文案 |
| 城市道路死胡同 | 到达新城市时 reveal 该城全部出路口路线（`travel.depart`），只显路线、远方城仍迷雾 |
| 右上控制条过大遮挡地图 | 精简为只留「设置」；行囊／同行移右侧竖排书列 |
| 图鉴／结局／归位／缩放入口 | 全部并入设置面板 |
| 字号档位过多 | `UiScale` 收敛为 小/中/大 三档（0.85/1.0/1.25），同步 `smoke_ui_overlay` |
| 找不到中英切换 | 设置面板新增语言切换，持久化到 `user://ui.cfg` |
| 中东地区出现中国剪影 | `map_art.gd`：steppe/west_asia/central_asia 文化剪影重映射到 `isl` |
| 入城文言文难读 | 12 主城入城长文全部改写为现代汉语；全量现代化记入需求文档 |
| 第二次回程无动画 | `_show_transit` 遇途中事件时保持 transit 画面至抵达，`_arrive` 统一清理 |
| 出行页偶发英文残留 | 确认所有城市 entry.body 双语齐全，travel_confirm 纯中文渲染 |
| transit 常驻遮挡事件对话（验证期发现） | transit 层 z-order 移到地图之上、全部交互层之下（`move_child`），hold 期间事件对话框与设置仍可点击 |
| 语言切换后 HUD 提示残留旧语言（验证期发现） | `hud.gd::build()` 清空 `_tips` 惰性缓存 |
| 出发后卡住回不去城镇 | 道路面板「回到地图」按来源返回：从城市内部进入则回到城市视图（`_show_roads(from_city)`）；出发失败同样回到城镇 |
| 左下日志英文乱码 | 日志过滤 `op:reason` 审计行（`_log_effects`/`_is_audit_slug`），玩家只见中文叙事；审计仍走 `log_lines` 供存档回放 |
| Q2 手动测试修复（2026-08-02） | ✅ 见 §2.2 |

---

## 3. 语料

| 书 | 年代 | places | stories | 状态 |
|---|---|---|---|---|
| 马可·波罗 | 1271–1295 | 136 | 98 | ✅ 已接入玩法（主干） |
| 伊本·白图泰 | 1325–1354 | 25 | 0 | ✅ 已接入（段落级绑定） |
| 伊本·法德兰 | 921–922 | 5 | **34** | ✅ 已接入；steppe 途中事件 |
| 伊本·朱拜尔 | 1183–1185 | 0 | 27 | ✅ 已接入 |
| 鲁布鲁克 | 1253–1255 | 3 | 2 | ✅ 书案选段 + `altRefs`（哈剌和林） |
| 鄂多立克 | 1318–1330 | 3 | 1 | ✅ 书案选段 + 刺桐／行在 `altRefs` |
| 尼科洛·德·康蒂 | 1419–1444 | 3 | 1 | ✅ 书案选段 + 马拉巴尔 `altRefs` |
| 佩罗·塔富尔 | 1435–1439 | 2 | 1 | ✅ 书案选段（Letts 1926，美版公有领域） |
| 瀛涯胜览（马欢／张升） | 1416 | **18** | 1 | ✅ 据 ZH 原文重生；书案 + `passages_yingya.json`；不覆盖既有 Polo 主引证 |
| 远游记（平托） | 16 世纪 | 5 | 8 | ✅ **仅书案**（`desk_only`，不作城市证据） |
| 岛夷志略／真腊风土记／星槎胜览／长春真人西游录／西游录 | 元明 | — | — | ✅ 语料入库 + 图鉴传说条目 |
| 曼德维尔 | c.1356 | 0 | 2 | ✅ 传说图鉴（`origin: authored`） |

**书案可读**：开场七封面可点开 `book_reader`；内容表 `content/tables/books.json`（`vol-*` id）；门禁 **G30**。

**已兑现**：城市 lore 覆盖 **83/102** 主引证不变；另有 **14** 城挂 `altRefs` 二次声部。11 座弱证据 + 8 座查无保持 `origin: "authored"`。

> ⚠️ 选段含时代性宗教贬语。`passages.json` 逐条标记，门禁 **G24** 拦住流入玩家可读文本的措辞。底本说明见 `assets/books/SOURCE_NOTES.md`。

---

## 4. 中文版

```
en 5118 条 · zh 5118 条 · 缺 0 · 中英同文 0
译文时效 3619 current · 0 stale · 0 missing
```

**中译 B1–B4 已全部完成**（详见 `L10N_PLAN.md` §3）。

---

## 5. 美术素材（实测 2026-07-30 · P3/P4 落盘）

```
根目录 assets/art/*.webp   674 张
  ✅ 完好      674
  ⚠️ 棋盘格    0
  ❌ 损坏       0
  _archive/    128
  _sheets/      58
Godot 运行时接线            674
未接线                        0
```

总索引：[`ASSETS_REQUIREMENTS.md`](ASSETS_REQUIREMENTS.md) · 缺口规格：[`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md)

### 5.1 已修复的两类缺陷

| 缺陷 | 数量 | 处理 |
|---|---|---|
| **棋盘格烘焙进像素** | 169 张 | `strip_checker.py --write` 已清除 |
| **路线笔触墨迹占比过低** | 3 张 | 已裁到墨迹范围 |

> ⚠️ **生成管线仍未修**。每次生成后须跑 `python3 tools/art/audit.py`。

### 5.2 内容错配

| 素材 | 问题 |
|---|---|
| `scene-region-isl.webp` | ✅ 已重绘 |
| `scene-region-chr.webp` | ✅ 2026-07-30 已重绘为拉丁基督教世界 |

### 5.3 接线（S1 ✅ · S1b ✅ · S1c ✅ 2026-07-30）

全部前缀经 `MapArt` 解析：explore / site / npc / ic / ui / sym / map / load / book / fate / mentor / retainer / currency / sticker / contract …

雇佣签契屏：`game/ui/hire_contract.gd`（公开 + 占卜抽选）。

### 5.4 仍缺的素材

| 缺口 | 数量 | 阻塞 |
|---|---|---|
| ~~`scene-region-chr.webp` 重绘~~ | 1 | ✅ |
| ~~白图泰六城入城图~~ | 6 | ✅ |
| ~~白图泰六城探索图~~ | 18 | ✅ |
| ~~易经 31–64 牌面~~ | 34 | 占位符已补齐并接线（2026-08-02）；正式出图待跑 |

---

## 5b. 音频素材

```
assets/audio/    37 OGG · A1–A8 ✅
```

详见 [`AUDIO_PLAN.md`](AUDIO_PLAN.md)。

---

## 5c. 动画（2026-07-26）

| 序 | 内容 | 状态 |
|---|---|---|
| N0 | `reduce_motion` | ✅ |
| N1 | 地图静态接线 | ✅ |
| N2 | 迷雾揭开 + 路线描画 | ✅ |
| N3 | 界面过渡 | ✅ |
| N4–N6 | 状态反馈 / 占卜六式 / 氛围 | 待做 |

实现：`game/fx/motion.gd` · `game/shaders/fog.gdshader` · `game/map/world_map.gd`。

---

## 6. UI 可读性

| 问题 | 状态 |
|---|---|
| 地图不能缩放平移 | ✅ |
| 文本框与选项出界 | ✅ |
| 对比度过低 | ✅ |
| 无字号调节 | ✅ 四档 + **200% 巨档**（`Size.MASSIVE`，需求书 §13 上限）；Q2 收敛为 小/中/大 三档（0.85/1.0/1.25，见 §2.2） |
| 数值不可见 | ✅ HUD |
| 无城市探索 | ✅ `city_view.gd` |

### 6.1 Q1 视觉回归（720p / 200% / 中英 / 覆盖层，2026-08-02）

> 历史记录：Q2（2026-08-02）将字号收敛为 小/中/大 三档后，本节的 200% 档
> 已由 `smoke_ui_overlay.gd` 改为在 LARGE（1.25×）档复跑，回归内容保持不变。

`tests/smoke_ui_overlay.gd` 在 200% 档中英双语下逐项断言行囊、市场、设置、队伍、城市卡、事件对话均在视口内，回归以下修复：

| 缺陷 | 根因 | 修复 |
|---|---|---|
| 行囊打不开合不上（窗口超界、合上按钮被挤出屏幕） | 行文本 Label 不换行，超长英文货物行把面板最小宽撑到 1317 px，超过 1280 视口 | 行文本 `autowrap` + 面板 `clip_contents`；`smoke_ui_overlay` 固定回归 |
| 市场/行囊物品图标过大 | 市场行图标 `TextureRect` 缺 `EXPAND_IGNORE_SIZE`，按 512² 源纹理当最小尺寸，单行被撑到 500+ px、面板出界 | 加 `expand_mode`，图标随字号缩放（`Metrics.icon_lg()`） |
| 入城介绍一大段不好读 | 入城正文单段 200–400 字无分段，读起来是一堵墙 | `event_dialog._auto_paragraphs` 按句末自动分句成段（≤120 字/段，短文不破坏） |
| 200% 字号下事件对话超界（卡片内容可滚动、确认按钮保持可见） | 大头像 + 头部 + 按钮固定部分在 200% 下超过 720 视口 | 头像限高 1/3 窗口；`_fit_scroll` 按实测压缩正文滚动窗，至少保留两行 |

**12 城后果链逐城回归**：`tests/smoke_twelve_cities.gd` 逐城走完 12 主城入口两条重要分支
（choice → consequence → resolution → 返回城市），0 失败——Q1"逐城点选后果链"的自动版本。
键盘遍历（Esc 关闭覆盖层）由 `smoke_ui_overlay.gd` 覆盖。剩余人工项（GPU 60 FPS 实机、
§13.2 十步人工脚本）见 [`RELEASE_CANDIDATE.md`](RELEASE_CANDIDATE.md)。

---

## 7. 未完成的任务

### 7.1 玩法系统 — 全部 ✅

### 7.2 内容

| # | 事项 | 量 |
|---|---|---|
| F–H | T1–T6 | ✅ |
| I | 拆解《远游记》《瀛涯胜览》及书案诸书 | ✅ 2026-08-06：瀛涯据 ZH 重生；远游记 desk_only；鲁布鲁克／鄂多立克／康蒂／塔富尔选段；中文行纪＋曼德维尔传说；书案可读 |
| P5 | 入城加长五城；12 主城入口/site/mentor 多轮；**21 city 探索深化 24 followup** | ✅ 2026-08-06 |

### 7.3 工程

| # | 事项 |
|---|---|
| J | 素材生成管线棋盘格缺陷 |
| K | 动画 N4–N6 |
| L | 完整历表 |
| M | iOS 导出（推迟） |
| S3 | ~~chr 重绘 + 白图泰 24 张~~ ✅ 2026-07-30 |

### 7.4 本轮明确占位

| 类别 | 状态 | 正式出口 |
|---|---|---|
| 新增流程 UI 与 24 课教学文本 | ✅ 2026-08-06 正式中英落库 + 文化校读（T1） | 需求书 §9–10 |
| 24 法逐法工具、反馈与动画 | 控件/符号占位 | 需求书 §11.7；逐法资产验收 |
| 102 城分支深化 | 12 主城 + **21 city 已多轮**；town/station 与其余 site 保持可运行 | 需求书 §4.7、§10；后续按城市批次人工通读 |

---

## 8. 建议的下一步

1. ~~正式课程文本：占位迁移 i18n，并完成中英与文化校读~~ ✅ 2026-08-06（T1 闭环）
2. ~~优化与发布验证：导入/导出、存档 P95、地图帧耗~~ ✅ 2026-08-07（O1 闭环：基准落 `docs/benchmarks.json` + 产物存 `build/audit/`，fixture 迁移用例，`verify_pck.mjs` PCK 结构门禁，`benchmark_map_fps.gd` 窗口帧耗实测）；~~720p/200%/中英回归~~ ✅ 已由 `smoke_ui_overlay.gd` 自动化（2026-08-02）；Q2 手动测试修复已完成并回归（2026-08-02）
3. **正式占法美术与既有缺图**：易经 31–64（34）及 §11.7 占位替换
4. **R1 外部试玩与通读**：✅ 自动化准备已完成（2026-08-06：全量门禁复跑落档、[`R1_READTHROUGH.md`](R1_READTHROUGH.md) 通读清单、[`PLAYTEST_README.md`](PLAYTEST_README.md)/[`PLAYTEST_FEEDBACK.md`](PLAYTEST_FEEDBACK.md) 交接包、[`AI_USAGE.md`](AI_USAGE.md) 生成式工具记录；六维验证修复：4 个占法用法站点接线进城市 `sites`，G2b 警告 6→2）；⏳ 待外部试玩与人工通读后按反馈收尾发布候选签署

---

## 9. 经济实测（2026-07-23）

```
G6 · 3263 次随机循环 · 中位 -15.3% · p10 -38.6% · p90 +42.2% · 破产 1
```

三条线在边走边贩下均可走完。

---

## 10. 系统性能实测（2026-08-08 · O1 复核）

Apple M2 Pro / 32 GB / Godot 4.7.1 headless，代表性全地图状态 40 次（2026-08-08，
T1 内容增长后复跑并复核；见 `docs/benchmarks.json`）：

```
序列化 P95                  1.24 ms
安全写档 median / P95       5.77 / 6.06 ms
存档序列化大小              7,712 B
Travel availability         6120 次 / 153.07 ms
vector_map                  90,397 B
```

地图 CPU 帧耗基准（`tests/benchmark_map.gd`，全图 102 城满情报 40 次 mask + 300 帧）：

```
setup               2.37 ms
mask 重建 P95       8.01 ms   （单帧预算 16.7 ms 内）
route 动画帧 P95    7.15 ms
持续帧率            81 FPS
```

窗口 GPU 帧耗基准（`tests/benchmark_map_fps.gd`，1280×720，30 次缩放/平移 + 90 帧常驻）：

```
zoom P95            0.03 ms
pan P95             0.02 ms
常驻帧 median       6.89 ms（≈145 FPS）
```

> 注：2026-08-07 曾记录 serialize/save/availability/map 数值放大 ~5.5x
> （serialize 5.93 / save 33.47 / mask 39.51 ms），经 2026-08-08 三次复跑
> 确认那是高负载观测值而非稳态——当前机器稳定在 1.24/6.06/8.01 ms
> （回到 2026-08-06 基线水平）。门禁（< 100 ms）均达标。完整机器可读
> 数据落 `docs/benchmarks.json`（systems/map CPU/map FPS/PCK/art）。

PCK 导出验证：`tools/validate/verify_pck.mjs` 解析 v4 目录（1952 文件 · 409.96 MB），必需资源全在、作者源目录 0 泄露；主场景以二进制 `.scn` + `.remap` 形式存在；`--main-pack` headless 185 s 零错误启动；macOS/Windows zip 包已产出 `build/audit/`。
