# 小游戏统一美术替换清单

范围：24 个占卜小游戏，以及它们共用的导师、操作器具、背景、桌布、纸张和花边。需求先登记，再生成、接入、实机验证。全部可见插画改用本次统一系列；旧资源不作为缺图后备。

## 发现的问题

| 类别 | 旧实现的问题 | 替换要求 |
|---|---|---|
| 塔罗花色 | 宝剑、木杖是代码线条；杯是咖啡杯；钱币是中国铜钱 | 圣杯、宝剑、带叶木杖、欧洲星纹金币四张同批插画 |
| 雷诺曼 | 船、钥匙、信封是线条；树借用了五行令牌 | 船、钥匙、封蜡信件、树四张同批插画 |
| 神谕牌 | 月、灯、门为简笔画，种子复用树叶 | 月亮、油灯、石门、种荚完整插画 |
| 星骰 | 日月、水星、金星为几何线条 | 四个雕刻金属／天体饰物，保留辨识形状 |
| 路线 | 山是三角形、路标是空心方框、旅人借用数字牌 | 山石、路标、门、旅人棋子完整插画 |
| 记忆 | 木牌上覆代码符文；梦境用文字代图形 | 四块真实雕刻符文木牌；梦境使用船、月、门、鸟插画 |
| 五行 | 金、水借用铜钱与水碗，材质不成套 | 木火土金水五枚同形、同尺度、同材质系列令牌 |
| 起卦 | 铜钱／筊杯正反面图片完全相同；爻为线段 | 正反铜钱、平凸筊杯、阴阳爻板 |
| 其他器具 | 旧图集密度、裁切和透视不一致 | 统一重新生成沙盘、星盘、地图、手面图、杯、水镜、签筒、算筹、卡背 |
| 导师 | 旧木刻、双人裁片和新水彩肖像混用 | 九张同景别、同背景、同光线的新导师肖像 |
| 场景 | 老地图背景与新人物层次不同 | 中国、庭院、欧洲、南亚、北方、观星台六张同系列背景 |
| 界面 | 旧桌布、旧花饰、程序折线角饰混用 | 新桌布与完整生成纸张花边；移除程序装饰花纹 |

## 本次交付资源

- 3 张 4×4 图集，共 48 个器具／图案／令牌裁片；全部来自生成图像。
- 9 张导师肖像：周先生、林先生、阿锦婆婆、萨赫勒、米拉、比约恩、纳迪尔、贝阿特丽切、塞尔玛。
- 6 张场景：中国书斋、庭院书室、欧洲工坊、南亚露台、北方木屋、观星台。
- 2 张共用界面材质：深青桌布、浅色古籍纸张花框。
- 共 20 个生成文件；提示词、落盘位置和逐件状态见 `LESSON_ART_UNIFIED_MANIFEST.json`。

统一规范：细密棕墨线、水彩层次、哑光木／纸／铜材质、暖色左上光、低饱和青绿与朱红点缀。器具图案使用成组绘制；界面显示时等比缩放，字体与动态规则信息保持清晰。动态路径、刻度、选择轮廓、计时条属于游戏状态信息，继续由引擎精准绘制；它们不再承担任何物体插画。

## 验收条件

1. 每张新图人工检查主体、风格、边界、无串格；不合格重生成。
2. 24 个关卡引用统一资源库，器具、按钮和正反面一致；无旧图或代码物体图标回退。
3. 所有 24 个关卡实际截图检查，包含正常状态和翻牌／已投掷状态。
4. 中英文通关、桌面输入、剧情导师、减少动态效果、高对比回归通过。
5. 图集符号可辨、匹配牌不泄露背面答案，旧图片存在不会影响本次关卡。

## 完成与验收记录（2026-10-25）

- [x] 上表 12 类替换需求全部完成。20 张图片均重新生成、接入并检查，项目文件与生成原图 SHA-256 全部一致。
- [x] 48 个道具裁片逐件检查。使用完整透明连通主体边界，修正了按等分格裁切时邻行碎片混入的问题。
- [x] 移除旧图回退、物体折线图标、程序符文刻痕和旧导师裁片。同类工具在桌面与按钮中使用同一资源映射。
- [x] 实机修复：花框九宫格显示，避免角花覆盖标题；桌布使用中央区域，避免装饰压住读数；高对比保持深色字配浅色纸。
- [x] 保存 39 张关卡截图：24 个开场、3 个投掷后、3 个完成后、2 个盖牌、2 个翻牌、4 个遮住参照、1 个高对比。另有 3 张共 48 器具的检查页。
- [x] 8 个专项测试脚本全部通过：24 关 × 中英文通关，失败／重试／提示／离开，导师互动和减少动态效果，贴图完整性，3 个剧情导师入口、完整旅程及研习馆。
- [x] FateQuest 与 CI 的差异空白检查通过；过期翻译检查为 4250 current / 0 stale / 0 missing。

