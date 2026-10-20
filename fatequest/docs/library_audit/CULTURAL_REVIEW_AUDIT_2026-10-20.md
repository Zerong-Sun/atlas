# FateQuest 角色与历史文化审阅队列

核对日期：2026-10-20。本报告建立人物标签数据库和历史文化审阅队列，记录待审证据，不把机器检查或代理视觉检查写成人类史实签署。

## 已建立的证据链

- [PORTRAIT_TAGS.json](../../assets/art/PORTRAIT_TAGS.json) 是人物图片的人工维护标签源，覆盖当前 `portrait_art_map.json` 接受的 23 个图片 stem。每条记录有 `character_id`（stem）、性别、文化背景、年龄段、服饰/道具、来源依据和审阅状态。
- [portrait_review_inventory.csv](portrait_review_inventory.csv) 是当前解析结果，增加运行路径、适用角色/事件、SHA256 和问题码；[portrait_review_database.json](portrait_review_database.json) 保存相同数据的机器可读版本。
- [cultural_review_queue.csv](cultural_review_queue.csv) 是逐项历史文化审阅队列，记录城市、人物、商品、舞种/音乐和宗教/礼仪的具体 i18n key、事件/表格路径、原文摘录、来源状态、风险和审阅空位；来源字段包括 `source_url`、`source_title`、`source_accessed_at` 和 `source_candidate_reason`。
- [historical_source_registry.json](../../tools/art/historical_source_registry.json) 收录 13 个稳定的一手/官方/学术来源入口；它们是候选证据，不是自动通过的史实签署。
- [audit_cultural_review.py](../../tools/art/audit_cultural_review.py) 可在内容或图片修改后重建所有输出，并在图片引用缺标签、标签字段缺失、文件缺失、文件名文化集合冲突或来源候选字段不完整时退出失败。
- [verify_historical_sources.py](../../tools/art/verify_historical_sources.py) 是离线结构核验脚本；[historical_source_verification.json](historical_source_verification.json) 记录来源状态摘要。脚本不把网络可达性或搜索摘要当作事实核验，逐条适配仍由专家完成。

## 当前规模

| 范围 | 数量 | 当前状态 |
| --- | ---: | --- |
| 运行时接受的人物图片 stem | 23 | 全部有标签、文件存在、SHA256 已记录；均为代理视觉检查后待人类文化签署 |
| 角色记录 | 54 | 全部进入人物队列；缺性别/年龄的记录继续保持未知，不从肖像推断 |
| 城市入口 | 103 | 全部进入城市队列；已有本地 lore ref 的记录保留书名/章节并标记 `已附来源` |
| 商品 | 61 | 全部进入商品产地、工艺和年代核对队列 |
| 舞种/音乐 | 60 | 从双语文本中逐键抽取，待核对名称、地域和时代 |
| 宗教/礼仪 | 307 | 从双语文本中逐键抽取，待核对场所、参与者、仪式和叙述语气 |
| 队列总行数 | 585 | 原先 367 行 `source_needed` 已拆成 333 行带稳定候选 URL、34 行明确是游戏机制/连接性演绎而无外部来源；所有候选仍标为待专家 |

来源状态不是审阅结论：

- `已附来源`：城市行已有本地书名/章节锚点；这只表示可回查入口仍需逐句核对。
- `待专家`：333 个文本行已附来源候选 URL，另有 115 条原创人物/商品记录需要内容编辑决定是否补历史依据。
- `明确无来源`：34 个占卜结果、练习或 UI/机制文案明确标为游戏演绎，不伪造历史引用。

本轮脚本输出为：`source_requested_rows=367`、`candidate_rows_with_url=333`、`explicit_no_external_source_rows=34`、`source_validation_errors=0`。来源 URL 的可访问性和逐条主张匹配没有用网络探测代替专家复核。

## 机器门禁

`tests/smoke_portrait_mapping.gd` 现在验证 330 项：

- 每个白名单图片都有完整标签、文件和当前 SHA256。
- 文件名集合与标签文化一致；职位和场所映射不能引用另一个文化集合的图片。
- 已绑定事件的图片标签存在；若事件有性别约束，图片标签必须一致。
- 54 条随从记录逐条经过运行时解析；能解析到图片时，图片文化必须等于出生文化，明确性别必须一致；没有适用图片时安全返回空。
- 既有未知事件、跨 slot、女性角色和旅行身份稳定性回归仍保留。

门禁的“通过”只说明绑定和标签没有互相矛盾，不能证明人物服饰符合具体史料，也不能证明文字中的城市、商品或礼仪事实正确。新图必须先进入 `PORTRAIT_TAGS.json`，再加入 mapping；没有标签的图片在审阅前不得接入。

## 人工审阅顺序

1. 先审当前路线会显示的城市入口和欢迎/市场/宗教事件；核对时期、政权、城市名、建筑、商品、礼仪与玩家可执行动作。
2. 再审命名人物和随从的姓名、性别、年龄段、出生文化、语言、职业、服饰和道具；年龄未知就保持未知，不能从脸部补写。
3. 再审舞种/音乐和宗教/礼仪文本；用具体来源或明确的“游戏演绎”标签替换笼统的异域化描写。
4. 审阅者填写 `reviewer`、`reviewed_at`、`source_status` 和结论；发现问题时新增 `rewrite` 或 `redraw` 记录，不能只把 `queued` 改成 `reviewed`。

## 已知高风险队列

- `npc-zayton-mentor` 明确是年长女性，当前没有通过审查的对应单人图；保留空 portrait，禁止从 male diviner 或 jiaobei 组图回退。
- 草原、东亚、印度洋随从目前大量没有专属肖像；禁止因旅途或岗位从伊斯兰/拉丁集合借图。
- `mentor-tarot`、多人导师和三条带场景继续隔离，直到拆图并绑定具体角色。
- 文本中出现的 `masjid`、`mandir`、教堂、佛寺、天妃宫、敖包、婚礼、丧礼和朝觐叙述都只是队列证据；有本地书章锚点也仍需文化编辑审阅。
- 具体候选来源按关键词选择，记录在 CSV 的 `source_candidate_reason`；例如天妃/妈祖使用 UNESCO Mazu 页面，敖包使用 UNESCO 蒙古圣地条目，清真寺使用大都会艺术博物馆伊斯兰艺术论文，佛寺焚香使用 Smithsonian 亚洲艺术馆，祆教圣火使用 Encyclopaedia Iranica。候选来源不能直接证明同一行的地点、年代或玩家动作。

本报告不关闭原有美术缺口，也不把 585 条队列写成完成。队列数据随源文件变化后必须重新生成，并以当前 hash、具体来源和审阅签署为准。
