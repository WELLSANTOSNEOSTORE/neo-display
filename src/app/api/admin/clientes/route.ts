import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.cookies.get("neo_auth")?.value === "ok";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const clientes = await prisma.tenant.findMany({
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const { nome, email, planId } = await req.json();
    if (!nome || !email) return NextResponse.json({ error: "nome e email obrigatórios" }, { status: 400 });
    const tenant = await prisma.tenant.create({
      data: { nome, email, planId: planId ? Number(planId) : null },
      include: { plan: true },
    });
    return NextResponse.json(tenant);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, nome, email, planId, ativo } = await req.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const tenant = await prisma.tenant.update({
    where: { id },
    data: { nome, email, planId: planId ? Number(planId) : null, ativo },
    include: { plan: true },
  });
  return NextResponse.json(tenant);
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  await prisma.tenant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
