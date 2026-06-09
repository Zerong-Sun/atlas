import { getMethod, isPreviewWorkbench } from "@/data/divinationMethods";

/** Resolve active divination method id from the current route pathname. */
export function methodIdFromPathname(pathname: string): string | null {
  if (pathname === "/dream") return "dream";
  const workbenchMatch = pathname.match(/^\/methods\/([^/]+)\/workbench$/);
  if (workbenchMatch) return workbenchMatch[1];
  const match = pathname.match(/^\/methods\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
  if (id === "methods") return null;
  return getMethod(id) ? id : id;
}

export function isMethodWorkbenchRoute(pathname: string): boolean {
  if (pathname.endsWith("/workbench")) return true;
  const methodId = methodIdFromPathname(pathname);
  return Boolean(methodId && isPreviewWorkbench(methodId));
}

export function isMethodCopilotRoute(pathname: string): boolean {
  if (pathname === "/dream") return true;
  if (pathname.startsWith("/reading/")) return true;
  if (pathname.startsWith("/archive/")) return true;
  return pathname.startsWith("/methods");
}
