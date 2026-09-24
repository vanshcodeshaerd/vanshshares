import { NextResponse, type NextRequest } from "next/server";
import { signupSchema } from "@/lib/validation";
import { verifyTurnstile } from "@/lib/turnstile";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const human = await verifyTurnstile(String(body.turnstileToken ?? ""), ip);
  if (!human) {
    return NextResponse.json({ error: "Verification failed. Please try the check again." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: "Please fix the highlighted fields", fieldErrors }, { status: 400 });
  }

  const { fullName, alias, collegeEmail } = parsed.data;
  const { error } = await supabaseAdmin()
    .from("signups")
    .insert({ full_name: fullName, alias, college_email: collegeEmail });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email has already been registered", fieldErrors: { collegeEmail: ["Already registered"] } },
        { status: 409 },
      );
    }
    console.error("Insert failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
