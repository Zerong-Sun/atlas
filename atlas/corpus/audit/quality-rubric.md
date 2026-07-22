# 语料内测质量 Rubric（corpus_v0_1）

每条 chunk 抽检 1–5 分（与解读 Rubric 对齐的语料侧指标）：

| 维度 | 1 分 | 5 分 |
| --- | --- | --- |
| 版权标注 | 缺 `source_type` / `license_note` | 字段完整且与 manifest 一致 |
| 原文/译文分离 | 混在单字段、无法区分展示层 | `original_text` / `translation_zh` / `annotation_zh` 清晰 |
| 检索可用 | 关键词空、tradition 错误 | 关键词与 tradition 可召回 |
| 误引风险 | 自研内容标为公版原文 | `source_type` 与 `verbatim_allowed` 正确 |
| 合规（占梦） | 伊斯兰条目含吉凶预言表述 | 仅精神反思话术 |

## 自动化门禁（CI）

- `npm run corpus:validate`：chunk ≥ 500、版权字段 100%、无空必填项
- `corpus/audit/copyright-coverage.json`：每次 validate 更新
- 发布前：`npm run corpus:publish`（生成 → 校验 → ingest dry-run）

## 人工抽检

- 每 tradition 随机 10 条，对照 `corpus/manifests/corpus_v0_1.yaml`
- 公版条目核对原文出处（如 ctext 周易）
