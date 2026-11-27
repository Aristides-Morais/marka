import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  gallery?: string[];
};

export default function PhotoEffect({ src, alt = "", className = "", style, gallery }: Props) {
  const [open, setOpen] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [current, setCurrent] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);

  const list = gallery && gallery.length > 0 ? gallery : [src];
  const currentSrc = list[current];

  const openLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const idx = list.indexOf(src);
    setCurrent(idx >= 0 ? idx : 0);
    setRotate(0);
    setOpen(true);
  };

  useEffect(() => { setRotate(0); }, [current]);

  // Trava o scroll da página enquanto o zoom está aberto
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [open]);

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

  // O ZOOM VAI PARA O BODY, FORA DO CARD - NÃO PISCA MAIS
  const lightbox = open ? createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4"
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
      {/* Div de fora faz a animação de entrada, img de dentro faz o rotate - não lutam */}
      <div className="animate-[photoFade_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <img
          key={currentSrc}
          src={currentSrc}
          alt=""
          className="max-w-[92vw] max-h-[78vh] object-contain rounded-2xl"
          style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.4s ease" }}
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
    </div>,
    document.body
  ) : null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={openLightbox}
        className={`${className} cursor-zoom-in hover:scale-[1.03] transition-transform duration-500`}
        style={style}
        draggable={false}
      />
      {lightbox}
      <style>{`@keyframes photoFade{from{opacity:0}to{opacity:1}}`}</style>
    </>
  );
}