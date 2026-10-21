# 仓库入口

本仓库包含两个独立维护的产品：Godot 游戏《远行之书》与跨文化占卜应用《诸象 Atlas》。
两个项目独立构建和发布，旧实现保留在归档目录。

| 目录 | 角色 |
|------|------|
| [`fatequest/`](fatequest/) | **现行主项目** — 远行之书 The Book of Far Roads（**Godot 4** 游戏） |
| [`fatequest/archive/`](fatequest/archive/) | 旧版本归档索引与初代网页快照（已冻结、不进 CI） |
| [`atlas/`](atlas/) | 诸象 Atlas — Web / Expo 移动端 / Electron 桌面版，共享占卜引擎与文化内容 |

下载与发布说明：[FateQuest v3.1.1](https://github.com/Zerong-Sun/atlas/releases/tag/v3.1.1) · [诸象 Atlas v0.2.0](https://github.com/Zerong-Sun/atlas/releases/tag/atlas-v0.2.0)。请下载发布页的运行包；Source code 是源码归档。

## FateQuest（主 · Godot）

用 **Godot 4.7.1** 打开 [`fatequest/`](fatequest/)（存在 `project.godot`），F5 运行。
无头测试与门禁：

```bash
cd fatequest
godot --headless --path . --script tests/run_tests.gd   # 内核单测
node tools/validate/validate.mjs                        # 内容门禁
```

说明、GDD 与结构见 [`fatequest/README.md`](fatequest/README.md)；当前内容规模、玩法覆盖与限制见
[`fatequest/docs/STATUS.md`](fatequest/docs/STATUS.md)。

## 诸象 Atlas

Windows x64 与 macOS 13+（Intel / Apple Silicon）桌面体验版可独立运行，离线打开方法页面与文化小课；AI 功能需要联网与用户自己的 API Key。安装和构建见 [`atlas/desktop/README.md`](atlas/desktop/README.md)，项目结构与手机开发见 [`atlas/README.md`](atlas/README.md)。

网页与原生手机应用独立发布。原 Vercel 站点仍待登录后恢复，远程数据库未随桌面包迁移。

## 归档

- **FateQuest 旧版**：分支级提交索引、恢复命令和初代网页快照见
  [`fatequest/archive/README.md`](fatequest/archive/README.md)。
