# FateQuest 旧版本归档索引

现行版本是 `fatequest/` 根目录的 **v3.0 Godot 4.7.1** 工程。旧网页实现不再进入
CI、不再部署，也不得作为新功能的修改入口。

为避免重复提交数百 MB 共享美术，仓库只保留一份可直接浏览的网页快照；其余版本
通过 Git 提交与主线合并父节点永久留档。即使以后删除旧分支，下面的提交仍可恢复。

| 版本 | 最终提交 | 主线合并 | 说明 |
|---|---|---|---|
| 初代网页快照 | `dadedd9` | `8b07a11` | 本目录的 [`web-version/`](web-version/README.md)，静态 HTML/JS/PWA |
| 早期《远行之书》网页引擎 | `cabf322` | `a83e117` | 数据驱动旅行与可点击世界地图 |
| FateQuest 2 占卜网页版 | `9f56cdc` | `c73c6cf` | `fatequest2/` 历史树，含命途塔与占法视觉实验 |
| PWA v3 原型 | `997911a` | `666f07c` | 20 城旅行闭环与 M0–M4 原型；已由 Godot v3 取代 |

旧分支中可复用的最终美术、旅行语料和生成工具已经人工迁入 Godot 的 `assets/` 与
`scripts/`；网页运行时代码没有覆盖 Godot 工作树。

## 查看或恢复

查看某版说明：

```bash
git show 997911a:fatequest/README.md
```

在临时目录恢复完整版本（不会切换当前工作树）：

```bash
git worktree add /tmp/fatequest-pwa-v3 997911a
git worktree add /tmp/fatequest2-web 9f56cdc
```

用完后：

```bash
git worktree remove /tmp/fatequest-pwa-v3
git worktree remove /tmp/fatequest2-web
```

## 归档原则

- Godot 的 `content/` 是唯一运行时数据真相源；不得从旧 PWA 数据表反向覆盖。
- `assets/art/_sheets/`、`assets/art/_archive/`、ChatGPT 对话抓图和本地 `.venv`
  属生成缓存，不因分支合并重复迁入。
- 需要复活旧版时，从指定提交另开分支，不直接修改归档目录。
