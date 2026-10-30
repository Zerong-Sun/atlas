#!/usr/bin/env python3
"""Review city livelihoods and the distinct card surfaces in isolated game data."""
import argparse
import html
import json
import shutil
from pathlib import Path
import capture_audit

PROJECT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT / 'build/city-life-audit'

def gallery():
    rows = json.loads((OUTPUT / 'after.json').read_text())
    sections = []
    for row in rows:
        name = row['screen']
        sections.append(f'<section><h2>{html.escape(name)}</h2><a href="after/{name}.png"><img loading="lazy" src="after/{name}.png"></a></section>')
    page = '''<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FateQuest · 在城市里生活</title><style>
body{margin:0;background:#26332e;color:#eee4cd;font:16px/1.6 system-ui}header,main{padding:24px 5vw}header{border-bottom:1px solid #8a7248}h1{margin:0}h2{font-size:18px}img{max-width:100%;display:block}section{margin-bottom:36px}a{color:#eee4cd}
</style><header><h1>在城市里生活 · 实机审阅</h1><p>零盘缠可打工，按角色背景选择手艺；可洗衣一年，也可借款、还款、安家或结束远行。删除城市定位标记，阅读提示只出现一次，新城用独立标签，卡片采用纸纹与分类边饰。</p><p>截图来自隔离审查存档，涵盖普通字号、中文小窗口及英文大字号。</p></header><main>SECTIONS</main></html>'''
    (OUTPUT / 'index.html').write_text(page.replace('SECTIONS', ''.join(sections)))
    # Refresh already-open galleries, so their city shots do not show the removed marker.
    for preset in ['normal-zh', 'compact-zh', 'large-en']:
        src = OUTPUT / 'after' / f'{preset}-city.png'
        for dst in [PROJECT / 'build/ui-audit/after' / f'{preset}-04-city.png', PROJECT / 'build/city-map-audit/after' / f'{preset}-city.png']:
            if dst.parent.exists(): shutil.copy2(src, dst)
    link = PROJECT / 'build/ui-audit/city-life'
    if not link.exists(): link.symlink_to(OUTPUT, target_is_directory=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--gallery-only', action='store_true')
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if not args.gallery_only:
        capture_audit.OUTPUT = OUTPUT
        capture_audit.capture('after', '/Applications/Godot.app/Contents/MacOS/Godot', script='audit_city_life')
    gallery()
    print(OUTPUT / 'index.html')

if __name__ == '__main__': main()
