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

type ColorPalette = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

const colorPalettes: ColorPalette[] = [
  {
    name: "Luxo Editorial",
    primary: "#29211F",
    secondary: "#A87963",
    accent: "#F3EDE5",
    background: "#F8F5F0",
    surface: "#FFFFFF",
    text: "#29211F",
    muted: "#81766F",
    border: "#E8DED4",
  },
  {
    name: "Preto e Ouro",
    primary: "#171717",
    secondary: "#B99750",
    accent: "#E8D8B5",
    background: "#F7F5F0",
    surface: "#FFFFFF",
    text: "#222222",
    muted: "#77716A",
    border: "#DED8CC",
  },
  {
    name: "Gastronomia",
    primary: "#432B20",
    secondary: "#B58A45",
    accent: "#F3E8D7",
    background: "#F8F4ED",
    surface: "#FFFFFF",
    text: "#34251E",
    muted: "#827064",
    border: "#E9DED0",
  },
  {
    name: "Verde Natural",
    primary: "#183D32",
    secondary: "#A6B89A",
    accent: "#E8B04A",
    background: "#F4F6EF",
    surface: "#FFFFFF",
    text: "#26382D",
    muted: "#718074",
    border: "#DFE6D9",
  },
  {
    name: "Beleza Rosé",
    primary: "#633F50",
    secondary: "#B98591",
    accent: "#F2E6E8",
    background: "#FAF5F5",
    surface: "#FFFFFF",
    text: "#382B32",
    muted: "#897780",
    border: "#EADDE2",
  },
  {
    name: "Azul Executivo",
    primary: "#172F4D",
    secondary: "#3977A8",
    accent: "#DCE8F2",
    background: "#F5F7FA",
    surface: "#FFFFFF",
    text: "#182B40",
    muted: "#6E7C8B",
    border: "#DFE5EC",
  },
  {
    name: "Hotel Premium",
    primary: "#183B43",
    secondary: "#B49A6A",
    accent: "#E8E1D3",
    background: "#F5F3ED",
    surface: "#FFFFFF",
    text: "#203238",
    muted: "#718083",
    border: "#E1E2DB",
  },
  {
    name: "Terracota",
    primary: "#713F32",
    secondary: "#C17B5A",
    accent: "#EAD6C5",
    background: "#F8F2EC",
    surface: "#FFFFFF",
    text: "#382923",
    muted: "#88766D",
    border: "#E8DCD2",
  },
  {
    name: "Moderno",
    primary: "#252A34",
    secondary: "#697C91",
    accent: "#C4D600",
    background: "#F5F6F7",
    surface: "#FFFFFF",
    text: "#252A34",
    muted: "#737B85",
    border: "#E1E4E8",
  },
  {
    name: "Vinho e Champagne",
    primary: "#512638",
    secondary: "#B99A75",
    accent: "#EFE5D7",
    background: "#F8F4EF",
    surface: "#FFFFFF",
    text: "#35232B",
    muted: "#817078",
    border: "#E7DDD5",
  },
];
const ANIMATION_EXPERIENCES = [
  ["classic", "Classic - Sem animação forte"],
  ["store-3d", "Loja 3D (Blockbuster)"],
  ["immersive", "Scroll Imersivo (SOLCO)"],
  ["beauty", "Beauty / Suave (brune)"],
  ["real-estate", "Real Estate - Zoom suave"],
  ["corporate", "Corporate - Troca de Cor"],
  ["color-theme", "A1 - Troca de Cor (Vernizes)"],
  ["drag-3d", "A4 - Arrastar 3D (brune)"],
  ["fade-up", "Fade Up - Sobe suave"],
  ["zoom-hero", "Zoom Hero - Zoom gigante"],
  ["slide-cards", "Slide Cards - Entra de lado"],
  ["parallax-forte", "Parallax Forte"],
] as const;

const colorFields = [
  {
    key: "primaryColor",
    label: "Cor principal",
    fallback: "#29211F",
  },
  {
    key: "secondaryColor",
    label: "Segunda cor",
    fallback: "#A87963",
  },
  {
    key: "accentColor",
    label: "Terceira cor / destaque",
    fallback: "#F3EDE5",
  },
];

const neutralFields = [
  {
    key: "background",
    label: "Fundo",
    fallback: "#F8F5F0",
  },
  {
    key: "surface",
    label: "Superfície",
    fallback: "#FFFFFF",
  },
  {
    key: "text",
    label: "Texto",
    fallback: "#29211F",
  },
  {
    key: "muted",
    label: "Texto secundário",
    fallback: "#81766F",
  },
  {
    key: "border",
    label: "Bordas",
    fallback: "#E8DED4",
  },
];

