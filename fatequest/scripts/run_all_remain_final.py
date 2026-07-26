#!/usr/bin/env python3
"""Run remaining REMAIN + EXPLORE windows sequentially; postprocess after each."""

from __future__ import annotations
import subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV = str(ROOT / '.venv' / 'bin' / 'python')
ART = ROOT.parent / 'assets' / 'art'

FILES = [
    ('ART_PROMPTS_REQ_REMAIN.md', ['VenueHeal','VenueScribe'], ['npc-healer-*.webp','npc-scribe-*.webp']),
    ('ART_PROMPTS_REQ_EXPLORE.md', ['Temple','Market','Inn'], ['explore-temple-*.webp','explore-market-*.webp','explore-inn-*.webp']),
]

def dry(prompts_file: str) -> int:
    r = subprocess.run([VENV,'orchestrate_req.py','--prompts-file',prompts_file,'--dry-run','--skip-existing'],
                       cwd=ROOT, capture_output=True, text=True)
    out = (r.stdout or '') + (r.stderr or '')
    print(out, flush=True)
    if 'Queue: 0 windows' in out or 'Nothing pending' in out:
        return 0
    n = 1
    for line in out.splitlines():
        if 'files' in line and '~' in line:
            try: n += int(line.split('~')[-1].split()[0])
            except: pass
    return n

def run_one(prompts_file, window):
    return subprocess.run([
        VENV, 'orchestrate_req.py', '--prompts-file', prompts_file,
        '--window-order', window, '--max-windows', '1', '--poll-sec', '600',
        '--skip-existing', '--wait-login-ms', '600000', '--rate-limit-ms', '600000',
    ], cwd=ROOT).returncode

def postprocess():
    subprocess.run([VENV, 'postprocess_art.py'], cwd=ROOT)

def main():
    for pf, win_order, globs in FILES:
        while True:
            left = dry(pf)
            if left <= 0: break
            pending = [w for w in win_order if any(ART.glob(g)) is False or True]
            window = None
            r = subprocess.run([VENV,'orchestrate_req.py','--prompts-file',pf,'--dry-run','--skip-existing'],
                               cwd=ROOT, capture_output=True, text=True)
            for w in win_order:
                if f'  {w}:' in (r.stdout or ''):
                    window = w; break
            if not window: break
            print(f'\n=== {pf} → {window} ===', flush=True)
            code = run_one(pf, window)
            print(f'window {window} exit={code}', flush=True)
            # postprocess relevant globs for this window if applicable
            subprocess.run([VENV, 'postprocess_art.py'], cwd=ROOT)
    # final audit for both
    for _, _, globs in FILES:
        if any(ART.glob(g) for g in globs):
            subprocess.run([VENV, 'postprocess_art.py'], cwd=ROOT)
    print('\nALL REMAIN + EXPLORE DONE', flush=True)

if __name__ == '__main__':
    raise SystemExit(main())
