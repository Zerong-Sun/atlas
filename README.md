# Atlas（诸象）

跨文化命理与占梦 AI 对照解读 App — 多体系对照 + 古籍依据 + 可追溯引用。

- 产品 PRD：[docs/prd/诸象.md](docs/prd/诸象.md)
- 实施计划：见项目 Wiki / 本地 `docs/plan.md`

## Monorepo 结构

```text
atlas/
├── apps/mobile/          # Expo 客户端
├── packages/
│   ├── engines/          # 八字 / 西占 / 塔罗 / 周易 计算引擎
│   ├── shared-types/     # 共享类型与 JSON Schema
│   └── corpus-scripts/   # 语料采集与入库流水线
├── supabase/             # 数据库迁移与 Edge Functions
├── corpus/               # 语料清单与种子数据
└── docs/                 # PRD、合规说明
```

## 快速开始

```bash
# 安装依赖（根目录）
npm install

# 语料流水线（示例）
npm run corpus:validate -w @atlas/corpus-scripts

# 移动端（Phase 1 起）
npm run dev -w @atlas/mobile
```

## 环境变量

复制 `.env.example` 为 `.env`，填写 Supabase 与 Mimo 等密钥（勿提交 `.env`）。

## 许可

专有项目。古籍语料遵循各条目 `source_type` 与 `license_note` 字段标注。
