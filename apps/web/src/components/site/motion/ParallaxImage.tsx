import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
};

export default function ParallaxImage({ src, alt, className = "", speed = 0.1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementCenter = rect.top + rect.height / 2 + scrollY;
      const windowCenter = scrollY + window.innerHeight / 2;
      const distance = windowCenter - elementCenter;
      
      // Aplica o movimento de parallax
      setOffset(distance * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Chamada inicial
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${offset}px) scale(1.15)` }}
      />
    </div>
  );
}