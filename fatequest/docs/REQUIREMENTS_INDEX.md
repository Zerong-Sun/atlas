# 需求与交付索引

**当前基线：2026-07-31 · Godot 4.7.1 · FateQuest v3.0**

本文是工作区整理后的入口页，用来区分“当前可执行文档”和“历史记录”，避免把旧计划误当成待办。

## 当前权威文档

| 需要回答的问题 | 文档 | 维护规则 |
|---|---|---|
| 现在做到哪一步 | [`STATUS.md`](STATUS.md) | 只写当前状态与已知缺口 |
| 下一步怎么做 | [`PLAN.md`](PLAN.md) | 只保留可执行任务与验收出口 |
| 版本阶段顺序 | [`ROADMAP.md`](ROADMAP.md) | 阶段完成后更新，不重复写操作步骤 |
| 引擎/数据/发布总需求 | [`FATEQUEST_ENGINE_REQUIREMENTS.md`](FATEQUEST_ENGINE_REQUIREMENTS.md) | 需求、边界与发布验收 |
| 文本需求与库存 | [`TEXT_REQUIREMENTS.md`](TEXT_REQUIREMENTS.md) | 文本数量、来源、校对和未完成内容 |
| 中英文流程 | [`L10N_PLAN.md`](L10N_PLAN.md) | 翻译守则与当前覆盖率 |
| 美术/音频/文本资产总索引 | [`ASSETS_REQUIREMENTS.md`](ASSETS_REQUIREMENTS.md) | 库存、接线、缺口与归档策略 |
| 美术验收细则 | [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) | 尺寸、文化匹配、接线和机器审计 |
| 十二主城剧情接线 | [`12_CITY_CLOSURE_MATRIX.md`](12_CITY_CLOSURE_MATRIX.md) | 入口选择、后果链、双语文本与探索点接线 |
| 当前验证快照 | [`FATEQUEST_ENGINE_AUDIT_2026-07-31.md`](FATEQUEST_ENGINE_AUDIT_2026-07-31.md) | 本轮剧情接线、文本、资源与测试结果 |
| 六维验收与修复清单 | [`QA_FIX_LIST_2026-07-31.md`](QA_FIX_LIST_2026-07-31.md) | 需求、逻辑、边界、代码、测试与实际运行复核 |

## 当前机器事实

- 102 城、204 路线、331 事件、60 商品、54 随从、24 种占法注册；12 主城已接入 24 条重要选择后果链和 12 个导师事件。
- 事件选择共 779 项，49 项队列接线，282 项即时反馈；首批主城无反馈选择 0。
- 运行时美术 674 张，`art_wire_index.json` 为 674/674，未接线 0。
- en/zh 各 3169 条，缺失 0；故事单元 109 个；译文 stamps 1830 current、0 stale。
- 剩余非阻塞美术缺口：易经 31–64 共 34 张，运行时使用卦符回退。
- N4–N6 动画、正式课程/占法工具文案与人工视觉回归仍属于发布前工作。

## 验收命令

```bash
cd fatequest
node tools/validate/validate.mjs --quiet
node tools/lore/story.mjs check
node tests/test_i18n_lines.mjs
python3 tools/art/audit.py --unused
godot --headless --path . --script tests/run_tests.gd
```

`validate.mjs` 的 G28 会检查 12 主城的无反馈选择、队列断链、双语 key 和至少两页的后果链。

`build/`、`.godot/`、本地 `.venv/` 和脚本状态文件是生成物或本机缓存，不是需求交付物；发布包应由
`export_presets.cfg` 生成，上传前只提交经过验证的导出产物与当前文档。

## 历史文档

`docs/archive/` 与 `docs/superpowers/` 保存已完成批次的设计/执行记录，归档规则见 [`archive/README.md`](archive/README.md)。它们可以作为审计证据，
但其中的 650/650、2482 条等历史数字不应回填到当前状态页、计划或发布说明。
