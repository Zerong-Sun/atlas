# 五区域音乐重写谱面与音色原则

> 当前状态：中原、西亚、草原的专属音乐已按用户听审要求撤下并删除，游戏中统一使用 `assets/audio/intro/title_theme.wav`。下表这三行仅作废弃方案记录；印度洋和拉丁区域仍使用各自的 A/B 曲目。

下表记录曾为五组区域写的原创短句，不宣称是传统曲目的原样演奏。印度洋与拉丁两组仍在运行时使用八小节 A/B 旋律和城镇、道路、安静场景的编配；前三组已经撤下。开场 40 秒录音的内容未重写，现也供前三组游戏场景共用。

| 区域 | 旋律音列与落点 | 8 小节结构 | 声音与节奏 |
| --- | --- | --- | --- |
| 中原 | G 宫五声 G–A–B–D–E，句末回 G；不以西方三和弦填满 | A 曲以 G–B–D–B–A 为记忆点，B 曲以 D–E–D–B 为记忆点；两曲都在第 5 小节抬高、第 8 小节回 G | CC0 古筝拨弦领奏；长音用弱起的往返轻拨模拟摇指，第 4 小节末用三音刮奏引向第二乐句。保留原采样余音，让相邻拨弦重叠。旧琵琶短样底噪明显，继续停用。 |
| 伊斯兰区域 | D Hijaz 骨架 D–E♭–F♯–G，上方用 A–B♭–C–D；反复由 G 回 D | A 曲反复 D–E♭–F♯–G，B 曲反复 G–F♯–E♭–D；第 5 小节上行，第 8 小节回 D | 乌德拨片下拨、上拨交替表现长音，回拨比主音轻；避免从过低的源音强行升调造成又短又脆的声音。同源的少量节奏回答只在非安静版出现。按 maqam 惯用乐句设计，不把“音阶相同”说成完整的 maqam 演奏。 |
| 草原 | D–F–G–A–C 无半音五声，以 D/A 四五度为支点；音级与中原的 G 宫不同 | A 曲反复长 D–A–G 的呼唤，B 曲反复 A–G–F 的下行回答；第 8 小节回 D | 图布秀尔用轻重交替的扫拨接续长音，第 1 和第 5 小节开头轻带另一根弦；保留少量低音回答，不铺持续重鼓。这里使用的是图布秀尔，不标成马头琴。 |
| 印度洋 | C Bhairav 音级 C–D♭–E–F–G–A♭–B；关键回旋 E–F–D♭–C | 前半反复短动机，5–6 小节强调 A♭ 与 G，尾句由 D♭ 回 C；B 曲改从 G 开篇 | 实录西塔琴音符与较轻的 tabla；四拍分组借用游戏背景音乐结构，称 Bhairav 启发的短曲，不冒称正统 raga 即兴。 |
| 拉丁欧洲 | D Dorian：D–E–F–G–A–B–C，B 音区别于自然小调 | A 曲反复 D–F–G–F–D 的跳进舞步，B 曲反复 F–E–D–C 的下行；第 5 小节高点，第 8 小节回 D | 竖笛领奏，拨弦诗琴在空隙回答，道路版有少量手鼓；不把现代调式表直接等同于历史曲式。 |

混音目标：旋律声部在最前，伴奏只在少数小节的空隙回答；无持续低频床、无将长录音切成大段伪装为新旋律。中原使用 CC0 古筝有损预览但不与无损乐器混叠；印度洋用 FLAC 西塔琴、拉丁用 WAV 竖笛与诗琴；西亚及草原的独立音符来自有损视频转出的 PCM，因此其源音质仍受原视频限制。成品输出为 44.1 kHz 立体声 Ogg Vorbis q8；源素材逐件列在 `assets/audio/THIRD_PARTY_CREDITS.md`。

中原、伊斯兰区域、草原的 18 个分区曲目及旧分轨现已删除。下表所记的轻拨和刮奏是已撤下版本的游戏化奏法近似，不再出现在当前游戏音乐中。

研究依据：[Smithsonian 五声音阶](https://asia.si.edu/wp-content/uploads/2023/06/resound-large-print-labels.pdf)、[Maqam World 的 Hijaz](https://maqamworld.com/en/maqam/hijaz.php)、[Smithsonian Folkways 草原音乐](https://folkways.si.edu/hooves-on-steppes-morin-huur-mongolia/throat-singing/music/tools-for-teaching/smithsonian)、[Darbar 的 Bhairav](https://darbar.org/raga/bhairav/)、[Open Music Theory 调式](https://openmusictheory.github.io/scales2.html)。

奏法参考：[Apple 古筝摇指与刮奏说明](https://support.apple.com/guide/garageband-iphone/play-the-guzheng-chsb600670af/ios)、[奥地利科学院图布秀尔演奏视频资料](https://www.oeaw.ac.at/vlach/collections/oirat-kalmyk/xinjiang-oirat/video-collection/tovshuur-music)。
