"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function EntrarPage() {
  const [loading, setLoading] = useState(false);
  const [negado, setNegado] = useState(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("error") === "AccessDenied"
  );

  async function handleGoogle() {
    setNegado(false);
    setLoading(true);
    await signIn("google", { callbackUrl: "/painel" });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8440A] flex items-center justify-center">
              <span className="text-white font-black text-sm">neo</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Powered by</p>
              <p className="text-xl font-black text-gray-800 leading-tight">Neo Display</p>
              <p className="text-[10px] text-gray-500 tracking-wider leading-none">SINALIZAÇÃO DIGITAL</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-black text-gray-800 mb-1">Acessar o Painel</h1>
          <p className="text-sm text-gray-400 mb-8">Entre com o Gmail cadastrado pela Neostore</p>

          {negado && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-medium">E-mail não autorizado.</p>
              <p className="text-xs text-red-400 mt-0.5">Entre em contato com a Neostore para liberar o acesso.</p>
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 hover:bg-gray-50 disabled:opacity-60 transition font-semibold text-gray-700"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Entrar com Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
