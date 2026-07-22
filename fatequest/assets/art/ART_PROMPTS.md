# 灵游 2.0 · 全量生图 Prompt 表 · ART_PROMPTS

与 [`ART_BRIEF.md`](./ART_BRIEF.md) 一一对应。把做好的 `.webp` **直接放进本目录**，文件名与引用名完全一致。

## 用法

1. 每张图给 **3 条完整英文 Prompt**（风格已内嵌，可直接复制进 Midjourney / SD / Flux 等）。
2. **Prompt 1** = 最贴 Brief 的 canonical；**Prompt 2** = 光影变体（烛光/暮云）；**Prompt 3** = 纹样/材质变体（金箔、纸纹、边框侧重）。
3. 出图后按 Brief 规格裁切/导出：图标类 **透明底**，全幅类不透明；格式 `.webp` 质量约 90。
4. 红线：不画拟人化神明；妈祖等以灯、香炉、船、月等器物代替。

## 全局风格锚点（已写入每条 Prompt）

**方向：「云岭暮光」——中世纪抄本 × 暮色山野。**

| 项 | 约定 |
|---|---|
| 主色 | 森墨绿 `#0D1411` / 暮云米白 `#F0E4D0` / 陈金 `#BDA476` / 朱批红 `#B3402E`（仅强调）/ 雾蓝 `#7FA3BD` / 云影桃 `#E8B28A`（微量） |
| 文明辅色 | 塔罗茜紫 `#9A6B84` · 周易铜绿 `#55806D` · 卢恩灰蓝 `#7E8B94` · 儒道赭石 `#A8794A` |
| 造型 | 中心构图、单一主体、粗金线描边 + 大块平涂剪影；四周留白 ≥8%；64px 仍可读 |
| 质感 | 羊皮纸 / 矿物颜料 / 金箔斑驳；禁照片感、3D、霓虹、油腻高光 |
| 统一 Negative | photorealistic, 3D render, neon, anime, cluttered, watermark |

---

# 一、P0 · 先做这 13 张

### `card-back-full.webp`

- **用在**：命途塔所有卡背（整面）
- **内容**：罗盘星芒居中 + 云雷纹边框，金线于墨蓝底，隐约二十八宿
- **规格**：512×768，2:3，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Tarot card back, vertical 2:3. Opaque dark ink-blue ground. Center: ornate compass rose fused with starburst rays in antique gold linework. Border of scrolling cloud-thunder (yunlei) patterns in gold. Faint Twenty-Eight Lunar Mansions stars barely visible in the field. Flat manuscript paint, no face, no text. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same card back composition. Emphasize warm dusk candlelight catching gold leaf on compass points; soft mist-blue haze in corners; parchment tooth visible through dark blue wash; rubric crimson tiny dots at four cardinal tips only. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same card back. Heavier decorative emphasis: denser cloud-thunder border, gold-leaf mottling on rays, subtle paper craquelure, constellation dots as tiny punched gold. Keep center compass dominant and margins clear. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-sun.webp`

- **用在**：塔罗符号·太阳
- **内容**：太阳纹章：放射金轮 + 中央面容化为罗盘
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon symbol of The Sun on transparent background. Heraldic radiant gold sun-wheel; face in center abstracted into a small compass rose, not a realistic human face. Thick gold outline, flat fills, centered, large empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Sun symbol. Soft dusk peach rim-light on rays; parchment cream highlights on wheel segments; mist-blue cool shadow under the lower arc; candlelit mineral gold. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Sun symbol. More manuscript ornament: tiny gold-leaf flecks on rays, subtle rubric marks between spokes, paper grain; keep silhouette bold for 64px. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-moon.webp`

- **用在**：塔罗符号·月亮
- **内容**：蚀月 + 下方一线水波，一滴月露
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon The Moon on transparent background. Partial eclipse crescent moon with gold outline; single calm water-wave line beneath; one drop of moon-dew falling. Flat silhouette, centered, generous margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Moon. Emphasize cool mist-blue on shadowed lunar disk, warm parchment cream on lit crescent edge, tiny cloud-peach specular on the dew drop; dusk glow not neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Moon. Add fine parchment grain and gold-leaf speckles on crescent rim; wave as single bold calligraphic stroke; dew drop as clear geometric teardrop. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-star.webp`

- **用在**：塔罗符号·星星
- **内容**：八角星倾泻两道细流入池
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon The Star on transparent background. Eight-pointed star pouring two thin streams of light-water into a small round pool below. Gold contour, flat color blocks, centered, readable at 64px. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Star. Candlelit gold on star points, mist-blue in the pool, parchment cream streams; soft dusk atmosphere, no sparkles overload. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Star. Manuscript detail: gold-leaf on star facets, subtle paper texture, pool edged with thin antique gold ring; keep empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-strength.webp`

- **用在**：塔罗符号·力量
- **内容**：狮首与一只轻按的手，∞ 记号悬顶
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon Strength on transparent background. Stylized lion head in profile or frontal heraldic, one gentle human hand lightly resting on muzzle; infinity ∞ mark floating above. Flat silhouettes, thick gold outlines, no gore, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Strength. Warm dusk gold on mane edges, cool mist-blue in eye hollow as abstract shape (not realistic eye), parchment cream on hand; calm dignity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Strength. More ornamental gold-line mane curls like manuscript beasts; ∞ as clean gold stroke; parchment grain; bold for tiny size. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-wheel.webp`

- **用在**：塔罗符号·命运之轮
- **内容**：轮盘嵌 TARO/ROTA 字环，指针为小剑
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon Wheel of Fortune on transparent background. Circular wheel with letter ring reading TARO and ROTA alternately around the rim; pointer is a small sword. Flat medieval diagram style, gold outlines, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Wheel. Emphasize candlelit gold on rim letters and sword tip, ink-dark spokes, parchment cream panels between spokes; dusk glow. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Wheel. Rich manuscript engraving feel: gold-leaf mottling on rim, subtle paper crackle, clear readable TARO/ROTA letterforms, empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-fool.webp`

