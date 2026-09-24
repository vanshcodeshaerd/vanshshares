import { NextResponse, type NextRequest } from "next/server";
import { signupSchema } from "@/lib/validation";
import { submitSignup } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: "Please fix the highlighted fields", fieldErrors }, { status: 400 });
  }

  const { fullName, alias, collegeEmail } = parsed.data;
  const { error } = await submitSignup(fullName, alias, collegeEmail);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email has already been registered", fieldErrors: { collegeEmail: ["Already registered"] } },
        { status: 409 },
      );
    }
    if (error.code === "22023") {
      return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
    }
    console.error("Insert failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
