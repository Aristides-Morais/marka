
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  apiFetch,
  getAccessToken,
  setAccessToken,
  setTenantSlug,
  uploadImage,
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
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [published, setPublished] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const identity = content.visualIdentity || {};

  function updateContent(patch: Partial<SiteContent>) {
    setContent((old) => {
      const next = { ...old, ...patch };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function updateIdentity(patch: Record<string, string>) {
    updateContent({
      visualIdentity: {
        ...(content.visualIdentity || {}),
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
        setError(err?.message || "Não foi possível carregar o conteúdo.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTenantSlug(slug);

    if (getAccessToken()) {
      void loadContent();
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
        body: JSON.stringify({ content: parsed }),
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
      setError(err?.message || "Guarde primeiro o rascunho.");
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
      setNotice("Publicação retirada. O conteúdo continua guardado.");
    } catch (err: any) {
      setError(err?.message || "Não foi possível retirar a publicação.");
    } finally {
      setSaving(false);
    }
  }

  async function handleHeroUpload(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona um ficheiro de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem não pode ultrapassar 5 MB.");
      return;
    }

    setUploadingHero(true);
    setError("");
    setNotice("");

    try {
      const url = await uploadImage(file, slug);
      updateContent({ heroImage: url });
      setNotice("Imagem principal carregada. Guarda o rascunho.");
    } catch (err: any) {
      setError(err?.message || "Não foi possível carregar a imagem.");
    } finally {
      setUploadingHero(false);
    }
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files);

    if (selected.some((file) => !file.type.startsWith("image/"))) {
      setError("Todos os ficheiros devem ser imagens.");
      return;
    }

    if (selected.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Cada imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploadingGallery(true);
    setError("");
    setNotice("");

    try {
      const urls = await Promise.all(
        selected.map((file) => uploadImage(file, slug))
      );

      updateContent({
        gallery: [...(content.gallery || []), ...urls],
      });

      setNotice(
        `${urls.length} imagem(ns) carregada(s). Guarda o rascunho.`
      );
    } catch (err: any) {
      setError(err?.message || "Não foi possível carregar a galeria.");
    } finally {
      setUploadingGallery(false);
    }
  }

  function previewDraft() {
    try {
      const parsed: SiteContent = JSON.parse(jsonText);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        throw new Error("Formato inválido");
      }

      localStorage.setItem(
        `marka_site_preview_${slug}`,
        JSON.stringify(parsed)
      );

      window.open(`/${slug}?preview=1`, "_blank", "noopener,noreferrer");
    } catch {
      setError("Corrige o JSON antes de pré-visualizar.");
    }
  }

  function removeGalleryImage(index: number) {
    updateContent({
      gallery: (content.gallery || []).filter(
        (_image, imageIndex) => imageIndex !== index
      ),
    });
  }

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

          <label className={`${labelClass} mt-5`}>Email</label>
          <input
            className={inputClass}
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className={`${labelClass} mt-4`}>Palavra-passe</label>
          <input
            className={inputClass}
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 font-bold text-white disabled:opacity-50"
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
              Personalize o website da sua empresa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={previewDraft}
              className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white"
            >
              Pré-visualizar
            </button>

            <Link
              to={`/${slug}`}
              target="_blank"
              className="rounded-xl border bg-white px-4 py-3 text-sm font-bold text-zinc-700"
            >
              Website público ↗
            </Link>

            <button
              type="button"
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
              <h2 className="text-lg font-bold">Estado do website</h2>
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
                Título, subtítulo, botão e imagem de destaque.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className={labelClass}>Título principal</span>
                  <input
                    className={inputClass}
                    value={content.heroTitle || ""}
                    onChange={(event) =>
                      updateContent({ heroTitle: event.target.value })
                    }
                    placeholder="Título do website"
                  />
                </label>

                <label>
                  <span className={labelClass}>Subtítulo</span>
                  <input
                    className={inputClass}
                    value={content.heroSubtitle || ""}
                    onChange={(event) =>
                      updateContent({ heroSubtitle: event.target.value })
                    }
                    placeholder="Uma frase sobre o negócio"
                  />
                </label>

                <label>
                  <span className={labelClass}>Texto do botão</span>
                  <input
                    className={inputClass}
                    value={content.buttonText || ""}
                    onChange={(event) =>
                      updateContent({ buttonText: event.target.value })
                    }
                    placeholder="Marcar horário"
                  />
                </label>

                <label>
                  <span className={labelClass}>URL da imagem principal</span>
                  <input
                    className={inputClass}
                    value={content.heroImage || ""}
                    onChange={(event) =>
                      updateContent({ heroImage: event.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>Carregar imagem principal</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingHero}
                    className={inputClass}
                    onChange={(event) => {
                      void handleHeroUpload(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    Máximo de 5 MB. A imagem será enviada para o Cloudinary.
                  </span>
                  {uploadingHero && (
                    <span className="mt-2 block text-sm text-zinc-500">
                      A carregar imagem...
                    </span>
                  )}
                </label>

                {content.heroImage && (
                  <div className="md:col-span-2">
                    <img
                      src={content.heroImage}
                      alt="Imagem principal"
                      className="h-52 w-full rounded-xl object-cover"
                    />
                  </div>
                )}

                <label className="md:col-span-2">
                  <span className={labelClass}>Texto sobre a empresa</span>
                  <textarea
                    className={inputClass}
                    rows={4}
                    value={content.description || ""}
                    onChange={(event) =>
                      updateContent({ description: event.target.value })
                    }
                    placeholder="Apresente a sua empresa aos visitantes..."
                  />
                </label>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">Identidade visual</h2>
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
                          updateIdentity({ [key]: event.target.value })
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
                Carregue fotografias ou coloque um endereço de imagem por linha.
              </p>

              <label className="mb-4 block">
                <span className={labelClass}>Carregar fotografias</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={uploadingGallery}
                  className={inputClass}
                  onChange={(event) => {
                    void handleGalleryUpload(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="mt-1 block text-xs text-zinc-500">
                  Cada imagem pode ter até 5 MB.
                </span>
                {uploadingGallery && (
                  <span className="mt-2 block text-sm text-zinc-500">
                    A carregar fotografias...
                  </span>
                )}
              </label>

              <textarea
                className={`${inputClass} font-mono text-xs`}
                rows={5}
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
                placeholder={"https://.../foto1.jpg\nhttps://.../foto2.jpg"}
              />

              {Array.isArray(content.gallery) &&
                content.gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {content.gallery.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Fotografia ${index + 1}`}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-1 text-xs font-bold text-white"
                        >
                          Remover
                        </button>
                      </div>
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
                  <span className={labelClass}>Título dos serviços</span>
                  <input
                    className={inputClass}
                    value={content.servicesTitle || ""}
                    onChange={(event) =>
                      updateContent({ servicesTitle: event.target.value })
                    }
                    placeholder="Os nossos serviços"
                  />
                </label>

                <label>
                  <span className={labelClass}>Título da galeria</span>
                  <input
                    className={inputClass}
                    value={content.galleryTitle || ""}
                    onChange={(event) =>
                      updateContent({ galleryTitle: event.target.value })
                    }
                    placeholder="Os nossos trabalhos"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className={labelClass}>Título dos contactos</span>
                  <input
                    className={inputClass}
                    value={content.contactTitle || ""}
                    onChange={(event) =>
                      updateContent({ contactTitle: event.target.value })
                    }
                    placeholder="Vamos conversar?"
                  />
                </label>
              </div>
            </section>

            <section className="mb-5 rounded-2xl border bg-white p-5 md:p-7">
              <h2 className="mb-1 text-lg font-bold">
                Conteúdo avançado (JSON)
              </h2>
              <p className="mb-4 text-sm text-zinc-500">
                Configurações adicionais. Altera esta área apenas se souberes
                o que estás a modificar.
              </p>

              <textarea
                className={`${inputClass} font-mono text-xs`}
                rows={14}
                spellCheck={false}
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
              />
            </section>
          </>
        )}

        <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void saveDraft()}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "A guardar..." : "Guardar rascunho"}
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={previewDraft}
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-800 disabled:opacity-50"
          >
            Pré-visualizar
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void publishWebsite()}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Publicar website
          </button>

          <button
            type="button"
            disabled={saving || loading || !published}
            onClick={() => void unpublishWebsite()}
            className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 disabled:opacity-50"
          >
            Retirar publicação
          </button>
        </div>
      </div>
    </main>
  );
}
