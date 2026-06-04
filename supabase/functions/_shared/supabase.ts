import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  return createClient(url, key);
}

export function createUserClient(authHeader: string | null): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader ?? "" } },
  });
}

export async function requireUser(req: Request): Promise<{ id: string; client: SupabaseClient }> {
  const authHeader = req.headers.get("Authorization");
  const client = createUserClient(authHeader);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  return { id: data.user.id, client };
}
