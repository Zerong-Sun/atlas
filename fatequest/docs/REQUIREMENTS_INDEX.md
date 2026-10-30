# 需求与交付索引

**当前基线：2026-10-20 · Godot 4.7.1 · FateQuest v3.0**

本文是工作区整理后的入口页，用来区分“当前可执行文档”和“历史记录”，避免把旧计划误当成待办。

## 当前权威文档

| 需要回答的问题 | 文档 | 维护规则 |
|---|---|---|
| 现在做到哪一步 | [`STATUS.md`](STATUS.md) | 只写当前状态与已知缺口 |
| 下一步怎么做 | [`PLAN.md`](PLAN.md) | 只保留可执行任务与验收出口 |
| 版本阶段顺序 | [`ROADMAP.md`](ROADMAP.md) | 阶段完成后更新，不重复写操作步骤 |
| 引擎/数据/发布总需求 | [`FATEQUEST_ENGINE_REQUIREMENTS.md`](FATEQUEST_ENGINE_REQUIREMENTS.md) | 需求、边界与发布验收 |
| 当前文本生产需求 | [`TEXT_REQUIREMENTS.md`](TEXT_REQUIREMENTS.md) | 已完成基线、未完成多轮互动、物品/故事/情报文本规格与验收 |
| 中英文流程 | [`L10N_PLAN.md`](L10N_PLAN.md) | 翻译守则与当前覆盖率 |
| 美术/音频/文本资产总索引 | [`ASSETS_REQUIREMENTS.md`](ASSETS_REQUIREMENTS.md) | 库存、接线、缺口与归档策略 |
| 美术验收细则 | [`ART_REQUIREMENTS.md`](ART_REQUIREMENTS.md) | 尺寸、文化匹配、接线和机器审计 |
| 十二主城剧情接线 | [`12_CITY_CLOSURE_MATRIX.md`](12_CITY_CLOSURE_MATRIX.md) | 入口选择、后果链、双语文本与探索点接线 |
| 资料库审阅与整改清单 | [`library_audit/README.md`](library_audit/README.md) | 四类资料的缺口、确定问题、未审项及验收出口 |
| 六维验收与修复清单 | [`SIX_DIMENSION_REVIEW_2026-10-20.md`](SIX_DIMENSION_REVIEW_2026-10-20.md) | 需求、逻辑、边界、代码、测试与实际运行复核 |
| 入城与身份称呼修复 | [`CITY_ENTRY_IDENTITY_FIX_2026-10-20.md`](CITY_ENTRY_IDENTITY_FIX_2026-10-20.md) | 当前城市进入交互、丹吉尔式旅人及回归记录 |

## 当前核对事实

- 103城、206路线、431事件、61商品、54随从；24种占法注册。结构接线完成不等于全部内容已审。
- 美术根目录674 WebP、注册索引674条；生产候选共849图像（含1测试图），不能称674张逐项运行验收通过。明确缺文件56；易经34为占位，另有编号错配待修。
- story中英各3955键，运行词典各5556键；显式stamp3955匹配、0缺失，连字符键已由工具读取。人工审校证据未闭合，逐key审阅库已列17个编辑复核项。
- 37 OGG与11类程序SFX有库存，场景接入/调度有缺口，全部未实际听审。
- 16语料库共462段，仅6库同时有本地原文和拆章；8册书案、5张精读卡不等于16本整书精读完成。平托重校、作者年代归属及版本来源待办见书籍审计。
- [资料库总表](library_audit/README.md)区分缺失、占位、接入、确定重做与待审；不能以旧里程碑全绿替代当前质量判断。

## 验收命令

```bash
cd fatequest
node tools/validate/validate.mjs --quiet
node tools/lore/story.mjs check
node tests/test_i18n_lines.mjs
python3 tools/art/audit.py --unused
node tools/test/run_isolated_godot.mjs tests/run_tests.gd
```

`story.mjs check` 当前 5762 current/0 stale/0 missing；结果只证明源文版本对应，质量限制见[文本审计](library_audit/TEXT_AUDIT_2026-10-20.md)。旧美术审计 USED 包含注册引用，不能等同实际使用。

`validate.mjs` 的 G28 会检查 12 主城的无反馈选择、队列断链、双语 key 和至少两页的后果链。

`build/`、`.godot/`、本地 `.venv/` 和脚本状态文件是生成物或本机缓存，不是需求交付物；发布包应由
`export_presets.cfg` 生成，上传前只提交经过验证的导出产物与当前文档。

## 历史文档

`docs/archive/` 与 `docs/superpowers/` 保存已完成批次的设计/执行记录，归档规则见 [`archive/README.md`](archive/README.md)。它们可以作为审计证据，
但其中的 650/650、2482 条等历史数字不应回填到当前状态页、计划或发布说明。
