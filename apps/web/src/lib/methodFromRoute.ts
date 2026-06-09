import { getMethod } from "@/data/divinationMethods";

/** Resolve active divination method id from the current route pathname. */
export function methodIdFromPathname(pathname: string): string | null {
  if (pathname === "/dream") return "dream";
  const match = pathname.match(/^\/methods\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
  if (id === "methods") return null;
  return getMethod(id) ? id : id;
}

export function isMethodCopilotRoute(pathname: string): boolean {
  if (pathname === "/dream") return true;
  if (pathname.startsWith("/reading/")) return true;
  if (pathname.startsWith("/archive/")) return true;
  return pathname.startsWith("/methods");
}
