import { useEffect } from "react";

export function useSEO(title: string, description: string) {
  useEffect(() => {
    // Atualiza o título da página (aba do browser)
    document.title = title;

    // Atualiza ou cria a meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
  }, [title, description]);
}