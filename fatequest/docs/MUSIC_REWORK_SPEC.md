# FateQuest 音乐重编规格（2026-10）

此文记录上一版方案，已由 [五区域新谱面](REGIONAL_MUSIC_SCORE.md) 替代；下表所述旧录音片段不再是当前运行时曲目。

## 目标与诊断

音乐要让玩家先听见一条可记住的旋律，再听见当地乐器的演奏方式。旧版把固定拍速的鼓、口弦或弹拨装饰叠在现成演奏上，却没有对齐自由速度和乐句；中原还混用了不同来源和码率的弦乐采样，印度洋把无损西塔与 MP3 坦布拉叠在一起。这样会产生互相抢拍、尾音堆叠和音质不一致。修订时让不同录音分曲呈现，再处理电平和频谱。

## 五组规格

| 地域 | 主奏和乐句 | 次声部 | 调式／节奏 | A/B 区别 |
| --- | --- | --- | --- | --- |
| 中原 | 琵琶与古筝分别领奏完整的 8 小节短句，句尾停顿 | 同一 cue 只用一份录音；低码率古琴源暂不参与 | G 宫五声；城镇、行路与静处有不同的节奏密度 | 两套不同旋律，A/B 交换琵琶与古筝 |
| 伊斯兰文化圈 | 原录音中的乌德琴按 Saba 调式自然装饰与停顿 | 只保留原演奏自身的打击乐 | 遵从演奏的实际速度；不硬套均匀鼓循环 | 同一演奏选不同、不重叠的段落；标为录音变奏，不声称全新作品 |
| 草原 | 托布秀尔／东布拉录音的弹拨舞曲 | 不叠错拍的框鼓和非蒙古口弦 | 以原 Oirat 舞曲的短句和拨弦律动为准 | 同一演奏选不同段落；**不称为马头琴** |
| 印度洋 | 无损西塔琴短句，A/B 使用不同旋律轮廓，音符自然衰减 | 城镇／行旅仅有稀疏的无损塔布拉鼓点；MP3 坦布拉源暂不参与 | 现有音阶仅作游戏配乐用的北印度色彩，不冒称完整 raga 表演 | A 偏呼应，B 偏上行展开；每个场景句法不同 |
| 拉丁欧洲 | 中提琴合奏与风琴原录音里的复调舞曲 | 不在未知和声上叠竖琴或竖笛音 | 保留原曲跳跃的舞曲句法 | 同一演奏选不同段落；原作 1578 年，属于后期文艺复兴而非游戏时代的严格复原 |

## 编排与制作约束

- 素材审核：古琴原件约 82 kbps、坦布拉源为 MP3，均已撤出运行时；古筝约 162 kbps 的预览源只用于单独的古筝 cue，不与琵琶录音叠合。琵琶与三组完整演奏也来自有损 Ogg/WebM；导出为高码率 Ogg 不会恢复源头丢失的细节。
- 每时刻只保留一个前景主奏。不同品质的录音分曲呈现；伴奏只在低密度段进入。
- 切掉不符合原演奏拍速与音高的叠加层。不同地域不共用固定鼓模板。
- 低频清理以实际录音的轰鸣为准；削减多余的低频能量，不把弦乐主体削薄。
- 用固定响度目标与峰值余量检查 30 个循环文件；保留原演奏动态，不逐个用峰值归一化追齐听感。
- A/B 自动轮换至少播放两个循环再切换，减少场景内频繁换曲。
- 开场曲独立于地域音乐，保留原先 40 秒版本。每个地域提供一首完整试听，不制作交错的短截合集。
- 素材来源、演奏者和许可证以 `assets/audio/THIRD_PARTY_CREDITS.md` 及各 `PERFORMANCES.json` 为准。

## 参考方法

- `mc-melody`、`mc-development`：动机、乐句、变奏、停顿与收束。
- `mc-orchestration`、`mc-texture-layering`、`mc-arrangement-arch`：确定前景、次声部的时间与音区；减少遮蔽。
- `music-compose`、`music-evaluate`：先固定可检验的编曲决策，再分别检查作曲、编排与技术音频质量。
- MaqamWorld 的 [maqam 与 taqsim](https://www.maqamworld.com/en/maqam.php)、[即兴乐句](https://oud.maqamworld.com/en/form/improv.php)；Darbar 的[北印度器乐结构](https://darbar.org/performance-format-for-hindustani-instrumental-music-alap-jor-and-jhalla/)；UNESCO 的[马头琴演奏方式](https://ich.unesco.org/en/RL/traditional-music-of-the-morin-khuur-00068)；Smithsonian Folkways 的[蒙古乐器资料](https://folkways-media.si.edu/docs/folkways/artwork/UNES08207.pdf)；The Met 的[文艺复兴器乐概述](https://www.metmuseum.org/pt/essays/music-in-the-renaissance)。这些是编排参考，不是对本游戏曲目的历史真实性认证。
