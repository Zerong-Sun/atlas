#!/usr/bin/env python3
"""Capture real Godot UI in a separate project/user-data directory; build a gallery."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

PROJECT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT / "build/ui-audit"


def gallery():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    for phase in ("after", "extras"):
        for screenshot in sorted((OUTPUT / phase).glob("*.png")):
            before = OUTPUT / "before" / screenshot.name
            records.append({"name": screenshot.stem, "after": f"{phase}/{screenshot.name}",
                            "before": f"before/{screenshot.name}" if before.exists() else "",
                            "group": "extras" if phase == "extras" else "compact-zh" if screenshot.stem.startswith("compact") else "large-en" if screenshot.stem.startswith("large") else "normal-zh"})
    page = '''<!doctype html><html lang="zh"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FateQuest 界面审查 · 前后对比</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#181d20;color:#eee6d6;font:16px/1.65 system-ui,sans-serif}
header{padding:32px 4vw;background:#222b2e;border-bottom:1px solid #52605c}h1{margin:0;font-size:28px}
p{color:#c4c8bf;max-width:850px}main{padding:24px 4vw}nav{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
button{background:#303c3d;border:1px solid #60716c;color:#fff;padding:10px 16px;border-radius:6px;cursor:pointer}
button[aria-pressed=true]{background:#dfcfa8;color:#1d2527}section{margin:0 0 36px}h2{font-size:18px;font-weight:500}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}.single{grid-template-columns:1fr}
figure{margin:0;background:#242d30;padding:10px;border-radius:8px}figcaption{padding:0 2px 8px;color:#c7cabc}
img{display:block;width:100%;height:auto}a{color:#dfcfa8}small{color:#aab4af}
@media(max-width:800px){.pair{grid-template-columns:1fr}}
</style><header><h1>FateQuest · 界面审查与修复</h1>
<p>真实 Godot 渲染截图。先审查，再修改，再以相同场景复拍。点击图片查看原图；补充截图包含 24 种练习、不同城市、空行囊及高对比模式。</p>
<small>2026-10-25 · 中文 / English · 1280×720 / 960×640 · 普通 / 大字号</small>
<nav id="filters"></nav></header><main id="gallery"></main>
<script>
const records=RECORDS;
const names={'normal-zh':'中文 · 普通字号','large-en':'English · 大字号','compact-zh':'960×640 · 大字号','extras':'补充界面 / 24 种练习'};
const labels={'01':'开局','02':'年代选择','03':'角色选择','04':'城市','05':'购买商品','06':'购买反馈','07':'货载 / 出售','08':'故事','09':'故事末尾','10':'书籍','11':'图鉴','12':'贴纸','13':'行囊','14':'同行','15':'设置','16':'存档','17':'练习目录','18':'练习','19':'地图','20':'城市详情','21':'出发确认','22':'停笔预览','23':'雇佣合约','24':'旅途过渡','25':'故事结果'};
function show(group){document.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.group===group));
document.getElementById('gallery').replaceChildren();
for(const r of records.filter(x=>x.group===group)){const s=document.createElement('section');
const title=document.createElement('h2');const number=r.name.match(/(?:^|-)(\d{2})-/);title.textContent=(number?labels[number[1]]+' · ':'')+r.name;s.append(title);
const pair=document.createElement('div');pair.className=r.before?'pair':'pair single';
for(const [url,label] of [[r.before,'修改前'],[r.after,r.before?'修改后':'补充验证']]){if(!url)continue;
const f=document.createElement('figure'),c=document.createElement('figcaption'),a=document.createElement('a'),i=document.createElement('img');
c.textContent=label;i.src=url;i.alt=r.name+' '+label;i.loading='lazy';a.href=url;a.target='_blank';a.append(i);f.append(c,a);pair.append(f)}
s.append(pair);document.getElementById('gallery').append(s)}}
for(const [key,label] of Object.entries(names)){const b=document.createElement('button');b.textContent=label;b.dataset.group=key;b.onclick=()=>show(key);document.getElementById('filters').append(b)}show('normal-zh');
</script></html>'''
    (OUTPUT / "index.html").write_text(page.replace("RECORDS", json.dumps(records, ensure_ascii=False)), encoding="utf-8")


def capture(phase, godot, script=None):
    # Linking content keeps all local work; the copied project redirects user://.
    with tempfile.TemporaryDirectory(prefix="fatequest-ui-") as folder:
        project = Path(folder)
        for child in PROJECT.iterdir():
            if child.name not in ("project.godot", "build"):
                (project / child.name).symlink_to(child, target_is_directory=child.is_dir())
        config = (PROJECT / "project.godot").read_text()
        config = config.replace("[application]", '[application]\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name="FateQuest-UI-Audit"')
        (project / "project.godot").write_text(config)
        if not (project / ".godot").exists():
            subprocess.run([godot, "--headless", "--path", folder, "--import"], check=True, timeout=180)
        script = script or ("audit_ui_extra" if phase == "extras" else "audit_ui_screens")
        env = dict(os.environ, FATEQUEST_AUDIT_OUTPUT=str(OUTPUT))
        OUTPUT.mkdir(parents=True, exist_ok=True)
        log_path = OUTPUT / f"{phase}.log"
        with log_path.open("w") as log:
            result = subprocess.run([godot, "--path", folder, "--audio-driver", "Dummy", "--resolution", "1280x720", "--script",
                                     f"res://tests/{script}.gd", "--", phase], env=env,
                                    stdout=log, stderr=subprocess.STDOUT, text=True, timeout=240)
        output = log_path.read_text()
        if result.returncode or "SCRIPT ERROR" in output:
            raise RuntimeError(f"Capture failed: {OUTPUT / (phase + '.log')}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase", choices=["before", "after", "extras", "gallery"], default="after")
    parser.add_argument("--godot", default=shutil.which("godot") or "/Applications/Godot.app/Contents/MacOS/Godot")
    args = parser.parse_args()
    if args.phase != "gallery":
        capture(args.phase, args.godot)
    gallery()
    print(OUTPUT / "index.html")
