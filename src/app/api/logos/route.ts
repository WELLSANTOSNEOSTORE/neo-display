import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getTenantId(req: NextRequest): Promise<string | null> {
  const session = await auth();
  if (session) return (session as unknown as Record<string, string>).tenantId ?? null;
  const tid = req.nextUrl.searchParams.get("tenantId");
  const neoAuth = req.cookies.get("neo_auth")?.value;
  if (neoAuth === "ok" && tid) return tid;
  return null;
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId(req);
  if (!tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [logos, salas] = await Promise.all([
    prisma.logoLibrary.findMany({ where: { tenantId }, orderBy: { nome: "asc" } }),
    prisma.salaConfig.findMany({ where: { tenantId, logoCliente: { not: null }, nomeCliente: { not: null } } }),
  ]);

  const logoUrls = new Set(logos.map((l) => l.url));
  const novos = salas.filter((s) => s.logoCliente && !logoUrls.has(s.logoCliente!));
  if (novos.length > 0) {
    await Promise.all(novos.map((s) =>
      prisma.logoLibrary.create({ data: { tenantId, nome: s.nomeCliente!, url: s.logoCliente! } })
    ));
    return NextResponse.json(await prisma.logoLibrary.findMany({ where: { tenantId }, orderBy: { nome: "asc" } }));
  }
  return NextResponse.json(logos);
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantId(req);
  if (!tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, url } = await req.json();
  if (!nome || !url) return NextResponse.json({ error: "nome e url obrigatórios" }, { status: 400 });

  const logo = await prisma.logoLibrary.create({ data: { tenantId, nome, url } });
  return NextResponse.json(logo);
}

export async function DELETE(req: NextRequest) {
  const tenantId = await getTenantId(req);
  if (!tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  await prisma.logoLibrary.deleteMany({ where: { id: Number(id), tenantId } });
  return NextResponse.json({ ok: true });
}
