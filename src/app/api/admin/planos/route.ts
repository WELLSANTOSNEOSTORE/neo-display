import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.cookies.get("neo_auth")?.value === "ok";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const planos = await prisma.plan.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(planos);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { nome, descricao } = await req.json();
  if (!nome) return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });
  const plano = await prisma.plan.create({ data: { nome, descricao } });
  return NextResponse.json(plano);
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, nome, descricao, ativo } = await req.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const plano = await prisma.plan.update({ where: { id: Number(id) }, data: { nome, descricao, ativo } });
  return NextResponse.json(plano);
}
