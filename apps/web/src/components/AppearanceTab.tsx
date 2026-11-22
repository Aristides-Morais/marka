import { useEffect, useState, type ChangeEvent } from "react";
import { apiFetch } from "../lib/api";
import {
  FONTS,
  HEX,
  PRESETS,
  EMPTY_EXTRA,
  fontStack,
  heroSize,
  isDark,
  loadFont,
  normalizeUrl,
  parseExtra,
  prettyName,
  textOn,
  type ExtraTheme,
  type LinkItem,
  type Preset,
} from "../lib/theme";

const SWATCHES = [
  "#FFFFFF", "#F4F4F5", "#FEF3C7", "#FFEDD5", "#FCE7F3", "#EDE9FE", "#DBEAFE", "#DCFCE7",
  "#000000", "#18181B", "#1E293B", "#4C1D95", "#7C3AED", "#DB2777", "#DC2626", "#EA580C",
  "#EAB308", "#16A34A", "#0284C7", "#C9A227",
];
const SUGESTOES = ["Instagram", "Facebook", "Tripadvisor", "Google", "LinkedIn", "Outro"];

type T = ExtraTheme & {
  name: string;
  logoUrl: string;
  primaryColor: string;
  storeBgColor: string;
  storeBgImage: string;
  storeHeroTitle: string;
  storeHeroSubtitle: string;
  storeHeroImage: string;
  bookingBgColor: string;
  bookingBgImage: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  mapsUrl: string;
  links: LinkItem[];
};

const EMPTY: T = {
  ...EMPTY_EXTRA,
  name: "",
  logoUrl: "",
  primaryColor: "#1A4D2E",
  storeBgColor: "",
  storeBgImage: "",
  storeHeroTitle: "",
  storeHeroSubtitle: "",
  storeHeroImage: "",
  bookingBgColor: "",
  bookingBgImage: "",
  fontFamily: "",
  heroTitle: "",
  heroSubtitle: "",
  mapsUrl: "",
  links: [],
};

type ColorRowProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (c: string) => void;
  clearable?: boolean;
};

