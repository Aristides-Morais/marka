import { useRef, useEffect } from "react";

type Props = {
  images: string[];
  primary: string;
  secondary: string;
};

export default function Gallery3D({ images, primary, secondary }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Aplica o efeito de rotação contínua com CSS puro
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".gallery-card");
    if (!cards) return;
    
    cards.forEach((card, index) => {
      const el = card as HTMLElement;
      el.style.transform = `rotateY(${index * 15}deg) translateZ(${index * 20}px)`;
      el.style.transitionDelay = `${index * 0.1}s`;
    });
  }, [images]);

  return (
    <div className="relative w-full py-20 overflow-hidden bg-[#1a1412]" ref={containerRef}>
      <div className="flex gap-6 px-6 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="gallery-card group relative w-[280px] h-[380px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 hover:scale-105 hover:z-20"
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            <img src={img} alt={`Prato ${idx + 1}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition duration-500">
              <p className="font-serif text-lg font-bold">Prato Especial</p>
              <p className="text-xs text-white/80">Descubra o nosso sabor</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}