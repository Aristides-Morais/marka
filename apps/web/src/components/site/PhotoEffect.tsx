import { useRef, useEffect, useState } from "react";

// MESMO EFEITO DO Gallery3D, MAS SEM MUDAR A ORGANIZAÇÃO
// Usa assim: <PhotoEffect src={...} alt={...} className="w-full h-full object-cover" />
// O className que passares é o que fica na foto, não muda o tamanho nem a grelha

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  // Para poder passar de foto em foto no zoom, opcional
  gallery?: string[];
};

export default function PhotoEffect({ src, alt = "", className = "", style, gallery }: Props) {
  const [open, setOpen] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [current, setCurrent] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const list = gallery && gallery.length > 0 ? gallery : [src];
  const currentSrc = list[current];

  // Quando abres, começa na foto que clicaste
  const openLightbox = () => {
    const idx = list.indexOf(src);
    setCurrent(idx >= 0 ? idx : 0);
    setRotate(0);
    setOpen(true);
  };

  useEffect(() => { setRotate(0); }, [current]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setCurrent((v) => Math.min(list.length - 1, v + 1));
      if (e.key === "ArrowLeft") setCurrent((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, list.length]);

  return (
    <>
      {/* A FOTO FICA EXATAMENTE COMO ESTAVA - SÓ GANHA O EFEITO */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onClick={openLightbox}
        className={`${className} cursor-zoom-in animate-[photoIn_0.5s_ease-out] hover:scale-[1.03] transition-transform duration-500`}
        style={style}
        draggable={false}
      />

      {/* ZOOM AO CLICAR - SÓ FOTO, A GIRAR, SEM DESCRIÇÃO - IGUAL AO Gallery3D */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setOpen(false)}
          onTouchStart={(e) => { start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!start.current) return;
            const dx = e.changedTouches[0].clientX - start.current.x;
            if (Math.abs(dx) > 60) {
              if (dx < 0) setCurrent((v) => Math.min(list.length - 1, v + 1));
              else setCurrent((v) => Math.max(0, v - 1));
            }
            start.current = null;
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <img
              key={currentSrc}
              src={currentSrc}
              alt=""
              className="max-w-[92vw] max-h-[78vh] object-contain rounded-2xl transition-transform duration-500 animate-[photoZoom_0.4s_ease-out]"
              style={{ transform: `rotate(${rotate}deg)` }}
              draggable={false}
            />
          </div>
          <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCurrent((v) => Math.max(0, v - 1))} className="w-11 h-11 rounded-full bg-white text-black font-bold">←</button>
            <button onClick={() => setRotate((r) => r - 90)} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">↺ Girar</button>
            <span className="text-white text-sm font-bold px-2">{current + 1} / {list.length}</span>
            <button onClick={() => setRotate((r) => r + 90)} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Girar ↻</button>
            <button onClick={() => setCurrent((v) => Math.min(list.length - 1, v + 1))} className="w-11 h-11 rounded-full bg-white text-black font-bold">→</button>
            <button onClick={() => setOpen(false)} className="ml-2 w-11 h-11 rounded-full bg-red-500 text-white font-bold">✕</button>
          </div>
          <p className="text-white/60 text-xs mt-2">Desliza para o lado para trocar • Clica em Girar para rodar</p>
        </div>
      )}

      <style>{`
        @keyframes photoIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes photoZoom { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}