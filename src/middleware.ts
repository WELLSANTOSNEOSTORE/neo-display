import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/admin", "/painel"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Já está na página de login — deixa passar
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const autenticado = req.cookies.get("neo_auth")?.value === "ok";
  if (!autenticado) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
