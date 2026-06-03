import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.cookies.get("neo_auth")?.value === "ok";
}

// GET é público — tela do hotel lê sem precisar de cookie
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId");
  const salaId = req.nextUrl.searchParams.get("salaId");

  if (!tenantId) return NextResponse.json({ error: "tenantId obrigatório" }, { status: 400 });
  if (!salaId || !["inter", "rooftop"].includes(salaId)) {
    return NextResponse.json({ error: "salaId inválido" }, { status: 400 });
  }

  const config = await prisma.salaConfig.upsert({
    where: { tenantId_salaId: { tenantId, salaId } },
    update: {},
    create: { tenantId, salaId, mensagemBoasVindas: "BEM-VINDO!", mostrarInfoEvento: true },
  });
  return NextResponse.json(config);
}

// POST exige cookie de admin
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId obrigatório" }, { status: 400 });

  const body = await req.json();
  const { salaId, mensagemBoasVindas, logoCliente, nomeCliente, mostrarInfoEvento, videoUrl, mostrarVideo, orientacao } = body;

  if (!salaId || !["inter", "rooftop"].includes(salaId)) {
    return NextResponse.json({ error: "salaId inválido" }, { status: 400 });
  }

  const config = await prisma.salaConfig.upsert({
    where: { tenantId_salaId: { tenantId, salaId } },
    update: { mensagemBoasVindas, logoCliente, nomeCliente, mostrarInfoEvento, videoUrl, mostrarVideo, orientacao },
    create: { tenantId, salaId, mensagemBoasVindas, logoCliente, nomeCliente, mostrarInfoEvento, videoUrl, mostrarVideo, orientacao },
  });
  return NextResponse.json(config);
}
