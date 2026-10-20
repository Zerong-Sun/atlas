# FateQuest 人物与场景对应审计

人物图现在依据明确事件绑定或角色档案选择。选项顺序、翻译标题和当前城市不会改变一个角色的脸。尚未核对的图片不再冒充人物，城市探索会显示场景与文字入口，剧情页省略空肖像。

## 已修复的问题

| 原问题 | 现在的行为 |
| --- | --- |
| 普通遗迹、见闻没有匹配词就显示商贩 | 无明确人物绑定时返回空肖像 |
| 可见选项增减导致 slot 改变，同一事件换职业 | 人像完全不读取 slot |
| ID 含 mentor 就当占卜师，实际角色可能是向导 | 随从读取角色档案的 roles，事件读取明确映射 |
| 随从走到其他文化城市可能换装换脸 | 随从读取出生地 origin.culture，不读取当前城市 |
| 女性角色借用默认男性或双人图 | gender 必须与审查记录匹配，否则不显示人像 |
| 草原统一借伊斯兰、印度洋统一借妈祖图 | 这两个地区没有已核对角色素材时不显示人像；地图建筑图标的旧映射不受此次人物修正影响 |
| 城市背景直接取 site 第一张 | 城市背景改用稳定的城市建立镜头，不再取按序号猜测的场景 |
| 未知城市区域默认欧洲画面 | 未知地域没有默认欧洲场景 |

亚历山大欢迎线已核对：城门文本中的角色是搬运工，现有搬运工素材包含双人和服饰标注混乱，因此该页不显示人物。饭食页使用已查看的执壶主人插图，与原文招待饭食的角色相符；它是角色示意图，不是历史人物肖像。

## 素材证据与缺口

已逐图检查三个联系表，共检查 85 个文件条目（包含重复核对项）。联系表仅用于审阅，未改写任何源素材。

- `build/playtest/portrait-audit-contact-sheet.png`：欢迎线相关人物、场景与随从。
- `build/playtest/portrait-cultures-contact-sheet.png`：同职业在四套素材之间的比较。
- `build/playtest/retainer-audit-contact-sheet.png`：随从、导师与补充职业素材。

具体缺口：

- `npc-job-guide-con` 与 `npc-job-guide-chr` 画面相同；`npc-job-guide-mazu` 与 Islamic guide 画面相同，不能仅凭后缀判断文化。
- `npc-job-diviner-con`、`npc-official-con`、`mentor-iching`、`mentor-jiaobei`、`mentor-astrodice`、`mentor-tarot` 等仍含多个并列人物，不能直接当作单人头像。
- `retainer-porter-chr`、`retainer-porter-isl`、`retainer-guard-chr` 含多个形象；`retainer-monk-isl` 需要重新核对文化与角色。
- `site-balc-1` 含三个横向场景条带；部分地区场景同样是未拆开的素材集合。
- 刺桐导师档案明确为老妇，现有被调用的通用占卜师图不满足年龄、性别和单人要求。
- 草原、印度洋角色缺少经过核对的单人职业素材。不能把地区、宗教与服饰直接等同。
- 目前可用的职业图仍会被多个同职业角色共享；这是职业示意，不是唯一角色形象。命名角色的最终美术应有稳定 characterId 和专属单人图。

这些缺口已通过不显示错误人像消除误导；补齐专属人物图、拆开素材和逐城市美术审阅仍是内容制作工作。

## 后续接入规则

审查清单在 `game/map/portrait_art_map.json`，图片加载与角色解析在 `game/map/map_art.gd`。

1. 新图片先核对：只有一个人物、无被裁断的肢体、职业道具与正文一致，人物身份和性别与档案一致。
2. 将核对通过的文件 stem 加入 portraits，并填写 gender 和 review。文件名不是身份依据。
3. 通过 events 的事件 ID 或 characters 的角色 ID 绑定肖像。剧情记录也可显式填写 `art.portrait` 或 `portrait`，但必须引用已审查的图片。
4. 绑定 `characterId` 或 `retainerId` 时沿用该角色档案；场景可用 `art.scene` 或 `scene.art`，不会根据标题猜测地点。
5. 未提供有效绑定时保留文字与场景卡，不从同一屏其他人物借脸。以后更换图片只改集中映射，不改剧情选项顺序。

## 验证

执行 `python3 tools/validate/playtest_local.py tests/smoke_portrait_mapping.gd`，18 个断言通过。覆盖未知事件、重排稳定性、欢迎线、女性角色、缺失素材、角色职业、旅行时身份保持、文化误标、未拆拼图、场景稳定性和未知地域回退。