- **用在**：塔罗符号·愚者
- **内容**：行囊杖 + 崖边一步 + 小犬剪影
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon The Fool on transparent background. Bundle on a staff, cliff-edge footstep silhouette, small dog silhouette — no detailed face. Flat shapes, gold contours, centered journey motif, generous margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Fool. Warm cloud-peach dusk light on cliff edge, cool mist-blue void beyond cliff, parchment cream on pack; candlelit gold on staff tip. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Fool. Calligraphic silhouette with parchment grain and gold-leaf flecks on staff; dog as tiny bold shape; keep 64px clarity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `arch-tarot.webp`

- **用在**：流派徽记·塔罗行者
- **内容**：水晶球中一张竖牌，紫金配色
- **规格**：512×512，透明底
- **辅色**：茜紫 #9A6B84 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Faction crest Tarot Wanderer on transparent background. Crystal sphere containing one upright tarot card silhouette; mauve-purple #9A6B84 and antique gold #BDA476. Flat manuscript icon, thick gold outline, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Soft candlelight refraction inside sphere as flat color planes (not photoreal glass), dusk mist-blue rim, parchment cream card face blank of text. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Gold-leaf flecks on sphere rim, subtle parchment grain, card frame with tiny rubric corner marks; empty margin ≥8%. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `arch-iching.webp`

- **用在**：流派徽记·易卜师
- **内容**：三枚铜钱叠落 + 一道爻变虚线，青金配色
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Faction crest I Ching Diviner on transparent background. Three stacked Chinese cash coins with square holes; one dashed changing-yao line beside them. Verdigris teal #55806D and antique gold. Flat, centered, gold outlines. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Warm dusk highlight on coin rims, cool mist-blue in square holes, parchment cream on faces; candlelit mineral pigments. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Manuscript coin calligraphy suggestion without readable modern text; gold-leaf mottling; parchment grain; bold 64px silhouette. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `arch-runes.webp`

- **用在**：流派徽记·符文萨满
- **内容**：石上 ᛉ 符文发光，灰蓝金配色
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Faction crest Rune Shaman on transparent background. Rough stone slab carved with Algiz rune ᛉ glowing softly as dusk candlelight, not neon. Grey-blue #7E8B94 and antique gold. Flat silhouette, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Emphasize warm gold carved grooves, cool mist-blue stone body, parchment cream chip highlights; quiet sacred glow. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same crest. Heavy parchment grain and gold-leaf in rune cuts; stone as simple geometric slab; large empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `mode-tower.webp`

- **用在**：主页·命途塔入口
- **内容**：十二层螺旋高塔剪影，塔顶一星
- **规格**：512×512，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Home mode icon Fate Tower on transparent background. Twelve-tier spiral tower silhouette, one star at the apex. Flat ink-and-gold manuscript cutout, centered, bold for 64px, generous margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same tower. Dusk peach light on upper tiers, deep forest-ink lower mass, mist-blue sky void as negative space (transparent), gold outline. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same tower. Decorative gold-line window slits as simple dashes, gold-leaf flecks on star, parchment grain on tower body; keep spiral readable. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `mode-journey.webp`

- **用在**：主页·占途入口
- **内容**：驼队剪影行于一条金线路径上
- **规格**：512×512，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Home mode icon Divination Journey on transparent background. Camel caravan silhouettes walking along a single antique-gold path line. Flat, centered, thick outlines, empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same journey. Warm dusk rim-light on camels, cool mist-blue ground shadow shapes, parchment cream highlights on humps; path as one confident gold stroke. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same journey. Manuscript simplification: 2–3 camels max, gold-leaf flecks on path, parchment grain; ultra-readable at 64px. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `bg-nocturne.webp`

- **用在**：全局底图
- **内容**：极淡星夜墨渍/云气，暗部占 90%，无主体
- **规格**：1920×1080，不透明，≤300KB

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full-bleed subtle nocturne background 16:9 opaque. Extremely faint starry night ink blots and cloud vapor on near-black forest ink #0D1411; dark areas ~90%; no focal subject, no characters, no UI. Soft parchment grain, muted mist blue and cream dust only. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same background. Emphasize soft dusk cloud veils drifting horizontally, tiny near-invisible star pinpricks, warm antique gold dust almost absent; atmospheric, quiet. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same background. More ink-wash cloud texture and paper mottling, still no center subject; keep file-light look: flat washes, minimal contrast, no hard edges. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

# 二、P1 · 符号、旅途与道具

## 2.1 塔罗符号补全

### `sym-tarot-tower.webp`

