import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/site/SiteHeader";

const MENU_ITEMS = [
  { id: 1, name: "Mufete de Cacusso", price: 12500, desc: "Peixe fresco grelhado na brasa, acompanhado de feijão de óleo de palma, banana pão e farofa." },
  { id: 2, name: "Calulu de Carne Seca", price: 10000, desc: "Cozido lentamente com quiabos, jimboa e óleo de palma, servido com funge de bombó." },
  { id: 3, name: "Cocktail Signature", price: 4500, desc: "Gin, maracujá fresco, hortelã e um toque secreto de especiarias." },
  { id: 4, name: "Bife à Casa com Batata Trufada", price: 18000, desc: "Corte nobre de novilho, molho de cogumelos, batata rústica com azeite de trufa." },
  { id: 5, name: "Risoto de Marisco", price: 15000, desc: "Arroz arbóreo cremoso com camarão, lulas e mexilhões frescos." },
  { id: 6, name: "Cheesecake de Frutos Vermelhos", price: 3500, desc: "Base crocante, queijo creme suave e coulis de frutos vermelhos frescos." },
];

export default function TakeawayPage() {
  const { slug = "" } = useParams();
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", payment: "Multicaixa", notes: "" });

  const primary = "#6B1020";
  const secondary = "#9A7634";
  const phone = "244923000000";

  const addToCart = (id: number) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  const removeFromCart = (id: number) => {
    const newCart = { ...cart };
    if (newCart[id] > 1) newCart[id] -= 1;
    else delete newCart[id];
    setCart(newCart);
  };

  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = MENU_ITEMS.find((m) => m.id === Number(id));
    return acc + (item ? item.price * qty : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (total === 0) return alert("O seu carrinho está vazio.");
    
    let message = `Olá, *Alive Restaurante & Lounge*!%0A%0A*NOVO PEDIDO:*%0A%0A`;
    Object.entries(cart).forEach(([id, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === Number(id));
      if (item) message += `- ${qty}x ${item.name} (${item.price * qty} Kz)%0A`;
    });
    message += `%0A*Total:* ${total} Kz%0A%0A*Dados de Entrega:*%0A`;
    message += `Nome: ${formData.name}%0ATelefone: ${formData.phone}%0AEndereço: ${formData.address}%0APagamento: ${formData.payment}%0A`;
    if (formData.notes) message += `Obs: ${formData.notes}`;

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#F8F4EF] text-[#35232B] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <SiteHeader businessName="Alive Restaurante & Lounge" primary={primary} secondary={secondary} waLink={`https://wa.me/${phone}`} />

      <section className="pt-32 pb-16 px-6 text-center bg-white">
        <h1 className="font-serif text-5xl md:text-7xl text-[#221A18] leading-tight mb-6">Takeaway & Delivery</h1>
        <p className="text-gray-500">Peça os seus pratos favoritos e receba em casa.</p>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
          
          {/* MENU */}
          <div>
            <h2 className="font-serif text-3xl mb-6">O Menu</h2>
            <div className="space-y-4">
              {MENU_ITEMS.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#221A18]">{item.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.desc}</p>
                    <span className="text-sm font-bold" style={{ color: primary }}>{item.price} Kz</span>
                  </div>
                  <button onClick={() => addToCart(item.id)} className="px-4 py-2 rounded-lg font-bold text-white text-sm" style={{ background: primary }}>+ Adicionar</button>
                </div>
              ))}
            </div>
          </div>

          {/* CARRINHO E FORMULÁRIO */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-fit sticky top-24">
            <h2 className="font-serif text-2xl mb-4">O Seu Pedido</h2>
            
            {total === 0 ? (
              <p className="text-gray-500 text-sm mb-8">O carrinho está vazio. Adicione pratos do menu.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = MENU_ITEMS.find((m) => m.id === Number(id));
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-sm border-b pb-2">
                      <div>
                        <span className="font-bold">{qty}x {item.name}</span>
                        <span className="text-gray-500 block text-xs">{item.price * qty} Kz</span>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold">−</button>
                    </div>
                  );
                })}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total:</span>
                  <span style={{ color: primary }}>{total} Kz</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-6">
              <h3 className="font-bold text-lg mb-2">Dados de Entrega</h3>
              <input type="text" placeholder="Nome Completo" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border p-3 rounded-lg" />
              <input type="tel" placeholder="Telefone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border p-3 rounded-lg" />
              <input type="text" placeholder="Endereço Completo" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border p-3 rounded-lg" />
              <select value={formData.payment} onChange={(e) => setFormData({ ...formData, payment: e.target.value })} className="w-full border p-3 rounded-lg bg-white">
                <option value="Multicaixa">Multicaixa Express</option>
                <option value="Dinheiro">Dinheiro na Entrega</option>
                <option value="Transferência">Transferência Bancária</option>
              </select>
              <textarea placeholder="Observações" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border p-3 rounded-lg resize-none" />
              
              <button type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white mt-4 shadow-lg" style={{ background: secondary }}>
                Finalizar Pedido no WhatsApp
              </button>
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}