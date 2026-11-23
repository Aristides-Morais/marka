import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Props = {
  business: {
    id: string;
    name: string;
    slug: string;
  };
  onClose: () => void;
};

type SiteContent = Record<string, unknown>;

export default function SiteContentEditor({ business, onClose }: Props) {
  const [content, setContent] = useState<SiteContent>({});
  const [jsonText, setJsonText] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContent() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch<{
          content?: SiteContent;
          isPublished?: boolean;
          publishedAt?: string | null;
        }>(
          `/api/v1/super-admin/businesses/${business.id}/site-content`
        );

        if (active) {
          const loaded = response.content || {};
          setContent(loaded);
          setJsonText(JSON.stringify(loaded, null, 2));
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar o conteúdo do site.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, [business.id]);

  function updateField(field: string, value: string) {
    setContent((current) => {
      const updated = { ...current, [field]: value };
      setJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  }

  function updateJson(value: string) {
    setJsonText(value);

    try {
      const parsed = JSON.parse(value);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        setError("O conteúdo deve ser um objecto JSON.");
        return;
      }

      setContent(parsed as SiteContent);
      setError("");
    } catch {
      setError("O JSON introduzido não é válido.");
    }
  }

  async function saveContent() {
    let parsed: SiteContent;

    try {
      parsed = JSON.parse(jsonText);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        throw new Error("JSON inválido");
      }
    } catch {
      setError("Corrige o JSON antes de guardar.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiFetch(
        `/api/v1/super-admin/businesses/${business.id}/site-content/draft`,
        {
          method: "PUT",
          body: JSON.stringify({ content: parsed }),
        }
      );

      setContent(parsed);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMessage("Rascunho guardado com sucesso.");
    } catch {
      setError("Não foi possível guardar o conteúdo.");
    } finally {
      setSaving(false);
    }
  }

  async function publishContent() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiFetch(
        `/api/v1/super-admin/businesses/${business.id}/site-content/publish`,
        { method: "POST" }
      );

      setMessage("Site publicado com sucesso.");
    } catch {
      setError("Não foi possível publicar o site. Guarda primeiro o rascunho.");
    } finally {
      setSaving(false);
    }
  }

  async function unpublishContent() {
    const confirmed = window.confirm(
      "Tens a certeza de que pretendes retirar este site do ar?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiFetch(
        `/api/v1/super-admin/businesses/${business.id}/site-content/unpublish`,
        { method: "POST" }
      );

      setMessage("Publicação retirada.");
    } catch {
      setError("Não foi possível retirar a publicação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 md:p-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-5 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-black text-white">
              Editor do site
            </h2>
            <p className="text-sm text-zinc-400">
              {business.name} · /{business.slug}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm"
          >
            Fechar
          </button>
        </div>

        <div className="p-5 md:p-7">
          {loading ? (
            <p className="text-zinc-400">A carregar conteúdo...</p>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Título principal
                  </label>

                  <input
                    value={String(content.heroTitle || "")}
                    onChange={(e) =>
                      updateField("heroTitle", e.target.value)
                    }
                    placeholder="Título do site"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Subtítulo
                  </label>

                  <input
                    value={String(content.heroSubtitle || "")}
                    onChange={(e) =>
                      updateField("heroSubtitle", e.target.value)
                    }
                    placeholder="Descrição principal"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Texto do botão principal
                  </label>

                  <input
                    value={String(content.buttonText || "")}
                    onChange={(e) =>
                      updateField("buttonText", e.target.value)
                    }
                    placeholder="Ex.: Fazer reserva"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300 mb-2">
                    Imagem principal (URL)
                  </label>

                  <input
                    value={String(content.heroImage || "")}
                    onChange={(e) =>
                      updateField("heroImage", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-zinc-300 mb-2">
                    Texto de apresentação
                  </label>

                  <textarea
                    rows={5}
                    value={String(content.description || "")}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Apresentação do negócio..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-y"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-zinc-300 mb-2">
                    Conteúdo completo (JSON)
                  </label>

                  <textarea
                    rows={14}
                    value={jsonText}
                    onChange={(e) => updateJson(e.target.value)}
                    spellCheck={false}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-xs resize-y"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveContent}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm"
                >
                  {saving ? "A guardar..." : "Guardar rascunho"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={publishContent}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm"
                >
                  Publicar site
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={unpublishContent}
                  className="bg-red-600/10 text-red-400 hover:bg-red-600/20 disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm"
                >
                  Retirar publicação
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}