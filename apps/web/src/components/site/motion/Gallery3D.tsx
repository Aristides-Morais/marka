import { useRef, useEffect, useState } from "react";

type GalleryItem = string | { image: string; title?: string; desc?: string; price?: string };
type Props = { images: GalleryItem[]; primary: string; secondary: string; experience?: string };

export default function Gallery3D({ images, primary, secondary, experience = "imersivo" }: Props) {
  const items = images.map((it, i) => typeof it === "string"
    ? { image: it, title: `Momento ${i + 1}`, desc: "Descubra o nosso sabor", price: "" }
    : { image: it.image, title: it.title || `Momento ${i + 1}`, desc: it.desc || "", price: it.price || "" }
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lockRef = useRef(false);

  const next = () => setIndex((v) => Math.min(items.length - 1, v + 1));
  const prev = () => setIndex((v) => Math.max(0, v - 1));

  // SE O ADMIN ESCOLHER CLASSIC, MOSTRA GRELHA SIMPLES
  if (experience === "classic") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-10 bg-[#1a1412]">
        {items.map((it, i) => (
          <button key={i} onClick={() => setSelected(i)} className="rounded-2xl overflow-hidden">
            <img src={it.image} alt={it.title} className="w-full h-56 object-cover" />
            <p className="text-white text-left p-2 text-sm">{it.title}</p>
          </button>
        ))}
        {selected !== null && <Lightbox items={items} selected={selected} setSelected={setSelected} />}
      </div>
    );
  }

  // IMERSIVO: SÓ O SCROLL HORIZONTAL MUDA DE FOTO. VERTICAL PASSA DIRETO.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (lockRef.current) return;
      e.preventDefault();
      lockRef.current = true;
      if (e.deltaX > 0) next(); else prev();
      setTimeout(() => { lockRef.current = false; }, 400);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [items.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    touchStart.current = null;
  };

  const current = items[index];

  return (
    <div className="bg-[#1a1412] overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="px-6 pt-8 pb-4 text-center">
        <h2 className="font-serif text-4xl text-white">Momentos</h2>
        <p className="text-gray-400 text-sm mt-2">Desliza para o lado ou clica numa foto para ver com zoom</p>
      </div>

      <div className="px-4 md:px-6 pb-8 flex flex-col items-center">
        <div className="relative w-full max-w-3xl">
          <img key={current.image} src={current.image} alt={current.title} onClick={() => setSelected(index)}
            className="w-full h-[55vh] md:h-[62vh] object-cover rounded-[2rem] shadow-2xl cursor-zoom-in animate-[galleryZoom_0.5s_ease-out]" />
          <div key={current.title} className="bg-white rounded-2xl p-4 shadow-xl -mt-8 mx-4 relative animate-[galleryUp_0.4s_ease-out]">
            <p className="text-xs tracking-[0.25em] uppercase" style={{ color: primary }}>{index + 1} / {items.length}</p>
            <h3 className="font-serif text-2xl font-bold text-black">{current.title}</h3>
            <p className="text-sm text-gray-600">{current.desc}</p>
            {current.price && <p className="text-sm font-bold" style={{ color: primary }}>{current.price}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 w-full max-w-3xl">
          <button onClick={prev} className="w-11 h-11 shrink-0 rounded-full bg-white text-black font-bold">←</button>
          <div className="flex gap-2 overflow-x-auto flex-1 py-1">
            {items.map((it, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === index ? "scale-110 border-white" : "opacity-50 border-transparent"}`}>
                <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button onClick={next} className="w-11 h-11 shrink-0 rounded-full bg-white text-black font-bold">→</button>
        </div>
      </div>

      {selected !== null && <Lightbox items={items} selected={selected} setSelected={setSelected} />}
      <style>{`@keyframes galleryZoom{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}} @keyframes galleryUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function Lightbox({ items, selected, setSelected }: { items: any[]; selected: number; setSelected: (v: number | null) => void }) {
  const [rotate, setRotate] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const it = items[selected];

  useEffect(() => { setRotate(0); }, [selected]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
      onClick={() => setSelected(null)}
      onTouchStart={(e) => { start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        if (!start.current) return;
        const dx = e.changedTouches[0].clientX - start.current.x;
        if (Math.abs(dx) > 60) {
          if (dx < 0) setSelected(Math.min(items.length - 1, selected + 1));
          else setSelected(Math.max(0, selected - 1));
        }
        start.current = null;
      }}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img key={it.image} src={it.image} alt=""
          className="max-w-[92vw] max-h-[78vh] object-contain rounded-2xl transition-transform duration-500 animate-[galleryZoom_0.4s_ease-out]"
          style={{ transform: `rotate(${rotate}deg)` }}
          draggable={false}
        />
      </div>
      <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setSelected(Math.max(0, selected - 1))} className="w-11 h-11 rounded-full bg-white text-black font-bold">←</button>
        <button onClick={() => setRotate((r) => r - 90)} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">↺ Girar</button>
        <span className="text-white text-sm font-bold px-2">{selected + 1} / {items.length}</span>
        <button onClick={() => setRotate((r) => r + 90)} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold">Girar ↻</button>
        <button onClick={() => setSelected(Math.min(items.length - 1, selected + 1))} className="w-11 h-11 rounded-full bg-white text-black font-bold">→</button>
        <button onClick={() => setSelected(null)} className="ml-2 w-11 h-11 rounded-full bg-red-500 text-white font-bold">✕</button>
      </div>
      <p className="text-white/60 text-xs mt-2">Desliza para o lado para trocar de foto • Clica em Girar para rodar</p>
    </div>
  );
}