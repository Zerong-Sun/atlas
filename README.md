# 仓库入口

**现行主项目是 [`fatequest/`](fatequest/) 的 Godot 版游戏《远行之书》。**
其余目录均为归档参考，互不引用、不共享构建。

| 目录 | 角色 |
|------|------|
| [`fatequest/`](fatequest/) | **现行主项目** — 远行之书 The Book of Far Roads（**Godot 4** 游戏） |
| [`fatequest/archive/web-version/`](fatequest/archive/web-version/) | 归档 — 初代网页版（静态 HTML/JS/PWA，已冻结、不进 CI） |
| [`atlas/`](atlas/) | 归档参考 — 诸象 Atlas monorepo（占卜引擎与方法元数据，短期冻结） |

## FateQuest（主 · Godot）

用 **Godot 4.7.1** 打开 [`fatequest/`](fatequest/)（存在 `project.godot`），F5 运行。
无头测试与门禁：

```bash
cd fatequest
godot --headless --path . --script tests/run_tests.gd   # 内核单测
node tools/validate/validate.mjs                        # 内容门禁
```

说明、GDD 与结构见 [`fatequest/README.md`](fatequest/README.md)；现状见
[`fatequest/docs/STATUS.md`](fatequest/docs/STATUS.md)。

## 归档

- **网页版**：Godot 版的前身，静态 HTML/JS 实现。留档于
  [`fatequest/archive/web-version/`](fatequest/archive/web-version/)，说明见其 README。
- **Atlas**：占卜方法对照应用的完整 monorepo，供查阅引擎与方法元数据。
  完整文档见 [`atlas/README.md`](atlas/README.md)。

> **部署暂关：** Atlas 的 Vercel 自动部署已在 `atlas/vercel.json` 关闭
> （`git.deploymentEnabled: false`）。网页版不再部署。
