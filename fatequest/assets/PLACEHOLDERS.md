# 美术资源占位清单 · Art Placeholder Manifest

当前版本视觉全部由 CSS / emoji / SVG 程序化生成，开箱即玩。
Everything currently renders via CSS / emoji / SVG — playable out of the box.
以下为可逐步替换的美术位，替换时保持文件名或按注释更新引用。

| 占位 Slot | 现状 Current | 期望资源 Desired asset |
|---|---|---|
| 应用图标 App icon | `icon.svg` / `icon-maskable.svg`（程序化罗盘星徽） | 精绘 512×512 PNG ×2（any + maskable），另补 192px |
| 塔罗牌面 Tarot faces | emoji + 渐变卡背 CSS | 22 张大阿卡纳插画 `tarot/00-fool.webp …`（78×126 @2x） |
| 卡背 Card back | CSS 织纹 | `tarot/back.webp` |
| 卢恩石 Rune stones | CSS 石面 + Unicode 符文 | 24 张石刻质感贴图 `runes/fehu.webp …` |
| 铜钱 I-Ching coins | CSS 圆形铜钱 | 正反面铜钱贴图 `coins/heads.webp` `tails.webp` |
| 筊杯 Moon blocks | CSS 月牙块 | 3D 或手绘筊杯 `jiaobei/flat.webp` `round.webp` |
| 签筒 Lot cylinder | CSS 木筒 | 手绘签筒 + 签纸纹理 `lots/cylinder.webp` `paper.webp` |
| 秘境卡封面 Realm covers | 渐变 + 图标 | 每文明一张横幅插画 `realms/tarot.webp …`（可选） |
| 星空背景 Sky | canvas 粒子星空 | 可保留；如需氛围可加远景星云 `sky/nebula.webp` |
| 音效 SFX | 无 none | 抽牌 / 掷币 / 摇签 / 升级 短音效（<1s, .mp3/.ogg） |
| 背景乐 BGM | 无 none | 循环氛围乐 1-2 首（建议可开关） |

> 建议格式 webp/avif，双倍分辨率；音频懒加载。替换后请在 `sw.js` 的 ASSETS 列表补充路径以支持离线。
> Prefer webp/avif at 2×; lazy-load audio. Add new paths to `sw.js` ASSETS for offline support.
