import { NextRequest, NextResponse } from "next/server";

const LOGIN = process.env.ADMIN_LOGIN ?? "neostore";
const SENHA = process.env.ADMIN_SENHA ?? "neo@2025";

export async function POST(req: NextRequest) {
  const { login, senha } = await req.json();
  if (login !== LOGIN || senha !== SENHA) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("neo_auth", "ok", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("neo_auth", "", { maxAge: 0, path: "/" });
  return res;
}
