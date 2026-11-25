import { useEffect, useRef, useState } from "react";

export function useScrollDrivenScene(enabled = true) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const hero = document.getElementById("inicio");
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const total = window.innerHeight || 1;
        const scrolled = Math.min(Math.max(-rect.top / total, 0), 1);
        setProgress(scrolled);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  return progress;
}