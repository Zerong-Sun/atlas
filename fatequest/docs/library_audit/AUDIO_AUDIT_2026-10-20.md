# FateQuest 音频资料库审计

日期：2026-10-20。审计范围为 `assets/audio/`、`game/audio/`、`tools/audio/`、音频接线调用、`default_bus_layout.tres` 与 `docs/AUDIO_PLAN.md`。结论：**资产数量完整，存在接线缺口、场景错配和循环边界风险；A1–A8 不能视为全部验收完成。** 本轮没有生成或修改音频，没有修改生产代码，也没有实际听审。

逐项清单见 [audio_inventory.csv](audio_inventory.csv)。清单包含 37 个 OGG 和 11 类运行时 SFX 生成器；别名合并到同一生成器行。每个 OGG 均记录 SHA-256、大小、时长、采样率、声道、解码峰值/RMS、端点差值、生成器、接线与审核状态。

## 文件与技术检查

| 检查 | 结果 | 边界 |
|---|---|---|
| 成品数量 | 37 OGG：20 stem、12 普通 ambient、5 sacred_blur | 预期文件均存在，未发现清单内缺失成品 |
| 成品体积 | 9,740,026 字节，约 9.74 MB / 9.29 MiB | 原计划20条stem的17 MB估算错误；96 kbps×1200秒约14.4 MB，实际为Vorbis可变码率 |
| 编码 | 全部 Vorbis、44,100 Hz、单声道 | OGG页与Vorbis identification header独立读取；再经libsndfile完整解码 |
| 时长 | 20 stem各60秒；5 sacred_blur各24秒；12环境床12–20秒 | 时长符合现有生成器参数 |
| 静音/满刻度 | 没有整段全零；所有单文件解码样本均小于满刻度 | 不是最终多轨混音的削波、响度或安全听感验收 |
| 峰值 | 最大 −1.197 dBFS，`stems/steppe/pulse.ogg` | 仅sample peak，未做true peak/LUFS |
| RMS | 各文件 −39.770 至 −8.308 dBFS | 稀疏装饰与持续层不能仅按此数值判质量 |
| 循环端点 | 16文件首尾样本差绝对值大于0.1满刻度 | 用于排查，不是人耳听见爆音的结论；不能继续无条件宣称“无缝” |

循环端点优先复核：`steppe/drone`差0.911844、`east_asia/drone`差0.642861、`latin/pulse`差0.600859；分别约为内部相邻差值RMS的85.88、63.70、127.83倍。`generate_all.py`、`generate_melody_color.py`、`compose_loops.py` 的 `make_seamless()` 将同一段混合结果同时写入开头和结尾，并不保证文件末样本与首样本相接连续。需要检查实际循环窗口与淡接算法，再做循环听审。

检测使用临时 Python `soundfile` 0.13.1 / libsndfile 1.2.2 与 numpy，解码为float64；`peak_dbfs=20log10(max(abs(x)))`、`rms_dbfs=20log10(sqrt(mean(x²)))`、`loop_edge_delta=abs(x[0]-x[-1])`。没有调用CoreAudio播放。此前CoreAudio阻塞意味着真实设备播放仍待独立验证；headless主动禁用文件播放，单元测试或图形窗口能启动均不能证明音乐已被听审。

## 真实接线与内容覆盖

1. **场景切换没有完整接入。** `main.gd` 的 `set_place(city,event)` 调用仅在 `_arrive()`。站点剧情 `_show_event()` 只播放翻页SFX，不向导演传入新event，因此宫廷、圣所、番坊的场景映射即使写在 `SceneDensity` 中，也不能据此宣称对应站点实际换声景。番坊50/50混合函数存在，但通常的番坊站点路径没有调用它。
2. **五文化文件齐全，默认内容只覆盖四文化。** 当前103城：islamic34、east_asia27、steppe23、indian_ocean19、latin0。未找到序章主动选择latin音乐的调用；4个latin stem及latin sacred_blur应标为“文件存在、默认内容未触发”。未知文化默认回退east_asia，需要新内容校验。
3. **海鸟未接线。** `seabirds.ogg`存在，但不在任何 `SceneDensity.ambients()` 返回值中。MANIFEST所称horse_hooves/rain/river未映射已经过时，这三者实际已接入。
4. **声景未区分路线方式与天气。** `set_travel(route)`一律使用wind_sand、camel_bells、horse_hooves，海路也会落入该组合；所有port一律waves、ropes_mast、river、rain，没有河港/海港与晴雨条件区分。
5. **color惊叹层并不会在多数场景加入。** `_apply_mix()`将场景gain乘情绪gain；town/port/wild/inn/journey的color基值为0，wonder设为1仍得到0。当前只有court/shrine可有非零color。
6. **四个ambient槽可能挤掉sacred_blur。** port/wild已有4条环境床，reverence再追加第五条sacred_blur时，播放器循环只读取前四条。代码注释说会替换最后一条，实际没有替换。
7. **“混响”目前只调音量。** `SceneDensity.reverb()`仅用于ambient衰减；总线只有Music低通，没有混响效果。文档中的长混响/空间声不能记为已实现。
8. **连续性有待审计。** `_apply_ambients()`每次创建新stream并赋给播放器，相同环境也可能重新开始；`_seek_stems()`对当前播放的stem重定位，新进入的文化从0播放。固定city/day RNG不等于任何进入历史下都得到同一听觉片段。构建生成器使用Python `hash()`作seed，未固定`PYTHONHASHSEED`，跨进程复现也不保证。
9. **程序SFX部分接线。** 找到page、coin、click、wood、tick调用；未找到bell/chime、gong、qing/磬、muyu/木鱼、dice、shake/lot调用。占卜课程序列没有接入骰子或签筒SFX。单个AudioStreamPlayer会替换上一音效；`dice`/`shake`将多个片段从同一采样位置叠加，并非连续敲击序列。这是实现事实，听感需另审。
10. **设置只有静音UI。** Master音量API存在，但没有找到可调音量控件或静音/音量持久化；AudioDirector默认非静音、−6 dB。A1只能记为部分完成。

