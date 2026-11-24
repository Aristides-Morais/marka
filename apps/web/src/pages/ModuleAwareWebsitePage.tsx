
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import WebsitePage from "./WebsitePage";

type BusinessInfo = {
  modules?: string[];
};

export default function ModuleAwareWebsitePage() {
  const { slug = "" } = useParams();
  const [modules, setModules] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<BusinessInfo>("/api/v1/business/info", {
      skipAuth: true,
      tenant: slug,
    })
      .then((business) => {
        if (active) {
          setModules(
            Array.isArray(business.modules)
              ? business.modules.map((module) => module.toLowerCase())
              : ["website", "store", "booking"]
          );
        }
      })
      .catch(() => {
        if (active) setModules([]);
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
    <>
      <style>
        {`
          ${
            modules.includes("store")
              ? ""
              : `a[href$="/loja"] { display: none !important; }`
          }

          ${
            modules.includes("booking")
              ? ""
              : `a[href$="/reservas"] { display: none !important; }`
          }
        `}
      </style>
      <WebsitePage />
    </>
  );
}
