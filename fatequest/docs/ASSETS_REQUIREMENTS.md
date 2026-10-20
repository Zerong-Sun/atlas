# 素材总索引 · ASSETS REQUIREMENTS

**当前核对：2026-10-20 · Godot 维护线。** 本页是美术、音频、游戏文本和书籍资料的统一入口。逐项优先级与验收出口见[资料库整改总表](library_audit/README.md)。旧文档的“全部接入”“全部完成”不能代替当前内容质量验收。

## 当前库存与真实缺口

| 资料 | 已有 | 确认缺口/问题 | 尚待审阅 |
|---|---|---|---|
| 美术 | 849个生产候选图像文件，含1张塔罗测试图；另129归档、58源组图 | 塔罗缺38文件；旧con/mazu随从矩阵缺18文件；易经34占位；多人肖像、未拆场景和人物错配；易经结果按错误编号选图 | 81项有代理视觉观察，其余768生产候选未目检；人类美术/史实签署另待补 |
| 音乐/环境音 | 37 OGG：20 stem+12环境床+5 sacred_blur；11类程序SFX | 清单内OGG无缺失；场所切换、海路环境、color/sacred调度有缺口；6类SFX未找到调用；16文件循环端点需排查 | 全部48清单项未实际听审；合成音色不能冒称真实传统器乐录音 |
| 游戏文本 | 140 story单元，中英各3955键；运行词典各5555键 | 92条交易反馈需重写；9缺stamp；254现有stamp被解析器漏读；103城缺独立短简介，76市集缺专属介绍 | 140单元需补当前版本审校证据；另1600运行键需定位维护来源 |
| 书籍资料 | 16语料库、462段（276 places+186 stories）；8册入书案 | 仅6库同时有本地原文及拆章；平托机译/OCR问题；两种现代译本版本声明待核；法德兰选集作者归属待拆 | 462段原文、年代、翻译、演绎边界与编辑签署未闭合；精读卡仅5张 |

计数不能直接相加为制作预算。18个旧随从文件缺口、44个当前无肖像随从和已隔离错配图有重叠；通用职业图也可能覆盖多名匿名人物。34张易经占位是缺正式图，不是缺文件。62座无sites城市仍有入城正文，其中38座有市集。

## 逐项列表与系统需求

| 类别 | 审计/完整清单 | 需求与生产规范 |
|---|---|---|
| 总清单 | [整改总表](library_audit/README.md) | [引擎总需求](FATEQUEST_ENGINE_REQUIREMENTS.md) §0.5 |
| 美术 | [报告](library_audit/ART_AUDIT_2026-10-20.md) · [逐文件CSV](library_audit/art_inventory.csv) | [ART_REQUIREMENTS](ART_REQUIREMENTS.md) · [ART_TODO](../assets/art/ART_TODO.md) |
| 音频 | [报告](library_audit/AUDIO_AUDIT_2026-10-20.md) · [逐音频CSV](library_audit/audio_inventory.csv) | [AUDIO_PLAN](AUDIO_PLAN.md) · [MANIFEST](../assets/audio/MANIFEST.md) |
| 文本 | [报告](library_audit/TEXT_AUDIT_2026-10-20.md) · [140单元队列](library_audit/text_review_inventory.csv) · [92条改写项](library_audit/text_confirmed_rewrite_items.csv) | [TEXT_REQUIREMENTS](TEXT_REQUIREMENTS.md) · [L10N_PLAN](L10N_PLAN.md) |
| 书籍 | [报告](library_audit/BOOK_SOURCE_AUDIT_2026-10-20.md) · [16库清单](library_audit/book_inventory.csv) · [462段队列](library_audit/book_passage_review.csv) | [来源记录](../assets/books/SOURCE_NOTES.md) · [LORE_PIPELINE](LORE_PIPELINE.md) |

## 验收口径

每项分别记录：文件存在、技术可读、实际触发、语义/形象对应、质量审阅、来源依据。任一状态不能替代其他状态。“未审”不是“低质量”；“候选疑点”不是“确定错误”。换版后旧审阅仅对旧hash有效。

美术索引674条仅证明注册数量。文本检查器当前成功退出仍会漏检stamp。音频解码、静音启动不证明真实播放或听感。本轮完成核对、清单和文档修正；生产代码、故事正文、音画资产未修改，P0/P1问题仍待处理。

## 复核入口

在 `fatequest/` 下执行：

```bash
python3 tools/lore/audit_library_sources.py
python3 tools/lore/audit_reading_cards.py
python3 docs/library_audit/build_art_inventory.py  # 需Pillow
python3 docs/library_audit/test_art_review_snapshot.py
node tools/lore/l10n.mjs report --lang zh
node tools/lore/story.mjs check                   # 已知漏检见文本审计
node tests/test_i18n_lines.mjs
```

音频解码方法、版本和听审边界见音频报告。这些检查不代替全库美术内容、人类双语通读或听审。归档和源组图保留，不计作生产完成；Prompt权威路径仍为 `assets/art/ART_PROMPTS*.md`。
