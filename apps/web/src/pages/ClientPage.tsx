import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
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
} from "../lib/theme";

type Service = { id: string; name: string; durationMin: number; price: number };
type Busy = { start: string; end: string };

type Info = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  address: string | null;
  bookingBgColor: string | null;
  bookingBgImage: string | null;
  fontFamily: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  mapsUrl: string | null;
  links: LinkItem[];
  extra: ExtraTheme;
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};
const fmtMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const localToday = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

export default function ClientPage() {
  const { slug } = useParams();

  const [info, setInfo] = useState<Info | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState<Busy[]>([]);
  const [hours, setHours] = useState({ openTime: "08:00", closeTime: "18:00" });

  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showForm, setShowForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiFetch<Service[]>("/api/v1/reservations/services", { skipAuth: true, tenant: slug }),
      apiFetch<{ openTime: string; closeTime: string }>("/api/v1/reservations/hours", { skipAuth: true, tenant: slug }),
      apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
    ])
      .then(([svcs, hrs, b]) => {
        setServices(svcs);
        setHours(hrs);
        const extra = parseExtra(b.theme);
        loadFont(b.fontFamily);
        loadFont(extra.headingFont);
        setInfo({
          name: b.name,
          logoUrl: b.logoUrl || null,
          primaryColor: b.primaryColor || "#1A4D2E",
          address: b.address || null,
          bookingBgColor: b.bookingBgColor || null,
          bookingBgImage: b.bookingBgImage || null,
          fontFamily: b.fontFamily || null,
          heroTitle: b.heroTitle || null,
          heroSubtitle: b.heroSubtitle || null,
          mapsUrl: b.mapsUrl || null,
          links: Array.isArray(b.links) ? b.links : [],
          extra,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  function refreshBusy() {
    if (!slug || !date) {
      setBusy([]);
      return;
    }
    apiFetch<Busy[]>(`/api/v1/reservations/busy?date=${date}`, { skipAuth: true, tenant: slug })
      .then(setBusy)
      .catch(() => setBusy([]));
  }

  useEffect(() => {
    setTime("");
    refreshBusy();
  }, [slug, date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedService || !date || !time) return setErrorMsg("Escolha o serviço, o dia e a hora.");

    setSubmitting(true);
    setErrorMsg(null);
    const startTime = new Date(`${date}T${time}:00.000Z`).toISOString();

    try {
      await apiFetch("/api/v1/reservations", {
        method: "POST",
        body: JSON.stringify({ serviceId: selectedService.id, clientName: formData.name, clientPhone: formData.phone, startTime }),
        skipAuth: true,
        tenant: slug,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
      if (err.status === 409) {
        setTime("");
        refreshBusy();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setErrorMsg(null);
    if (isSuccess) {
      setIsSuccess(false);
      setSelectedService(null);
      setDate("");
      setTime("");
      setFormData({ name: "", phone: "" });
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">A carregar...</div>;
  if (!info) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Negócio não encontrado.</div>;

  const primary = info.primaryColor;
  const ex = info.extra;
  const hasImage = !!info.bookingBgImage;
  const bgColor = info.bookingBgColor || "#F4F4F5";
  const onDark = hasImage || isDark(bgColor);

  const body = fontStack(info.fontFamily);
  const heading = fontStack(ex.headingFont || info.fontFamily);

  const rootStyle: CSSProperties = {
    backgroundColor: bgColor,
    backgroundImage: hasImage ? `url(${info.bookingBgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    fontFamily: body,
  };

  const titleColor = ex.bookingTitleColor || (onDark ? "#FFFFFF" : "#18181B");
  const subColor = ex.bookingSubtitleColor || (onDark ? "rgba(255,255,255,0.8)" : "#52525B");

  const displayName = prettyName(info.name);
  const title = info.heroTitle || displayName;
  const ampIdx = title.indexOf("&");
  const titleFirst = ampIdx > 0 ? title.slice(0, ampIdx).trim() : title;
  const titleSecond = ampIdx > 0 ? title.slice(ampIdx).trim() : "";

  const secondaryBtn: CSSProperties = onDark
    ? { backgroundColor: "#F5EFE6", color: "#18181B" }
    : { backgroundColor: "#FFFFFF", color: "#18181B", border: "1px solid #E4E4E7" };

  const linkBtn: CSSProperties = onDark
    ? { backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "#FFFFFF" }
    : { backgroundColor: "#FFFFFF", border: "1px solid #D4D4D8", color: "#18181B" };

  // Horários disponíveis
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots: { label: string; disabled: boolean; taken: boolean }[] = [];
  if (selectedService && date) {
    const open = toMin(hours.openTime);
    const close = toMin(hours.closeTime);
    const d = selectedService.durationMin;
    for (let s = open; s + d <= close; s += 30) {
      const e = s + d;
      const taken = busy.some((b) => s < toMin(b.end) && e > toMin(b.start));
      const past = date === localToday() && s <= nowMin;
      slots.push({ label: fmtMin(s), disabled: taken || past, taken });
    }
  }

  return (
    <div className="min-h-screen relative" style={rootStyle}>
      {hasImage && <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.78))" }} />}

      <div className="relative z-10 min-h-screen max-w-lg mx-auto px-5 py-8 flex flex-col">
        <header className="flex items-center gap-4">
          {info.logoUrl ? (
            <img src={info.logoUrl} alt="Logo" className="w-20 h-20 shrink-0 rounded-full object-cover border border-white/20 shadow-lg" />
          ) : (
            <div className="w-20 h-20 shrink-0 rounded-full flex items-center justify-center font-bold text-3xl shadow-lg" style={{ backgroundColor: primary, color: textOn(primary) }}>
              {displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight break-words" style={{ color: titleColor, fontFamily: heading, overflowWrap: "anywhere" }}>
              {displayName}
            </h2>
            {info.address && <p className="text-base mt-1 break-words" style={{ color: subColor }}>{info.address}</p>}
          </div>
        </header>

        <section className="flex-1 flex flex-col justify-center py-10">
          <h1 className="font-bold leading-[1.05] break-words" style={{ color: titleColor, fontFamily: heading, fontSize: heroSize(title), overflowWrap: "anywhere" }}>
            {titleFirst}
            {titleSecond && (
              <>
                <br />
                <span style={{ color: primary }}>{titleSecond}</span>
              </>
            )}
          </h1>
          {info.heroSubtitle && <p className="mt-5 text-lg max-w-xs" style={{ color: subColor }}>{info.heroSubtitle}</p>}
          <p className="mt-4 text-xs inline-block self-start px-3 py-1 rounded-full" style={{ backgroundColor: onDark ? "rgba(255,255,255,0.12)" : "#ECFDF5", color: onDark ? "#FFFFFF" : "#047857" }}>
            Aberto das {hours.openTime} às {hours.closeTime}
          </p>
        </section>

        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-between px-6 py-5 rounded-2xl font-semibold text-xl shadow-lg"
            style={{ background: `linear-gradient(90deg, ${primary}CC, ${primary})`, color: textOn(primary) }}
          >
            <span>Reservar</span>
            <span className="text-2xl">→</span>
          </button>

          <Link to={`/${slug}/loja`} className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-lg" style={secondaryBtn}>
            Ir para a Loja
          </Link>

          {info.mapsUrl && (
            <a href={normalizeUrl(info.mapsUrl)} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-lg" style={secondaryBtn}>
              Como chegar
            </a>
          )}

          {info.links.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {info.links.map((l, i) => (
                <a key={i} href={normalizeUrl(l.url)} target="_blank" rel="noreferrer" className="flex items-center justify-center text-center px-2 py-5 rounded-2xl text-base font-medium break-words" style={linkBtn}>
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-6 text-center">
          <Link to={`/${slug}/admin`} className="text-xs" style={{ color: subColor, opacity: 0.6 }}>Admin</Link>
        </footer>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={closeForm}>
          <div
            className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 md:p-8 text-zinc-900"
            style={{ fontFamily: body }}
            onClick={(e) => e.stopPropagation()}
          >
            {isSuccess ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: primary, color: textOn(primary) }}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Reserva feita!</h2>
                <p className="text-zinc-500 mb-6">{selectedService?.name} no dia {date.split("-").reverse().join("/")} às {time}.</p>
                <button onClick={closeForm} className="w-full py-3 rounded-xl font-semibold" style={{ backgroundColor: primary, color: textOn(primary) }}>Fechar</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">Fazer reserva</h2>
                  <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none px-2">×</button>
                </div>

                {errorMsg && <div className="mb-5 p-4 bg-red-50 text-red-700 text-sm rounded-lg">{errorMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">1. Serviço</label>
                    <div className="grid gap-2">
                      {services.map((svc) => (
                        <div
                          key={svc.id}
                          onClick={() => {
                            setSelectedService(svc);
                            setTime("");
                          }}
                          className="p-4 rounded-xl border-2 cursor-pointer"
                          style={{ borderColor: selectedService?.id === svc.id ? primary : "#E4E4E7", backgroundColor: selectedService?.id === svc.id ? "#FAFAFA" : "#FFFFFF" }}
                        >
                          <div className="flex justify-between gap-3">
                            <span className="font-semibold break-words min-w-0">{svc.name}</span>
                            <span className="font-bold shrink-0">{Number(svc.price).toLocaleString("pt-AO")} Kz</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">{svc.durationMin} min</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">2. Dia</label>
                    <input type="date" required min={localToday()} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">3. Hora</label>
                    {!selectedService || !date ? (
                      <p className="text-sm text-zinc-500">Escolha primeiro o serviço e o dia.</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-zinc-500">Sem horários disponíveis para este serviço.</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map((s) => (
                            <button
                              type="button"
                              key={s.label}
                              disabled={s.disabled}
                              onClick={() => setTime(s.label)}
                              className={`py-2 rounded-lg text-sm font-semibold border ${s.disabled ? "bg-zinc-100 text-zinc-400 border-zinc-100 cursor-not-allowed" : ""} ${s.taken ? "line-through" : ""}`}
                              style={time === s.label ? { backgroundColor: primary, color: textOn(primary), borderColor: primary } : undefined}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Os horários riscados já estão ocupados.</p>
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium">4. Os seus dados</label>
                    <input type="text" required placeholder="Nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                    <input type="text" required placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  <button type="submit" disabled={submitting || !selectedService || !date || !time} className="w-full py-3 rounded-xl font-bold disabled:opacity-50" style={{ backgroundColor: primary, color: textOn(primary) }}>
                    {submitting ? "A agendar..." : "Confirmar Reserva"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}