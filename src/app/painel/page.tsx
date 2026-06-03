"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useSearchParams } from "next/navigation";

type SalaId = "inter" | "rooftop";
type Orientacao = "landscape" | "portrait";

interface SalaConfig {
  salaId: SalaId;
  mensagemBoasVindas: string;
  logoCliente: string | null;
  nomeCliente: string | null;
  mostrarInfoEvento: boolean;
  videoUrl: string | null;
  mostrarVideo: boolean;
  orientacao: Orientacao;
}

interface LogoLibrary { id: number; nome: string; url: string; }

const defaultConfig = (salaId: SalaId): SalaConfig => ({
  salaId, mensagemBoasVindas: "BEM-VINDO!", logoCliente: null, nomeCliente: null,
  mostrarInfoEvento: true, videoUrl: null, mostrarVideo: false, orientacao: "landscape",
});

export default function PainelPage() {
  return (
    <Suspense>
      <PainelContent />
    </Suspense>
  );
}

function PainelContent() {
  const searchParams = useSearchParams();
  const tenantIdParam = searchParams.get("tenantId");

  const [sala, setSala] = useState<SalaId>("inter");
  const [config, setConfig] = useState<SalaConfig>(defaultConfig("inter"));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [buscarLogoSistema, setBuscarLogoSistema] = useState(false);
  const [logos, setLogos] = useState<LogoLibrary[]>([]);
  const [salvandoLogo, setSalvandoLogo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [uploadVideoError, setUploadVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const apiSuffix = tenantIdParam ? `&tenantId=${tenantIdParam}` : "";

  useEffect(() => { fetchConfig(sala); }, [sala]);
  useEffect(() => { if (buscarLogoSistema) fetchLogos(); }, [buscarLogoSistema]);

  async function fetchConfig(salaId: SalaId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/sala?salaId=${salaId}${apiSuffix}`);
      const data = await res.json();
      if (res.ok && data.salaId) { setConfig(data); setLogoPreview(data.logoCliente ?? null); }
      else setConfig(defaultConfig(salaId));
    } catch { setConfig(defaultConfig(salaId)); }
    finally { setLoading(false); }
  }

  async function fetchLogos() {
    const res = await fetch(`/api/logos?dummy=1${apiSuffix}`);
    const data = await res.json();
    setLogos(Array.isArray(data) ? data : []);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) { setLogoPreview(data.url); setConfig((p) => ({ ...p, logoCliente: data.url })); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/sala${apiSuffix ? "?" + apiSuffix.slice(1) : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  async function handleSalvarNoSistema() {
    if (!config.logoCliente || !config.nomeCliente) return;
    setSalvandoLogo(true);
    try {
      await fetch(`/api/logos${apiSuffix ? "?" + apiSuffix.slice(1) : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: config.nomeCliente, url: config.logoCliente }),
      });
      await fetchLogos();
    } finally { setSalvandoLogo(false); }
  }

  async function handleDeletarLogo(id: number) {
    await fetch(`/api/logos?id=${id}${apiSuffix}`, { method: "DELETE" });
    setLogos((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true); setUploadVideoProgress(0); setUploadVideoError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload-video",
        multipart: true,
        onUploadProgress: ({ percentage }) => setUploadVideoProgress(Math.round(percentage)),
      });
      setConfig((p) => ({ ...p, videoUrl: blob.url }));
    } catch (err) {
      setUploadVideoError(err instanceof Error ? err.message : "Erro ao enviar vídeo.");
    } finally {
      setUploadingVideo(false); setUploadVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  const tenantNome = "Meu Hotel";
  const nomeSala = sala === "inter" ? "Sala Inter" : "Sala Rooftop";
  const telaUrl = tenantIdParam
    ? `/tela/${sala}?tenantId=${tenantIdParam}`
    : `/tela/${sala}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8440A] flex items-center justify-center">
              <span className="text-white font-black text-xs">neo</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Neo Display</p>
              <p className="text-lg font-black text-gray-800 leading-tight">{tenantNome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/clientes" className="text-[10px] text-gray-400 hover:text-gray-700 transition uppercase tracking-widest">← Admin</a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">OLÁ, IBIS HOTEL</h1>
          <p className="text-gray-400 text-sm mt-1">Configure as informações exibidas na tela de cada sala.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-7">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sala</label>
            <select value={sala} onChange={(e) => setSala(e.target.value as SalaId)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#E8440A] transition">
              <option value="inter">Sala Inter</option>
              <option value="rooftop">Sala Rooftop</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Orientação da tela</label>
            <div className="grid grid-cols-2 gap-3">
              {(["landscape", "portrait"] as Orientacao[]).map((o) => (
                <button key={o} type="button" onClick={() => setConfig((p) => ({ ...p, orientacao: o }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${config.orientacao === o ? "border-[#E8440A] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`${o === "landscape" ? "w-14 h-8" : "w-8 h-14"} rounded border-2 ${config.orientacao === o ? "border-[#E8440A] bg-orange-100" : "border-gray-400 bg-gray-100"}`} />
                  <span className={`text-xs font-bold ${config.orientacao === o ? "text-[#E8440A]" : "text-gray-500"}`}>{o === "landscape" ? "Horizontal" : "Vertical"}</span>
                  <span className="text-[10px] text-gray-400">{o === "landscape" ? "1920 × 1080" : "1080 × 1920"}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8440A]" /></div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mensagem de boas-vindas</label>
                <input type="text" value={config.mensagemBoasVindas} onChange={(e) => setConfig((p) => ({ ...p, mensagemBoasVindas: e.target.value }))} placeholder="BEM-VINDO!"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#E8440A] transition" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome do cliente / evento</label>
                <input type="text" value={config.nomeCliente ?? ""} onChange={(e) => setConfig((p) => ({ ...p, nomeCliente: e.target.value }))} placeholder="Ex: Empresa XPTO"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#E8440A] transition" />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="buscarLogo" checked={buscarLogoSistema} onChange={(e) => setBuscarLogoSistema(e.target.checked)} className="w-5 h-5 accent-[#E8440A] cursor-pointer" />
                <label htmlFor="buscarLogo" className="text-sm text-gray-600 cursor-pointer select-none">Procurar logo no sistema? <span className="text-gray-400">(cliente recorrente)</span></label>
              </div>

              {buscarLogoSistema && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Logos salvos</p>
                  </div>
                  {logos.length === 0 ? (
                    <div className="px-4 py-8 text-center"><p className="text-sm text-gray-400">Nenhum logo salvo ainda.</p></div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {logos.map((logo) => (
                        <li key={logo.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition">
                          <Image src={logo.url} alt={logo.nome} width={64} height={32} className="object-contain h-8 w-16 rounded" unoptimized />
                          <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{logo.nome}</span>
                          <button onClick={() => { setLogoPreview(logo.url); setConfig((p) => ({ ...p, logoCliente: logo.url, nomeCliente: p.nomeCliente || logo.nome })); setBuscarLogoSistema(false); }} className="text-xs font-bold text-[#E8440A] hover:underline">Usar</button>
                          <button onClick={() => handleDeletarLogo(logo.id)} className="text-xs text-gray-300 hover:text-red-400 transition">✕</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Logo do cliente</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#E8440A] transition group" onClick={() => fileInputRef.current?.click()}>
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <Image src={logoPreview} alt="Preview" width={180} height={90} className="object-contain max-h-24" unoptimized />
                      <p className="text-xs text-gray-400 group-hover:text-[#E8440A] transition">Clique para trocar</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-50 transition">
                        <svg className="w-7 h-7 text-gray-400 group-hover:text-[#E8440A] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 group-hover:text-[#E8440A] transition">Clique para fazer upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG até 5MB</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden" />
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => { setLogoPreview(null); setConfig((p) => ({ ...p, logoCliente: null })); }} className="text-xs text-red-400 hover:text-red-600 transition">Remover logo</button>
                    {config.nomeCliente && (<><span className="text-gray-200">|</span><button type="button" onClick={handleSalvarNoSistema} disabled={salvandoLogo} className="text-xs text-[#E8440A] hover:underline disabled:opacity-50 transition">{salvandoLogo ? "Salvando..." : "Salvar no sistema"}</button></>)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Mostrar informações do evento?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Exibe logo e nome do cliente no slide 3</p>
                </div>
                <button type="button" onClick={() => setConfig((p) => ({ ...p, mostrarInfoEvento: !p.mostrarInfoEvento }))}
                  style={{ width: "52px" }} className={`relative inline-flex h-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${config.mostrarInfoEvento ? "bg-[#E8440A]" : "bg-gray-200"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${config.mostrarInfoEvento ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Vídeo</label>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Upload do computador (MP4 até 500 MB)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[#E8440A] transition group" onClick={() => !uploadingVideo && videoInputRef.current?.click()}>
                    {uploadingVideo ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-2 bg-[#E8440A] rounded-full transition-all" style={{ width: `${uploadVideoProgress}%` }} /></div>
                        <p className="text-xs text-gray-500">Enviando… {uploadVideoProgress}%</p>
                      </div>
                    ) : config.videoUrl ? (
                      <p className="text-xs text-gray-400 group-hover:text-[#E8440A] transition">Clique para trocar o vídeo</p>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-50 transition">
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-[#E8440A] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-600 group-hover:text-[#E8440A] transition">Clique para fazer upload</p>
                        <p className="text-xs text-gray-400">MP4, WebM até 500 MB</p>
                      </>
                    )}
                  </div>
                  <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoFileChange} className="hidden" />
                  {uploadVideoError && <p className="mt-2 text-xs text-red-500">{uploadVideoError}</p>}
                </div>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-100" /><span className="text-xs text-gray-400">ou cole uma URL</span><div className="flex-1 h-px bg-gray-100" /></div>
                <div className="flex gap-2">
                  <input type="url" value={config.videoUrl ?? ""} onChange={(e) => setConfig((p) => ({ ...p, videoUrl: e.target.value || null }))} placeholder="https://exemplo.com/video.mp4"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#E8440A] transition text-sm" />
                  {config.videoUrl && <button type="button" onClick={() => setConfig((p) => ({ ...p, videoUrl: null, mostrarVideo: false }))} className="px-3 py-2 text-xs text-red-400 hover:text-red-600 border border-gray-200 rounded-xl transition">Remover</button>}
                </div>
                {config.videoUrl && !uploadingVideo && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video key={config.videoUrl} src={config.videoUrl} controls muted className="w-full max-h-48 object-contain" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Mostrar vídeo?</p>
                    <p className="text-xs text-gray-400 mt-0.5">Exibe o vídeo como slide extra na tela</p>
                  </div>
                  <button type="button" onClick={() => setConfig((p) => ({ ...p, mostrarVideo: !p.mostrarVideo }))}
                    style={{ width: "52px" }} className={`relative inline-flex h-7 items-center rounded-full transition-colors duration-200 focus:outline-none ${config.mostrarVideo ? "bg-[#E8440A]" : "bg-gray-200"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${config.mostrarVideo ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2">
                  {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : saved ? (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Salvo!</>) : "Salvar"}
                </button>
                <button onClick={() => window.open(telaUrl, "_blank")} className="flex-1 bg-[#1a2e4a] hover:bg-[#243d61] text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Ver Tela — {nomeSala}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
