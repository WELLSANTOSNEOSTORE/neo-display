import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getTenantId(req: NextRequest): Promise<string | null> {
  const session = await auth();
  if (session) {
    return (session as unknown as Record<string, string>).tenantId ?? null;
  }
  // Admin impersonando um tenant via query param
  const tid = req.nextUrl.searchParams.get("tenantId");
  const neoAuth = req.cookies.get("neo_auth")?.value;
  if (neoAuth === "ok" && tid) return tid;
  return null;
}

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId(req);
  if (!tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const salaId = req.nextUrl.searchParams.get("salaId");
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

export async function POST(req: NextRequest) {
  const tenantId = await getTenantId(req);
  if (!tenantId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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
