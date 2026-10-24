/** Local snapshots: legacy JSON -> version 1, with one last-known-good backup. */
export type Validator<T> = (value: unknown) => value is T;
const VERSION = 1;
const volatile = new Map<string, string>();
const issues = new Map<string, string>();
const readIssueKey = (key: string) => `${key}:read`;
const listeners = new Set<() => void>();
let notice = "";

function report(key: string, message: string) {
  if (message) issues.set(key, message);
  else issues.delete(key);
  const next = [...new Set(issues.values())].join(" ");
  if (next === notice) return;
  notice = next;
  // Reads may happen in a React render; notify after that render has completed.
  queueMicrotask(() => listeners.forEach((listener) => listener()));
}
export const getStorageNotice = () => notice;
export function subscribeStorageNotice(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
export const isString = (value: unknown): value is string => typeof value === "string";
export function arrayOf<T>(validate: Validator<T>): Validator<T[]> {
  return (value): value is T[] => Array.isArray(value) && value.every(validate);
}

function decode<T>(raw: string, validate: Validator<T>): T {
  const parsed: unknown = JSON.parse(raw);
  if (isRecord(parsed) && "version" in parsed) {
    if (parsed.version !== VERSION) throw new Error("unsupported-version");
    if (validate(parsed.data)) return parsed.data;
  } else if (validate(parsed)) return parsed;
  throw new Error("invalid-snapshot");
}

export function readSnapshot<T>(key: string, fallback: T, validate: Validator<T>): T {
  const memory = volatile.get(key);
  if (memory) return decode(memory, validate);
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        const value = decode(raw, validate);
        report(readIssueKey(key), "");
        return value;
      }
      catch (error) {
        if (error instanceof Error && error.message === "unsupported-version") {
          report(readIssueKey(key), "发现较新版本的本地资料，请使用新版应用打开；原资料已保留。");
          return fallback;
        }
      }
    }
    const backup = localStorage.getItem(`${key}:backup`);
    if (backup) {
      try {
        const recovered = decode(backup, validate);
        report(readIssueKey(key), "部分本地资料读取失败，已使用上一份有效记录。");
        return recovered;
      } catch { /* Preserve damaged data for recovery; do not clear storage. */ }
    }
    report(readIssueKey(key), raw !== null ? "部分本地资料无法读取，原资料已保留。" : "");
  } catch {
    report(readIssueKey(key), "本地存储不可用；新记录仅保留在本次会话，关闭页面前请导出需要的报告。");
  }
  return fallback;
}

export function writeSnapshot<T>(key: string, value: T, validate: Validator<T>): boolean {
  if (!validate(value)) throw new Error("无效的本地资料，未写入。");
  const raw = JSON.stringify({ version: VERSION, data: value });
  try {
    const prev = localStorage.getItem(key);
    let previousValid: string | undefined;
    if (prev) {
      const parsed: unknown = (() => { try { return JSON.parse(prev); } catch { return null; } })();
      if (isRecord(parsed) && "version" in parsed && parsed.version !== VERSION) {
        volatile.set(key, raw);
        report(readIssueKey(key), "");
        report(key, "较新版本的本地资料已保留；本次修改仅在会话中，请使用新版应用打开原资料。");
        return false;
      }
      try {
        decode(prev, validate);
        previousValid = prev;
      } catch { /* A corrupt primary never replaces a good backup. */ }
    }
    // A single-key setItem is atomic. Persist the user's latest work before spending
    // quota on a backup. Re-saving identical content must not rotate away the backup.
    if (prev !== raw) localStorage.setItem(key, raw);
    volatile.delete(key);
    report(readIssueKey(key), "");
    if (previousValid && prev !== raw) {
      try { localStorage.setItem(`${key}:backup`, previousValid); report(`${key}:backup`, ""); }
      catch {
        report(`${key}:backup`, "新记录已保存，但本地空间不足或存储受限，无法更新恢复备份。");
        return true;
      }
    }
    report(key, "");
    return true;
  } catch {
    volatile.set(key, raw);
    report(key, "本地保存失败；新记录仅保留在本次会话，关闭页面前请导出需要的报告。");
    return false;
  }
}