- **用在**：塔罗·高塔
- **内容**：雷击塔尖、王冠坠落
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon The Tower on transparent background. Spire struck by a single lightning bolt, crown falling off the tip. Flat silhouette, gold outlines, centered, no people, generous margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Tower. Flash as parchment-cream flat bolt (not neon), warm dusk on masonry edges, cool mist-blue void; calm tragic clarity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Tower. Manuscript gold-line masonry, gold-leaf on falling crown, parchment grain; bold 64px read of tower+bolt+crown. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-death.webp`

- **用在**：塔罗·死神
- **内容**：白蝶自敞开的茧/骨扉飞出
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon Death (transformed) on transparent background. White butterfly emerging from an open cocoon or bone-door — rebirth, not gore. Flat shapes, gold contour, centered, respectful tone. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Death motif. Soft candlelit cream on butterfly wings, cool mist-blue in doorway void, antique gold on hinge/outline; dusk quiet. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Death motif. Ornamental manuscript door frame, gold-leaf flecks on wings, parchment grain; keep silhouette simple. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-hermit.webp`

- **用在**：塔罗·隐者
- **内容**：提灯，灯芯是六角星
- **规格**：512×512，透明底
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Game icon The Hermit on transparent background. Handheld lantern whose flame/wick is a six-pointed star. No detailed face — lantern as hero. Flat, gold outlines, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Hermit lantern. Warm candle glow inside as flat cream and gold planes, cool mist-blue outer shell, tiny cloud-peach ember; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Hermit lantern. Gold-leaf on star wick, parchment grain on metal body as flat color, thick contour; 64px clarity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.2 周易八符（青金配色）

### `sym-qian.webp`

- **用在**：周易·乾
- **内容**：六阳爻化天门
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Qian on transparent background. Six solid yang lines transforming into a celestial gate / sky portal. Verdigris #55806D and antique gold, flat manuscript icon, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Qian. Dusk gold on gate lintel, mist-blue beyond the threshold, parchment cream on yang bars; candlelit mineral paint. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Qian. Hexagram geometry clear at 64px; gold-leaf flecks on gate; parchment grain; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-kun.webp`

- **用在**：周易·坤
- **内容**：大地承物
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Kun on transparent background. Earth as a broad supporting vessel or open plain holding a simple offering form. Broken yin-line suggestion abstracted. Verdigris and gold, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Kun. Warm dusk on earth surface, cool mist-blue shadow under vessel, parchment cream highlight; quiet receptive mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Kun. Manuscript earth patterning as simple hatches, gold outline, parchment grain; bold silhouette. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-kan.webp`

- **用在**：周易·坎
- **内容**：重渊漩涡
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Kan on transparent background. Deep double-abyss whirlpool as flat spiral. Verdigris and antique gold, thick gold contour, centered, readable small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Kan. Cool mist-blue in vortex core, warm gold on outer rings, parchment cream foam marks as flat dots; dusk not neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Kan. Calligraphic spiral, gold-leaf in rings, parchment grain; keep single subject and margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-li.webp`

- **用在**：周易·离
- **内容**：双焰明目
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Li on transparent background. Twin flames forming an abstract bright eye / clarity motif — not a realistic eye. Verdigris and gold, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Li. Candlelit cream-gold flames, cool mist-blue outline, parchment highlights; controlled warmth. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Li. Ornamental flame curls like manuscript fire, gold-leaf flecks, parchment grain; 64px clarity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-qian15.webp`

- **用在**：周易·谦
- **内容**：山藏地中
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Qian/Humility (hexagram 15) on transparent background. Mountain silhouette nested low inside earth / buried peak motif. Verdigris and gold, flat, humble centered composition. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Humility. Soft dusk peach on buried summit tip, cool mist-blue earth mass, parchment cream ridge line. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Humility. Simple geometric mountain-in-earth, gold outline, parchment grain; oversized margin for quietness. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-ge.webp`

- **用在**：周易·革
- **内容**：蜕皮兽影
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Ge (Revolution) on transparent background. Animal silhouette shedding a skin outline — transformation, not gore. Verdigris and gold, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Ge. Warm gold on new form edge, cooler mist-blue on shed skin ghost, parchment cream accents; dusk glow. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Ge. Manuscript beast simplification, gold-leaf flecks along shed line, parchment grain; bold 64px. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-jin.webp`

- **用在**：周易·晋
- **内容**：日出于地
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Jin (Progress) on transparent background. Sun rising from earth line — half disk emerging. Verdigris and gold, flat heraldic, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Jin. Warm dusk peach and gold on sun, cool mist-blue sky void, parchment cream earth band; candlelit. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Jin. Radiating gold lines limited and bold, parchment grain, gold-leaf on disk; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-gen.webp`

- **用在**：周易·艮
- **内容**：止山
- **规格**：512×512，透明底
- **辅色**：铜绿 #55806D + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. I Ching symbol Gen (Keeping Still) on transparent background. Single still mountain as stopping/stillness emblem. Verdigris and gold, flat, centered, heavy calm silhouette. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Gen. Cool mist-blue mountain mass, warm gold ridge outline catching dusk, parchment cream snowcap flat shape. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Gen. Monumental simple triangle mountain, gold-leaf flecks on ridge, parchment grain; 64px readable. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.3 卢恩七符（灰蓝金配色）

### `sym-fehu.webp`

- **用在**：卢恩·Fehu
- **内容**：石刻 ᚠ + 牛角意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Fehu on transparent background. Carved stone showing Fehu rune ᚠ with a cattle-horn motif. Grey-blue #7E8B94 and antique gold, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Fehu. Candlelit gold in carved grooves, cool mist-blue stone, parchment cream chips; soft dusk glow not neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Fehu. Heavy parchment grain, gold-leaf in rune cuts, bold horn silhouette; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-algiz.webp`

