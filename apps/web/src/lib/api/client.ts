import {
  getEdgeAuthHeaders,
  invokeFunction,
  invokeFunctionGet,
  isSupabaseConfigured,
  supabaseUrl,
} from "../supabase";

/** Deployed Supabase Edge Function slugs (see apps/mobile/lib/api.ts) */
export const EDGE_PATHS = {
  createReading: "create-reading",
  listReadings: "list-readings",
  interpretDream: "create-dream",
  dailyBrief: "daily-brief",
  libraryList: "get-library",
  profile: "profile",
} as const;

export { EDGE_PATHS as EDGE };

export function useMockApi(): boolean {
  return !isSupabaseConfigured;
}

export async function callEdge<T>(
  path: string,
  opts?: {
    method?: "GET" | "POST" | "PATCH";
    body?: Record<string, unknown>;
    query?: Record<string, string>;
  }
): Promise<T | null> {
  if (useMockApi()) return null;

  const method = opts?.method ?? "POST";

  if (method === "GET") {
    return invokeFunctionGet<T>(path, opts?.query);
  }

  if (method === "PATCH") {
    const headers = await getEdgeAuthHeaders();
    if (!headers) return null;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(opts?.body ?? {}),
      });
      if (!res.ok) {
        console.warn(`[edge] PATCH ${path}:`, res.status);
        return null;
      }
      return (await res.json()) as T;
    } catch (e) {
      console.warn(`[edge] PATCH ${path}:`, e);
      return null;
    }
  }

  return invokeFunction<T>(path, opts?.body);
}
