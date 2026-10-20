#!/usr/bin/env python3
"""Run Godot UI checks with isolated preferences/saves and a wall-clock timeout."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]


def _user_data_base():
    """Godot's platform data root; only fresh child directories are cleaned."""
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support"
    if sys.platform == "win32":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    return Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")


def _text(output):
    # TimeoutExpired may carry bytes even with subprocess.run(text=True).
    if isinstance(output, bytes):
        return output.decode("utf-8", errors="replace")
    return output or ""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scripts", nargs="*", default=["tests/smoke_boot.gd"])
    parser.add_argument("--godot", default=shutil.which("godot") or
                        "/Applications/Godot.app/Contents/MacOS/Godot")
    parser.add_argument("--timeout", type=int, default=90)
    parser.add_argument("--windowed", action="store_true", help="Use a real window for visual checks")
    parser.add_argument("--silent-audio", action="store_true",
                        help="Use Dummy audio if OS audio-device initialization blocks windowed checks")
    args = parser.parse_args()
    failures = []
    data_root = _user_data_base()
    data_root.mkdir(parents=True, exist_ok=True)
    for script in args.scripts:
        with tempfile.TemporaryDirectory(prefix="fatequest-playtest-") as folder, \
                tempfile.TemporaryDirectory(prefix="fatequest-playtest-user-", dir=data_root) as user_folder:
            project = Path(folder)
            # Resources stay in the working tree. Godot resolves the custom
            # name RELATIVE to its OS data root, even when given an absolute
            # string. Reserve a unique directory there, pass only its basename,
            # and clean only this newly-created directory on every exit path.
            for item in ROOT.iterdir():
                if item.name not in ("project.godot", "override.cfg"):
                    (project / item.name).symlink_to(item, target_is_directory=item.is_dir())
            shutil.copyfile(ROOT / "project.godot", project / "project.godot")
            (project / "override.cfg").write_text(
                '[application]\nconfig/use_custom_user_dir=true\n'
                f'config/custom_user_dir_name="{Path(user_folder).name}"\n', encoding="utf-8")
            command = [args.godot] + ([] if args.windowed else ["--headless"]) + [
                "--path", folder, "--script", script]
            if args.silent_audio:
                command.extend(["--audio-driver", "Dummy"])
            try:
                result = subprocess.run(command, capture_output=True, text=True, timeout=args.timeout)
                output = result.stdout + result.stderr
                # UI smoke tests must not report PASS while runtime errors occur.
                failed = result.returncode != 0 or any(
                    marker in output for marker in ("SCRIPT ERROR", "ERROR:", "FAIL"))
            except subprocess.TimeoutExpired as exc:
                output = (_text(exc.stdout) + _text(exc.stderr) +
                          f"\nTIMEOUT after {args.timeout}s while running {script}\n")
                failed = True
            log_dir = ROOT / "build" / "playtest"
            log_dir.mkdir(parents=True, exist_ok=True)
            log = log_dir / (Path(script).stem + ".log")
            log.write_text(output, encoding="utf-8")
            print(f"{'FAIL' if failed else 'PASS'} {script} — {log}", flush=True)
            if failed:
                print(output[-5000:], flush=True)
                failures.append(script)
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
