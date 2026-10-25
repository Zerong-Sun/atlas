# Atlas 桌面 v0.2.2 发布与验证记录

- 发布时间：2026-10-25（Asia/Shanghai）。
- 发布标签：`atlas-v0.2.2`；源码提交：`935c3e598bab5d3c640421ebe89c63de3fc22d21`。
- 渠道：GitHub Release 桌面体验版（prerelease），不改变 FateQuest 的 Latest 状态。
- [发布页](https://github.com/Zerong-Sun/atlas/releases/tag/atlas-v0.2.2)。

## 更新内容

本版将 24 个占法入口故事、64 卦故事和 78 张塔罗牌的图像与释义带入离线桌面包。塔罗抽牌与历史回放显示实际牌图和具体解释；三钱起卦绘出三枚铜钱；二十四山罗盘支持手动方位测算，并在传感器无可靠读数时给出提示。跨文化资料与来源标注也随包更新。详见 [六维验证与修复清单](divination-six-dimension-review-2026-10-25.md)。

## 发布验证

- [源码 CI](https://github.com/Zerong-Sun/atlas/actions/runs/40205980228) 和 [桌面发布工作流](https://github.com/Zerong-Sun/atlas/actions/runs/40206013909) 均通过。发布工作流从标签重新安装依赖、运行工作区与桌面测试、类型检查、网页构建、预算检查，以及编译目录和最终 macOS ASAR 的 Electron 离线烟雾测试。
- 烟雾测试逐一打开 24 个占法页面，检查入口故事与文化资料；在桌面容器中读取 78 张不同的本地 WebP、完成塔罗抽牌和历史回放、确认罗盘 270° 对应酉山，并在 320px 宽度检查罗盘和三枚铜钱无横向溢出。渲染进程无 Node 权限，离线 AI 请求返回缺少用户 Key 的 401，渲染错误列表为空。详见发布附件 `smoke-results.json`。
- 两个安装包均通过 ZIP、版本、来源提交、架构及 macOS ad-hoc 签名完整性检查。包内来源提交均为上述标签提交。详见发布附件 `verification.json`。
- GitHub 发布的两个 ZIP 摘要和大小与 `verification.json`、`SHA256SUMS.txt` 一致；三个小附件重新下载后计算的 SHA-256 也与 GitHub 的附件摘要一致。

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| Atlas-v0.2.2-macOS-universal.zip | 275699923 | `1b4c955046fc069f803d78cafaa3f2cc3292686b77da75f85bf5ae0684f4a39c` |
| Atlas-v0.2.2-Windows-x64.zip | 209116007 | `1ffbe4132159a5275caf738484e58d758e4a91020c420d01b960a5a1b93ac612` |

## 范围与限制

本次发布只提供桌面包；暂停的 Vercel 网页、手机商店应用和远程数据库没有部署。Windows 安装与磁传感器精度尚未在实体设备上验收。macOS 包尚无 Developer ID 签名及 Apple 公证，Windows 包尚无发行者签名；ad-hoc 签名仅用于完整性校验。