- **用在**：卢恩·Algiz
- **内容**：石刻 ᛉ + 麋角意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Algiz on transparent background. Stone slab with Algiz ᛉ and elk-antler motif. Grey-blue and gold, flat manuscript, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Algiz. Warm gold antler tips, cool stone body, parchment cream; protective quiet light. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Algiz. Ornamental antler curves simplified, gold-leaf in rune, parchment grain; 64px clear. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-isa.webp`

- **用在**：卢恩·Isa
- **内容**：石刻 ᛁ + 冰柱意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Isa on transparent background. Stone with Isa rune ᛁ and a single icicle motif. Grey-blue and gold, flat, centered, still mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Isa. Mist-blue ice, gold outline, parchment cream highlight on tip; cold dusk not neon cyan. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Isa. Vertical clarity, gold-leaf flecks, parchment grain; generous margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-sowilo.webp`

- **用在**：卢恩·Sowilo
- **内容**：石刻 ᛋ + 日轮意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Sowilo on transparent background. Stone with Sowilo ᛋ and a sun-wheel motif. Grey-blue and antique gold, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Sowilo. Warm dusk gold on sun-wheel, cool stone, parchment cream rays as flat wedges. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Sowilo. Manuscript sun disk, gold-leaf mottling, parchment grain; bold small-size read. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-raidho.webp`

- **用在**：卢恩·Raidho
- **内容**：石刻 ᚱ + 车轮意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Raidho on transparent background. Stone with Raidho ᚱ and a wagon-wheel motif. Grey-blue and gold, flat, centered journey emblem. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Raidho. Candlelit gold on wheel rim, mist-blue stone, parchment cream spokes. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Raidho. Simple wheel geometry, gold-leaf, parchment grain; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-perthro.webp`

- **用在**：卢恩·Perthro
- **内容**：石刻 ᛈ + 骰盅意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Perthro on transparent background. Stone with Perthro ᛈ and a dice-cup / lot-cup motif. Grey-blue and gold, flat, centered mystery emblem. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Perthro. Warm gold on cup rim, cool interior void mist-blue, parchment cream; quiet chance mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Perthro. Manuscript cup shape, gold-leaf flecks, parchment grain; 64px silhouette. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-uruz.webp`

- **用在**：卢恩·Uruz
- **内容**：石刻 ᚢ + 野牛意象
- **规格**：512×512，透明底
- **辅色**：灰蓝 #7E8B94 + 陈金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Rune icon Uruz on transparent background. Stone with Uruz ᚢ and aurochs / wild ox silhouette. Grey-blue and gold, flat, centered strength emblem. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Uruz. Dusk gold on horn ridge, cool stone and body, parchment cream muzzle highlight flat. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Uruz. Heraldic ox simplification, gold-leaf in rune, parchment grain; bold margins. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.4 塔之逆位 · 诅咒卡（紫黑主调）

### `curse-shadow.webp`

- **用在**：诅咒·阴翳
- **内容**：噬光墨团
- **规格**：512×512，透明底
- **辅色**：紫黑 + 茜紫 #9A6B84

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Curse icon Shadow on transparent background. Light-eating ink blot / void mass, purple-black with mauve #9A6B84 edges, antique gold thin contour. Flat, centered, ominous but manuscript-still — no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Shadow. Emphasize soft dusk-eaten edges, mist-blue cool fringe, parchment cream almost absent; candlelit darkness. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Shadow. Irregular ink-wash blob with gold-leaf flecks at rim, parchment grain; keep single blob readable at 64px. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `curse-chain.webp`

- **用在**：诅咒·锁蔽
- **内容**：缠卡锁链
- **规格**：512×512，透明底
- **辅色**：紫黑 + 茜紫

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Curse icon Chain on transparent background. Heavy chains wrapping a blank card silhouette. Purple-black and mauve, gold outlines, flat, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Chain. Cold mist-blue on metal links as flat color, warm gold on a few link edges, dusk gloom. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Chain. Bold chain links for tiny size, gold-leaf mottling, parchment grain; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `curse-leak.webp`

- **用在**：诅咒·漏财
- **内容**：漏底钱袋
- **规格**：512×512，透明底
- **辅色**：紫黑 + 茜紫

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Curse icon Leak on transparent background. Money pouch with a hole, coins dripping as flat shapes. Purple-black mauve gold, centered, no modern currency symbols. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Leak. Warm gold on falling coin disks, cool mist-blue pouch shadow, parchment cream thread; quiet loss mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Leak. Manuscript pouch silhouette, gold-leaf on coins, parchment grain; 64px clear hole+drip. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `curse-dread.webp`

- **用在**：诅咒·惊惶
- **内容**：盘蛇
- **规格**：512×512，透明底
- **辅色**：紫黑 + 茜紫

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Curse icon Dread on transparent background. Coiled serpent silhouette, purple-black mauve, gold contour, flat heraldic, centered — no gore. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Dread. Cool mist-blue scales as flat bands, warm gold eye mark as geometric dot, dusk tension. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same Dread. Calligraphic coil, gold-leaf flecks, parchment grain; bold S-curve for small size. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.5 旅伴半身像（剪影，不画五官细节）

### `comp-tebrizi.webp`

- **用在**：旅伴·星家帖必烈
- **内容**：缠头老者持黄铜星盘，半身剪影
- **规格**：512×640，透明底
- **辅色**：陈金 + 雾蓝

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Companion portrait silhouette on transparent background, 512x640. Elderly turbaned astronomer half-body holding a brass astrolabe; no facial features detail — masklike flat planes. Gold outlines, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same companion. Warm dusk gold on astrolabe rings, cool mist-blue turban folds as flat shapes, parchment cream highlights; dignified candlelight. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same companion. Stronger parchment grain and gold-leaf on instrument; simplify costume into large color blocks; keep silhouette iconic at small size. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `comp-lin.webp`

- **用在**：旅伴·船娘林三娘
- **内容**：斗笠船娘执桨，腰间香符
- **规格**：512×640，透明底
- **辅色**：陈金 + 赭石微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Companion portrait silhouette on transparent background, 512x640. Boatwoman in conical hat holding an oar, incense charm at waist; no facial detail. Flat manuscript half-body, gold outlines, centered, respectful. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same companion. Warm dusk on hat brim, cool mist-blue water suggestion as tiny flat shape near oar tip, parchment cream sash; candlelit. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same companion. Bold hat+oar silhouette, gold-leaf on charm plaque, parchment grain; empty margin ≥8%. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.6 九秘境图标

### `realm-tarot.webp`

- **用在**：秘境·塔罗
- **内容**：一张牌为器物
- **规格**：512×512，透明底
- **辅色**：茜紫 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Tarot on transparent background. Single upright card as object emblem, mauve and gold, flat centered manuscript icon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Candlelit gold card edge, mist-blue face plane, parchment cream; dusk. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Gold-leaf flecks on frame, parchment grain; 64px card rectangle clear. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-iching.webp`

