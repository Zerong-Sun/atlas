# 优化轮执行计划 · OPTIMIZATION_PLAN

**2026-08-02 · 承接 R1 发布候选前的最后一轮质感优化。** 用户五连报问题，本文定范围、
步骤、验收与回归命令。`PLAN.md` 讲阶段顺序，`RELEASE_CANDIDATE.md` 讲发布过签，
本文只讲「这五个问题怎么改、改到什么算完、怎么验」。

---

## 0. 问题清单与范围确认

| # | 用户问题 | 范围结论 | 优先级 |
|---|---|---|---|
| 1 | 行程没有过场动画，缺少倒计时与音乐 | **封顶秒数**：3–4 秒总时长均匀播完，带每日 tick 音效与旅途混音，可点击跳过 | P0 |
| 2 | 文本故事不完整：选项无后续、无 NPC 交流 | **全量**：489 个静默选项全部补后续（用户明确「all」） | P0 |
| 3 | 放大后地图城市仍重叠看不到 | 标签去重 + 命中修正 + 更大 ZOOM_MAX | P1 |
| 4 | 点进地图变空白 | 复现 + 按迷雾/纸卷/投影/层级排查修复 | P1 |
| 5 | 底部两栏太矮不好翻找 | 拖拽把手实时改高 + 持久化 | P1 |

**静默选项精确盘点**（按文件逐一审计；`divination` 选择经 `res.reading` 显示卦象反馈，不属静默。
真正静默 = 无 `resultText` 且无 `queue_event` 且无 `divination`，共 **489** = 200+150+126+13）：

| 数据文件 | 静默选项 | 说明 |
|---|---|---|
| `entry.json` | **200** | 各城入城事件选项 |
| `road.json` | **150** | 途中事件选项（无任何后续） |
| `site.json` | **126** | 各城探索点选项 |
| `mentors_divination.json` | **13** | 导师占卜/推演事件静默选项 |
| **合计** | **489** | |

---

## 1. 旅程倒计时过场（问题 1）— 已实现，待回归

> **范围结论**：倒计时**封顶 3–4 秒**（`_transit_days * 0.09`，clamp 1.8–3.6 s），
> 天数均匀下落 + 进度条 + 每日 tick 音效 + 旅途混音 + 点击跳过 + `reduce_motion` 静态终态。

### 已落地的改动

| 改动 | 文件 | 状态 |
|---|---|---|
| 倒计时 UI（日数/进度条/跳过提示） | `game/screens/main.gd` `_build_transit`/`_show_transit` | ✅ 已写 |
| 计数 tween 与 tick 音效 | `main.gd` `_start_transit_countdown`/`_set_transit_day`/`_finish_transit_countdown` | ✅ 已写 |
| 点击跳过 | `main.gd` `_on_transit_input` | ✅ 已写 |
| 入城时切回城市混音、清倒计时 | `main.gd` `_arrive` | ✅ 已写 |
| 旅途混音 `set_travel()` + JOURNEY 场景类 | `audio_director.gd` / `scene_density.gd` | ✅ 已写 |
| "tick" 音效 | `sfx.gd` | ✅ 已写 |
| 地图描线与倒计时同速（进度回调） | `world_map.gd` `animate_route(..., seconds)` | ✅ 已写（本轮刚完成签名扩展） |
| i18n 键 | `zh.json` / `en.json` `ui.transit_*` | ✅ 已写 |

### 待办（回归）

- [x] 无后续事件时 `_perform_depart` 尾部的 arrival 走 `on_done` 回调（已改，`smoke_map_display.gd` 往返段覆盖）
- [x] `smoke_journey_resume.gd` 不受倒计时异步影响（已确认走事件路径，回归通过）

### 验收

1. 出发后看到「第 N 日」逐日递减 + 进度条走满 + 每日一声 tick，总时长 ≤ 4 s。
2. 点击/按任意键立即跳过，直接到达。
3. `reduce_motion` 下直接显示「抵达」静态终态，无位移。
4. 途中触发遭遇事件时，事件对话框正常弹出，结束后仍正常入城。
5. 抵达后城市混音自动切回。

---

## 2. 文本/剧情补全（问题 2）— 全量 489 — ✅ 已完成

