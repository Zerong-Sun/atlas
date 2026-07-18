# 灵游 FateQuest

**环游诸文明的占卜奇旅 · A playful voyage through the world's divination traditions.**

Atlas（诸象）的游戏化姊妹作：同样的多文明占卜内核，做成轻盈、有仪式感、可收集的游戏体验。
The gamified sibling of Atlas (诸象): the same multi-civilization divination core, reimagined as a light, ritual-rich, collectible game.

## 玩法 Gameplay

- **占途 · 千载行纪 FateRoad Chronicles** — 手绘风历史地图上重走真实古路。首章「马可·波罗东行」:威尼斯→泉州,穿越基督/新月/儒道/妈祖四大文化区,每个节点以**当地文明的占法**开门(圣殿骑士的塔罗关文、波斯商队的观星择日、殿前起卦、天妃宫掷筊…),章末断案「沉波之珠」三占法集线索、三结局评分。灵感与地理叙事底座来自 [HiSMap](https://github.com/Zerong-Sun/histravelmap)。
  Walk Marco Polo's real route on a stylized map; each land opens with its own tradition's ritual, ending in a multi-ending case file. Geographic-narrative concept from HiSMap.
- **9 个可玩秘境 9 playable realms** — 塔罗 Tarot · 周易 I-Ching · 八字 BaZi · 星座 Zodiac · 卢恩 Runes · 占梦 Dreams · 星辰骰 Astro Dice · 筊杯 Moon Blocks · 梅花心易 Plum Blossom（紫微 / 奇门 / 雷诺曼为待开启占位 placeholder realms）
- **每日一签 Daily Lot** — 签到摇签，连签有加成 streak bonus
- **灵光与称号 XP & titles** — 7 阶成长：见习星旅人 → 万象大师
- **万象图鉴 Codex** — 22 塔罗 + 64 卦 + 24 卢恩，仪式中邂逅即点亮
- **成就 Achievements** · 双语 中文/EN · 离线可玩 offline-ready

## 运行 Run

```bash
# 任意静态服务器即可 any static server works
npx serve .        # or: python3 -m http.server
# open http://localhost:3000
```

直接双击 `index.html` 也能玩（PWA 安装与离线缓存需 http(s)）。
Double-clicking `index.html` also works (PWA install/offline needs http(s)).

**手机安装 Install on phone:** 浏览器打开后「添加到主屏幕」即可全屏运行。
Open in a mobile browser → "Add to Home Screen" → runs fullscreen like a native app.
要上架商店可用 [Capacitor](https://capacitorjs.com) 原样打包此目录。
For app stores, wrap this folder as-is with Capacitor.

## 结构 Structure

```text
fatequest/
├── index.html            # 应用外壳 app shell
├── manifest.webmanifest  # PWA 清单
├── sw.js                 # 离线缓存 service worker
├── assets/               # 图标与美术占位 icons & art placeholders
├── css/style.css         # 主题 + 全部仪式动画 theme + ritual animations
└── js/
    ├── i18n.js           # 双语文案 bilingual copy
    ├── data-*.js         # 塔罗/64卦/卢恩/杂项 数据（可独立扩充）
    ├── engines.js        # 确定性引擎：八字、纳甲、梅花、星座…
    ├── state.js          # XP · 连签 · 图鉴 · 成就（localStorage）
    ├── fx.js             # 星空背景 + 粒子 celebration FX
    └── app.js            # 界面与仪式交互 screens & rituals
```

## 扩展 Extend

- **新占法 new method:** 在 `data-misc.js` 的 `FQ.METHODS` 注册 → `i18n.js` 加文案 → `app.js` 加一个 screen + action。锁定占位只需 `playable:false`。
- **换美术 art swap:** 见 `assets/PLACEHOLDERS.md`，当前视觉全部由 CSS/emoji/SVG 生成，可逐张替换为插画。

## 说明 Notes

- 八字为简化排盘（节气取常年近似日）；日柱以 1949-10-01 甲子日锚定，经测试校验。
  BaZi uses simplified solar terms; day pillar anchored to the verified 甲子 day 1949-10-01.
- 仅供娱乐与文明探索，不构成任何现实建议。
  For entertainment & cultural exploration only — not real-life advice.
