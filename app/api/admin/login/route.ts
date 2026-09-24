import { NextResponse, type NextRequest } from "next/server";
import { checkCredentials } from "@/lib/adminAuth";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  if (!checkCredentials(String(username ?? ""), String(password ?? ""))) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSession();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server setup error: ADMIN_SESSION_SECRET is missing or shorter than 32 characters in Vercel." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
