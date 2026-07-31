# FateQuest 当前验证记录 · 2026-07-31

本记录是 12 主城剧情闭环接线后的当前验证快照。旧版验证记录保存在
`docs/archive/` 或以更早日期命名的审计文件中，不覆盖本记录。

## 结果

| 检查 | 结果 |
|---|---|
| 内容门禁 | ✅ 25 道门禁全绿，含 G28 十二主城闭环审计 |
| 剧情接线 | ✅ 331 事件、779 选择、49 队列接线、282 即时反馈 |
| 双语文本 | ✅ en/zh 各 3169，缺失 0 |
| 翻译时效 | ✅ 1830 current、0 stale、0 missing |
| i18n 结构测试 | ✅ 3169/3169，0 raw key |
| 资源接线 | ✅ 项目资源审计 `--unused` 无未接线输出 |
| 差异格式 | ✅ `git diff --check` |
| Godot 版本 | ✅ `/Applications/Godot.app`，4.7.1.stable.official |
| Godot 单测 | ✅ `tests/run_tests.gd`：SUITE PASS |
| Godot smoke | ✅ 全部 12 个 `smoke_*.gd` 通过，含城市导航、主流程、存档、占卜、市场和结语 |

## 剧情重点

- 12 个主城均有 3 个入口选项和 1 个可点击导师事件。
- 每城前两个入口选项进入两页后果链；Zayton 保留原有三条历史分支，并为前两条补充 resolution 页。
- 所有首批主城探索点、导师和后果选择都有双语即时反馈或事件队列。
- `docs/12_CITY_CLOSURE_MATRIX.md` 是具体接线表。

## 复现命令

```bash
node tools/validate/validate.mjs --quiet
node tools/lore/story.mjs check
node tests/test_i18n_lines.mjs
scripts/art-gen-kit/.venv/bin/python tools/art/audit.py --unused
git diff --check
godot --headless --path . --script tests/run_tests.gd
godot --headless --path . --script tests/smoke_boot.gd
godot --headless --path . --script tests/smoke_zayton.gd
godot --headless --path . --script tests/smoke_journey_resume.gd
godot --headless --path . --script tests/smoke_fatequest_flow.gd
godot --headless --path . --script tests/smoke_party.gd
godot --headless --path . --script tests/benchmark_systems.gd
for test in tests/smoke_*.gd; do godot --headless --path . --script "$test" || exit 1; done
```

Godot 4.7.1 兼容修正：运行时翻译不得放入 `const` 字典；HUD 改为惰性初始化，
字号标签改为调用时生成。设置页的 reduced-motion 回调也补齐了闭合括号。
