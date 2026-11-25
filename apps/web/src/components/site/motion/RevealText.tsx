import { useEffect, useRef, useState, createElement } from "react";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  delay?: number;
  once?: boolean;
};

export default function RevealText({
  text,
  className = "",
  as = "h2",
  delay = 0,
  once = true,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delay);
          if (once) obs.disconnect();
          return () => clearTimeout(timer);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, once]);

  const words = text.split(" ");

  return createElement(
    as,
    { ref: ref as React.RefObject<HTMLElement>, className },
    words.map((word, i) =>
      createElement(
        "span",
        {
          key: i,
          className: "inline-block transition-all duration-700 ease-out",
          style: {
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: `${i * 60}ms`,
          },
        },
        word,
        i < words.length - 1 ? "\u00A0" : ""
      )
    )
  );
}