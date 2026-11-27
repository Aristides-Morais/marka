import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import WebsitePage from "./WebsitePage";
import SiteAnimationRuntime from "../components/site/motion/SiteAnimationRuntime";

type BusinessInfo = {
  modules?: string[];
  theme?: {
    animation?: Record<string, unknown>;
  } | null;
};

export default function ModuleAwareWebsitePage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [modules, setModules] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<BusinessInfo>("/api/v1/business/info", {
      skipAuth: true,
      tenant: slug,
    })
      .then((data) => {
        if (!active) return;
        setBusiness(data);
        setModules(
          Array.isArray(data.modules)
            ? data.modules.map((m) => m.toLowerCase())
            : ["website", "store", "booking"]
        );
      })
      .catch(() => {
        if (!active) return;
        setBusiness(null);
        setModules([]);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (modules === null) {
    return <div style={{ padding: 30 }}>A carregar...</div>;
  }

  if (!modules.includes("website")) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <h2>Website indisponível</h2>
        <p>Este módulo não está activo neste negócio.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Animação escolhida no Super Admin - vem de business.theme.animation */}
      <SiteAnimationRuntime settings={business?.theme?.animation} />

      <style>
        {`
          ${modules.includes("store") ? "" : `a[href$="/loja"] { display: none !important; }`}
          ${modules.includes("booking") ? "" : `a[href$="/reservas"] { display: none !important; }`}
        `}
      </style>

      {/* O runtime procura por .site-animation-root, por isso tem de estar aqui */}
      <main className="site-animation-root">
        <WebsitePage />
      </main>
    </div>
  );
}