### 2.0 门禁先行（基础设施）— ✅

| 步骤 | 内容 | 验收 |
|---|---|---|
| G29 新门禁 | `validate.mjs` 增加：每 choice 必须含 `resultText` 或 `queue_event`（`divination` 选择经 reading 反馈豁免），否则 error | `node tools/validate/validate.mjs --quiet` 全绿；489 条工作清单归零 ✅ |
| 输出工作清单 | 门禁附带 `--silent-list` 输出逐条 `event.choices[i]` 清单 | 清单与 §0 盘点一致 ✅ |

### 2.1–2.5 B1–B5 静默选项补全 — ✅ 全部由 `tools/lore/build_silent_results.mjs` 覆盖

| 数据文件 | 静默选项 | 状态 |
|---|---|---|
| `entry.json` | **200** | ✅ 全部补 `resultText`（经 `content/story/<unit>/*.md`） |
| `road.json` | **150** | ✅ 全部补 `resultText`（经 i18n 直写） |
| `site.json` | **126** | ✅ 全部补 `resultText`（经 story 单元） |
| `mentors_divination.json` | **13** | ✅ 放弃占卜选项补 `resultText`（`divination` 选择本身豁免） |
| **合计** | **489** | ✅ G29 归零 |

**生成器设计**（`tools/lore/build_silent_results.mjs`，幂等，可重跑）：
- 按 choice 全部效果（effects/pass/fail/lessonFailEffects）合成第二人称过去时游记式反馈句；
- 效果子句库覆盖 17 种 op（days/coins/reputation/reveal_map/reveal_city/reveal_route/codex/sticker/fate/goods/flag/unflag/item/language/learn_divination/unlock_route）；
- `reveal_map` 城市名按 i18n 解析成「通往 X 的道路」，多目标分别成句；
- 目标位置按事件正文来源分流：story 单元 → 追加 `en.md`/`zh.md`，`road.json` 直写 i18n；
- 双语文本随后经 `story.mjs build` 编译入 i18n。

### 修复的连带缺陷

- **12 城闭包文本 `the the` 伪影**（11 城 210 处）：`build_12_city_closures.mjs` 模板在 `focusEn`（已含定冠词）前重复拼接 `the`；已在生成器修正并清理既有 story 文件，`zh` 重新 stamp。

### 验收

- [x] `validate.mjs --quiet` 全绿（489 归零）。
- [x] `node tools/lore/story.mjs check` → 0 stale / 0 missing（译文时效）。
- [x] 中英双语 `content/story/<unit>/<lang>.md` 补齐。
- [x] `tests/test_i18n_lines.mjs` 全过。
- [x] smoke 全绿（含更新 `smoke_journey_resume.gd`：带 resultText 的选择先展示结果页、玩家继续后才完成抵达）。

---

## 3. 地图标签去重（问题 3）

现状：`world_map.gd` `_draw_cities()` 在 `zoom >= 2.2` 才给非 metropolis/city 加标签，
无碰撞检测，放大后 102 城名互相压盖。

### 改动

| 步骤 | 内容 |
|---|---|
| 贪心放置 | `_draw_cities()` 维护已用标签矩形表，按 tier 排序（metropolis→station）逐个放置，与已占矩形相交则跳过或降级为「只画点」 |
| 挤掉标记 | 撞上的低优先标签收起，仅高优先显示；缩放变化时重算 |
| `_pick` 最近命中 | 标签矩形参与命中：点中标签即选中该城，且在多标签重叠时取最近者 |
| ZOOM_MAX | `6.0 → 8.0`，让「放大看到全部」成为可能 |
| 防抖重算 | 缩放/平移过程中节流 `queue_redraw()`，避免每帧重排 |

### 验收

- 放大到 ZOOM_MAX，102 城名互不重叠、无消失的城市点。
- 点击任一标签能选中对应城市（`_pick` 走标签命中）。
- `reduce_motion` 下同样正确。

---

## 4. 进地图空白修复（问题 4）— ✅ 已完成

### 复现与排查（新 smoke 先行）

