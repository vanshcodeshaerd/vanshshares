import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { supabaseAdmin, type Signup } from "@/lib/supabaseAdmin";

function csvCell(value: string): string {
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin()
    .from("signups")
    .select("full_name, alias, college_email, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });

  const header = ["Full name", "Alias", "College email", "Submitted at (UTC)"].map(csvCell).join(",");
  const rows = (data as Omit<Signup, "id">[]).map((r) =>
    [r.full_name, r.alias, r.college_email, r.created_at].map(csvCell).join(","),
  );
  const csv = [header, ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="campus-leader-signups-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
