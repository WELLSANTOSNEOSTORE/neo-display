"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(false);
    setLoading(true);
    try {
      const res = await fetch("/api/neo-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });
      if (res.ok) router.push("/admin");
      else setErro(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/neostore-logo.png"
                alt="Neostore"
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    '<span style="font-weight:900;font-size:11px;letter-spacing:0.1em;color:#111">NEOSTORE</span>';
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-white font-black text-lg tracking-tight">Neo Display</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Acesso Restrito</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-black text-gray-800 mb-1">Entrar</h1>
          <p className="text-sm text-gray-400 mb-6">Painel Neostore</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            {erro && <p className="text-sm text-red-500 font-medium">Login ou senha incorretos.</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center mt-2"
            >
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
