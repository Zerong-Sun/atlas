# 仓库入口

本仓库包含两个**互不引用**的顶层项目：

| 目录 | 角色 |
|------|------|
| [`fatequest/`](fatequest/) | **现行主项目** — 灵游 FateQuest（静态 HTML/JS 游戏） |
| [`atlas/`](atlas/) | **归档参考** — 诸象 Atlas monorepo（短期冻结，供对照阅读） |

两边无共享 package、无相互 import、无耦合构建。需要查阅占卜引擎或方法元数据时，打开 `atlas/` 即可。

## FateQuest（主）

```bash
cd fatequest
npx serve .
# 浏览器打开提示的本地地址（常见为 http://localhost:3000）
```

说明、GDD 与结构见 [`fatequest/README.md`](fatequest/README.md)。

## Atlas（归档）

```bash
cd atlas
npm install
npm run dev:web
```

完整文档与命令见 [`atlas/README.md`](atlas/README.md)。若继续部署诸象到 Vercel，请将项目 **Root Directory** 设为 `atlas`。