- **用在**：秘境·易经
- **内容**：铜钱为器物
- **规格**：512×512，透明底
- **辅色**：铜绿 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon I Ching on transparent background. One Chinese cash coin emblem, verdigris and gold, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Warm gold rim, cool square-hole mist-blue, parchment cream face. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Manuscript coin, gold-leaf, parchment grain; bold hole. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-bazi.webp`

- **用在**：秘境·八字
- **内容**：罗盘宫格
- **规格**：512×512，透明底
- **辅色**：赭石 #A8794A + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Bazi on transparent background. Compact geomantic compass with palace grid, ochre #A8794A and gold, flat centered, no tiny unreadable text — grid as geometry. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Dusk gold needles, mist-blue outer ring, parchment cream dial. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Simplified grid 3–4 cells max visible, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-western.webp`

- **用在**：秘境·西洋占星
- **内容**：星座环
- **规格**：512×512，透明底
- **辅色**：雾蓝 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Western astrology on transparent background. Zodiac ring emblem, mist-blue and gold, flat centered manuscript circle with simple tick marks not detailed glyphs. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Candlelit gold ticks, cool mist-blue band, parchment cream center void. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Clean ring silhouette, gold-leaf, parchment grain; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-runes.webp`

- **用在**：秘境·卢恩
- **内容**：符袋
- **规格**：512×512，透明底
- **辅色**：灰蓝 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Runes on transparent background. Rune pouch / drawstring bag emblem, grey-blue and gold, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Warm gold drawstring, cool bag body, parchment cream highlight. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Bold bag silhouette, tiny rune mark, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-dream.webp`

- **用在**：秘境·解梦
- **内容**：枕月
- **规格**：512×512，透明底
- **辅色**：雾蓝 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Dream on transparent background. Pillow with a crescent moon resting on it, mist-blue and gold, flat centered gentle emblem. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Soft dusk peach on moon edge, cool pillow shadow, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Simple pillow rectangle + crescent, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-astrodice.webp`

- **用在**：秘境·星辰骰
- **内容**：三骰
- **规格**：512×512，透明底
- **辅色**：雾蓝 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Astrodice on transparent background. Three dice clustered, mist-blue and gold, flat centered; pips as simple dots, no modern branding. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Candlelit gold edges, cool faces, parchment cream pips. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Clear three-cube silhouette, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-jiaobei.webp`

- **用在**：秘境·筊杯
- **内容**：筊杯一对
- **规格**：512×512，透明底
- **辅色**：赭石 + 金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Jiaobei on transparent background. Pair of crescent divination blocks (moon blocks), ochre and gold, flat centered sacred objects. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Warm dusk on wood grain as flat color, cool mist-blue gap between blocks, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Two bold crescents, gold outline, parchment grain; respectful. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `realm-meihua.webp`

- **用在**：秘境·梅花
- **内容**：梅枝
- **规格**：512×512，透明底
- **辅色**：赭石 + 朱批微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Realm icon Meihua on transparent background. Plum blossom branch emblem, ochre and antique gold with tiny rubric crimson on one blossom only, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Cool mist-blue branch, warm gold buds, parchment cream petals. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same realm. Calligraphic branch, few blossoms, gold-leaf, parchment grain; 64px read. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 2.7 占具 / 商货 / 信物（256×256）

### `item-compass.webp`

- **用在**：占具·罗盘
- **内容**：罗盘
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Item icon compass on transparent background 256px. Ornate flat compass, gold and forest-ink, centered manuscript, thick outline, large margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Candlelit gold needle, mist-blue dial, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Gold-leaf flecks, parchment grain; ultra-bold for tiny UI. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-crystal.webp`

- **用在**：占具·水晶球
- **内容**：水晶球
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Item icon crystal ball on transparent background. Flat sphere with simple inner swirl, gold outline, parchment cream and mist-blue, centered — not photoreal glass. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Soft dusk highlight plane, cool shadow plane; candlelit. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Gold-leaf rim, parchment grain; empty margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-beads.webp`