## 生成方式 文化与来源证据

20个stem和5个sacred_blur均为程序合成，不能标为真实传统乐器或仪式田野录音。“hybrid”指合成声部/纹理组合，检查的`generate_melody_color.py`没有读取外部器乐录音。它们目前是可运行的合成候选素材，尚无作曲/地区顾问/敏感读者听审记录；本审计不将“合成”自动等同于低质量。

| 文化 | 生成器设定 | 待核验 |
|---|---|---|
| islamic | 78 BPM；12平均律Hijaz色彩音阶；pluck_flute/flute_bell | 不能泛称准确maqam/Bayati；覆盖多地域是否合适 |
| east_asia | 58 BPM；五声音阶；稀疏拨弦/笛/钟模拟 | 城市与礼俗区分、器乐近似是否成立 |
| steppe | 66 BPM；五声音阶；弓弦与泛音模拟 | 马头琴/泛音人声联想是否准确、避免单一标签 |
| indian_ocean | 88 BPM；持续音/拨弦模拟 | 印度洋跨地域共享一套声床的代表性 |
| latin | 66 BPM；Dorian色彩；平行声部/钟管模拟 | 默认内容未触发；时期与世俗/礼仪边界 |

12条CC0原始缓存及`tools/audio/_cc0_cache/SOURCES.json`本机存在，记录ID、下载URL、时间和字节数；缓存被gitignore排除。持久文档 `assets/audio/CC0_SOURCES.md` 保留12条来源，其中rain/fire/waves/river链接仍是搜索页，不是对应录音的稳定详情页。没有逐文件原始hash、处理参数/版本、输出hash的完整构建链，也没有逐条授权页面快照；“CC0已记录”不等于“所有成品来源链已证明”。

2026-10-20只对下列两条官方详情页做了在线核查，不泛化为12条全部复核：

- [0585 Bells of Santa Claus #1](https://bigsoundbank.com/bells-of-santa-claus-s0585.html)：明确标CC0，描述为圣诞老人驯鹿铃、录音环境为studio。因此`camel_bells`是替代音色，不是骆驼铃实录；需要在素材清单保留这个事实。
- [2728 Outdoor Market #1](https://bigsoundbank.com/outdoor-market-1-s2728.html)：明确标CC0，地点为法国Nogent-le-Rotrou。低通不能自动证明无可辨识法语或现代声源，需要对最终18秒循环单独听审。

sacred_blur为合成共振峰/音色轮廓，未发现使用经文或礼拜录音的代码；这不能替代对其联想、语义不可辨识与圣所语境的敏感读者审阅。当前MANIFEST的“无可辨识人声”和所有“无缝循环”应视为待验目标。

## A1 至 A8 验收复核

| 需求 | 实现状态 | 仍未完成的验收 |
|---|---|---|
| A1 总线与设置 | 3个子总线、Master静音、音量API已实现 | 音量UI、设置持久化、真实设备静音与恢复 |
| A2 程序音效 | 11类生成器、5类调用 | 其余6类接线；占卜/圣所触发；并发与重复操作听审 |
| A3 单层drone | 5文化文件和播放器存在 | 真实设备持续播放、循环边界听审 |
| A4 场景密度 | 7类配置含journey | 站点切换接线、实际混响、天气/路线方式区分 |
| A5 五文化与跨淡入 | 20文件、20播放器、10秒Tween | latin实际入口、番坊站点接线、混合连续性与音乐审阅 |
| A6 情绪 | 推导、低通、音高/音量/增益调制已实现 | color零乘数、sacred槽溢出、结果后切换连续性与听审 |
| A7 CC0环境床 | 12文件、11名称有静态映射 | 海鸟接线、环境错配、全部授权/来源链、不可辨识语音听审 |
| A8 melody/color | 10条合成候选文件存在 | 构建seed稳定性；“不再单薄”属听觉评价，未验收 |

## 建议执行清单

- **优先修接线**：在事件/站点切换时更新声景；按陆路/海路、港口类型与天气选环境；决定海鸟和未用SFX的明确触发点；为latin确定实际使用范围。
- **优先复核循环**：处理上述端点异常；每条循环至少连续听3遍，再测试多轨叠加与10秒跨文化过渡，不凭峰值替代听审。
- **修调度与混音**：color开启规则、sacred槽占位、同环境重启、固定city/day语义、SFX重叠/序列；决定是否实现真正混响。
- **补来源与复现**：将12条稳定详情页、下载时间、原始hash、许可证据、生成参数/seed和输出hash写入可版本化清单；固定合成seed；保留Santa铃和法国市集的替代来源标签。
- **完成音频设置**：独立音量控件、持久化；验证重新启动与静音恢复。
- **最后做听审签署**：逐文件及场景组合记录审听人、设备、日期、结论；重点审查sacred_blur与跨文化泛化。当前清单所有条目均为`not_performed`，没有音质或文化适配通过结论。
