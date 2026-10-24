# Atlas 桌面 v0.2.1 发布与验证记录

- 发布时间：2026-10-25（Asia/Shanghai）。
- 发布标签：`atlas-v0.2.1`；源码提交：`c538d67cf99220ca14933ed7c384861dcecd2fbd`。
- 渠道：GitHub Release 桌面体验版（prerelease），保留仓库其他产品的 Latest 状态。
- [发布页](https://github.com/Zerong-Sun/atlas/releases/tag/atlas-v0.2.1)。

## 更新范围

包含 [技能仓库对照审阅](../reviews/gamedev-skills-2026-10-24.md) 与 [六维验证修复](../reviews/verification-six-areas-2026-10-24.md)：本地持久化和数据恢复、请求竞态和同步重试、抽签生命周期、键盘与焦点、滚动恢复、减少动态效果、首次加载性能及 CI。桌面版本、安装说明和帮助链接统一到 0.2.1；包内元数据记录实际来源提交。

本次仅发布桌面包；原 Vercel 网页、手机商店与数据库没有部署。AI 需要用户配置自己的服务与密钥。

## 验证证据

- 本地预检：macOS 13.7.8 Intel，Node 22.16.0，Electron 45.0.0。
- 发布构建：GitHub Actions macOS 15.7.9 ARM64，Node 22.23.2，Electron 45.0.0。[发布工作流](https://github.com/Zerong-Sun/atlas/actions/runs/40110379662) 完整通过。上传由 runner 完成，发布资产以该次构建为准。
- 工作区类型检查、166 项工作区测试、3 项桌面协议测试通过，共 169 项。
- Web 生产构建通过；首屏 gzip 165,013 bytes，最大 JS 块 gzip 150,122 bytes，静态 public 42,489,445 bytes，均低于预算。
- [发布源码 CI](https://github.com/Zerong-Sun/atlas/actions/runs/40109570237) 通过，包含上述检查及语料验证、导入与嵌入 dry-run。
- 本地 Intel 预检与云端 ARM64 发布构建均对编译目录与最终 macOS ASAR 各运行一次 Electron 自动化离线测试：24 个占法页面正常、无横向溢出；周易六次手动阳爻得到乾→乾；文化笔记重新加载后保留；390px 窄屏通过；渲染进程无 Node 权限；无 Key 返回 401；无渲染错误。详见 [最终包测试结果](desktop-0.2.1-smoke.json)。
- 两个 ZIP 完整性、版本与来源提交校验通过。macOS 包含 x86_64 / arm64，ad-hoc 签名完整性通过；Windows PE 为 AMD64。详见 [产物结果](desktop-0.2.1-artifacts.json)。
- 本地与云端构建均将开发 LLM 与 Supabase 环境配置置空。以下密钥扫描与文件逐一比对来自本地预检：92 个编译文本文件未匹配到本地开发 API Key。两个本地预检 ASAR 各 286 个文件与受检构建逐一比对一致（package.json 为 JSON 语义一致，其余逐字节一致）。包内无 .env、测试文件或 node_modules。详见 [构建扫描记录](desktop-0.2.1-build-scan.json)。这是一项已知本地值检查，不是全面安全审计。

## 发布文件

| 文件 | 字节数 | SHA-256 |
|---|---:|---|
| Atlas-v0.2.1-macOS-universal.zip | 268679082 | `055acb55638b20f3a61a03a447ea2c97bf3634fb56f67744ac784e3567990471` |
| Atlas-v0.2.1-Windows-x64.zip | 202097449 | `80e8171808053b8dd4a65fb8c370eb549c2687554967ceb1720948f8824f8212` |

GitHub 端 5 个附件均已核对上传状态与 SHA-256，两个 ZIP 的大小与构建报告一致；校验值和两份验证 JSON 也核对了远端摘要。

## 已知限制

- macOS 尚无 Developer ID 签名与 Apple 公证；Windows 尚无 Authenticode 签名。不能把 ad-hoc 完整性校验称为系统信誉认证。
- Windows 尚未进行实机验收。ARM64 已在 GitHub macOS runner 上自动运行通过，仍未做用户设备上的人工安装验收。
- 上游依赖审计仍有 8 high / 8 moderate，详见六维验证记录；本次发布不宣称所有依赖漏洞已经清零。
- 升级沿用 `ZhuxiangAtlas` 用户目录；自动化测试使用临时用户目录，不改动真实用户记录。
