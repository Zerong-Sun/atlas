# 诸象 Atlas 桌面版

独立 Electron 外壳复用网页生产构建与 LLM 代理。所有静态文件随包分发，`atlas://app` 固定来源让设置与学习笔记跨版本保存。渲染进程无 Node 权限、无预加载桥接，启用沙箱与上下文隔离；外部 HTTPS 资料在默认浏览器打开。

在 macOS 上构建 Windows x64 与 macOS Universal：

```sh
cd atlas
npm ci
npm run build:web
cd desktop
npm ci
npm run install:runtime
npm test
npm run prepare:app
npm run test:app
npm run package
npm run verify
```

产物在 `release/`，校验值在 `SHA256SUMS.txt`。仅 `build/` 中的白名单运行文件交给打包器，不包括源码工作区、环境文件、测试资料、Supabase 管理信息或开发者 API Key。

macOS 使用 ad-hoc 完整性签名，尚未获得 Developer ID 公证；Windows 尚未做 Authenticode 签名。发布时必须说明这一限制，不能宣称已通过系统信誉认证。用户操作见 `INSTALL.zh-CN.txt`。

当前跨平台打包脚本使用 macOS 自带的 codesign、ditto、zip；Electron 版本在 package.json 锁定。原生端与 Vercel 网站可以独立发布；该包不依赖 Vercel 站点是否在线。
