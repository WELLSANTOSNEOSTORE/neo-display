"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Plano { id: number; nome: string; descricao: string | null; ativo: boolean; }

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/planos").then((r) => r.json()).then((data) => { setPlanos(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const novo = await res.json();
      setPlanos((prev) => [...prev, novo]);
      setForm({ nome: "", descricao: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(plano: Plano) {
    const res = await fetch("/api/admin/planos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plano.id, ativo: !plano.ativo }),
    });
    const atualizado = await res.json();
    setPlanos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-8 py-5 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-black text-xl">Planos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition"
        >
          + Novo plano
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <h2 className="font-black text-lg">Novo plano</h2>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                required
                placeholder="Ex: Pro"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Ex: Telas ilimitadas + vídeo"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-60 transition">
                {saving ? "Salvando..." : "Criar plano"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-sm transition">Cancelar</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        ) : (
          <div className="space-y-3">
            {planos.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-white">{p.nome}</p>
                  {p.descricao && <p className="text-xs text-gray-500 mt-0.5">{p.descricao}</p>}
                </div>
                <button
                  onClick={() => toggleAtivo(p)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition ${p.ativo ? "bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400" : "bg-red-900/40 text-red-400 hover:bg-green-900/40 hover:text-green-400"}`}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