- **用在**：占具·念珠
- **内容**：念珠
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Item icon prayer beads on transparent background. Loop of beads, flat circles, gold and ochre, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Warm dusk on beads, cool gaps, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Few large beads for 64px, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-silk.webp`

- **用在**：商货·绸卷
- **内容**：绸卷
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Trade good silk bolt on transparent background. Rolled cloth cylinder, parchment cream and mauve stripe, gold outline, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Soft dusk fold planes, mist-blue shadow under roll. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Simple cylinder+ribbon, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-spice.webp`

- **用在**：商货·香料袋
- **内容**：香料袋
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Trade good spice pouch on transparent background. Tied sack, ochre and gold, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Warm dusk pouch, cool mist-blue tie shadow, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Bold sack silhouette, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-glass.webp`

- **用在**：商货·琉璃瓶
- **内容**：琉璃瓶
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Trade good glass bottle on transparent background. Flat bottle silhouette with mist-blue fill, gold outline, centered — stained-glass manuscript look not photo glass. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Candlelit cream highlight strip, cool body. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Simple bottle shape, gold-leaf neck, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-lampoil.webp`

- **用在**：信物·灯油瓶
- **内容**：灯油瓶
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Keepsake lamp-oil bottle on transparent background. Small flask, gold and cream, flat centered sacred ordinary object. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Warm oil glow as flat cream oval inside, mist-blue glass plane. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Bold flask, gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-astrolabe.webp`

- **用在**：信物·星盘
- **内容**：星盘
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Keepsake astrolabe on transparent background. Brass rings nested, antique gold and mist-blue, flat centered diagrammatic. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Candlelit gold rings, cool voids, parchment cream. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Simplified rings (2–3), gold-leaf, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-paiza.webp`

- **用在**：信物·金牌
- **内容**：金牌（八思巴文暗示）
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Keepsake paiza tablet on transparent background. Golden plaque with abstract Phags-pa-like mark suggestion (not accurate modern text), antique gold, flat centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Dusk metal sheen as flat planes, mist-blue engraved grooves. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Rectangle plaque bold, gold-leaf mottling, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `item-mazucharm.webp`

- **用在**：信物·香符
- **内容**：香符（器物，不画神像）
- **规格**：256×256，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Keepsake Mazu charm on transparent background. Incense charm plaque / talisman packet with wave and lamp motifs only — no deity figure. Gold and ochre, flat centered, respectful. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Tiny lamp and wave symbols, candlelit gold, mist-blue wash. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same item. Simple packet silhouette, gold-leaf, parchment grain; no person. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

# 三、P2 · 氛围大图与预留槽

## 3.1 地图与区域

### `map-parchment.webp`

- **用在**：占途地图底
- **内容**：羊皮纸肌理 + 四角海图装饰，中央大片留白
- **规格**：1640×840，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Opaque journey map base 1640x840. Aged parchment texture filling the field; ornate portolan-chart corner decorations in antique gold and forest ink; large empty center reserved for UI. Muted, no cities labeled, no characters. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same map. Emphasize warm dusk foxing stains, cool mist-blue faint coast suggestion at edges only, candlelit gold corner flourishes; center stays blank and calm. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same map. Richer paper grain and gold-leaf mottling in four corners, subtle compass rose very faint in one corner only; keep center ≥50% empty. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `region-chr.webp`

- **用在**：文明区·基督教世界横幅
- **内容**：钟楼帆影地平线
- **规格**：1024×400，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Opaque region banner 1024x400. Horizon silhouette of Christian medieval world: bell towers and sail masts along a dusk skyline. Flat manuscript cutouts, forest ink silhouettes, parchment cream and mist-blue sky wash, antique gold thin horizon line. No readable crosses as logos, no people. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Warm cloud-peach dusk sky band, cool mist-blue distance, gold flecks on tower tips; quiet pilgrimage mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Stronger parchment grain sky, simplified 3–5 landmark silhouettes, empty sky for title overlay. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `region-isl.webp`

- **用在**：文明区·伊斯兰世界横幅
- **内容**：宣礼塔驼影
- **规格**：1024×400，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Opaque region banner 1024x400. Horizon of Islamic medieval world: minaret profiles and camel caravan silhouettes. Flat manuscript, forest ink, parchment and mist-blue sky, gold horizon. No calligraphy text, no people faces. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Warm dusk on sand-flat color band, cool minaret edges, gold flecks; serene. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Few bold silhouettes, parchment grain sky, space for title. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `region-con.webp`

- **用在**：文明区·儒教世界横幅
- **内容**：飞檐山影
- **规格**：1024×400，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Opaque region banner 1024x400. Horizon of Confucian East Asian medieval world: flying eaves and mountain silhouettes. Flat manuscript, ochre #A8794A accents with forest ink, parchment sky, gold line. No people. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Dusk peach on eave tips, cool mountain mist-blue, quiet scholar mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Simplified roofs+peaks, parchment grain, empty sky for overlay. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `region-mazu.webp`

- **用在**：文明区·妈祖海域横幅
- **内容**：妈祖灯与浪（器物，不画神像）
- **规格**：1024×400，不透明

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Opaque region banner 1024x400. Mazu sea horizon: signal lamps, waves, and boat silhouettes — no deity figure. Flat manuscript, forest ink waves, gold lamp flames as flat cream-gold, mist-blue sea. Respectful maritime sacred mood. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Warm dusk lamps, cool wave troughs, parchment cream foam lines; candlelit not neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same banner. Bold wave+lamp silhouettes, parchment grain sky, space for title; no anthropomorphic goddess. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 3.2 行进段小队像

### `marker-camel.webp`

