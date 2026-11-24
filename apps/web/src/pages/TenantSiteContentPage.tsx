import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  apiFetch,
  getAccessToken,
  setAccessToken,
  setTenantSlug,
  uploadImage,
} from "../lib/api";
import type { SiteContent, Testimonial, FaqItem, BlogPost } from "../lib/siteContent";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-700";
const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-600";
const sectionClass =
  "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TenantSiteContentPage() {
  const { slug = "" } = useParams();

  const [authenticated, setAuthenticated] = useState(Boolean(getAccessToken()));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState<SiteContent>({});
  const [jsonText, setJsonText] = useState("{}");
  const [businessName, setBusinessName] = useState(slug);
  const [tab, setTab] = useState<
    "home" | "about" | "testimonials" | "faq" | "blog" | "legal" | "seo" | "json"
  >("home");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [published, setPublished] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const identity = content.visualIdentity || {};

  function syncJson(next: SiteContent) {
    setJsonText(JSON.stringify(next, null, 2));
  }

  function updateContent(patch: Partial<SiteContent>) {
    setContent((old) => {
      const next = { ...old, ...patch };
      syncJson(next);
      return next;
    });
  }

  function updateIdentity(patch: Record<string, string>) {
    updateContent({
      visualIdentity: { ...(content.visualIdentity || {}), ...patch },
    });
  }

  async function loadContent() {
    setLoading(true);
    setError("");
    try {
      const [draft, business] = await Promise.all([
        apiFetch<{ content?: SiteContent; isPublished?: boolean }>(
          "/api/v1/site-content/draft",
          { tenant: slug }
        ),
        apiFetch<{ name: string }>("/api/v1/business/info", {
          skipAuth: true,
          tenant: slug,
        }),
      ]);
      const data = draft.content || {};
      setContent(data);
      syncJson(data);
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
    if (getAccessToken()) void loadContent();
  }, [slug]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<{ token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
        skipAuth: true,
        tenant: slug,
      });
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
    setSaving(true);
    setNotice("");
    setError("");
    try {
      let payload = content;
      if (tab === "json") {
        payload = JSON.parse(jsonText) as SiteContent;
        setContent(payload);
      }
      await apiFetch("/api/v1/site-content/draft", {
        method: "PUT",
        body: JSON.stringify({ content: payload }),
        tenant: slug,
      });
      setNotice("Rascunho guardado.");
    } catch (err: any) {
      setError(err?.message || "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await saveDraft();
      await apiFetch("/api/v1/site-content/publish", {
        method: "POST",
        tenant: slug,
      });
      setPublished(true);
      setNotice("Site publicado.");
    } catch (err: any) {
      setError(err?.message || "Erro ao publicar.");
    } finally {
      setSaving(false);
    }
  }

  async function unpublish() {
    setSaving(true);
    try {
      await apiFetch("/api/v1/site-content/unpublish", {
        method: "POST",
        tenant: slug,
      });
      setPublished(false);
      setNotice("Publicação desactivada.");
    } catch (err: any) {
      setError(err?.message || "Erro ao despublicar.");
    } finally {
      setSaving(false);
    }
  }

  async function onHeroFile(file: File) {
    setUploadingHero(true);
    try {
      const url = await uploadImage(file);
      updateContent({ heroImage: url });
    } catch (err: any) {
      setError(err?.message || "Falha no upload.");
    } finally {
      setUploadingHero(false);
    }
  }

  async function onGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        urls.push(await uploadImage(f));
      }
      updateContent({ gallery: [...(content.gallery || []), ...urls] });
    } catch (err: any) {
      setError(err?.message || "Falha no upload da galeria.");
    } finally {
      setUploadingGallery(false);
    }
  }

  /* ——— helpers listas ——— */
  function setTestimonials(list: Testimonial[]) {
    updateContent({ testimonials: list });
  }
  function setFaq(list: FaqItem[]) {
    updateContent({ faq: list });
  }
  function setPosts(list: BlogPost[]) {
    updateContent({ posts: list });
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-16">
        <form
          onSubmit={handleLogin}
          className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-2 text-xl font-semibold">Editor do website</h2>
          <p className="mb-6 text-sm text-zinc-500">/{slug}</p>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <label className={labelClass}>Email</label>
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className={`${labelClass} mt-4`}>Password</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "about", label: "Sobre" },
    { id: "testimonials", label: "Depoimentos" },
    { id: "faq", label: "FAQ" },
    { id: "blog", label: "Blog" },
    { id: "legal", label: "Legal" },
    { id: "seo", label: "SEO / Cores" },
    { id: "json", label: "JSON" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Editor do site
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">{businessName}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/${slug}`}
              target="_blank"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold"
            >
              Ver site
            </Link>
            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
            >
              {saving ? "A guardar…" : "Guardar rascunho"}
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={saving}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
            >
              Publicar
            </button>
            {published && (
              <button
                type="button"
                onClick={unpublish}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold"
              >
                Despublicar
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                tab === t.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {notice && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {loading && <p className="text-sm text-zinc-500">A carregar…</p>}

        {/* HOME */}
        {tab === "home" && (
          <div className="space-y-6">
            <div className={sectionClass}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500">
                Hero
              </h2>
              <label className={labelClass}>Título</label>
              <input
                className={inputClass}
                value={content.heroTitle || ""}
                onChange={(e) => updateContent({ heroTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Subtítulo</label>
              <textarea
                className={inputClass}
                rows={3}
                value={content.heroSubtitle || ""}
                onChange={(e) => updateContent({ heroSubtitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Texto do botão</label>
              <input
                className={inputClass}
                value={content.buttonText || ""}
                onChange={(e) => updateContent({ buttonText: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Imagem hero (URL ou upload)</label>
              <input
                className={inputClass}
                value={content.heroImage || ""}
                onChange={(e) => updateContent({ heroImage: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm"
                disabled={uploadingHero}
                onChange={(e) => e.target.files?.[0] && onHeroFile(e.target.files[0])}
              />
            </div>

            <div className={sectionClass}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500">
                Títulos de secção
              </h2>
              <label className={labelClass}>Título serviços</label>
              <input
                className={inputClass}
                value={content.servicesTitle || ""}
                onChange={(e) => updateContent({ servicesTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Título galeria</label>
              <input
                className={inputClass}
                value={content.galleryTitle || ""}
                onChange={(e) => updateContent({ galleryTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Título contactos</label>
              <input
                className={inputClass}
                value={content.contactTitle || ""}
                onChange={(e) => updateContent({ contactTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Intro contactos</label>
              <textarea
                className={inputClass}
                rows={2}
                value={content.contactIntro || ""}
                onChange={(e) => updateContent({ contactIntro: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Horário</label>
              <input
                className={inputClass}
                value={content.hours || ""}
                onChange={(e) => updateContent({ hours: e.target.value })}
              />
            </div>

            <div className={sectionClass}>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500">
                Galeria
              </h2>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingGallery}
                onChange={(e) => onGalleryFiles(e.target.files)}
              />
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(content.gallery || []).map((url, i) => (
                  <div key={url + i} className="relative">
                    <img src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white"
                      onClick={() =>
                        updateContent({
                          gallery: (content.gallery || []).filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {tab === "about" && (
          <div className={sectionClass}>
            <label className={labelClass}>Título</label>
            <input
              className={inputClass}
              value={content.aboutTitle || ""}
              onChange={(e) => updateContent({ aboutTitle: e.target.value })}
            />
            <label className={`${labelClass} mt-4`}>Texto</label>
            <textarea
              className={inputClass}
              rows={6}
              value={content.aboutText || content.description || ""}
              onChange={(e) =>
                updateContent({ aboutText: e.target.value, description: e.target.value })
              }
            />
            <label className={`${labelClass} mt-4`}>Missão</label>
            <textarea
              className={inputClass}
              rows={2}
              value={content.aboutMission || ""}
              onChange={(e) => updateContent({ aboutMission: e.target.value })}
            />
            <label className={`${labelClass} mt-4`}>Visão</label>
            <textarea
              className={inputClass}
              rows={2}
              value={content.aboutVision || ""}
              onChange={(e) => updateContent({ aboutVision: e.target.value })}
            />
            <label className={`${labelClass} mt-4`}>
              Valores (um por linha)
            </label>
            <textarea
              className={inputClass}
              rows={4}
              value={(content.aboutValues || []).join("\n")}
              onChange={(e) =>
                updateContent({
                  aboutValues: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        )}

        {/* TESTIMONIALS */}
        {tab === "testimonials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Título da secção</label>
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                onClick={() =>
                  setTestimonials([
                    ...(content.testimonials || []),
                    { id: uid(), name: "", text: "", role: "", rating: 5 },
                  ])
                }
              >
                + Depoimento
              </button>
            </div>
            <input
              className={inputClass}
              value={content.testimonialsTitle || ""}
              onChange={(e) => updateContent({ testimonialsTitle: e.target.value })}
            />
            {(content.testimonials || []).map((t, i) => (
              <div key={t.id} className={sectionClass}>
                <div className="mb-2 flex justify-between">
                  <span className="text-xs font-bold text-zinc-500">#{i + 1}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      setTestimonials((content.testimonials || []).filter((x) => x.id !== t.id))
                    }
                  >
                    Remover
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Nome"
                  value={t.name}
                  onChange={(e) => {
                    const list = [...(content.testimonials || [])];
                    list[i] = { ...t, name: e.target.value };
                    setTestimonials(list);
                  }}
                />
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Cargo / contexto"
                  value={t.role || ""}
                  onChange={(e) => {
                    const list = [...(content.testimonials || [])];
                    list[i] = { ...t, role: e.target.value };
                    setTestimonials(list);
                  }}
                />
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={3}
                  placeholder="Texto"
                  value={t.text}
                  onChange={(e) => {
                    const list = [...(content.testimonials || [])];
                    list[i] = { ...t, text: e.target.value };
                    setTestimonials(list);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        {tab === "faq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <input
                className={inputClass}
                placeholder="Título FAQ"
                value={content.faqTitle || ""}
                onChange={(e) => updateContent({ faqTitle: e.target.value })}
              />
              <button
                type="button"
                className="ml-2 shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                onClick={() =>
                  setFaq([...(content.faq || []), { id: uid(), question: "", answer: "" }])
                }
              >
                + Pergunta
              </button>
            </div>
            {(content.faq || []).map((f, i) => (
              <div key={f.id} className={sectionClass}>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => setFaq((content.faq || []).filter((x) => x.id !== f.id))}
                  >
                    Remover
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Pergunta"
                  value={f.question}
                  onChange={(e) => {
                    const list = [...(content.faq || [])];
                    list[i] = { ...f, question: e.target.value };
                    setFaq(list);
                  }}
                />
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={3}
                  placeholder="Resposta"
                  value={f.answer}
                  onChange={(e) => {
                    const list = [...(content.faq || [])];
                    list[i] = { ...f, answer: e.target.value };
                    setFaq(list);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* BLOG */}
        {tab === "blog" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Título do blog"
                value={content.blogTitle || ""}
                onChange={(e) => updateContent({ blogTitle: e.target.value })}
              />
              <button
                type="button"
                className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                onClick={() =>
                  setPosts([
                    ...(content.posts || []),
                    {
                      id: uid(),
                      title: "Novo artigo",
                      slug: `artigo-${uid()}`,
                      excerpt: "",
                      body: "",
                    },
                  ])
                }
              >
                + Artigo
              </button>
            </div>
            {(content.posts || []).map((p, i) => (
              <div key={p.id} className={sectionClass}>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => setPosts((content.posts || []).filter((x) => x.id !== p.id))}
                  >
                    Remover
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Título"
                  value={p.title}
                  onChange={(e) => {
                    const list = [...(content.posts || [])];
                    list[i] = { ...p, title: e.target.value };
                    setPosts(list);
                  }}
                />
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="slug-url"
                  value={p.slug}
                  onChange={(e) => {
                    const list = [...(content.posts || [])];
                    list[i] = { ...p, slug: e.target.value };
                    setPosts(list);
                  }}
                />
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={2}
                  placeholder="Resumo"
                  value={p.excerpt}
                  onChange={(e) => {
                    const list = [...(content.posts || [])];
                    list[i] = { ...p, excerpt: e.target.value };
                    setPosts(list);
                  }}
                />
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={5}
                  placeholder="Corpo do artigo"
                  value={p.body}
                  onChange={(e) => {
                    const list = [...(content.posts || [])];
                    list[i] = { ...p, body: e.target.value };
                    setPosts(list);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* LEGAL */}
        {tab === "legal" && (
          <div className="space-y-6">
            <div className={sectionClass}>
              <label className={labelClass}>Título privacidade</label>
              <input
                className={inputClass}
                value={content.privacyTitle || ""}
                onChange={(e) => updateContent({ privacyTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Texto privacidade</label>
              <textarea
                className={inputClass}
                rows={8}
                value={content.privacyBody || ""}
                onChange={(e) => updateContent({ privacyBody: e.target.value })}
              />
            </div>
            <div className={sectionClass}>
              <label className={labelClass}>Título termos</label>
              <input
                className={inputClass}
                value={content.termsTitle || ""}
                onChange={(e) => updateContent({ termsTitle: e.target.value })}
              />
              <label className={`${labelClass} mt-4`}>Texto termos</label>
              <textarea
                className={inputClass}
                rows={8}
                value={content.termsBody || ""}
                onChange={(e) => updateContent({ termsBody: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* SEO + CORES */}
        {tab === "seo" && (
          <div className="space-y-6">
            <div className={sectionClass}>
              <h2 className="mb-3 text-sm font-bold uppercase text-zinc-500">Cores</h2>
              {(
                [
                  ["primaryColor", "Principal"],
                  ["secondaryColor", "Secundária"],
                  ["background", "Fundo"],
                  ["text", "Texto"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="mb-3 flex items-center gap-3">
                  <label className="w-28 text-xs font-semibold text-zinc-600">{label}</label>
                  <input
                    type="color"
                    value={identity[key] || "#512638"}
                    onChange={(e) => updateIdentity({ [key]: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    value={identity[key] || ""}
                    onChange={(e) => updateIdentity({ [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className={sectionClass}>
              <h2 className="mb-3 text-sm font-bold uppercase text-zinc-500">SEO Home</h2>
              <input
                className={inputClass}
                placeholder="Title"
                value={content.seo?.home?.title || ""}
                onChange={(e) =>
                  updateContent({
                    seo: {
                      ...content.seo,
                      home: { ...content.seo?.home, title: e.target.value },
                    },
                  })
                }
              />
              <textarea
                className={`${inputClass} mt-2`}
                rows={2}
                placeholder="Meta description"
                value={content.seo?.home?.description || ""}
                onChange={(e) =>
                  updateContent({
                    seo: {
                      ...content.seo,
                      home: { ...content.seo?.home, description: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* JSON */}
        {tab === "json" && (
          <div className={sectionClass}>
            <p className="mb-2 text-xs text-zinc-500">
              Edição avançada. Guarda com o separador JSON activo para aplicar este texto.
            </p>
            <textarea
              className={`${inputClass} font-mono text-xs`}
              rows={24}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}