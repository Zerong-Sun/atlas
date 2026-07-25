# 远行之书 FateQuest · v3.0（PWA M0–M1）

中世纪欧亚旅行开放世界。当前主路径基于 [`docs/GDD.md`](docs/GDD.md) §16 **Polo 走廊**：角色抽取 → 城市探索 → 雾地图解锁 → 出行 → 停笔结语。

v2「占途抽签环 / 命途塔」已退出主路径，归档于 [`archive/v2-pwa/`](archive/v2-pwa/README.md)。

## 运行

```bash
cd fatequest
npx serve .
# 打开提示的 http://localhost:… （勿用 file://，JSON 表需 fetch）
```

验收清单：[`docs/V3_MVP_CHECKLIST.md`](docs/V3_MVP_CHECKLIST.md)

```bash
node scripts/validate-tables.mjs
node scripts/test-v3-effects.mjs
```

## 结构（摘要）

```text
assets/data/     # 八张系统表 + transports
js/data-loader.js effects.js chargen.js city.js travel.js
archive/v2-pwa/  # 旧 journey / tower / outcomes
docs/GDD.md · SYSTEM_TABLES.md · REQ_ANALYSIS.md
```

美术缺口见 `assets/art/ART_TODO.md` / `docs/ART_REQUIREMENTS.md`（M0–M1 用已有图 + emoji 回退）。
