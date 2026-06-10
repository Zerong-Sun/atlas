# 语料版权字段说明

MVP 语料版本 `corpus_v0_1` 要求每条 chunk 与 manifest 书目 **100% 覆盖** 版权字段。校验命令：

```bash
npm run corpus:validate
```

报告输出：`corpus/audit/copyright-coverage.json`。

## 必填字段

| 层级 | 字段 | 说明 |
| --- | --- | --- |
| manifest `sources[]` | `source_type` | `public_domain` \| `licensed` \| `self_authored` |
| manifest `sources[]` | `license_note` | 人类可读的版权/授权说明 |
| seed chunk | `source_type` | 与书目一致，冗余便于审计 |
| seed chunk | `license_note` | 与书目一致或更细粒度说明 |
| seed chunk | `source_url` | 公版原文出处（如有） |
| seed chunk | `verbatim_allowed` | 是否允许 UI 展示原文 |

## source_type 规则

### public_domain

- 必须提供 `original_text`（古籍原文节选）。
- 白话 `translation_zh` 与 `annotation_zh` 为自研，须在 `license_note` 中注明。
- 示例：`公版《周易》原文节选 + 自研白话与注释`

### self_authored

- 结构化规则、牌义、短语库等自研内容。
- `original_text` 可为空；须至少有 `translation_zh` 或 `annotation_zh`。
- `verbatim_allowed` 通常为 `false`。

### licensed

- 第三方授权内容（MVP 暂未使用）。
- 须含明确 `license_note` 与 `source_url`。

## 第三方计算组件

| 组件 | 用途 | 许可 |
| --- | --- | --- |
| [Swiss Ephemeris](https://www.astro.com/swisseph/) via `@swisseph/browser` / `@swisseph/node` | Web / Node 吠陀星历（Lahiri 恒星黄道） | AGPL-3.0 |

产品分发前须评估 AGPL 合规；默认使用内置 Moshier 星历（浏览器 ~250KB WASM），不加载 CDN 全精度文件。

## 展示层区分

UI 与报告须区分以下层级（见 [compliance.md](compliance.md)）：

1. **原文** — `original_text`（仅 `verbatim_allowed=true` 且 public_domain）
2. **翻译** — `translation_zh`
3. **注释** — `annotation_zh`
4. **AI 推理** — Mimo 生成，标记 `degraded` 或模板 fallback
5. **建议** — 行动建议、注意事项（非古籍引用）

## 引用防幻觉

- 解读中的古籍引用必须来自检索白名单 `chunk_id`。
- 历史报告使用 `citation_snapshots` 冻结，语料升级不影响已生成报告。
- `CitationVerifier` 校验：`chunk_id ∈ retrieval` 且 `application` 与 chunk 文本/关键词匹配。

## 相关文件

| 路径 | 用途 |
| --- | --- |
| `corpus/manifests/corpus_v0_1.yaml` | 书目清单与版权元数据 |
| `corpus/seeds/*.json` | 结构化种子 chunk |
| `packages/corpus-scripts/src/lib/chunk-schema.mjs` | 必填字段定义 |
| `packages/corpus-scripts/src/lib/quality-checks.mjs` | 校验逻辑 |
| `packages/corpus-scripts/src/validate-manifest.mjs` | CLI 入口 |
