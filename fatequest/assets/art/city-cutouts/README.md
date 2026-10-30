# City landmark cutouts

Generated with the built-in imagegen tool on 2026-10-25 for the city/map UI review. These are illustrative venue sprites, not documentary reconstructions. Alpha is preserved; no raster masking or background removal was applied after generation.

| Asset | Binding / use |
|---|---|
| zayton-harbor.png | 刺桐码头 |
| zayton-quarter.png | 番坊街区 |
| zayton-temple.png | 天妃庙 |
| zayton-reader.png | 庙门边的解签老妇 |
| west-gate.png | 西域城门 / 城防地点 |
| west-palace.png | 西域宫廷 / 官署地点 |
| west-garden.png | 大不里士园郊 |

The explicit event-to-art bindings are in `game/screens/city_view.gd`. Do not map images by visible card index: unlocking or completing a story must not change another place's picture or position. Other venues retain their existing authored art and portrait bindings. Whole-city scenes are backgrounds only.
