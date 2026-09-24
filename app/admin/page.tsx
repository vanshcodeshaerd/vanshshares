import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { supabaseAdmin, type Signup } from "@/lib/supabaseAdmin";
import EntriesTable from "./EntriesTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Campus Leader Sign-ups", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const { data, error } = await supabaseAdmin()
    .from("signups")
    .select("id, full_name, alias, college_email, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">Failed to load entries: {error.message}</p>
      ) : (
        <EntriesTable initialRows={(data ?? []) as Signup[]} />
      )}
    </main>
  );
}
