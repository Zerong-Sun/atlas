# 诸象 Atlas v0.2.0 · Windows / macOS 桌面体验版

诸象是通过占卜传统了解不同文化的应用。本次提供独立桌面下载包，基础页面和文化内容可离线打开。

## 下载与启动

- **Windows 10 / 11，64 位**：下载 `Atlas-v0.2.0-Windows-x64.zip`，完整解压后双击 `ZhuxiangAtlas.exe`。
- **macOS 13 或更新版本，Intel 或 Apple Silicon**：下载 `Atlas-v0.2.0-macOS-universal.zip`，解压后将 `ZhuxiangAtlas.app` 拖到“应用程序”。
- `SHA256SUMS.txt` 提供两个 ZIP 的完整性校验值。不要下载 GitHub 自动生成的 Source code 来启动应用。

## 内容

- 24 个方法入口、文明小课、文化练习与本地笔记。
- 《周易》64 卦、384 爻原典，三钱法按六次结果自下而上成卦，动爻与变卦相互一致。
- 纳甲、梅花与占星算法修正；原创签诗和近似星历均保留边界说明。
- 文化场景插画、乾坤意象、铜钱投掷和方法反馈动效；支持减少动态效果。
- AI 解读需要联网，在设置中填自己的 API Key；此下载包没有共享密钥。

## 验证与边界

工作区 110 项测试、桌面协议 3 项测试通过；在 Intel macOS 上检查全部 24 个方法离线加载、页面布局、存储与渲染隔离。Windows 和 Apple Silicon 实机测试仍待补。

macOS 包仅有本地完整性签名，尚未由 Apple 公证；Windows 包尚未做发行者签名，首次启动可能触发系统安全提示。安装说明随 ZIP 提供。

本次是桌面体验版；Vercel 网站与远程数据库没有随此发布更新。未配置云服务时部分界面使用本地演示数据，文化资料和用户笔记保存在本机。传统内容与数据库的后续缺口见仓库 `atlas/docs/method-completeness.md`。
