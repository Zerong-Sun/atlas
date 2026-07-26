# ChatGPT 出图脚本（CDP 附着本机 Chrome）

用已打开的调试 Chrome 登录态，把 `ART_PROMPTS.md` 里的 Prompt 提交到 [chatgpt.com](https://chatgpt.com/)，下载生成图并保存为 `assets/art/<引用名>`。

## 一次性准备

```bash
cd fatequest/scripts
python3 -m venv .venv
.venv/bin/pip install -r requirements-art-gen.txt
.venv/bin/playwright install chromium   # 仅 CDP 驱动需要；不启动独立浏览器窗口
```

## 每次出图

1. 启动带调试端口的 Chrome（**已在跑的普通 Chrome 无法中途打开 9222**，需另开调试配置或先 Cmd+Q 再带端口启动）：

```bash
./launch_chrome_debug.sh          # 独立配置目录（推荐；需在该窗口登录一次）
# 或沿用你日常已登录的配置（必须先完全退出 Chrome）：
# USE_DEFAULT_PROFILE=1 ./launch_chrome_debug.sh
```

2. 在弹出的窗口里登录 https://chatgpt.com/（确认能手动生图）。

3. 跑脚本（默认 **P0 + Prompt 1**）：

```bash
.venv/bin/python chatgpt_gen_art.py --dry-run
.venv/bin/python chatgpt_gen_art.py --wait-login --skip-existing --limit 1
.venv/bin/python chatgpt_gen_art.py --skip-existing

# Batch mode (10-up contact sheets from ART_PROMPTS_UI.md):
.venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_UI.md --skip-existing
.venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_CARDS.md --skip-existing

# Full 78-card tarot deck (Mode: separate — 10 individual images per request):
.venv/bin/python gen_tarot_prompts.py
.venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_TAROT_DECK.md --skip-existing --timeout-ms 600000

# Full 64-hexagram I Ching deck (name + lines + scene on each card):
.venv/bin/python gen_iching_prompts.py
.venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_ICHING_DECK.md --skip-existing --timeout-ms 600000
```

## 裁切组图 / 描述目录

生成脚本会把**原始组图**存到 `assets/art/_sheets/`，并按批次定义裁切、命名、写入 EXIF 描述。

若已有组图文件，可单独裁切：

```bash
.venv/bin/python crop_contact_sheet.py --list --prompts-file ART_PROMPTS_CARDS.md
.venv/bin/python crop_contact_sheet.py --prompts-file ART_PROMPTS_UI.md --batch 2 --force
.venv/bin/python crop_contact_sheet.py --all-sheets --prompts-file ART_PROMPTS_UI.md --embed-descriptions
```

生成/更新资源目录（中英文描述 + 规格），并写入 EXIF：

```bash
.venv/bin/python build_art_catalog.py --embed
```

输出：`assets/art/ART_CATALOG.json`（62+ 条目，含 `description_en` / `description_zh`、批次、尺寸）。

常用参数：

| 参数 | 含义 |
|---|---|
| `--section P0\|P1\|P2\|ALL` | 区间，默认 P0 |
| `--prompt-index 1` | 用 Prompt 1/2/3 |
| `--only sym-sun mode-tower` | 只跑指定文件 |
| `--skip-existing` | 已有非空文件则跳过 |
| `--new-chat` | 每张图前新开对话 |
| `--port 9222` | CDP 端口 |
| `--stop-on-error` | 失败即停 |

## 注意

- ChatGPT DOM / 生图入口常变；若提交或等图失败，改 `chatgpt_gen_art.py` 里选择器或先在页面手动点一次「生成图片」模式。
- 需要账号具备生图权限；触限流时脚本会记 FAIL，可稍后 `--skip-existing` 续跑。
- 脚本只 **断开 CDP**，不会退出你的 Chrome。

---

## 与 `art-gen-kit/` 的关系

| 路径 | 用途 |
|---|---|
| **`scripts/`**（本目录） | 仓库 **canonical** 脚本；`orchestrate_req.py` 等为 Godot 主线完整版 |
| **`scripts/art-gen-kit/`** | **可移植 kit**（`kit_paths.py` 自动定位 `assets/art/`）；适合单独拷贝出仓库跑 |

11 个同名文件在两处共存：

- **完全相同**（任一侧改即可同步）：`archive_chat_images.py` · `harvest_chat_images.py` · `resume_dual_decks.py` · `submit_map_windows.py`
- **有差异**（以 **`scripts/` 根目录为准** 维护 Godot 管线）：`orchestrate_req.py` · `postprocess_art.py` · `batch_art_utils.py` 等 — kit 版含便携路径，勿用旧 kit 覆盖根目录

kit 独有：`run_parallel.py` · `setup.sh` · `config.example.env` · `PROMPTS_TEMPLATE.md`

Chat 变体归档输出：`assets/art/_archive/chats/`（见该目录 `README.md`）。
