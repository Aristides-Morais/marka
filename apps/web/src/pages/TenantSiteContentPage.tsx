import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  apiFetch,
  getAccessToken,
  setAccessToken,
  setTenantSlug,
} from "../lib/api";

type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  buttonText?: string;
  heroImage?: string;
  description?: string;
  aboutTitle?: string;
  aboutText?: string;
  gallery?: string[];
  servicesTitle?: string;
  galleryTitle?: string;
  contactTitle?: string;
  visualIdentity?: Record<string, string>;
};

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-700";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-600";

export default function TenantSiteContentPage() {
  const { slug = "" } = useParams();

  const [authenticated, setAuthenticated] = useState(
    Boolean(getAccessToken())
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState<SiteContent>({});
  const [jsonText, setJsonText] = useState("{}");

  const [businessName, setBusinessName] = useState(slug);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [published, setPublished] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function updateContent(patch: Partial<SiteContent>) {
    setContent((old) => {
      const next = { ...old, ...patch };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function updateIdentity(patch: Record<string, string>) {
    const identity = content.visualIdentity || {};

    updateContent({
      visualIdentity: {
        ...identity,
        ...patch,
      },
    });
  }

  async function loadContent() {
    setLoading(true);
    setError("");

    try {
      const [draft, business] = await Promise.all([
        apiFetch<{
          content?: SiteContent;
          isPublished?: boolean;
        }>("/api/v1/site-content/draft", {
          tenant: slug,
        }),

        apiFetch<{ name: string }>("/api/v1/business/info", {
          skipAuth: true,
          tenant: slug,
        }),
      ]);

      const data = draft.content || {};

      setContent(data);
      setJsonText(JSON.stringify(data, null, 2));
      setPublished(Boolean(draft.isPublished));
      setBusinessName(business.name);

      setAuthenticated(true);
      setTenantSlug(slug);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAuthenticated(false);
        setAccessToken(null);
      } else {
        setError(
          err?.message || "Não foi possível carregar o conteúdo."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTenantSlug(slug);

    if (getAccessToken()) {
      loadContent();
    }
  }, [slug]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<{ token: string }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
          skipAuth: true,
          tenant: slug,
        }
      );

      setAccessToken(result.token);
      setTenantSlug(slug);
      setAuthenticated(true);

      await loadContent();
    } catch (err: any) {
      setError(err?.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft() {
    let parsed: SiteContent;

    try {
      parsed = JSON.parse(jsonText);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        throw new Error("Formato inválido");
      }
    } catch {
      setError("O conteúdo JSON não é válido.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/api/v1/site-content/draft", {
        method: "PUT",
        body: JSON.stringify({
          content: parsed,
        }),
        tenant: slug,
      });

      setContent(parsed);
      setJsonText(JSON.stringify(parsed, null, 2));

      setNotice("Rascunho guardado com sucesso.");
    } catch (err: any) {
      setError(err?.message || "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function publishWebsite() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/api/v1/site-content/publish", {
        method: "POST",
        tenant: slug,
      });

      setPublished(true);
      setNotice("Website publicado com sucesso.");
    } catch (err: any) {
      setError(
        err?.message || "Guarde primeiro o rascunho."
      );
    } finally {
      setSaving(false);
    }
  }

  async function unpublishWebsite() {
    const confirmed = window.confirm(
      "Pretende retirar a publicação do website? O conteúdo será mantido."
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch("/api/v1/site-content/unpublish", {
        method: "POST",
        tenant: slug,
      });

      setPublished(false);
      setNotice(
        "Publicação retirada. O conteúdo continua guardado."
      );
    } catch (err: any) {
      setError(
        err?.message || "Não foi possível retirar a publicação."
      );
    } finally {
      setSaving(false);
    }
  }

  const identity = content.visualIdentity || {};

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl border bg-white p-7 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">
            MARKA-KANDA · {slug}
          </p>

          <h1 className="mt-3 text-2xl font-black text-zinc-900">
            Editor do website
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Entre com as credenciais de administrador desta empresa.
          </p>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className={`${labelClass} mt-5`}>
            Email
          </label>

          <input
            className={inputClass}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className={`${labelClass} mt-4`}>
            Palavra-passe
          </label>

          <input
            className={inputClass}
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>

          <Link
            to={`/${slug}`}
            className="mt-4 block text-center text-sm text-zinc-500"
          >
            Voltar ao website
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-7 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">
              MARKA-KANDA · EDITOR
            </p>

            <h1 className="mt-1 text-2xl font-black text-zinc-900">
              {businessName}
            </h1>

            <p className="text-sm text-zinc-500">
              Edite o conteúdo do website da sua empresa.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/${slug}`}
              target="_blank"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-bold text-zinc-700"
            >
              Ver website ↗
            </Link>

            <button
              onClick={() => {
                setAccessToken(null);
                setAuthenticated(false);
              }}
              className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600"
            >
              Sair
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {notice && (
          <p className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <section className="mb-5 rounded-2xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Estado do website
              </h2>

              <p className="text-sm text-zinc-500">
                {published
                  ? "Actualmente publicado"
                  : "Ainda não está publicado"}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                published
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {published ? "PUBLICADO" : "RASCUNHO"}
            </span>
          </div>
        </section>

        {loading ? (
          <p className="py-10 text-center">A carregar...</p>
        ) : (
          <>
            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Apresentação principal
              </h2>

              <p className="mb-5 text-sm text-zinc-500">
                Título, descrição e imagem de destaque.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className={labelClass}>
                    Título principal
                  </span>

                  <input
                    className={inputClass}
                    value={content.heroTitle || ""}
                    onChange={(event) =>
                      updateContent({
                        heroTitle: event.target.value,
                      })
                    }
                    placeholder="Título do website"
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Subtítulo
                  </span>

                  <input
                    className={inputClass}
                    value={content.heroSubtitle || ""}
                    onChange={(event) =>
                      updateContent({
                        heroSubtitle: event.target.value,
                      })
                    }
                    placeholder="Uma frase sobre o negócio"
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Texto do botão
                  </span>

                  <input
                    className={inputClass}
                    value={content.buttonText || ""}
                    onChange={(event) =>
                      updateContent({
                        buttonText: event.target.value,
                      })
                    }
                    placeholder="Marcar horário"
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    URL da imagem principal
                  </span>

                  <input
                    className={inputClass}
                    value={content.heroImage || ""}
                    onChange={(event) =>
                      updateContent({
                        heroImage: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>
                    Texto sobre a empresa
                  </span>

                  <textarea
                    className={inputClass}
                    rows={4}
                    value={content.description || ""}
                    onChange={(event) =>
                      updateContent({
                        description: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Identidade visual
              </h2>

              <p className="mb-5 text-sm text-zinc-500">
                Escolha as cores da sua marca.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[
                  ["primaryColor", "Cor principal", "#512638"],
                  ["secondaryColor", "Cor secundária", "#B99A75"],
                  ["background", "Fundo", "#F8F4EF"],
                  ["surface", "Fundo dos cartões", "#FFFFFF"],
                  ["text", "Texto", "#35232B"],
                  ["muted", "Texto secundário", "#817078"],
                  ["border", "Linhas e bordas", "#E7DDD5"],
                ].map(([key, label, fallback]) => (
                  <label key={key}>
                    <span className={labelClass}>{label}</span>

                    <div className="flex items-center gap-3 rounded-xl border p-2">
                      <input
                        aria-label={label}
                        type="color"
                        value={identity[key] || fallback}
                        onChange={(event) =>
                          updateIdentity({
                            [key]: event.target.value,
                          })
                        }
                        className="h-10 w-12 cursor-pointer border-0 bg-transparent"
                      />

                      <span className="text-xs font-mono text-zinc-500">
                        {identity[key] || fallback}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Galeria de fotografias
              </h2>

              <p className="mb-4 text-sm text-zinc-500">
                Coloque um endereço de imagem por linha.
              </p>

              <textarea
                className={`${inputClass} font-mono text-xs`}
                rows={6}
                value={
                  Array.isArray(content.gallery)
                    ? content.gallery.join("\n")
                    : ""
                }
                onChange={(event) =>
                  updateContent({
                    gallery: event.target.value
                      .split("\n")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={
                  "https://.../foto1.jpg\nhttps://.../foto2.jpg"
                }
              />

              {Array.isArray(content.gallery) &&
                content.gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {content.gallery.slice(0, 6).map((url, index) => (
                      <img
                        key={`${url}-${index}`}
                        src={url}
                        alt={`Fotografia ${index + 1}`}
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Títulos das secções
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className={labelClass}>
                    Título dos serviços
                  </span>

                  <input
                    className={inputClass}
                    value={content.servicesTitle || ""}
                    onChange={(event) =>
                      updateContent({
                        servicesTitle: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Título da galeria
                  </span>

                  <input
                    className={inputClass}
                    value={content.galleryTitle || ""}
                    onChange={(event) =>
                      updateContent({
                        galleryTitle: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>
                    Título dos contactos
                  </span>

                  <input
                    className={inputClass}
                    value={content.contactTitle || ""}
                    onChange={(event) =>
                      updateContent({
                        contactTitle: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Conteúdo avançado (JSON)
              </h2>

              <p className="mb-4 text-sm text-zinc-500">
                Configurações adicionais do website.
              </p>

              <textarea
                className={`${inputClass} font-mono text-xs`}
                rows={12}
                spellCheck={false}
                value={jsonText}
                onChange={(event) => {
                  setJsonText(event.target.value);

                  try {
                    const parsed = JSON.parse(event.target.value);

                    if (
                      parsed &&
                      typeof parsed === "object" &&
                      !Array.isArray(parsed)
                    ) {
                      setContent(parsed);
                      setError("");
                    } else {
                      setError(
                        "O conteúdo deve ser um objecto JSON."
                      );
                    }
                  } catch {
                    setError(
                      "JSON inválido. Corrija antes de guardar."
                    );
                  }
                }}
              />
            </section>

            <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
              <button
                disabled={saving}
                onClick={saveDraft}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "A guardar..." : "Guardar rascunho"}
              </button>

              <button
                disabled={saving}
                onClick={publishWebsite}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Publicar website
              </button>

              <button
                disabled={saving || !published}
                onClick={unpublishWebsite}
                className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-50"
              >
                Retirar publicação
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}