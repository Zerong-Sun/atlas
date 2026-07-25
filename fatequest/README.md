# 远行之书 FateQuest · v3.0（PWA M0–M3）

中世纪欧亚旅行开放世界。主路径：角色抽取 → 城市探索 → 雾地图 → 出行 / 五拍占卜 → 停笔结语。

- **第一章** Polo 走廊（威尼斯→刺桐）
- **第二章** 白图泰线（丹吉尔→麦加→卡利卡特）
- v2 占途/命途塔已退出主路径，见 [`archive/v2-pwa/`](archive/v2-pwa/README.md)

## 运行

```bash
cd fatequest
npx serve .
# 勿用 file://（JSON 表需 fetch）
```

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
# 重建 Battuta/图鉴等内容（可选）：
node scripts/build-m2-m3-content.mjs
```

验收：[`docs/V3_MVP_CHECKLIST.md`](docs/V3_MVP_CHECKLIST.md) · [`docs/V3_M2_M3_CHECKLIST.md`](docs/V3_M2_M3_CHECKLIST.md)

## 结构（摘要）

```text
assets/data/     # 系统表 + transports + codex
js/ritual.js effects.js chargen.js city.js travel.js data-loader.js
archive/v2-pwa/  # 旧 journey / tower / map / stories
docs/GDD.md · SYSTEM_TABLES.md · ATLAS_PORT.md
```
