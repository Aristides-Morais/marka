import { useRef, useEffect, useState } from "react";

type Props = {
  images: string[];
  primary: string;
  secondary: string;
};

export default function Gallery3D({ images, primary, secondary }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Scroll com 2 dedos empurra as fotos para o lado - estilo SOLCO
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const maxX = trackRef.current ? trackRef.current.scrollWidth - window.innerWidth : 0;

  return (
    <div ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#1a1412] flex flex-col justify-center">
        <div className="px-6 mb-6">
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: secondary }}>Momentos</p>
          <h2 className="font-serif text-4xl md:text-6xl text-white mt-2">Desliza para ver</h2>
        </div>
        <div
          ref={trackRef}
          className="flex gap-6 px-6 will-change-transform"
          style={{ transform: `translateX(${-progress * maxX}px)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative w-[280px] md:w-[380px] h-[380px] md:h-[520px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
              <img src={img} alt={`Momento ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-serif text-lg font-bold">Momento {idx + 1}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Barra de progresso do scroll */}
        <div className="mx-6 mt-8 h-[3px] bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-none" style={{ width: `${progress * 100}%`, background: primary }} />
        </div>
      </div>
    </div>
  );
}