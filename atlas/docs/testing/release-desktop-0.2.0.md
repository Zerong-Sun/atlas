# 诸象 Atlas v0.2.0 桌面发布记录

状态：2026-10-21 已公开发布 [诸象 Atlas v0.2.0 桌面体验版](https://github.com/Zerong-Sun/atlas/releases/tag/atlas-v0.2.0)。

标签 `atlas-v0.2.0` 对应源码提交 `5efab47aed1c2f5bfaeffb21c5005405a194f6ce`。GitHub 三个附件（双 ZIP 与 SHA256SUMS.txt）均为 uploaded；远端返回的文件大小与 SHA-256 已逐项匹配本地。此记录只代表桌面发行，不代表原网页或手机应用已上架。

## 本次交付

- Windows x64：完整 ZIP，包含 `ZhuxiangAtlas.exe` 和运行依赖，无需另装 Node.js。
- macOS Universal：完整 ZIP，包含 Intel / Apple Silicon 通用 `.app`。
- 离线静态资源、24 个方法入口与文化小课、《周易》64 卦卦辞／象辞／384 爻辞。
- 实际三钱法、纳甲／梅花结构修正、可追溯原典与近似星历边界，沿用 2026-10-20 的审计记录。
- 稳定的本地用户目录与应用来源，保留学习笔记、设置和本地记录。
- AI 代理复用共享实现；需要用户自行填写 API Key，未内置开发者密钥。

## 验证

- Web 生产构建通过。
- Atlas 工作区 110 项测试通过。
- 桌面协议 3 项测试通过：来源隔离、路径边界、路由／资源 MIME、AI 代理入口。
- Electron 离线运行：24 个方法页面可加载，渲染进程无法直接访问 Node，窄窗口无横向溢出。
- 本地开发密钥扫描：构建中命中 0 次。
- 实际 UI 输入六个 7：本卦乾（1）、变卦乾（1）；保存文化练习笔记后重载页面，笔记和已学习状态保留。
- 打包后的 ASAR 再次通过 24 页离线检查；macOS 原生应用成功创建渲染进程并保持运行。
- 双 ZIP 完整性验证通过，两个包均含 287 个资源条目，主进程文件 SHA-256 一致。
- Windows EXE 为 AMD64 PE；macOS 为 x86_64 + arm64，最低 macOS 13，ad-hoc 签名校验通过。
- 结构与哈希证据：[desktop-0.2.0-artifacts.json](desktop-0.2.0-artifacts.json)；离线交互证据：[desktop-0.2.0-smoke.json](desktop-0.2.0-smoke.json)。

| 附件 | 字节 | SHA-256 |
| --- | ---: | --- |
| Atlas-v0.2.0-Windows-x64.zip | 202084550 | `557bbf68e512f479a9fbb3cd12aa5c9edb982d353946002b05e9671b48821d83` |
| Atlas-v0.2.0-macOS-universal.zip | 269047991 | `28c5d2534fb5bae9ec6e5ed49f861023c86d39c34cfd65bda4176d69e086595e` |

## 范围与限制

这是桌面体验版。macOS 为 ad-hoc 完整性签名，未取得 Developer ID 签名／Apple 公证；Windows 未做 Authenticode 签名。Windows 真机及 Apple Silicon 真机验收待补，本机为 Intel macOS 13.7.8。不得把交叉打包成功等同于所有系统实机通过。

Vercel 网页、Expo/App Store 客户端、远程 Supabase 迁移不随此包发布。Supabase 未配置时，已有界面仍含本地演示数据；文化小课笔记和用户本地记录可用，但不构成云端同步服务。各传统内容、素材与算法的进一步缺口见 [`method-completeness.md`](../method-completeness.md)。

## 重建

见 [`desktop/README.md`](../../desktop/README.md)。Electron 45.0.0 与 packager 20.3.0 锁定于独立锁文件；只复制网页编译文件和桌面运行文件，资源不会从仓库根目录整体打包。
