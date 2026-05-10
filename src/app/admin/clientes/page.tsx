"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Plano { id: number; nome: string; }
interface Cliente { id: string; nome: string; email: string; ativo: boolean; plan: Plano | null; createdAt: string; }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", planId: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clientes").then((r) => r.json()),
      fetch("/api/admin/planos").then((r) => r.json()),
    ])
      .then(([c, p]) => {
        if (c?.error) throw new Error(c.error);
        setClientes(Array.isArray(c) ? c : []);
        setPlanos(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, planId: form.planId || null }),
      });
      const novo = await res.json();
      if (!res.ok) throw new Error(novo?.error ?? `Erro ${res.status}`);
      setClientes((prev) => [novo, ...prev]);
      setForm({ nome: "", email: "", planId: "" });
      setShowForm(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(cliente: Cliente) {
    const res = await fetch("/api/admin/clientes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cliente.id, ativo: !cliente.ativo }),
    });
    const atualizado = await res.json();
    setClientes((prev) => prev.map((c) => (c.id === atualizado.id ? atualizado : c)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cliente? Todos os dados serão apagados.")) return;
    await fetch(`/api/admin/clientes?id=${id}`, { method: "DELETE" });
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-8 py-5 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-black text-xl">Clientes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition"
        >
          + Novo cliente
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <h2 className="font-black text-lg">Novo cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome do hotel</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  required
                  placeholder="Ex: ibis Styles Faria Lima"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Gmail do cliente</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="hotel@gmail.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Plano</label>
              <select
                value={form.planId}
                onChange={(e) => setForm((p) => ({ ...p, planId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white transition"
              >
                <option value="">Sem plano</option>
                {planos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            {saveError && <p className="text-red-400 text-sm font-semibold">{saveError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-60 transition">
                {saving ? "Salvando..." : "Criar conta"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-sm transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loadError && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl px-6 py-4 mb-4 text-red-400 text-sm font-semibold">
            Erro ao carregar: {loadError}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg font-bold">Nenhum cliente ainda.</p>
            <p className="text-sm mt-1">Clique em "+ Novo cliente" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientes.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-gray-400">{c.nome.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{c.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {c.plan && (
                    <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full font-semibold">{c.plan.nome}</span>
                  )}
                  <button
                    onClick={() => toggleAtivo(c)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition ${c.ativo ? "bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400" : "bg-red-900/40 text-red-400 hover:bg-green-900/40 hover:text-green-400"}`}
                  >
                    {c.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <Link
                    href={`/painel?tenantId=${c.id}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-white transition"
                  >
                    Ver painel
                  </Link>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-600 hover:text-red-400 transition">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
