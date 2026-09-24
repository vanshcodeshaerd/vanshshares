import "server-only";
import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";

// Publishable keys are designed to be public: the signups table is locked by RLS and is only
// reachable through the RPC functions in supabase/migrations/0002_rpc_access.sql.
const DEFAULT_URL = "https://qeomdzexohmsfobguurq.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_Twusln70CdVaV8zCKCiymA_0h9wXTbG";

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_URL).trim();
    const key = (
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      DEFAULT_PUBLISHABLE_KEY
    ).trim();
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/** The database checks this against the SHA-256 stored in private.app_config. */
function adminToken(): string {
  const token = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!token) throw new Error("ADMIN_SESSION_SECRET must be set");
  return token;
}

export type Signup = {
  id: string;
  full_name: string;
  alias: string;
  college_email: string;
  created_at: string;
};

export async function submitSignup(fullName: string, alias: string, collegeEmail: string) {
  const { error } = await db().rpc("submit_signup", {
    p_full_name: fullName,
    p_alias: alias,
    p_college_email: collegeEmail,
  });
  return { error };
}

export async function listSignups(): Promise<{ data: Signup[]; error: PostgrestError | null }> {
  const { data, error } = await db().rpc("admin_list_signups", { p_token: adminToken() });
  return { data: (data ?? []) as Signup[], error };
}

export async function deleteSignup(id: string) {
  const { error } = await db().rpc("admin_delete_signup", { p_token: adminToken(), p_id: id });
  return { error };
}
