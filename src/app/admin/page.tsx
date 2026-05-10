"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats { clientes: number; ativos: number; planos: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clientes").then((r) => r.json()),
      fetch("/api/admin/planos").then((r) => r.json()),
    ]).then(([clientes, planos]) => {
      setStats({
        clientes: clientes.length,
        ativos: clientes.filter((c: { ativo: boolean }) => c.ativo).length,
        planos: planos.length,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/neostore-logo.png" alt="" className="w-full h-full object-contain p-1"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span style="font-weight:900;font-size:8px;color:#111">NEO</span>'; }} />
          </div>
          <div>
            <p className="font-black text-white leading-none">Neo Display</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Admin</p>
          </div>
        </div>
        <button
          onClick={async () => { await fetch("/api/neo-auth", { method: "DELETE" }); window.location.href = "/admin/login"; }}
          className="text-xs text-gray-500 hover:text-red-400 transition uppercase tracking-widest"
        >
          Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-black mb-2">Dashboard</h1>
        <p className="text-gray-500 text-sm mb-10">Visão geral da plataforma Neo Display</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Clientes", value: stats?.clientes ?? "—" },
            { label: "Ativos", value: stats?.ativos ?? "—" },
            { label: "Planos", value: stats?.planos ?? "—" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <p className="text-4xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/clientes" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition group">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-gray-700 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-black text-white">Clientes</p>
            <p className="text-xs text-gray-500 mt-1">Criar e gerenciar contas</p>
          </Link>

          <Link href="/admin/planos" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition group">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-gray-700 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-black text-white">Planos</p>
            <p className="text-xs text-gray-500 mt-1">Criar e editar planos</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
