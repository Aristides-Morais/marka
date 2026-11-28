import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Dish = { id: string; name: string; price: number };

export default function ClientPage() {
  const { slug = "" } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [form, setForm] = useState({ nome: "", telefone: "", data: "", hora: "19:00", pessoas: "2", pratoId: "", obs: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }).then(setBusiness).catch(() => {});
    apiFetch<Dish[]>("/api/v1/products", { skipAuth: true, tenant: slug }).then((p) => setDishes(Array.isArray(p) ? p : [])).catch(() => {});
  }, [slug]);

  const primary = business?.primaryColor || "#6B1020";
  const waNumber = String(business?.phone || "244923000000").replace(/\D/g, "");
  const prato = dishes.find((d) => d.id === form.pratoId);
  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isValid = form.nome.trim().length >= 2 && form.telefone.trim().length >= 9 && form.data && form.hora;

  const msg = `Olá ${business?.name || ""}! Quero reservar mesa:\n\n👤 ${form.nome}\n📞 ${form.telefone}\n📅 ${form.data} às ${form.hora}\n👥 ${form.pessoas} pessoa(s)\n🍽️ Prato: ${prato ? `${prato.name} - ${Number(prato.price).toLocaleString()} Kz` : "Sem prato escolhido"}\n📝 ${form.obs || "-"}`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  async function saveAndWhatsApp() {
    setSaving(true);
    try {
      const start = new Date(`${form.data}T${form.hora}:00`).toISOString();
      await apiFetch("/api/v1/reservations", {
        method: "POST", skipAuth: true, tenant: slug,
        body: JSON.stringify({ clientName: form.nome, clientPhone: form.telefone, startTime: start, notes: `[RESERVA MESA] ${form.pessoas} pessoa(s) | Prato: ${prato ? prato.name : "Sem prato"} | Obs: ${form.obs || "-"}` }),
      }).catch(() => null);
    } finally { setSaving(false); window.open(waLink, "_blank"); setSent(true); }
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E5DDD6", fontSize: 15, background: "#fff" };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#F8F4EF] pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); .font-serif{font-family:'Playfair Display',serif} .font-sans{font-family:'DM Sans',sans-serif}`}</style>
      <div className="relative w-full md:w-1/2 h-[40vh] md:h-screen flex flex-col justify-between p-8 md:p-16 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" alt="Restaurante" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10"><Link to={`/${slug}`} className="font-serif text-2xl font-bold text-white">{business?.name || "Alive"}</Link></div>
        <div className="relative z-10"><h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-4">Reserve o seu<br />momento.</h1><p className="text-white/80 text-lg max-w-md">Garanta o seu lugar.</p></div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="font-serif text-3xl font-bold mb-2">Faça a sua Reserva</h2>
          <p className="text-gray-500 text-sm mb-6">Preencha, guardamos para o restaurante e reencaminhamos no WhatsApp.</p>
          {!sent ? (
            <div className="space-y-4">
              <input style={inputStyle} placeholder="Nome completo *" value={form.nome} onChange={(e) => setF("nome", e.target.value)} />
              <input style={inputStyle} placeholder="Telefone / WhatsApp *" value={form.telefone} onChange={(e) => setF("telefone", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input style={inputStyle} type="date" value={form.data} onChange={(e) => setF("data", e.target.value)} />
                <input style={inputStyle} type="time" value={form.hora} onChange={(e) => setF("hora", e.target.value)} />
              </div>
              <select style={inputStyle} value={form.pessoas} onChange={(e) => setF("pessoas", e.target.value)}>{["1","2","3","4","5","6","7+"].map((n) => <option key={n} value={n}>{n} Pessoa(s)</option>)}</select>
              {dishes.length > 0 && (
                <div><label className="block text-sm font-bold mb-1">Escolher prato (do Cardápio Digital)</label>
                  <select style={inputStyle} value={form.pratoId} onChange={(e) => setF("pratoId", e.target.value)}>
                    <option value="">Sem prato / Só mesa</option>
                    {dishes.map((d) => <option key={d.id} value={d.id}>{d.name} - {Number(d.price).toLocaleString()} Kz</option>)}
                  </select></div>
              )}
              <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Observações" value={form.obs} onChange={(e) => setF("obs", e.target.value)} />
              <button onClick={() => { if (isValid) setSent(true); }} disabled={!isValid} className="w-full py-4 rounded-full text-white font-bold" style={{ background: isValid ? primary : "#ccc" }}>{isValid ? "Confirmar Reserva →" : "Preencha nome, telefone, data e hora"}</button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-3">✅</div><h2 className="font-serif text-2xl font-bold mb-3">Resumo da reserva</h2>
              <div className="bg-white rounded-2xl p-5 text-left text-sm space-y-1 border">
                <p>👤 {form.nome} • 📞 {form.telefone}</p><p>📅 {form.data} às {form.hora} • 👥 {form.pessoas}</p><p>🍽️ {prato ? prato.name : "Sem prato escolhido"}</p><p>📝 {form.obs || "-"}</p>
              </div>
              <button onClick={saveAndWhatsApp} disabled={saving} className="block w-full mt-5 py-4 rounded-full text-white font-bold" style={{ background: "#25D366" }}>{saving ? "A guardar..." : "Guardar e reencaminhar no WhatsApp"}</button>
              <button onClick={() => setSent(false)} className="mt-3 text-sm underline text-gray-500 font-bold">Editar reserva</button>
            </div>
          )}
          <div className="mt-8 text-center"><Link to={`/${slug}`} className="text-sm text-gray-500">← Voltar ao site</Link></div>
        </div>
      </div>
    </main>
  );
}