import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export async function getAuthSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function ensureAuthSession(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return true;

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn("[auth] anonymous sign-in failed:", error.message);
    return false;
  }
  return true;
}

export async function getEdgeAuthHeaders(): Promise<Record<string, string> | null> {
  if (!isSupabaseConfigured) return null;
  const session = await getAuthSession();
  const token = session?.access_token ?? supabaseAnonKey;
  return {
    Authorization: `Bearer ${token}`,
    apikey: supabaseAnonKey,
  };
}

export async function invokeFunction<T>(
  name: string,
  body?: Record<string, unknown>
): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke<T>(name, {
    body: body ?? {},
  });

  if (error) {
    console.warn(`[edge] ${name}:`, error.message);
    return null;
  }
  return data;
}

export async function invokeFunctionGet<T>(
  name: string,
  params?: Record<string, string>
): Promise<T | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const headers = await getEdgeAuthHeaders();
  if (!headers) return null;

  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${name}${qs}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      console.warn(`[edge] GET ${name}:`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`[edge] GET ${name}:`, e);
    return null;
  }
}