- **用在**：小队·驼队
- **内容**：侧视小剪影朝右
- **规格**：128×128，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Tiny party marker on transparent background 128px. Side-view camel silhouette facing right, flat gold outline, forest ink fill, centered, oversized margin. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Tiny dusk peach rim light, mist-blue underbelly flat. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Ultra-simple camel, gold-leaf fleck, parchment grain; readable tiny. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `marker-ship.webp`

- **用在**：小队·海船
- **内容**：侧视小剪影朝右
- **规格**：128×128，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Tiny party marker ship silhouette facing right, transparent 128px, flat manuscript gold outline, ink fill, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Warm gold sail edge, cool hull mist-blue. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Bold hull+sail only, parchment grain. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `marker-boat.webp`

- **用在**：小队·小舟
- **内容**：侧视小剪影朝右
- **规格**：128×128，透明底

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Tiny party marker small boat silhouette facing right, transparent 128px, flat gold outline, ink fill, centered. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Dusk peach on bow, mist-blue waterline. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same marker. Simplest boat shape, parchment grain; clear at tiny size. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 3.3 塔卡整面立绘 `sym-*-full.webp`（24 张）

全幅 **512×768** 不透明。在对应符号意象外，增加：**抄本牌面边框**、**底部名条留白位**（不写字或仅暗示装饰线）、四周云雷/金线框。风格与对应 `sym-*.webp` 一致，文明辅色继承。

### `sym-sun-full.webp`

- **用在**：太阳整面
- **内容**：放射金轮+罗盘面容
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full tarot-like card face 2:3 opaque. Ornate manuscript border with cloud-thunder gold frame and blank nameplate band at bottom. Center: radiant gold sun-wheel with compass-face abstraction. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full tarot-like card face 2:3 opaque. Ornate manuscript border with cloud-thunder gold frame and blank nameplate band at bottom. Center: radiant gold sun-wheel with compass-face abstraction. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full tarot-like card face 2:3 opaque. Ornate manuscript border with cloud-thunder gold frame and blank nameplate band at bottom. Center: radiant gold sun-wheel with compass-face abstraction. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-moon-full.webp`

- **用在**：月亮整面
- **内容**：蚀月+水波+月露
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque with gold manuscript border and blank nameplate. Center: eclipse crescent, wave line, dew drop. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque with gold manuscript border and blank nameplate. Center: eclipse crescent, wave line, dew drop. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque with gold manuscript border and blank nameplate. Center: eclipse crescent, wave line, dew drop. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-star-full.webp`

- **用在**：星星整面
- **内容**：八角星倾流入池
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: eight-pointed star pouring two streams into a pool. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: eight-pointed star pouring two streams into a pool. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: eight-pointed star pouring two streams into a pool. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-strength-full.webp`

- **用在**：力量整面
- **内容**：狮首+手+∞
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lion head, gentle hand, infinity mark above. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lion head, gentle hand, infinity mark above. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lion head, gentle hand, infinity mark above. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-wheel-full.webp`

- **用在**：命运之轮整面
- **内容**：TARO/ROTA 轮+剑针
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: wheel with TARO/ROTA letter ring and sword pointer. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: wheel with TARO/ROTA letter ring and sword pointer. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: wheel with TARO/ROTA letter ring and sword pointer. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-fool-full.webp`

- **用在**：愚者整面
- **内容**：行囊杖+崖步+犬
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: pack-staff, cliff step, small dog silhouette. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: pack-staff, cliff step, small dog silhouette. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: pack-staff, cliff step, small dog silhouette. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-tarot-tower-full.webp`

- **用在**：高塔整面
- **内容**：雷击塔+坠冠
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: tower struck by lightning, falling crown. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: tower struck by lightning, falling crown. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: tower struck by lightning, falling crown. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-death-full.webp`

- **用在**：死神整面
- **内容**：白蝶出茧/骨扉
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: white butterfly from open cocoon or bone-door. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: white butterfly from open cocoon or bone-door. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: white butterfly from open cocoon or bone-door. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-hermit-full.webp`

- **用在**：隐者整面
- **内容**：六角星灯芯提灯
- **规格**：512×768，2:3，不透明
- **辅色**：塔罗茜紫微量

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lantern with six-pointed star wick. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lantern with six-pointed star wick. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: lantern with six-pointed star wick. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-qian-full.webp`

- **用在**：乾整面
- **内容**：六阳爻天门
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Qian — six yang lines as celestial gate; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Qian — six yang lines as celestial gate; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Qian — six yang lines as celestial gate; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-kun-full.webp`

- **用在**：坤整面
- **内容**：大地承物
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kun earth-as-vessel; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kun earth-as-vessel; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kun earth-as-vessel; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-kan-full.webp`

- **用在**：坎整面
- **内容**：重渊漩涡
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kan double-abyss whirlpool; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kan double-abyss whirlpool; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Kan double-abyss whirlpool; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-li-full.webp`

- **用在**：离整面
- **内容**：双焰明目
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Li twin flames as abstract bright eye; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Li twin flames as abstract bright eye; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Li twin flames as abstract bright eye; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-qian15-full.webp`

- **用在**：谦整面
- **内容**：山藏地中
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Humility — mountain nested in earth; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Humility — mountain nested in earth; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Humility — mountain nested in earth; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-ge-full.webp`

- **用在**：革整面
- **内容**：蜕皮兽影
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Ge shedding animal silhouette; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Ge shedding animal silhouette; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Ge shedding animal silhouette; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-jin-full.webp`

- **用在**：晋整面
- **内容**：日出于地
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Jin sun rising from earth; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Jin sun rising from earth; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Jin sun rising from earth; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-gen-full.webp`