export default function SiteContentEditor({
  business,
  onClose,
}: Props) {
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
      const updated = {
        ...current,
        [field]: value,
      };

      setJsonText(JSON.stringify(updated, null, 2));

      return updated;
    });
  }

  function updateVisualIdentity(values: Record<string, unknown>) {
    setContent((current) => {
      const currentIdentity =
        current.visualIdentity &&
        typeof current.visualIdentity === "object"
          ? (current.visualIdentity as Record<string, unknown>)
          : {};

      const updated = {
        ...current,
        visualIdentity: {
          ...currentIdentity,
          ...values,
        },
      };

      setJsonText(JSON.stringify(updated, null, 2));

      return updated;
    });

    setError("");
  }
    // CONFIGURAÇÕES DE ANIMAÇÃO DO WEBSITE
  function getAnimations(): Record<string, unknown> {
    const currentAnimations = content.animations;

    const defaults: Record<string, unknown> = {
  enabled: true,
  experience: "classic",
  intensity: "normal",
  reveal: "fade-up",
  hero: "cinematic",
  hover: "lift",
  duration: 850,
  stagger: 90,
  parallax: true,
};
    if (
      !currentAnimations ||
      typeof currentAnimations !== "object" ||
      Array.isArray(currentAnimations)
    ) {
      return defaults;
    }

    return {
      ...defaults,
      ...(currentAnimations as Record<string, unknown>),
    };
  }

  function updateAnimations(values: Record<string, unknown>) {
    setContent((current) => {
      const currentAnimations =
        current.animations &&
        typeof current.animations === "object" &&
        !Array.isArray(current.animations)
          ? (current.animations as Record<string, unknown>)
          : {};

      const updated = {
  ...current,
  animations: {
    enabled: true,
    experience: "classic",
    intensity: "normal",
    reveal: "fade-up",
    hero: "cinematic",
    hover: "lift",
    duration: 850,
    stagger: 90,
    parallax: true,
    ...currentAnimations,
    ...values,
  },
};
      setJsonText(JSON.stringify(updated, null, 2));

      return updated;
    });

    setError("");
    setMessage("Configurações de animação actualizadas no rascunho.");
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

  function getIdentity() {
    return (
      content.visualIdentity &&
      typeof content.visualIdentity === "object"
        ? (content.visualIdentity as Record<string, unknown>)
        : {}
    );
  }

  function getSavedPalettes(): ColorPalette[] {
    const saved = getIdentity().savedPalettes;

    return Array.isArray(saved)
      ? (saved as ColorPalette[])
      : [];
  }

  function applyPalette(palette: ColorPalette) {
    updateVisualIdentity({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      background: palette.background,
      surface: palette.surface,
      text: palette.text,
      muted: palette.muted,
      border: palette.border,
    });

    setMessage(`Combinação "${palette.name}" seleccionada.`);
  }

  function saveCurrentPalette() {
    const name = window.prompt(
      "Qual será o nome desta combinação de cores?"
    );

    if (!name?.trim()) return;

    const identity = getIdentity();

    const palette: ColorPalette = {
      name: name.trim(),
      primary: String(identity.primaryColor || "#29211F"),
      secondary: String(identity.secondaryColor || "#A87963"),
      accent: String(identity.accentColor || "#F3EDE5"),
      background: String(identity.background || "#F8F5F0"),
      surface: String(identity.surface || "#FFFFFF"),
      text: String(identity.text || "#29211F"),
      muted: String(identity.muted || "#81766F"),
      border: String(identity.border || "#E8DED4"),
    };

    updateVisualIdentity({
      savedPalettes: [...getSavedPalettes(), palette],
    });

    setMessage(`Combinação "${name}" guardada no rascunho.`);
  }

  function deleteSavedPalette(index: number) {
    const confirmed = window.confirm(
      "Pretendes eliminar esta combinação personalizada?"
    );

    if (!confirmed) return;

    const updated = getSavedPalettes().filter(
      (_, paletteIndex) => paletteIndex !== index
    );

    updateVisualIdentity({
      savedPalettes: updated,
    });

    setMessage("Combinação eliminada do rascunho.");
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
      setError(
        "Não foi possível publicar o site. Guarda primeiro o rascunho."
      );
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

  const identity = getIdentity();
  const savedPalettes = getSavedPalettes();

  function colorValue(key: string, fallback: string) {
    return String(identity[key] || fallback);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 md:p-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

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
            <p className="text-zinc-400">
              A carregar conteúdo...
            </p>
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

              {/* IDENTIDADE VISUAL */}

              <section className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Identidade visual
                  </h3>

                  <p className="text-sm text-zinc-400 mt-1">
                    Escolhe uma combinação de três cores ou cria a tua
                    própria identidade visual.
                  </p>
                </div>

                {/* BIBLIOTECA */}

                <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                  Biblioteca de combinações
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => applyPalette(palette)}
                      className="text-left rounded-xl border border-zinc-700 hover:border-emerald-500 p-3 transition"
                    >
                      <div className="flex h-12 overflow-hidden rounded-lg mb-3">
                        <div
                          className="flex-1"
                          style={{ background: palette.primary }}
                        />
                        <div
                          className="flex-1"
                          style={{ background: palette.secondary }}
                        />
                        <div
                          className="flex-1"
                          style={{ background: palette.accent }}
                        />
                      </div>

                      <span className="text-sm font-semibold text-white">
                        {palette.name}
                      </span>

                      <span className="block text-xs text-zinc-500 mt-1">
                        Aplicar combinação
                      </span>
                    </button>
                  ))}
                </div>

                {/* PALETAS PERSONALIZADAS */}

                {savedPalettes.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                      As minhas combinações
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedPalettes.map((palette, index) => (
                        <div
                          key={`${palette.name}-${index}`}
                          className="rounded-xl border border-zinc-700 p-3"
                        >
                          <button
                            type="button"
                            onClick={() => applyPalette(palette)}
                            className="w-full text-left"
                          >
                            <div className="flex h-12 overflow-hidden rounded-lg mb-3">
                              <div
                                className="flex-1"
                                style={{ background: palette.primary }}
                              />
                              <div
                                className="flex-1"
                                style={{ background: palette.secondary }}
                              />
                              <div
                                className="flex-1"
                                style={{ background: palette.accent }}
                              />
                            </div>

                            <span className="text-sm font-semibold text-white">
                              {palette.name}
                            </span>

                            <span className="block text-xs text-zinc-500 mt-1">
                              Aplicar combinação
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSavedPalette(index)}
                            className="text-xs text-red-400 hover:text-red-300 mt-3"
                          >
                            Eliminar combinação
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TRÊS CORES */}

                <div className="border-t border-zinc-800 mt-7 pt-6">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                    Personalizar as três cores
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {colorFields.map((field) => (
                      <label
                        key={field.key}
                        className="text-sm text-zinc-300"
                      >
                        {field.label}

                        <div className="flex items-center gap-3 mt-2 rounded-lg border border-zinc-700 p-2">
                          <input
                            type="color"
                            value={colorValue(
                              field.key,
                              field.fallback
                            )}
                            onChange={(e) =>
                              updateVisualIdentity({
                                [field.key]: e.target.value,
                              })
                            }
                            className="h-10 w-12 cursor-pointer bg-transparent"
                          />

                          <span className="text-xs text-zinc-400">
                            {colorValue(
                              field.key,
                              field.fallback
                            ).toUpperCase()}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* CORES COMPLEMENTARES */}

                <div className="border-t border-zinc-800 mt-7 pt-6">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                    Tons complementares
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {neutralFields.map((field) => (
                      <label
                        key={field.key}
                        className="text-xs text-zinc-400"
                      >
                        {field.label}

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="color"
                            value={colorValue(
                              field.key,
                              field.fallback
                            )}
                            onChange={(e) =>
                              updateVisualIdentity({
                                [field.key]: e.target.value,
                              })
                            }
                            className="h-9 w-10 cursor-pointer bg-transparent"
                          />

                          <span>
                            {colorValue(
                              field.key,
                              field.fallback
                            ).toUpperCase()}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GUARDAR COMBINAÇÃO */}

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={saveCurrentPalette}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
                  >
                    Guardar combinação personalizada
                  </button>
                </div>

                {/* PRÉ-VISUALIZAÇÃO */}

                <div className="mt-7">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                    Pré-visualização da identidade
                  </h4>

                  <div
                    className="rounded-xl overflow-hidden border border-zinc-700"
                    style={{
                      background: colorValue(
                        "background",
                        "#F8F5F0"
                      ),
                      color: colorValue("text", "#29211F"),
                    }}
                  >
                    <div className="p-6 md:p-8">
                      <span className="text-xs tracking-widest">
                        IDENTIDADE DO NEGÓCIO
                      </span>

                      <h3 className="text-3xl font-bold mt-3">
                        {business.name}
                      </h3>

                      <p
                        className="text-sm mt-2"
                        style={{
                          color: colorValue("muted", "#81766F"),
                        }}
                      >
                        Uma apresentação com identidade própria.
                      </p>

                      <div className="flex flex-wrap gap-2 mt-6">
                        {colorFields.map((field) => (
                          <span
                            key={field.key}
                            className="rounded-lg px-4 py-3 text-xs font-semibold"
                            style={{
                              background: colorValue(
                                field.key,
                                field.fallback
                              ),
                              color:
                                field.key === "accentColor"
                                  ? colorValue("text", "#29211F")
                                  : "#FFFFFF",
                            }}
                          >
                            {field.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ANIMAÇÕES DO WEBSITE */}
              <section className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 md:p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Animações do website
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Controla os efeitos visuais deste website.
                    Estas definições são geridas pelo Super Admin.
                  </p>
                </div>

                {/* ACTIVAR ANIMAÇÕES */}
                <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 p-4">
                  <span>
                    <span className="block text-white font-semibold">
                      Activar animações
                    </span>
                    <span className="block text-sm text-zinc-400 mt-1">
                      Permitir efeitos de movimento no website.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={Boolean(getAnimations().enabled)}
                    onChange={(e) =>
                      updateAnimations({ enabled: e.target.checked })
                    }
                    className="h-5 w-5 accent-emerald-500"
                  />
                </label>
{/* EXPERIÊNCIA GLOBAL - IGUAL AO SUPER ADMIN */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  <div>
    <label className="block text-sm text-zinc-300 mb-2">
      Experiência global do site (igual ao Super Admin)
    </label>
    <select
      value={String(getAnimations().experience || "classic")}
      onChange={(e) => {
        updateAnimations({ experience: e.target.value });
        // Mantém o reveal sincronizado para o site reagir logo
        if (e.target.value === "fade-up") updateAnimations({ reveal: "fade-up" });
        if (e.target.value === "zoom-hero") updateAnimations({ reveal: "zoom", hero: "zoom" });
        if (e.target.value === "slide-cards") updateAnimations({ reveal: "slide-left" });
        if (e.target.value === "parallax-forte") updateAnimations({ parallax: true });
      }}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white"
    >
      {ANIMATION_EXPERIENCES.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
    <p className="text-xs text-zinc-500 mt-1">
      Esta é a mesma lista do Super Admin. Escolhe aqui e guarda + publica.
    </p>
  </div>

  <div>
    <label className="block text-sm text-zinc-300 mb-2">
      Intensidade
    </label>
    <select
      value={String(getAnimations().intensity || "normal")}
      onChange={(e) => updateAnimations({ intensity: e.target.value })}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white"
    >
      <option value="subtle">Suave</option>
      <option value="normal">Normal</option>
      <option value="bold">Forte</option>
    </select>
  </div>
</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* EFEITO DE ENTRADA */}
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Efeito de entrada ao fazer scroll
                    </label>

                    <select
                      value={String(getAnimations().reveal)}
                      
                      onChange={(e) =>
                        updateAnimations({ reveal: e.target.value })
                      }
                      
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="fade-up">Fade + subir</option>
                      <option value="fade">Fade simples</option>
                      <option value="slide-left">Deslizar da esquerda</option>
                      <option value="slide-right">Deslizar da direita</option>
                      <option value="zoom">Zoom suave</option>
                      <option value="blur">Desfoque suave</option>
                      <option value="flip">Rotação 3D</option>
                    </select>
                  </div>

                  {/* EFEITO PRINCIPAL */}
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Efeito do destaque principal
                    </label>

                    <select
                      value={String(getAnimations().hero)}
                      onChange={(e) =>
                        updateAnimations({ hero: e.target.value })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="cinematic">Cinemático</option>
                      <option value="zoom">Zoom lento</option>
                      <option value="float">Flutuação suave</option>
                      <option value="none">Sem efeito</option>
                    </select>
                  </div>

                  {/* EFEITO HOVER */}
                  <div>
                    <label className="block text-sm text-zinc-300 mb-2">
                      Efeito ao passar o rato
                    </label>

                    <select
                      value={String(getAnimations().hover)}
                      onChange={(e) =>
                        updateAnimations({ hover: e.target.value })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="lift">Elevação</option>
                      <option value="glow">Brilho</option>
                      <option value="scale">Aumentar ligeiramente</option>
                      <option value="none">Sem efeito</option>
                    </select>
                  </div>

                  {/* PARALLAX */}
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 p-4">
                    <span>
                      <span className="block text-white font-semibold">
                        Movimento Parallax
                      </span>
                      <span className="block text-sm text-zinc-400 mt-1">
                        Movimento suave durante o scroll.
                      </span>
                    </span>

                    <input
                      type="checkbox"
                      checked={Boolean(getAnimations().parallax)}
                      onChange={(e) =>
                        updateAnimations({ parallax: e.target.checked })
                      }
                      className="h-5 w-5 accent-emerald-500"
                    />
                  </label>
                </div>

                {/* DURAÇÃO */}
                <div className="rounded-xl border border-zinc-800 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-white font-semibold">
                      Duração da animação
                    </label>

                    <span className="text-emerald-400 font-bold tabular-nums">
                      {Number(getAnimations().duration)} ms
                    </span>
                  </div>

                  <input
                    type="range"
                    min="150"
                    max="2000"
                    step="50"
                    value={Number(getAnimations().duration)}
                    onChange={(e) =>
                      updateAnimations({
                        duration: Number(e.target.value),
                      })
                    }
                    disabled={!Boolean(getAnimations().enabled)}
                    className="w-full accent-emerald-500 disabled:opacity-40"
                  />

                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>150 ms — Rápida</span>
                    <span>2.000 ms — Lenta</span>
                  </div>
                </div>

                {/* INTERVALO */}
                <div className="rounded-xl border border-zinc-800 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-white font-semibold">
                      Intervalo entre elementos
                    </label>

                    <span className="text-emerald-400 font-bold tabular-nums">
                      {Number(getAnimations().stagger)} ms
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={Number(getAnimations().stagger)}
                    onChange={(e) =>
                      updateAnimations({
                        stagger: Number(e.target.value),
                      })
                    }
                    disabled={!Boolean(getAnimations().enabled)}
                    className="w-full accent-emerald-500 disabled:opacity-40"
                  />

                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>0 ms — Simultâneo</span>
                    <span>500 ms — Sequencial</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  As alterações ficam no conteúdo do rascunho.
                  Para serem apresentadas aos visitantes, será necessário
                  guardar e publicar o website.
                </p>
              </section>

{/* EDITAR CADA PÁGINA */}
<section className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 md:p-6 space-y-5 mt-6">
  <h2 className="text-xl font-bold text-white">Editar cada página</h2>
  <p className="text-sm text-zinc-400">Tudo o que mudares aqui aparece nessa página, com a mesma animação global.</p>

  {[
    ["loja", "Loja", "lojaTitle", "lojaSubtitle", "lojaImage"],
    ["reservas", "Reservas / Booking", "reservasTitle", "reservasSubtitle", "reservasImage"],
    ["sobre", "Sobre", "sobreTitle", "sobreSubtitle", "sobreImage"],
    ["galeria", "Galeria", "galeriaTitle", "galeriaSubtitle", "galeriaImage"],
    ["blog", "Blog", "blogTitle", "blogSubtitle", "blogImage"],
    ["eventos", "Eventos", "eventosTitle", "eventosSubtitle", "eventosImage"],
    ["menu", "Menu / Takeaway", "menuTitle", "menuSubtitle", "menuImage"],
    ["contactos", "Contactos", "contactosTitle", "contactosSubtitle", "contactosImage"],
  ].map(([key, label, titleKey, subKey, imgKey]) => (
    <div key={key} className="border border-zinc-800 rounded-xl p-4 space-y-3">
      <h3 className="font-bold text-white">{label}</h3>
      <input value={String(content[titleKey] || "")} onChange={(e) => updateField(titleKey, e.target.value)} placeholder={`Título - ${label}`} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
      <input value={String(content[subKey] || "")} onChange={(e) => updateField(subKey, e.target.value)} placeholder={`Subtítulo - ${label}`} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
      <input value={String(content[imgKey] || "")} onChange={(e) => updateField(imgKey, e.target.value)} placeholder={`Imagem (URL) - ${label} https://...`} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white" />
    </div>
  ))}
</section>

              {/* CONTEÚDO DO WEBSITE */}

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

                            {/* ACÇÕES */}

              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveContent}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm text-white"
                >
                  {saving ? "A guardar..." : "Guardar rascunho"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={publishContent}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm text-white"
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

              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold"
                >
                  ✓ {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold"
                >
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}