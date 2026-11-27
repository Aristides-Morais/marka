import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const MENU = [
  { id: "mufete", name: "Mufete Perfeito", price: 12000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
  { id: "calulu", name: "Calulu de Peixe", price: 10000, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
  { id: "muamba", name: "Muamba de Galinha", price: 9500, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" },
  { id: "grelhada", name: "Grelhada Mista", price: 15000, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80" },
];

export default function TakeawayPage() {
  const { slug = "" } = useParams();
  const primary = "#6B1020";
  const waNumber = "244923000000";

  const [cart, setCart] = useState<Record<string, number>>({ mufete: 1 });
  const [form, setForm] = useState({ nome: "", telefone: "", entrega: "Levantamento", morada: "", obs: "" });
  const [sent, setSent] = useState(false);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id: string) => setCart((c) => { const n = { ...c }; n[id] = Math.max(0, (n[id] || 0) - 1); if (n[id] === 0) delete n[id]; return n; });
  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const items = MENU.filter((m) => cart[m.id] > 0).map((m) => ({ ...m, qty: cart[m.id] }));
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const isValid = items.length > 0 && form.nome.trim().length >= 2 && form.telefone.trim().length >= 9 && (form.entrega === "Levantamento" || form.morada.trim().length >= 5);

  const msg = `Olá Alive! Pedido Takeaway:\n\n${items.map((i) => `• ${i.qty}x ${i.name} - ${i.price * i.qty} Kz`).join("\n")}\n\nTotal: ${total} Kz\n\n👤 ${form.nome}\n📞 ${form.telefone}\n🚚 ${form.entrega}${form.entrega === "Entrega" ? ` - ${form.morada}` : ""}\n📝 ${form.obs || "-"}`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E5DDD6", fontSize: 15, background: "#fff" };

  return (
    <main className="min-h-screen bg-[#F8F4EF] font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); .font-serif{font-family:'Playfair Display',serif} .font-sans{font-family:'DM Sans',sans-serif}`}</style>
      <section className="pt-32 pb-10 px-6 text-center bg-white">
        <Link to={`/${slug}`} className="inline-block mb-6 px-5 py-2 rounded-full border font-bold text-sm">← Voltar à Página Inicial</Link>
        <p className="text-sm font-bold tracking-[0.2em] uppercase mb-3" style={{ color: primary }}>Takeaway</p>
        <h1 className="font-serif text-5xl md:text-6xl">Peça para levar</h1>
        <p className="text-gray-500 mt-3">Escolha, preencha e só depois enviamos para o WhatsApp.</p>
      </section>

      <section className="px-6 py-10">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold">1. Escolha o prato</h2>
            {MENU.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border p-3 flex gap-3 items-center">
                <img src={m.img} alt={m.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold">{m.name}</p>
                  <p className="text-sm" style={{ color: primary }}>{m.price.toLocaleString()} Kz</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => remove(m.id)} className="w-9 h-9 rounded-full border font-bold">-</button>
                  <span className="font-bold w-5 text-center">{cart[m.id] || 0}</span>
                  <button onClick={() => add(m.id)} className="w-9 h-9 rounded-full text-white font-bold" style={{ background: primary }}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-lg border p-6 h-fit">
            {!sent ? (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold">2. Os seus dados</h2>
                <input style={inputStyle} placeholder="Nome completo *" value={form.nome} onChange={(e) => setF("nome", e.target.value)} />
                <input style={inputStyle} placeholder="Telefone / WhatsApp *" value={form.telefone} onChange={(e) => setF("telefone", e.target.value)} />
                <div className="flex gap-2">
                  {["Levantamento", "Entrega"].map((t) => (
                    <button key={t} onClick={() => setF("entrega", t)} className="flex-1 py-3 rounded-full font-bold border text-sm" style={{ background: form.entrega === t ? primary : "#fff", color: form.entrega === t ? "#fff" : "#333" }}>{t}</button>
                  ))}
                </div>
                {form.entrega === "Entrega" && <input style={inputStyle} placeholder="Morada completa *" value={form.morada} onChange={(e) => setF("morada", e.target.value)} />}
                <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Observações (ex: sem pimenta)" value={form.obs} onChange={(e) => setF("obs", e.target.value)} />
                <div className="bg-[#F8F4EF] rounded-xl p-4 text-sm space-y-1">
                  {items.length === 0 ? <p>Escolha pelo menos 1 prato.</p> : items.map((i) => <p key={i.id} className="flex justify-between"><span>{i.qty}x {i.name}</span><b>{(i.price * i.qty).toLocaleString()} Kz</b></p>)}
                  <p className="flex justify-between pt-2 border-t font-bold text-base"><span>Total</span><span>{total.toLocaleString()} Kz</span></p>
                </div>
                <button onClick={() => { if (isValid) setSent(true); }} disabled={!isValid} className="w-full py-4 rounded-full text-white font-bold" style={{ background: isValid ? primary : "#ccc" }}>{isValid ? "Confirmar Pedido →" : "Preencha nome, telefone e prato"}</button>
                <p className="text-center text-xs text-gray-400">Ainda não enviamos nada. O WhatsApp só abre depois de confirmar.</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-3">✅</div>
                <h2 className="font-serif text-2xl font-bold mb-3">Resumo do pedido</h2>
                <div className="bg-[#F8F4EF] rounded-2xl p-5 text-left text-sm space-y-1">
                  {items.map((i) => <p key={i.id}>• {i.qty}x {i.name} - {(i.price * i.qty).toLocaleString()} Kz</p>)}
                  <p className="font-bold pt-2 border-t">Total: {total.toLocaleString()} Kz</p>
                  <p>👤 {form.nome} • 📞 {form.telefone}</p>
                  <p>🚚 {form.entrega} {form.entrega === "Entrega" ? `- ${form.morada}` : ""}</p>
                </div>
                <a href={waLink} target="_blank" rel="noreferrer" className="block mt-5 py-4 rounded-full text-white font-bold" style={{ background: "#25D366" }}>📲 Encaminhar no WhatsApp</a>
                <button onClick={() => setSent(false)} className="mt-3 text-sm underline text-gray-500 font-bold">Editar pedido</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}