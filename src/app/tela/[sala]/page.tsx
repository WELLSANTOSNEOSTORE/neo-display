"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

type SalaId = "inter" | "rooftop";

interface SalaConfig {
  salaId: SalaId;
  mensagemBoasVindas: string;
  logoCliente: string | null;
  nomeCliente: string | null;
  mostrarInfoEvento: boolean;
  videoUrl: string | null;
  mostrarVideo: boolean;
  orientacao: string;
}

const DURATIONS = [6000, 5000, 5000, 15000];
const NOME_SALA: Record<string, string> = { inter: "SALA INTER", rooftop: "SALA ROOFTOP" };
const W = 1920, H = 1080, WP = 1080, HP = 1920;

export default function TelaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sala = params.sala as string;
  const tenantId = searchParams.get("tenantId");

  const [config, setConfig] = useState<SalaConfig | null>(null);
  const [slide, setSlide] = useState(0);
  const [scale, setScale] = useState(1);

  const isPortrait = config?.orientacao === "portrait";
  const advanceSlide = useCallback((total: number) => setSlide((p) => (p + 1) % total), []);

  useEffect(() => {
    function updateScale() {
      const portrait = config?.orientacao === "portrait";
      const cW = portrait ? WP : W, cH = portrait ? HP : H;
      setScale(Math.min(window.innerWidth / cW, window.innerHeight / cH));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [config?.orientacao]);

  const fetchConfig = useCallback(async () => {
    try {
      const tid = tenantId ? `&tenantId=${tenantId}` : "";
      const res = await fetch(`/api/sala?salaId=${sala}${tid}`, { cache: "no-store" });
      setConfig(await res.json());
    } catch { /* mantém config anterior */ }
  }, [sala, tenantId]);

  useEffect(() => {
    fetchConfig();
    const iv = setInterval(fetchConfig, 30_000);
    return () => clearInterval(iv);
  }, [fetchConfig]);

  useEffect(() => {
    const total = 2 + (config?.mostrarInfoEvento ? 1 : 0) + (config?.mostrarVideo && config?.videoUrl ? 1 : 0);
    const slideVideo = (config?.mostrarInfoEvento ? 3 : 2);
    if (config?.mostrarVideo && config?.videoUrl && slide === slideVideo) return;
    const t = setTimeout(() => advanceSlide(total), (DURATIONS[slide] ?? 5000) - 500);
    return () => clearTimeout(t);
  }, [slide, config?.mostrarInfoEvento, config?.mostrarVideo, config?.videoUrl, advanceSlide]);

  if (!config) return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
    </div>
  );

  const totalSlides = 2 + (config.mostrarInfoEvento ? 1 : 0) + (config.mostrarVideo && config.videoUrl ? 1 : 0);
  const slideVideo = config.mostrarInfoEvento ? 3 : 2;
  const nomeSala = NOME_SALA[sala] ?? "SALA";
  const slideClaro = slide === 0 || (config.mostrarInfoEvento && slide === 2);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black" style={{ position: "relative" }}>
      <div style={{
        width: isPortrait ? WP : W, height: isPortrait ? HP : H,
        position: "absolute", top: "50%", left: "50%",
        marginLeft: isPortrait ? -WP / 2 : -W / 2,
        marginTop: isPortrait ? -HP / 2 : -H / 2,
        transform: `scale(${scale})`, transformOrigin: "center center", overflow: "hidden",
      }}>
        <div className={`absolute inset-0 transition-opacity duration-500 ${slide === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {["inter", "rooftop"].includes(sala) ? <SlideInter nomeSala={nomeSala} /> : <Slide1 mensagem={config.mensagemBoasVindas} />}
        </div>
        <div className={`absolute inset-0 transition-opacity duration-500 ${slide === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <Slide2 />
        </div>
        {config.mostrarInfoEvento && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${slide === 2 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Slide3 logoCliente={config.logoCliente} nomeSala={nomeSala} />
          </div>
        )}
        {config.mostrarVideo && config.videoUrl && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${slide === slideVideo ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <SlideVideo videoUrl={config.videoUrl} active={slide === slideVideo} onEnded={() => advanceSlide(totalSlides)} />
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${slide === i ? `w-6 h-2 ${slideClaro ? "bg-black" : "bg-white"}` : `w-2 h-2 ${slideClaro ? "bg-black/30" : "bg-white/40"}`}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Slide1({ mensagem }: { mensagem: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white px-8">
      <h1 className="text-8xl font-black text-black leading-none tracking-tight text-center">
        {mensagem.split(/[\n\r]/)[0].trim()}
      </h1>
    </div>
  );
}

function Slide2() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#E8440A" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ibis-logo.png" alt="ibis" className="object-contain h-96" />
    </div>
  );
}

function Chevron({ direction, color }: { direction: "left" | "right"; color: string }) {
  const clip =
    direction === "left"
      ? "polygon(100% 0%, 28% 0%, 0% 50%, 28% 100%, 100% 100%, 72% 50%)"
      : "polygon(0% 0%, 72% 0%, 100% 50%, 72% 100%, 0% 100%, 28% 50%)";
  return <div style={{ width: 52, height: 88, backgroundColor: color, clipPath: clip, flexShrink: 0 }} />;
}

function SlideInter({ nomeSala }: { nomeSala: string }) {
  const leftColors = ["#4acf4a", "#35b535", "#268a26", "#1a5c1a"];
  const rightColors = ["#d45500", "#e87000", "#f59000", "#f8b400"];

  return (
    <div className="w-full h-full flex flex-col font-black text-white" style={{ backgroundColor: "#E8440A" }}>
      <div className="flex-1 flex items-center justify-center gap-6 px-12">
        <div className="flex gap-1">
          {leftColors.map((c, i) => <Chevron key={i} direction="left" color={c} />)}
        </div>
        <span style={{ fontSize: "88px", letterSpacing: "6px", whiteSpace: "nowrap" }}>{nomeSala}</span>
      </div>
      <div className="flex items-center justify-center py-6">
        <div className="bg-white rounded-3xl p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ibis-logo.png" alt="ibis" className="h-28 object-contain" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center gap-6 px-12">
        <span style={{ fontSize: "88px", letterSpacing: "6px", whiteSpace: "nowrap" }}>BANHEIROS</span>
        <div className="flex gap-1">
          {rightColors.map((c, i) => <Chevron key={i} direction="right" color={c} />)}
        </div>
      </div>
    </div>
  );
}

function Slide3({ logoCliente, nomeSala }: { logoCliente: string | null; nomeSala: string }) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-8 px-20">
      {logoCliente ? (
        <div className="flex-1 flex items-center justify-center w-full min-h-0 py-8">
          <Image src={logoCliente} alt="Logo" width={900} height={500} className="object-contain w-full h-full" style={{ maxHeight: "60vh" }} unoptimized priority />
        </div>
      ) : (
        <div className="w-72 h-36 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400 text-sm font-medium">Logo do cliente</p>
        </div>
      )}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-4">
          <div className="h-px w-16 bg-[#E8440A]" />
          <p className="text-5xl font-black text-gray-800 tracking-wide">{nomeSala}</p>
          <div className="h-px w-16 bg-[#E8440A]" />
        </div>
      </div>
    </div>
  );
}

function SlideVideo({ videoUrl, active, onEnded }: { videoUrl: string; active: boolean; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (active) videoRef.current?.play().catch(() => {});
    else { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; }
  }, [active]);
  return (
    <div className="w-full h-full bg-black">
      <video ref={videoRef} src={videoUrl} muted playsInline onEnded={onEnded} className="w-full h-full object-cover" />
    </div>
  );
}