function ColorRow({ label, hint, value, onChange, clearable = true }: ColorRowProps) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);

  function typeHex(v: string) {
    let x = v.trim();
    if (x && !x.startsWith("#")) x = "#" + x;
    setHex(x);
    if (HEX.test(x)) onChange(x.toUpperCase());
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold">{label}</label>
        {clearable && value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full font-semibold">
            Automático
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-zinc-500 -mt-1">{hint}</p>}
      <div className="flex flex-wrap gap-1.5">
        {SWATCHES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => onChange(c)}
            className="w-7 h-7 rounded-full border-2"
            style={{ backgroundColor: c, borderColor: value.toUpperCase() === c ? "#2563eb" : "#d4d4d8" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={HEX.test(value) ? value : "#FFFFFF"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="w-14 h-10 rounded-lg cursor-pointer border p-1 bg-white"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => typeHex(e.target.value)}
          placeholder={clearable ? "Automático" : "#FFFFFF"}
          maxLength={7}
          className="w-32 border rounded-lg px-3 py-2 text-sm font-mono uppercase"
        />
      </div>
    </div>
  );
}

type ImageFieldProps = {
  label: string;
  image: string;
  uploading: boolean;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function ImageField({ label, image, uploading, onFile, onRemove }: ImageFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input type="file" accept="image/*" onChange={onFile} className="w-full text-sm" />
      {uploading && <p className="text-xs text-zinc-500 mt-1">A enviar imagem...</p>}
      {image && (
        <div className="mt-2 flex items-center gap-3">
          <img src={image} className="w-20 h-14 object-cover rounded-lg border" />
          <button type="button" onClick={onRemove} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-semibold">
            Remover imagem
          </button>
        </div>
      )}
    </div>
  );
}

function FontSelect({ label, value, onChange, emptyLabel }: { label: string; value: string; onChange: (f: string) => void; emptyLabel: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          loadFont(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full border rounded-lg px-3 py-3 text-base bg-white"
        style={{ fontFamily: fontStack(value) }}
      >
        <option value="">{emptyLabel}</option>
        {FONTS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <p className="text-xl" style={{ fontFamily: fontStack(value) }}>
        Aa Bb Cc 123 — {value || emptyLabel}
      </p>
    </div>
  );
}

function StorePreview({ t }: { t: T }) {
  const p = HEX.test(t.primaryColor) ? t.primaryColor : "#1A4D2E";
  const pageBg = t.storeBgColor || "#F4F5F7";
  const headerBg = t.headerBg || "#FFFFFF";
  const bannerBg = t.bannerBg || "";
  const cardBg = t.cardBg || "#FFFFFF";
  const body = fontStack(t.fontFamily);
  const heading = fontStack(t.headingFont || t.fontFamily);
  const title = t.storeHeroTitle || `Bem-vindo à ${prettyName(t.name) || "nossa loja"}`;
  const words = title.split(" ");
  const last = !t.titleColor && words.length > 1 ? words.pop() : "";
  const first = words.join(" ");
  const titleColor = t.titleColor || (bannerBg ? textOn(bannerBg) : "#111827");
  const subColor = t.subtitleColor || (bannerBg && isDark(bannerBg) ? "rgba(255,255,255,0.85)" : "#4B5563");

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-sm"
      style={{
        backgroundColor: pageBg,
        backgroundImage: t.storeBgImage ? `url(${t.storeBgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: body,
      }}
    >
      <div className="px-3 py-2 flex items-center justify-between border-b" style={{ backgroundColor: headerBg, color: textOn(headerBg) }}>
        <div className="flex items-center gap-2 min-w-0">
          {t.logoUrl ? (
            <img src={t.logoUrl} className="w-6 h-6 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-6 h-6 shrink-0 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: p }}>
              {(t.name || "L").charAt(0)}
            </div>
          )}
          <span className="text-[11px] font-bold leading-tight line-clamp-2 break-words" style={{ fontFamily: heading }}>
            {prettyName(t.name) || "A tua loja"}
          </span>
        </div>
        <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: p }} />
      </div>

      <div className="p-3 space-y-3">
        <div className="rounded-xl overflow-hidden grid grid-cols-2" style={{ background: bannerBg || `linear-gradient(135deg, ${p}1A, #FFFFFF)` }}>
          <div className="p-3 flex flex-col justify-center min-w-0">
            <p className="text-sm font-extrabold leading-tight break-words" style={{ color: titleColor, fontFamily: heading, overflowWrap: "anywhere" }}>
              {first} {last && <span style={{ color: p }}>{last}</span>}
            </p>
            <p className="text-[10px] mt-1 line-clamp-2" style={{ color: subColor }}>
              {t.storeHeroSubtitle || "Descobre os nossos produtos."}
            </p>
            <span className="mt-2 text-[10px] px-2 py-1 rounded-full self-start" style={{ backgroundColor: p, color: textOn(p) }}>
              Ver produtos
            </span>
          </div>
          {t.storeHeroImage ? (
            <img src={t.storeHeroImage} className="w-full h-full object-cover" />
          ) : (
            <div className="min-h-[80px]" style={{ background: `linear-gradient(135deg, ${p}, ${p}99)` }} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl p-2" style={{ backgroundColor: cardBg, color: textOn(cardBg) }}>
              <div className="aspect-square bg-black/5 rounded-lg mb-2" />
              <p className="text-[11px] font-semibold" style={{ fontFamily: heading }}>Produto {i}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-extrabold" style={{ color: p }}>5.000 Kz</span>
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: p, color: textOn(p) }}>+</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingPreview({ t }: { t: T }) {
  const p = HEX.test(t.primaryColor) ? t.primaryColor : "#1A4D2E";
  const bg = t.bookingBgColor || "#F4F4F5";
  const onDark = !!t.bookingBgImage || isDark(bg);
  const titleColor = t.bookingTitleColor || (onDark ? "#FFFFFF" : "#18181B");
  const subColor = t.bookingSubtitleColor || (onDark ? "rgba(255,255,255,0.8)" : "#52525B");
  const text = t.heroTitle || prettyName(t.name) || "O teu negócio";

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-sm p-4 space-y-3"
      style={{
        backgroundColor: bg,
        backgroundImage: t.bookingBgImage ? `url(${t.bookingBgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: fontStack(t.fontFamily),
      }}
    >
      <p className="font-bold leading-tight break-words" style={{ color: titleColor, fontFamily: fontStack(t.headingFont || t.fontFamily), fontSize: `calc(${heroSize(text)} / 2.4)`, overflowWrap: "anywhere" }}>
        {text}
      </p>
      <p className="text-[11px]" style={{ color: subColor }}>{t.heroSubtitle || "Faz a tua reserva online"}</p>
      <div className="rounded-xl px-3 py-2.5 text-xs font-semibold" style={{ backgroundColor: p, color: textOn(p) }}>Reservar →</div>
      <div className="rounded-xl px-3 py-2.5 text-xs font-semibold text-center bg-white text-zinc-900">Ir para a Loja</div>
    </div>
  );
}

type Props = { slug?: string; onToast: (message: string, type: "success" | "error") => void };

export default function AppearanceTab({ slug, onToast }: Props) {
  const [t, setT] = useState<T>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"store" | "booking" | "hero" | null>(null);

  useEffect(() => {
    FONTS.forEach(loadFont);
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
      .then((b) =>
        setT({
          ...parseExtra(b.theme),
          name: b.name || "",
          logoUrl: b.logoUrl || "",
          primaryColor: b.primaryColor || "#1A4D2E",
          storeBgColor: b.storeBgColor || "",
          storeBgImage: b.storeBgImage || "",
          storeHeroTitle: b.storeHeroTitle || "",
          storeHeroSubtitle: b.storeHeroSubtitle || "",
          storeHeroImage: b.storeHeroImage || "",
          bookingBgColor: b.bookingBgColor || "",
          bookingBgImage: b.bookingBgImage || "",
          fontFamily: b.fontFamily || "",
          heroTitle: b.heroTitle || "",
          heroSubtitle: b.heroSubtitle || "",
          mapsUrl: b.mapsUrl || "",
          links: Array.isArray(b.links) ? b.links : [],
        })
      )
      .catch(() => onToast("Erro ao carregar a aparência", "error"));
  }, [slug]);

  function applyPreset(p: Preset) {
    loadFont(p.fontFamily);
    loadFont(p.headingFont);
    setT((prev) => ({
      ...prev,
      primaryColor: p.primaryColor,
      storeBgColor: p.storeBgColor,
      bookingBgColor: p.bookingBgColor,
      fontFamily: p.fontFamily,
      headerBg: p.headerBg,
      bannerBg: p.bannerBg,
      cardBg: p.cardBg,
      titleColor: p.titleColor,
      subtitleColor: p.subtitleColor,
      bookingTitleColor: p.bookingTitleColor,
      bookingSubtitleColor: p.bookingSubtitleColor,
      headingFont: p.headingFont,
    }));
    onToast(`Combinação "${p.name}" aplicada. Clica em Guardar Aparência.`, "success");
  }

  async function pickImage(kind: "store" | "booking" | "hero", e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await apiFetch<{ url: string }>("/api/v1/upload", { method: "POST", body: fd, tenant: slug });
      setT((p) =>
        kind === "store" ? { ...p, storeBgImage: r.url } : kind === "booking" ? { ...p, bookingBgImage: r.url } : { ...p, storeHeroImage: r.url }
      );
      onToast("Imagem enviada. Clica em Guardar Aparência.", "success");
    } catch (err: any) {
      onToast(err.message || "Erro ao enviar imagem", "error");
    } finally {
      setUploading(null);
      input.value = "";
    }
  }

  function setLink(i: number, patch: Partial<LinkItem>) {
    setT((p) => ({ ...p, links: p.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }));
  }

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/v1/business/info", {
        method: "PATCH",
        tenant: slug,
        body: JSON.stringify({
          primaryColor: HEX.test(t.primaryColor) ? t.primaryColor : undefined,
          storeBgColor: t.storeBgColor || null,
          storeBgImage: t.storeBgImage || null,
          storeHeroTitle: t.storeHeroTitle || null,
          storeHeroSubtitle: t.storeHeroSubtitle || null,
          storeHeroImage: t.storeHeroImage || null,
          bookingBgColor: t.bookingBgColor || null,
          bookingBgImage: t.bookingBgImage || null,
          fontFamily: t.fontFamily || null,
          heroTitle: t.heroTitle || null,
          heroSubtitle: t.heroSubtitle || null,
          mapsUrl: t.mapsUrl ? normalizeUrl(t.mapsUrl) : null,
          links: t.links.filter((l) => l.label.trim() && l.url.trim()).map((l) => ({ label: l.label.trim(), url: normalizeUrl(l.url) })),
          theme: {
            headerBg: t.headerBg,
            bannerBg: t.bannerBg,
            cardBg: t.cardBg,
            titleColor: t.titleColor,
            subtitleColor: t.subtitleColor,
            bookingTitleColor: t.bookingTitleColor,
            bookingSubtitleColor: t.bookingSubtitleColor,
            headingFont: t.headingFont,
          },
        }),
      });
      onToast("Aparência guardada!", "success");
    } catch (err: any) {
      onToast(err.message || "Erro ao guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  const card = "border rounded-2xl p-5 space-y-5 bg-white shadow-sm";
  const set = (k: keyof T) => (v: string) => setT((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div className="space-y-6 min-w-0">
        <div>
          <h2 className="font-bold text-lg">Aparência</h2>
          <p className="text-sm text-zinc-500">
            Escolhe uma combinação pronta ou personaliza cada cor. As cores marcadas como "Automático" ajustam-se sozinhas. No fim, clica em Guardar Aparência.
          </p>
        </div>

        {/* Combinações */}
        <div className={card}>
          <h3 className="font-bold">Combinações prontas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => (
              <button type="button" key={p.name} onClick={() => applyPreset(p)} className="border rounded-xl p-3 text-left hover:border-blue-500">
                <div className="flex h-8 rounded-lg overflow-hidden mb-2 border">
                  <div className="flex-1" style={{ backgroundColor: p.headerBg }} />
                  <div className="flex-1" style={{ backgroundColor: p.bannerBg }} />
                  <div className="flex-1" style={{ backgroundColor: p.primaryColor }} />
                  <div className="flex-1" style={{ backgroundColor: p.bookingBgColor }} />
                </div>
                <p className="text-sm font-semibold" style={{ fontFamily: fontStack(p.headingFont) }}>{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cor da marca */}
        <div className={card}>
          <h3 className="font-bold">Cor dos botões e preços</h3>
          <ColorRow label="Cor principal" value={t.primaryColor} onChange={set("primaryColor")} clearable={false} />
        </div>

        {/* Letras */}
        <div className={card}>
          <h3 className="font-bold">Tipos de letra</h3>
          <FontSelect label="Letra dos títulos" value={t.headingFont} onChange={set("headingFont")} emptyLabel="Igual ao texto" />
          <FontSelect label="Letra do texto" value={t.fontFamily} onChange={set("fontFamily")} emptyLabel="Padrão" />
        </div>

        {/* Loja */}
        <div className={card}>
          <h3 className="font-bold">Cores da Loja</h3>
          <ColorRow label="Cabeçalho (topo)" hint="Faixa com o nome da loja e o carrinho." value={t.headerBg} onChange={set("headerBg")} />
          <ColorRow label="Banner principal" hint="Caixa grande do início da loja." value={t.bannerBg} onChange={set("bannerBg")} />
          <ColorRow label="Cartões dos produtos" value={t.cardBg} onChange={set("cardBg")} />
          <ColorRow label="Cor do título do banner" value={t.titleColor} onChange={set("titleColor")} />
          <ColorRow label="Cor do subtítulo do banner" value={t.subtitleColor} onChange={set("subtitleColor")} />
          <ColorRow label="Fundo da página (opcional)" hint="Deixa em Automático para um fundo claro e neutro." value={t.storeBgColor} onChange={set("storeBgColor")} />
          <ImageField
            label="Imagem de fundo da página (opcional)"
            image={t.storeBgImage}
            uploading={uploading === "store"}
            onFile={(e) => pickImage("store", e)}
            onRemove={() => setT((p) => ({ ...p, storeBgImage: "" }))}
          />
        </div>

        {/* Banner */}
        <div className={card}>
          <h3 className="font-bold">Textos do banner da Loja</h3>
          <input value={t.storeHeroTitle} onChange={(e) => setT({ ...t, storeHeroTitle: e.target.value })} placeholder="Título (ex: Beleza que transforma)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input value={t.storeHeroSubtitle} onChange={(e) => setT({ ...t, storeHeroSubtitle: e.target.value })} placeholder="Subtítulo (ex: Confira a nossa coleção)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <ImageField
            label="Imagem do banner (opcional)"
            image={t.storeHeroImage}
            uploading={uploading === "hero"}
            onFile={(e) => pickImage("hero", e)}
            onRemove={() => setT((p) => ({ ...p, storeHeroImage: "" }))}
          />
        </div>

        {/* Marcações */}
        <div className={card}>
          <h3 className="font-bold">Página de Marcações</h3>
          <ColorRow label="Fundo" value={t.bookingBgColor} onChange={set("bookingBgColor")} />
          <ImageField
            label="Imagem de fundo (opcional, tem prioridade sobre a cor)"
            image={t.bookingBgImage}
            uploading={uploading === "booking"}
            onFile={(e) => pickImage("booking", e)}
            onRemove={() => setT((p) => ({ ...p, bookingBgImage: "" }))}
          />
          <ColorRow label="Cor do título" value={t.bookingTitleColor} onChange={set("bookingTitleColor")} />
          <ColorRow label="Cor do subtítulo" value={t.bookingSubtitleColor} onChange={set("bookingSubtitleColor")} />
          <input value={t.heroTitle} onChange={(e) => setT({ ...t, heroTitle: e.target.value })} placeholder="Título (ex: Steak & Sea)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input value={t.heroSubtitle} onChange={(e) => setT({ ...t, heroSubtitle: e.target.value })} placeholder="Subtítulo (ex: Experiência única)" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Links */}
        <div className={card}>
          <h3 className="font-bold">Botões e links</h3>
          <input value={t.mapsUrl} onChange={(e) => setT({ ...t, mapsUrl: e.target.value })} placeholder="Link do Como chegar (Google Maps)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          {t.links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Nome" className="w-1/3 border rounded-lg px-3 py-2 text-sm" />
              <input value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="Link (https://...)" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => setT((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }))} className="text-red-500 px-2">🗑️</button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => (
              <button
                type="button"
                key={s}
                disabled={t.links.length >= 12}
                onClick={() => setT((p) => ({ ...p, links: [...p.links, { label: s === "Outro" ? "" : s, url: "" }] }))}
                className="text-xs bg-zinc-100 px-3 py-1.5 rounded-full font-semibold disabled:opacity-50"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving || uploading !== null}
          className="w-full py-3 rounded-xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: HEX.test(t.primaryColor) ? t.primaryColor : "#1A4D2E", color: textOn(t.primaryColor) }}
        >
          {saving ? "A guardar..." : "Guardar Aparência"}
        </button>
      </div>

      {/* Pré-visualização */}
      <div className="lg:sticky lg:top-4 order-first lg:order-none space-y-4">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Pré-visualização da Loja</p>
          <StorePreview t={t} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Pré-visualização das Marcações</p>
          <BookingPreview t={t} />
        </div>
      </div>
    </div>
  );
}