# FateQuest — 网页版（归档）

> **状态：已归档，2026-07-24。** 这是灵游 FateQuest 的**初代网页实现**（静态
> HTML/JS/PWA）。现行版本是同仓库 [`fatequest/`](../../) 根目录下的 **Godot 版**
> ——世界、内核、数据与测试都在那边。本目录冻结留档，供对照与必要时复活。

## 这是什么

一个纯前端、可离线（Service Worker + manifest）的占卜旅行游戏，包含两大模式
（占途·千载行纪 / 命途塔占卜肉鸽），引擎与数据全部是手写 JS。它是 Godot 版
的前身：许多数据（马可·波罗语料、占卜方法、结局矩阵）最早在这里成形，之后
被 Godot 版的 `content/` 与 `tools/` 管线接手并成为唯一真相源。

## 目录

| 路径 | 内容 |
|---|---|
| `index.html` · `sw.js` · `manifest.webmanifest` | PWA 外壳 |
| `js/` | 游戏引擎与生成数据（`app.js`、`engines.js`、`data-*.js`、`outcomes/`） |
| `css/` | 样式 |
| `scripts/` | 网页版专用工具：`build-lore-runtime` `gen-outcomes` `gen-quest-stories` 与两道门禁 `validate-outcomes` / `smoke-outcomes` |
| `assets` → `../../assets` | **符号链接**，指向仓库共享素材目录（Godot 版也用它） |

## 运行

```bash
cd fatequest/archive/web-version
npx serve .
# 浏览器打开提示的地址（常见 http://localhost:3000）
```

素材通过 `assets` 符号链接指向 `fatequest/assets`，无需复制。

## 门禁（已从 CI 摘除，可手动跑）

```bash
node scripts/validate-outcomes.mjs   # 60 道 outcome 门禁
node scripts/smoke-outcomes.mjs      # 引擎冒烟
```

这两道原在 `.github/workflows/ci.yml` 里，随本次归档移除——它们只校验网页版的
`js/` 数据，与 Godot 版无关。若复活网页版，从 git 历史恢复那两个 CI 步骤即可。

## 为什么归档而不是删除

网页版是数据与玩法设计的第一手记录。Godot 版的不少决策（占卜即移动方式、
命运博弈三层、断案证据链）都能在这里读到最早的形态。删掉等于抹掉出处；
冻结留档，成本只是一个不再进 CI 的目录。
