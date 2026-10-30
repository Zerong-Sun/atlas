#!/usr/bin/env python3
"""Capture and review the spatial-city / local-atlas UI in isolated game data."""
import argparse
import html
import json
import shutil
from pathlib import Path
import capture_audit

PROJECT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT / "build/city-map-audit"


def gallery():
    records = json.loads((OUTPUT / 'after.json').read_text())
    sections = []
    for record in records:
        name = record['screen']
        before_dir = 'before-left-layout' if (OUTPUT / 'before-left-layout' / (name + '.png')).exists() else 'before'
        before = OUTPUT / before_dir / (name + '.png')
        figures = []
        if before.exists():
            figures.append(f'<figure><figcaption>修改前</figcaption><a href="{before_dir}/{name}.png"><img loading="lazy" src="{before_dir}/{name}.png"></a></figure>')
        figures.append(f'<figure><figcaption>当前版本</figcaption><a href="after/{name}.png"><img loading="lazy" src="after/{name}.png"></a></figure>')
        group = 'normal' if name.startswith('normal') else 'compact' if name.startswith('compact') else 'english' if name.startswith('large') else 'dense' if name.startswith('dense') else 'cities'
        sections.append(f'<section data-group="{group}"><h2>{html.escape(name)}</h2><div class="pair">'+''.join(figures)+'</div></section>')
    page = '''<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FateQuest · 城市场景与地图重做</title><style>
*{box-sizing:border-box}body{margin:0;background:#182321;color:#eee6d5;font:16px/1.6 system-ui,sans-serif}header,main{padding:24px 4vw}header{background:#26332e;border-bottom:1px solid #58685d}h1{font-size:28px;margin:0}h2{font-size:17px;font-weight:500}p{max-width:1000px;color:#c6cec5}.pair{display:flex;gap:18px;flex-wrap:wrap}figure{flex:1 1 540px;margin:0;background:#2b3831;padding:10px}figcaption{padding-bottom:8px}img{width:100%;display:block}section{margin-bottom:30px}nav{display:flex;gap:10px;flex-wrap:wrap}button{background:#3a4c40;color:#eee6d5;border:1px solid #8a967a;padding:9px 15px;cursor:pointer}button.active{background:#e4d3ad;color:#26332e}a{color:#e4d3ad}</style>
<header><h1>城市场景与地图 · 第二轮审查</h1><p><a href="../city-life/index.html">最新审查：城市生活、打工借款与卡片样式 →</a></p><p>刺桐的独立码头、街区、庙宇和解签摊位集中在偏左区域，去掉城内道路连线，留出右侧背景建筑；地图保留清晰的本地地理层，默认看所在城市附近，已走旅程带方向箭头。以下为真实 Godot 窗口截图。</p><p>27 张截图 · 中文 / English · 普通 / 大字号 · 1280×720 / 960×640。存读档、往返路线、缩放中间帧和标签点击另有自动回归。</p><nav id="nav"></nav></header><main>SECTIONS</main><script>
const groups={normal:'中文 · 普通',compact:'小窗口 · 大字',english:'English · 大字',dense:'密集城市',cities:'其他城市'};
function select(g){document.querySelectorAll('section').forEach(s=>s.hidden=s.dataset.group!==g);document.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.group===g))}
for(const [g,label] of Object.entries(groups)){const b=document.createElement('button');b.textContent=label;b.dataset.group=g;b.onclick=()=>select(g);document.getElementById('nav').append(b)}select('normal');
</script></html>'''
    (OUTPUT / 'index.html').write_text(page.replace('SECTIONS', ''.join(sections)))
    # Update the first audit's normal-zh-04-city etc. so its currently open page
    # never silently points to the superseded card design.
    for preset in ('normal-zh', 'compact-zh', 'large-en'):
        for source, target in [('city', '04-city'), ('map-nearby', '19-map')]:
            source_path = OUTPUT / 'after' / f'{preset}-{source}.png'
            if source_path.exists():
                shutil.copy2(source_path, PROJECT / 'build/ui-audit/after' / f'{preset}-{target}.png')
    link = PROJECT / 'build/ui-audit/city-map'
    if not link.exists():
        link.symlink_to(OUTPUT, target_is_directory=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--gallery-only', action='store_true')
    parser.add_argument('--godot', default=shutil.which('godot') or '/Applications/Godot.app/Contents/MacOS/Godot')
    args = parser.parse_args()
    (OUTPUT / 'before').mkdir(parents=True, exist_ok=True)
    for preset in ('normal-zh', 'compact-zh', 'large-en'):
        for source, target in [('04-city', 'city'), ('19-map', 'map-nearby')]:
            old = PROJECT / 'build/ui-audit/after' / f'{preset}-{source}.png'
            dest = OUTPUT / 'before' / f'{preset}-{target}.png'
            if old.exists() and not dest.exists():
                shutil.copy2(old, dest)
    if not args.gallery_only:
        capture_audit.OUTPUT = OUTPUT
        capture_audit.capture('after', args.godot, script='audit_city_map')
    gallery()
    print(OUTPUT / 'index.html')

if __name__ == '__main__':
    main()
