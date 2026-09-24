"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signup } from "@/lib/db";

const fmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default function EntriesTable({ initialRows }: { initialRows: Signup[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // router.refresh() re-renders the server page with fresh rows; sync them in.
  useEffect(() => setRows(initialRows), [initialRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.full_name, r.alias, r.college_email].some((v) => v.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  async function remove(row: Signup) {
    if (!confirm(`Delete the entry for ${row.full_name} (${row.college_email})?`)) return;
    setDeleting(row.id);
    const res = await fetch(`/api/admin/entries/${row.id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.status === 401) return router.replace("/admin/login");
    if (!res.ok) return alert("Delete failed. Please try again.");
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const btn = "rounded-lg px-3.5 py-2 text-sm font-semibold transition";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Campus Leader sign-ups</h1>
          <p className="text-sm text-slate-600">
            {rows.length} total{query && ` · ${filtered.length} matching`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.refresh()} className={`${btn} bg-white ring-1 ring-slate-300 hover:bg-slate-50`}>
            Refresh
          </button>
          <a href="/api/admin/export" className={`${btn} bg-brand text-ink hover:bg-brand-dark`}>
            Export CSV
          </a>
          <button onClick={logout} className={`${btn} bg-[#232f3e] text-white hover:bg-[#1a2330]`}>
            Log out
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, alias or email…"
        aria-label="Search entries"
        className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
          {rows.length === 0 ? "No entries yet." : "No entries match your search."}
        </p>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Full name</th>
                  <th className="px-4 py-3">Alias</th>
                  <th className="px-4 py-3">College email</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3">{r.alias}</td>
                    <td className="px-4 py-3">{r.college_email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmt.format(new Date(r.created_at))}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(r)}
                        disabled={deleting === r.id}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deleting === r.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <li key={r.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.full_name}</p>
                    <p className="text-sm text-slate-600">@{r.alias}</p>
                    <p className="break-all text-sm">{r.college_email}</p>
                    <p className="mt-1 text-xs text-slate-500">{fmt.format(new Date(r.created_at))}</p>
                  </div>
                  <button
                    onClick={() => remove(r)}
                    disabled={deleting === r.id}
                    className="shrink-0 text-sm font-medium text-red-600 disabled:opacity-50"
                  >
                    {deleting === r.id ? "…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
