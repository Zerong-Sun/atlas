# Corpus（语料库）

MVP 语料版本：`corpus_v0_1`（≥500 chunks，版权字段 100%；当前约 **1701** chunks / **12** 书目）。

| 体系 | 约 chunk 数 | 主要书目 |
| --- | ---: | --- |
| 周易 | 610 | 六十四卦、爻辞、六爻规则 |
| 八字 | 396 | 规则库 + **四柱/大运/流年/小运/流月列表** + 古籍公版节选 |
| 塔罗 | 214 | 大/小阿卡纳自研牌义 |
| 西占 | 188 | 短语库 + 托勒密《四书》公版节选 |
| 占梦 | 293 | 象征库 + 周公解梦意象 + 荣格/伊斯兰反思 |

## 目录

| 路径 | 说明 |
| --- | --- |
| `manifests/corpus_v0_1.yaml` | 书目清单、版权、tradition 映射 |
| `seeds/*.json` | 结构化种子（周易/八字/塔罗/西占/占梦） |
| `audit/` | 版权覆盖率报告与内测 Rubric |
| `.cache/` | 本地生成物（ingest SQL/JSON，gitignore） |

## 发布流程

```bash
npm run corpus:publish
```

等价于：`generate` → `validate` → `ingest --dry-run`（SQL + JSON）。

入库生产：配置 Supabase 后执行 `npm run corpus:ingest`（写入 `corpus/.cache/ingest.sql`）。
