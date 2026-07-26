# 远行之书 · FateQuest

中世纪欧亚旅行开放世界 PWA。角色抽取 → 城市探索 → 雾地图 → 出行 / 五拍占卜 → 停笔结语。

本仓库包含两个**互不引用**的顶层项目：

| 目录 | 角色 | 状态 |
|------|------|------|
| [`fatequest/`](fatequest/) | **现行主项目** — 远行之书 FateQuest（静态 HTML/JS 游戏） | v3.0 · M0–M3 ✅ · M4 打磨中 |
| [`atlas/`](atlas/) | **归档参考** — 诸象 Atlas monorepo（占卜引擎与方法元数据） | 短期冻结，供对照阅读 |

两边无共享 package、无相互 import、无耦合构建。

## FateQuest（主）

**两条旅行线：**

- **Polo 走廊** — 威尼斯 → 刺桐（14 城）
- **白图泰线** — 丹吉尔 → 卡利卡特（6 城）

**当前规模：** 20 城 · 107 事件 · 100 图鉴 · 9 结局 · 580+ 美术资产 · 10+ 占卜法

```bash
cd fatequest
npx serve .
# 浏览器打开提示的本地地址（常见为 http://localhost:3000）
# 勿用 file://（JSON 表需 fetch）
```

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
```

完整说明、GDD 与项目结构见 [`fatequest/README.md`](fatequest/README.md)。

| 文档 | 说明 |
|------|------|
| [GDD](fatequest/docs/GDD.md) | 游戏设计文档 |
| [系统表规格](fatequest/docs/SYSTEM_TABLES.md) | 八表 schema |
| [文本需求](fatequest/docs/TEXT_REQUIREMENTS.md) | 文案完成度 |
| [美术需求](fatequest/docs/ART_REQUIREMENTS.md) | 素材完成度 |
| [art-gen-kit](fatequest/scripts/art-gen-kit/README.md) | ChatGPT 批量生图工具 |

## Atlas（归档）

```bash
cd atlas
npm install
npm run dev:web
```

完整文档与命令见 [`atlas/README.md`](atlas/README.md)。

> **部署暂关：** Vercel 自动部署已在 `atlas/vercel.json` 关闭（`git.deploymentEnabled: false`）。项目完成后再重新接入。