全局内容校验另有 **G7 地名术语不一致**，涉及城市与图鉴译文（例如大不里士、刺桐、巴达哈伤等）。本轮未改这些文案；小游戏内容规则 G32/G33 通过。完整输出在 `build/playtest/unified-content.log`，不把该项计为全项目通过。

### 逐关验收

| 关卡 | 实机图片 | 中英文通关 |
|---|---|---|
| 星骰配图 · astrodice | [已检查](../build/playtest/unified/astrodice.png) | 通过 |
| 五行连环 · bazi | [已检查](../build/playtest/unified/bazi.png) | 通过 |
| 五行交织 · bazi-relationship | [已检查](../build/playtest/unified/bazi-relationship.png) | 通过 |
| 杯壁寻影 · coffee | [已检查](../build/playtest/unified/coffee.png) | 通过 |
| 梦境拾片 · dream | [已检查](../build/playtest/unified/dream.png) | 通过 |
| 山水择路 · fengshui | [已检查](../build/playtest/unified/fengshui.png) | 通过 |
| 沙盘织图 · geomancy | [已检查](../build/playtest/unified/geomancy.png) | 通过 |
| 铜钱成卦 · iching | [已检查](../build/playtest/unified/iching.png) | 通过 |
| 月牙落地 · jiaobei | [已检查](../build/playtest/unified/jiaobei.png) | 通过 |
| 小牌叙事局 · lenormand | [已检查](../build/playtest/unified/lenormand.png) | 通过 |
| 动爻工坊 · liuyao | [已检查](../build/playtest/unified/liuyao.png) | 通过 |
| 签筒稳手 · lot | [已检查](../build/playtest/unified/lot.png) | 通过 |
| 梅窗取数 · meihua | [已检查](../build/playtest/unified/meihua.png) | 通过 |
| 数石配平 · numerology | [已检查](../build/playtest/unified/numerology.png) | 通过 |
| 意象拼章 · oracle | [已检查](../build/playtest/unified/oracle.png) | 通过 |
| 掌纹拓片 · palmistry | [已检查](../build/playtest/unified/palmistry.png) | 通过 |
| 门盘寻径 · qimen | [已检查](../build/playtest/unified/qimen.png) | 通过 |
| 刻木记忆 · runes | [已检查](../build/playtest/unified/runes.png) | 通过 |
| 水镜留痕 · scrying | [已检查](../build/playtest/unified/scrying.png) | 通过 |
| 四花色牌局 · tarot | [已检查](../build/playtest/unified/tarot.png) | 通过 |
| 星图校准 · vedic | [已检查](../build/playtest/unified/vedic.png) | 通过 |
| 黄道星轮 · western | [已检查](../build/playtest/unified/western.png) | 通过 |
| 面谱修复 · xiangmian | [已检查](../build/playtest/unified/xiangmian.png) | 通过 |
| 十二宫巡星 · ziwei | [已检查](../build/playtest/unified/ziwei.png) | 通过 |

### 可复现验证

```sh
FATEQUEST_CAPTURE_ART=1 python3 tools/validate/playtest_local.py --windowed --silent-audio tests/smoke_lesson_art.gd
FATEQUEST_CAPTURE_CHALLENGES=1 python3 tools/validate/playtest_local.py --windowed --silent-audio --timeout 180 tests/smoke_divination_challenges.gd
python3 tools/validate/playtest_local.py --silent-audio --timeout 180 tests/smoke_divination_challenges.gd tests/smoke_lesson_presentation.gd tests/smoke_lesson_art.gd tests/smoke_zayton_mentor.gd tests/smoke_baldacum_mentor.gd tests/smoke_tauris_mentor.gd tests/smoke_fatequest_flow.gd tests/smoke_divination_annex.gd
```

提示词、生成源文件、尺寸与哈希见 [统一素材清单](LESSON_ART_UNIFIED_MANIFEST.json)。测试日志在 `build/playtest/`，窗口截图日志为 `build/playtest/unified/capture.log`。
