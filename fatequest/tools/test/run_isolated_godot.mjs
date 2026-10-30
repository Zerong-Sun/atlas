#!/usr/bin/env node
/** Run a Godot test against this checkout with a separate user:// directory. */
import { mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mode = process.argv[2];
const gameRun = mode === "--game";
const guiRun = mode === "--gui";
const script = guiRun ? process.argv[3] : mode;
if ((guiRun && process.argv.length !== 4) || (gameRun && process.argv.length !== 3)
    || (!gameRun && (!script || !/^tests\/[A-Za-z0-9_-]+\.gd$/.test(script)))) {
  console.error("usage: node tools/test/run_isolated_godot.mjs [--gui] tests/<test>.gd | --game");
  process.exit(2);
}

const temp = mkdtempSync(join(tmpdir(), "fatequest-test-"));
const auditName = `${basename(temp)}-FateQuest-UI-Audit`;
try {
  for (const entry of readdirSync(project)) {
    if (entry !== "project.godot") symlinkSync(join(project, entry), join(temp, entry));
  }
  const original = readFileSync(join(project, "project.godot"), "utf8");
  const config = original.replace(/^config\/name="[^"]+"$/m, `config/name="${auditName}"`);
  if (config === original) throw new Error("project.godot has no application name to replace");
  writeFileSync(join(temp, "project.godot"), config);

  const godot = process.env.GODOT_BIN ?? "/Applications/Godot.app/Contents/MacOS/Godot";
  const args = gameRun
    ? ["--path", temp, "--quit-after", "180"]
    : [...(guiRun ? [] : ["--headless"]), "--path", temp, "--script", script];
  const result = spawnSync(godot, args, {
    stdio: "inherit",
    timeout: 180_000,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(temp, { recursive: true, force: true });
  const userDataBase = process.platform === "darwin"
    ? join(homedir(), "Library/Application Support/Godot/app_userdata")
    : process.platform === "win32"
      ? join(process.env.APPDATA ?? join(homedir(), "AppData/Roaming"), "Godot/app_userdata")
      : join(process.env.XDG_DATA_HOME ?? join(homedir(), ".local/share"), "godot/app_userdata");
  rmSync(join(userDataBase, auditName), { recursive: true, force: true });
}