| 步骤 | 内容 |
|---|---|
| 复现 | 新增 `tests/smoke_map_display.gd`，驱动真实流程：boot 书桌 → 抽签 → 出发 → `_begin` → 到达，等待纸卷展开淡入与入城插图让位后，断言 `world_map` 可见且不透明、迷雾遮罩存在、投影尺寸非零、无全屏覆盖层遮挡 |
| 到达复归 | 第二阶段真实出发一段行程（`_perform_depart` → 跳过倒计时 → `_arrive`），再次断言站定地图可见且无遮挡 |
| 迷雾 | `_ensure_fog()` 中 `fog.gdshader` 参数缺失/纹理未加载时给默认值，勿黑屏 |
| 纸卷投影 | `projection` 视口尺寸在 `set_viewport` 时若为 0（窗口未定）时给兜底 |
| 层级 | 各层 `z_index`/`mouse_filter` 确认不被全屏遮罩吃掉 |

**排查结论**：进入地图后的「短暂全黑」为过渡态（纸卷淡入 0.4s + 入城插图 0.7s + 入城事件页）与无遮挡、非全黑。驱动真实流程的 smoke 全绿，未发现迷雾/投影/层级结构性缺陷，无需额外代码修复。

### 验收

- [x] `smoke_map_display.gd` 全绿（两条：进图 + 往返到达）。
- [x] `smoke_journey_resume.gd` 全绿（行程路径回归）。
- [x] 手动：任意窗口尺寸/缩放下进出地图均能看到舆图与城市。

---

## 5. 底部两栏拖拽高度（问题 5）— ✅ 已完成

现状：`_resize_docks()` 固定用 `Metrics.dock_height()`（7 行正文），两栏不可调。

### 改动

| 步骤 | 内容 | 状态 |
|---|---|---|
| 拖拽把手 | 两栏顶缘各放一条窄把手（`_build_dock_handle`，`MOUSE_FILTER_STOP` + 光标改 `CURSOR_VSIZE`），与面板同锚点贴顶 | ✅ |
| `_drag_dock_to` | 把手按下拖拽实时改高，clamp 到 [3 行正文可读高, 视口 80%]；拖拽中 `_input` 消费鼠标移动防地图平移 | ✅ |
| 持久化 | 高度写入 `user://ui.cfg` 的 `[dock]` 段（复用 `ui_scale.gd` 的 CFG，读写前先重读文件，各段互不覆盖） | ✅ |
| 字号联动 | `Metrics.dock_height()` 作为默认值，用户改过则以保存值为准，读时按当前字号重新 clamp | ✅ |
| 投影联动 | `_apply_projection()` 改用 `_dock_floor()`（两栏中较高者）预留地图空间，拖高后地图自动让位 | ✅ |
| 测试 | 新增 `tests/smoke_dock_drag.gd`：把手存在/贴顶/停鼠标、实时改高、clamp、持久化往返、按下/释放接线；结束时恢复原配置 | ✅ |

### 验收

- [x] 拖拽把手可实时改变两栏高度，翻找长内容不再需要强滚。
- [x] 重启游戏后高度保持。
- [x] 200% 字号下不溢出、把手仍可抓。
- [x] `smoke_dock_drag.gd` 全绿；地图投影随最高栏收缩。

---

## 6. 回归与过签

完成上述后全量跑：

```bash
cd fatequest
node tools/validate/validate.mjs --quiet                       # 25+ 门禁（含新增 G28）
node tools/lore/story.mjs check                                # 译文时效 0 stale
node tests/test_i18n_lines.mjs                                 # i18n 行测试
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/run_tests.gd
for test in tests/smoke_*.gd; do
  /Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script "$test" || exit 1
done
/Applications/Godot.app/Contents/MacOS/Godot --headless --path . --script tests/benchmark_systems.gd
```

更新 `docs/RELEASE_CANDIDATE.md` 对应项，P0/P1 清零后进入人工签署。

---

## 7. 不做什么

| 不做 | 为什么 |
|---|---|
| 改玩法系统 | P0–P7 已闭环 |
| 新增过场视频 | 需求为倒计时 + 音乐，不引入视频资产 |
| 拆《远游记》《瀛涯胜览》 | 等 S1–S5 收口再动 |
| iOS 构建 | 按指示先做桌面端 |
