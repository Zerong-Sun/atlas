# FateQuest 统一视觉规范与出图 Prompt

本文件是新增美术、重绘美术和牌组接入的共同约束。它把既有的“云岭暮光”简报收束成可复用的生成 prompt 和验收表。文件名、角色 ID、城市 ID、牌号和文化背景必须先查 [美术资料库审计](../../docs/library_audit/ART_AUDIT_2026-10-20.md)，不能由出图模型自行猜测。

## 统一方向

FateQuest 的视觉是“中世纪抄本 × 暮色山野”：羊皮纸、矿物颜料、铁胆墨线、蜡印和烛光，服务于一个由城市、道路、见闻和占法串起来的旅行故事。画面克制、低饱和、中心主体明确；缩小到 64 px 仍应能辨认用途。

共用色板：墨绿 `#0D1411`、云米白 `#F0E4D0`、高光 `#F7EFDC`、陈金 `#BDA476`、朱批 `#B3402E`、雾蓝 `#7FA3BD`、云影桃 `#E8B28A`。专属辅色只作为小面积识别：塔罗茜紫 `#9A6B84`、易经铜绿 `#55806D`、卢恩灰蓝 `#7E8B94`、儒道赭石 `#A8794A`。

共用构图：单一主体、中心或略偏左、四周至少 8% 安全边；全幅场景留出对话和 UI 遮挡区；人物半身、面向右侧、面部和道具位于画面上方 85%；牌面保留统一边框和底部空名条。纹理可以有纸纹和细颗粒，不能用照片、3D 渲染、霓虹、玻璃高光或现代摄影景深模拟抄本质感。

文化只通过已确认的建筑、服饰、工具、商品和环境表达。`latin`、`islamic`、`east_asia`、`steppe`、`indian_ocean` 是资料字段，不是脸型或宗教身份的替代词；不能用旅行地或出生地自动借用一张人物图。神明不画成人形，宗教场景使用灯、香炉、船、月、书、门等器物意象，并保留庄重留白。

## 通用出图模板

将下列模板与对应资产表中的主体段合并。每次请求必须使用 `separate`，禁止联系表、九宫格和自动拼图；生成后逐文件落盘并保留原始 prompt、模型、日期和 SHA256。

```text
Create one separate FateQuest game asset: [ASSET_ID / filename].
Subject: [one concrete subject, role, age, gender if authored, setting, props].
Historical brief: [city/event/source record; use only the supplied facts].
Style lock: Cloud-ridge Twilight, 13th-century manuscript illumination,
vellum grain, iron-gall dark contours, flat mineral pigments, restrained
candlelight and dusk, antique gold #BDA476 used as a small accent.
Composition lock: [portrait half-body facing right / centered card / wide
establishing shot], one readable focal subject, at least 8% safe margin,
no important detail in the UI-safe area.
Palette: #0D1411 #F0E4D0 #F7EFDC #BDA476 with [domain accent].
Output: [WIDTH]x[HEIGHT], [transparent or opaque], WebP quality 90,
no text unless the brief explicitly supplies a verified title.
Negative: photorealism, 3D render, anime, neon, glossy AI highlights,
watermark, logo, modern clothing, modern architecture, contact sheet,
multiple unrelated people, cropped face, extra limbs, invented symbols,
anthropomorphic deity.
```

## 三类资产的附加锁

### 人物与肖像

主体段必须写出稳定角色 ID、正文来源、年龄段、性别（若正文有）、职业和至少一个可复用道具。一个角色只绑定一张经过审阅的单人图；多人组图、三条带场景和未拆分图不能进入 `portrait_art_map.json`。无法确认的角色暂时显示场景或文字，不用文化标签随机补脸。新的图片必须先加入审查白名单并通过 `tests/smoke_portrait_mapping.gd`。

```text
Portrait lock: one named person only, half-body, facing right, transparent
background, face and signature prop in the upper 85%, dialog-safe bottom 15%.
Do not infer ethnicity from the job or travel route. Keep the same person,
clothing silhouette and signature prop across every event using [CHARACTER_ID].
```

### 城市、入城和探索场景

主体段必须写城市 ID、时期、路线环境、可观察的建筑、市场商品和一项与事件正文相符的行动。场景图是地点建立镜头，不把匿名人物当成城市身份。全幅画面优先 16:9（1920×1080 或 960×540），场景主体放在中后景，前景留出事件文字区；site 图必须是单一地点，不能把三个地点塞进一张组图。

### 牌面与符号

牌面文件名中的牌号是唯一身份，图中符号、卦名、六爻和正文记录必须从同一 manifest 生成。塔罗使用 78 个 authored ID；易经使用文王序 01–64，程序位掩码先转换为文王序再加载；雷诺曼使用 01–36；占星骰使用 `planet/sign/house` 三组 SVG。缺少某张牌时返回空并显示方法级回退，不能显示相邻牌或用错误牌号冒充。

## 统一 prompt 素材段

### 易经正式牌面 31–64

```text
Create exactly one separate I Ching hexagram card: [NN] [Chinese name] / [English name].
Use the supplied King Wen number, lower trigram, upper trigram, and six lines
exactly; draw lines bottom-up but display them in the established card frame.
Match the finished 01–30 deck: 512x768 opaque vellum card, identical
cloud-thunder border, blank bottom nameplate, copper-green #55806D accents,
clear Chinese title and English subtitle, no invented text. The scene is one
travel-readable metaphor for the supplied hexagram, not a generic landscape.
Negative: wrong trigram, wrong line count, missing title, clipped side note,
PLACEHOLDER, contact sheet, photorealism, deity portrait, watermark.
```

### 塔罗缺失牌面

```text
Create one separate RWS tarot card face: [CARD_ID] [verified card name].
Match the existing Tarot deck exactly: 512x768 opaque, identical ornate
cloud-thunder antique-gold border, parchment field #F0E4D0, blank nameplate,
flat manuscript mineral paint, Tarot mauve #9A6B84 accents. Use one readable
symbolic scene from the supplied brief; no readable title or numerals unless
the template explicitly asks for the verified nameplate.
Negative: modern costume, unrelated culture, duplicated card, extra characters,
photorealism, 3D, neon, watermark, contact sheet.
```

### 命名人物

```text
Create one separate named FateQuest portrait: [CHARACTER_ID], [name],
[city/event/source]. One person only, [authored age/gender], [role],
[signature prop], [verified clothing]. Half-body facing right, transparent
900x1300, dialog-safe bottom 15%, manuscript illumination, iron-gall contour,
mineral flats, candlelight and dusk. Preserve this silhouette and prop in
future images of the same ID. Never infer identity from a culture label.
```

## 接入验收

出图完成不等于接入完成。每项必须同时满足：文件存在且可解码；尺寸、透明度和命名正确；manifest 和代码能解析；牌号/角色/城市 ID 对应正文；缩略图和实际 UI 尺寸可读；无多人残边、占位字样、错文化建筑或未经授权文字；代理视觉记录绑定当前 SHA256；最后由美术和史实/文化审阅者签署。

生成缺口前先检查是否已有同一角色、牌号或地点的旧图。`assets/art/_archive` 和 `_sheets` 只作来源，不得直接复制进运行时。所有新产物都要在 [art_inventory.csv](../../docs/library_audit/art_inventory.csv) 中登记，运行时接线通过后再从 [ART_TODO](ART_TODO.md) 关闭对应条目。
