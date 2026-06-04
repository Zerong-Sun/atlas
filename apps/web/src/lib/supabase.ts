import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? supabaseAnonKey;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${name}${qs}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
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