- **用在**：艮整面
- **内容**：止山
- **规格**：512×768，2:3，不透明
- **辅色**：铜绿+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Gen still mountain; verdigris and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Gen still mountain; verdigris and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Gen still mountain; verdigris and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-fehu-full.webp`

- **用在**：Fehu整面
- **内容**：ᚠ+牛角
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Fehu rune stone with cattle horns; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Fehu rune stone with cattle horns; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Fehu rune stone with cattle horns; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-algiz-full.webp`

- **用在**：Algiz整面
- **内容**：ᛉ+麋角
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Algiz rune stone with elk antlers; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Algiz rune stone with elk antlers; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Algiz rune stone with elk antlers; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-isa-full.webp`

- **用在**：Isa整面
- **内容**：ᛁ+冰柱
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Isa rune stone with icicle; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Isa rune stone with icicle; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Isa rune stone with icicle; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-sowilo-full.webp`

- **用在**：Sowilo整面
- **内容**：ᛋ+日轮
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Sowilo rune stone with sun-wheel; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Sowilo rune stone with sun-wheel; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Sowilo rune stone with sun-wheel; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-raidho-full.webp`

- **用在**：Raidho整面
- **内容**：ᚱ+车轮
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Raidho rune stone with wagon wheel; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Raidho rune stone with wagon wheel; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Raidho rune stone with wagon wheel; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-perthro-full.webp`

- **用在**：Perthro整面
- **内容**：ᛈ+骰盅
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Perthro rune stone with dice cup; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Perthro rune stone with dice cup; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Perthro rune stone with dice cup; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `sym-uruz-full.webp`

- **用在**：Uruz整面
- **内容**：ᚢ+野牛
- **规格**：512×768，2:3，不透明
- **辅色**：灰蓝+金

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Uruz rune stone with aurochs; grey-blue and gold. Flat illumination, parchment field inside border, centered subject with ≥8% margin inside frame, readable when small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Uruz rune stone with aurochs; grey-blue and gold. Emphasize candlelit dusk gold on border and subject edges, cool mist-blue in recesses, parchment cream field; no neon. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Full card face 2:3 opaque, gold border, blank nameplate. Center: Uruz rune stone with aurochs; grey-blue and gold. Emphasize gold-leaf mottling on frame, paper grain, subtle rubric corner ticks; nameplate stays blank; single clear subject. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

## 3.4 PWA 图标

### `icon-512.png`

- **用在**：PWA 图标 512
- **内容**：金色 ✦ 罗盘于墨蓝圆角底
- **规格**：512×512，不透明（圆角底可画在图内）

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. App icon 512x512. Rounded-square dark ink-blue ground. Center: antique-gold compass rose fused with a four-pointed ✦ star. Flat paint, thick gold lines, generous margin inside rounded square, instantly readable small. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same app icon. Soft dusk candlelight on gold points, mist-blue subtle vignette, parchment cream micro-highlights; no neon glow. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same app icon. Gold-leaf flecks on compass, parchment grain in blue field, simple bold geometry; empty margin inside mask. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---
### `icon.png`

- **用在**：PWA 图标（同构图，可导出较小尺寸）
- **内容**：与 icon-512 同画面
- **规格**：按平台导出

**Prompt 1**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same composition as icon-512.png app icon: rounded dark ink-blue field, gold compass-star ✦ center, flat, bold, high margin — optimized for small size clarity. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 2**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same as icon-512 lighting variant: candlelit gold, mist-blue vignette, parchment micro-highlights. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

**Prompt 3**

```
Cloud-ridge Twilight style: medieval manuscript illumination crossed with dusk mountain wilderness. Muted low-saturation palette sampled from dusk clouds over dark green ridges — forest ink #0D1411, parchment cream #F0E4D0 (highlight #F7EFDC), antique gold #BDA476, rubric crimson #B3402E used only as rare emphasis, mist blue #7FA3BD, cloud-peach #E8B28A as a tiny accent. Centered single subject, thick gold-line contour, large flat color silhouettes, generous empty margin ≥8% on all sides, must remain instantly readable when shrunk to 64px. Texture of aged parchment grain, mineral pigment flatness, subtle gold-leaf flecks; candlelight or dusk glow only — never neon. No photorealism, no 3D render, no glossy AI highlights, no cluttered background, no anthropomorphic deity figures. Same as icon-512 texture variant: gold-leaf flecks, parchment grain, ultra-simple silhouette. Negative: photorealistic, 3D render, CGI, neon glow, anime, cluttered background, busy scene, modern UI, watermark, signature, extra limbs, facial close-up detail unless silhouette, bright saturated colors, purple cyberpunk, chrome metal.
```

---

# 附录 · 出图检查清单

- [ ] 是否一眼能辨认主体（缩到 64px 试）
- [ ] 是否中心构图、留白 ≥8%
- [ ] 是否克制饱和度（灰一档，不要艳）
- [ ] 发光是否仅为烛光/暮光（无霓虹）
- [ ] 图标是否透明底；全幅/卡背/地图/横幅是否不透明
- [ ] 有无拟人神明（妈祖场景应为灯/船/浪/香符）
- [ ] 文件名是否与引用名完全一致（小写连字符 + `.webp`，PWA 除外）
- [ ] `bg-nocturne` 是否暗部约 90% 且无主体、体积尽量 ≤300KB

---

*生成自 ART_BRIEF.md · 风格锁定「云岭暮光」· 每图 3 Prompt*
