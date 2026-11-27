import { useEffect, useMemo } from "react";

type Experience =
  | "classic"
  | "store-3d"
  | "immersive"
  | "beauty"
  | "real-estate"
  | "corporate"
  | "color-theme"
  | "drag-3d"
  | "fade-up"
  | "zoom-hero"
  | "slide-cards"
  | "parallax-forte";

type Props = {
  settings?: Record<string, unknown> | null;
  preview?: boolean;
};

type AnimationSettings = {
  enabled: boolean;
  experience: Experience;
  intensity: "subtle" | "normal" | "bold";
  duration: number;
  stagger: number;
  parallax: boolean;
  hover: boolean;
};

const DEFAULTS: AnimationSettings = {
  enabled: true,
  experience: "classic",
  intensity: "normal",
  duration: 800,
  stagger: 90,
  parallax: true,
  hover: true,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readSettings(value?: Record<string, unknown> | null): AnimationSettings {
  const source = value || {};
  const experiences: Experience[] = [
    "classic",
    "store-3d",
    "immersive",
    "beauty",
    "real-estate",
    "corporate",
    "color-theme",
    "drag-3d",
    "fade-up",
    "zoom-hero",
    "slide-cards",
    "parallax-forte",
  ];
  const requestedExperience = String(source.experience || DEFAULTS.experience) as Experience;
  const intensity = String(source.intensity || "normal");
  return {
    enabled: source.enabled !== false,
    experience: experiences.includes(requestedExperience) ? requestedExperience : "classic",
    intensity: intensity === "subtle" || intensity === "bold" ? intensity : "normal",
    duration: clamp(Number(source.duration ?? 800) || 800, 200, 2000),
    stagger: clamp(Number(source.stagger ?? 90), 0, 400),
    parallax: source.parallax !== false,
    hover: source.hover !== false,
  };
}

export default function SiteAnimationRuntime({ settings, preview = false }: Props) {
  const settingsKey = JSON.stringify(settings ?? {});
const config = useMemo(() => readSettings(settings), [settingsKey]);

  useEffect(() => {
    const root =
      document.querySelector<HTMLElement>(".site-animation-root") ||
      document.querySelector<HTMLElement>("main");
    if (!root) return;

    const previousExperience = root.dataset.siteExperience;
    const previousPreview = root.dataset.sitePreview;

    root.dataset.siteExperience = config.experience;
    root.dataset.sitePreview = preview ? "true" : "false";
    root.dataset.siteIntensity = config.intensity;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const active = config.enabled && !reducedMotion;
    root.dataset.siteMotion = active ? "on" : "off";

    const style = document.createElement("style");
    style.dataset.siteAnimationRuntime = "true";
    style.textContent = `
      .site-animation-root [data-site-reveal] {
        opacity: 0;
        transform: translate3d(0, 26px, 0);
        transition: opacity var(--site-duration, 800ms) cubic-bezier(.2,.7,.2,1), transform var(--site-duration, 800ms) cubic-bezier(.2,.7,.2,1);
        transition-delay: var(--site-delay, 0ms);
        will-change: opacity, transform;
      }
      .site-animation-root [data-site-reveal].is-site-visible { opacity: 1; transform: none; }
      .site-animation-root [data-site-hover] { transition: transform 450ms ease, box-shadow 450ms ease; }
      .site-animation-root[data-site-motion="on"] [data-site-hover]:hover {
        transform: translateY(-8px) scale(1.015);
        box-shadow: 0 24px 60px rgba(0,0,0,.16);
      }
      /* 6 ANTIGAS */
      .site-animation-root[data-site-experience="store-3d"] [data-site-depth] { perspective: 1100px; }
      .site-animation-root[data-site-experience="store-3d"] [data-site-depth] img { transition: transform 900ms ease; }
      .site-animation-root[data-site-experience="store-3d"] [data-site-depth]:hover img { transform: translateZ(45px) scale(1.07); }
      .site-animation-root[data-site-experience="immersive"] [data-site-scene],
      .site-animation-root[data-site-experience="real-estate"] [data-site-scene] { overflow: hidden; isolation: isolate; }
      .site-animation-root[data-site-experience="immersive"] [data-site-scene] img,
      .site-animation-root[data-site-experience="real-estate"] [data-site-scene] img { transition: transform 1400ms ease; }
      .site-animation-root[data-site-experience="immersive"] [data-site-scene].is-site-visible img { transform: scale(1.045); }
      .site-animation-root[data-site-experience="real-estate"] [data-site-scene].is-site-visible img { transform: scale(1); }
      .site-animation-root[data-site-experience="beauty"] [data-site-reveal] { transform: translateY(18px) scale(.98); filter: blur(2px); }
      .site-animation-root[data-site-experience="beauty"] [data-site-reveal].is-site-visible { filter: blur(0); }
      .site-animation-root[data-site-experience="corporate"] [data-site-reveal] { transform: translateY(10px); }
      /* 6 NOVAS */
      .site-animation-root[data-site-experience="color-theme"] [data-site-reveal] { transition: background-color 600ms ease, color 600ms ease, opacity 800ms ease, transform 800ms ease; }
      .site-animation-root[data-site-experience="drag-3d"] [data-site-depth] { perspective: 1200px; cursor: grab; }
      .site-animation-root[data-site-experience="drag-3d"] [data-site-depth]:active { cursor: grabbing; }
      .site-animation-root[data-site-experience="drag-3d"] [data-site-depth] img { transition: transform 500ms ease; }
      .site-animation-root[data-site-experience="drag-3d"] [data-site-depth]:hover img { transform: rotateY(12deg) rotateX(4deg) scale(1.06); }
      .site-animation-root[data-site-experience="fade-up"] [data-site-reveal] { transform: translateY(40px); }
      .site-animation-root[data-site-experience="fade-up"] [data-site-reveal].is-site-visible { transform: none; }
      .site-animation-root[data-site-experience="zoom-hero"] [data-site-scene] { overflow: hidden; }
      .site-animation-root[data-site-experience="zoom-hero"] [data-site-scene] img { transition: transform 1600ms ease; transform: scale(1.25); }
      .site-animation-root[data-site-experience="zoom-hero"] [data-site-scene].is-site-visible img { transform: scale(1.02); }
      .site-animation-root[data-site-experience="slide-cards"] [data-site-reveal] { transform: translateX(-60px); opacity: 0; }
      .site-animation-root[data-site-experience="slide-cards"] [data-site-reveal].is-site-visible { transform: none; opacity: 1; }
      .site-animation-root[data-site-experience="parallax-forte"] [data-site-scene] { overflow: hidden; }
      .site-animation-root[data-site-experience="parallax-forte"] [data-site-scene] img { transition: transform 800ms ease; transform: scale(1.2); }
      .site-animation-root[data-site-intensity="subtle"] [data-site-reveal] { transform: translateY(12px); }
      .site-animation-root[data-site-intensity="bold"] [data-site-reveal] { transform: translateY(48px); }
      /* Paleta flutuante da color-theme */
      .marka-color-palette { position: fixed; bottom: 88px; right: 16px; z-index: 90; display: flex; gap: 8px; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); padding: 8px; border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,.18); }
      .marka-color-palette button { width: 28px; height: 28px; border-radius: 999px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,.2); cursor: pointer; }
      @media (prefers-reduced-motion: reduce) {
        .site-animation-root *, .site-animation-root *::before, .site-animation-root *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
        .site-animation-root [data-site-reveal] { opacity: 1 !important; transform: none !important; }
      }
    `;
    document.head.appendChild(style);
    root.style.setProperty("--site-duration", `${config.duration}ms`);

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-site-reveal], main > section, .site-section"));
    targets.forEach((element, index) => {
      element.setAttribute("data-site-reveal", "true");
      element.style.setProperty("--site-delay", `${(index % 5) * config.stagger}ms`);
      if (config.experience === "store-3d" || config.experience === "drag-3d") element.setAttribute("data-site-depth", "true");
      if (["immersive", "real-estate", "zoom-hero", "parallax-forte"].includes(config.experience)) element.setAttribute("data-site-scene", "true");
      if (config.hover && element.matches("article, .group, [data-card], a")) element.setAttribute("data-site-hover", "true");
    });

    // A1 - color-theme: paleta flutuante que muda as cores do site
    let paletteEl: HTMLDivElement | null = null;
    if (active && config.experience === "color-theme") {
      paletteEl = document.createElement("div");
      paletteEl.className = "marka-color-palette";
      const palettes = [
        ["#183D32", "#E8B04A"], ["#633B55", "#D8A6B8"], ["#173B67", "#F2A900"], ["#111111", "#D94343"], ["#087F8C", "#75C9B7"],
      ];
      palettes.forEach(([p, s]) => {
        const b = document.createElement("button");
        b.style.background = `linear-gradient(135deg, ${p} 50%, ${s} 50%)`;
        b.onclick = () => {
          document.documentElement.style.setProperty("--marka-primary", p);
          document.documentElement.style.setProperty("--marka-secondary", s);
          root.style.setProperty("--marka-primary", p);
        };
        paletteEl!.appendChild(b);
      });
      document.body.appendChild(paletteEl);
    }

    let observer: IntersectionObserver | null = null;
    if (active && "IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("is-site-visible"); observer?.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
      targets.forEach((element) => observer?.observe(element));
    } else {
      targets.forEach((element) => element.classList.add("is-site-visible"));
    }

    let frame = 0;
    const onScroll = () => {
      if (!active || !config.parallax || !["immersive", "real-estate", "parallax-forte", "zoom-hero"].includes(config.experience)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewport = window.innerHeight || 1;
        root.querySelectorAll<HTMLElement>("[data-site-scene]").forEach((scene) => {
          const rect = scene.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > viewport) return;
          const progress = (viewport - rect.top) / (viewport + rect.height);
          const distance = config.experience === "parallax-forte" ? 60 : config.intensity === "bold" ? 34 : config.intensity === "subtle" ? 10 : 20;
          const movement = (progress - 0.5) * distance;
          scene.style.setProperty("--site-parallax-y", `${movement}px`);
          const image = scene.querySelector<HTMLElement>("img");
          if (image) image.style.translate = `0 ${(-movement * 0.35).toFixed(1)}px`;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

        return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      style.remove();
      paletteEl?.remove();
      targets.forEach((element) => {
        element.classList.remove("is-site-visible");
        element.style.removeProperty("--site-delay");
        element.removeAttribute("data-site-reveal");
        element.removeAttribute("data-site-depth");
        element.removeAttribute("data-site-scene");
        element.removeAttribute("data-site-hover");
        element.querySelectorAll<HTMLElement>("img").forEach((img) => img.style.removeProperty("translate"));
      });
      root.style.removeProperty("--site-duration");
      // NÃO apagar dataset aqui - senão volta a classic entre renders
    };
  }, [config, preview]);

  return null;
}