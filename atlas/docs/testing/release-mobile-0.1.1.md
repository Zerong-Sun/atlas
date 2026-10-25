# Atlas 手机版 v0.1.1 发布与验证记录

- 发布时间：2026-10-26（Asia/Shanghai）。
- 发布标签：`atlas-mobile-v0.1.1`；源码提交：`56b590fe3344eec34b3692e664f614a31e5357db`。
- 渠道：[GitHub Release Android 体验版](https://github.com/Zerong-Sun/atlas/releases/tag/atlas-mobile-v0.1.1)（prerelease）；没有提交 Google Play 或 TestFlight。

## 更新内容

本版包含 24 个占法入口说明与小故事、64 卦故事、78 张塔罗牌本地图像和牌义、三枚铜钱图、二十四山罗盘与近期的文化资料。Android 应用版本为 `0.1.1`，版本代码 `2`，包名 `com.atlas.app`。

## 构建与验收

- 本机手机端 TypeScript 检查和 14 项测试通过。iOS、Android Expo/Hermes 导出通过；两个导出产物各自与源文件逐字节匹配全部 78 张塔罗 WebP。导出证明 JS 与资源可打包，不代替原生安装验收。
- [Android 云端构建](https://github.com/Zerong-Sun/atlas/actions/runs/40213546065)通过：从源码生成原生工程、用专用持久密钥签名、验证 APK、在 Android 35 虚拟机安装并启动。自动化检查首次引导页可见；[截图](https://github.com/Zerong-Sun/atlas/releases/download/atlas-mobile-v0.1.1/atlas-mobile-onboarding.png)已人工查看，显示“你想探索什么？”与兴趣选项，未出现启动白屏。结果见发布附件 `emulator-smoke.json`。
- 本机从构建任务下载 APK 后，复算大小与 SHA-256，并与 `mobile-android-verification.json` 一致。APK 使用 v2 签名；证书 SHA-256 为 `4611a0a47b2067dfaa5d85870c4959aea6685d8f875c73f5dcfe3d1ba1a6a4fa`，与本次专用签名密钥一致。
- [云端上传任务](https://github.com/Zerong-Sun/atlas/actions/runs/40215611293)再次校验来源提交、APK 大小、SHA-256 和虚拟机结果后，将同一 APK 上传到草稿。发布页五个附件的远端摘要与本机文件逐一比对一致。

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| Atlas-mobile-v0.1.1-Android.apk | 97807700 | `40de0fadcdd05c2492216e44bec548de3108d9a36149e4acddeb9fdec3431ab3` |

## 范围与限制

Android 虚拟机验收覆盖安装、启动和首次引导页；塔罗、铜钱、罗盘的原生交互及磁传感器精度仍需实体手机复核。APK 是可直接安装的 GitHub 体验版，尚未经过 Google Play 商店审核。

当前环境没有 Expo 项目登录、EAS 项目 ID、Apple Developer 签名凭据，也没有可用的 iOS 模拟器；因此不能生成面向真实 iPhone 的签名 IPA，也没有发布 TestFlight。iOS 的代码和 78 张牌图已通过导出验证，待上述账号与签名配置齐备后可继续构建和提交。
