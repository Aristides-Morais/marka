import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Product = { id: string; name: string; description: string | null; price: number; stock: number; imageUrl: string | null; };
type CartItem = Product & { quantity: number };

export default function StorePage() {
  const { slug } = useParams();
  
  const [store, setStore] = useState<{ name: string, logoUrl: string, primaryColor: string, products: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  
  // Estas são as variáveis que estavam a dar erro por não serem usadas:
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    Promise.all([
      apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }),
      apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug })
    ]).then(([productsData, businessData]) => {
        const productList = Array.isArray(productsData) ? productsData : [];
        setStore({ 
          name: businessData.name,
          logoUrl: businessData.logoUrl,
          primaryColor: businessData.primaryColor,
          products: productList.map((p: any) => ({ ...p, price: Number(p.price), stock: Number(p.stock) })) 
        });
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [slug]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { showToast("Limite de stock atingido!"); return prev; }
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setErrorMsg(null); showToast("Produto adicionado!");
  }

  function decreaseQuantity(productId: string) {
    setCart((prev) => prev.map((item) => item.id === productId ? (item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item) : item).filter((item) => item.quantity > 0));
  }

  function increaseQuantity(productId: string) {
    setCart((prev) => prev.map((item) => (item.id === productId && item.quantity < item.stock) ? { ...item, quantity: item.quantity + 1 } : item));
  }

  function removeFromCart(productId: string) { setCart((prev) => prev.filter((item) => item.id !== productId)); }

  const cartSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryFee = cart.length > 0 ? 1500 : 0; 
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemCount = cart.reduce((acc, item) => acc + Number(item.quantity), 0);

  async function handleCheckout(e: FormEvent) {
    e.preventDefault(); setSubmitting(true); setErrorMsg(null);
    try {
      await apiFetch("/api/v1/orders", {
        method: "POST", skipAuth: true, tenant: slug,
        body: JSON.stringify({
          customerName: formData.name, customerPhone: formData.phone, customerAddress: formData.address,
          items: cart.map((item) => ({ productId: item.id, quantity: Number(item.quantity) })),
        }),
      });
      setCart([]); setFormData({ name: "", phone: "", address: "" }); setIsCartOpen(false); setIsSuccess(true);
    } catch (err: any) { setErrorMsg(err.message); } finally { setSubmitting(false); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#1A4D2E" }}></div></div>;
  if (!store) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-red-500 font-bold">Loja não encontrada.</div>;

  const filteredProducts = store.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800 pb-20 md:pb-0">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium animate-bounce" style={{ backgroundColor: store.primaryColor }}>{toast}</div>}

      {/* HEADER ESTILO E-COMMERCE */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to={`/${slug}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden md:block">Reservas</span>
            </Link>

            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: store.primaryColor }}>
                  {store.name.charAt(0)}
                </div>
              )}
              <span className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:block">
                {store.name}
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" placeholder="Procurar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
              style={{ "--tw-ring-color": store.primaryColor } as any}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative text-white p-2.5 rounded-full transition-colors shadow-lg" style={{ backgroundColor: store.primaryColor }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">{cartItemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL (GRELHA DE PRODUTOS) */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        
        <div className="md:hidden relative mb-6">
            <input type="text" placeholder="Procurar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": store.primaryColor } as any} />
        </div>

        <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <span className="text-sm text-gray-500">{filteredProducts.length} produtos</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-500">Tente pesquisar por outro nome.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
                
                <div className="aspect-square bg-[#F3F4F6] rounded-2xl relative overflow-hidden mb-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sem imagem</div>
                  )}
                  {product.stock > 0 ? (
                     <span className="absolute top-3 left-3 bg-green-100 text-green-800 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full">Em stock</span>
                  ) : (
                     <span className="absolute top-3 left-3 bg-red-100 text-red-800 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full">Esgotado</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col px-1">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-1">{product.description || "Sem descrição"}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg md:text-xl font-extrabold" style={{ color: store.primaryColor }}>{Number(product.price).toLocaleString("pt-AO")} Kz</span>
                    <button onClick={() => addToCart(product)} disabled={product.stock === 0} className="text-white w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shadow-md" style={{ backgroundColor: store.primaryColor }}>
                      <span className="hidden md:block text-sm font-medium">Adicionar</span>
                      <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* OVERLAY DO CARRINHO */}
      {isCartOpen && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />}

      {/* CARRINHO LATERAL (ESTILO PREMIUM) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6" style={{ color: store.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            O teu Carrinho
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center mt-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="text-gray-500 font-medium mb-6">O teu carrinho está vazio.</p>
              <button onClick={() => setIsCartOpen(false)} className="text-white px-6 py-2.5 rounded-full font-medium transition-colors" style={{ backgroundColor: store.primaryColor }}>Começar a comprar</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                   {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100"></div>}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{Number(item.price).toLocaleString("pt-AO")} Kz / un</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                      <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-full transition-colors">-</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-full disabled:opacity-50 transition-colors">+</button>
                    </div>
                    <span className="font-bold" style={{ color: store.primaryColor }}>{(Number(item.price) * Number(item.quantity)).toLocaleString("pt-AO")} Kz</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RESUMO E CHECKOUT */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{errorMsg}</div>}
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{Number(cartSubtotal).toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxa de Entrega</span>
                <span className="font-medium text-gray-900">{Number(deliveryFee).toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-extrabold text-xl" style={{ color: store.primaryColor }}>{Number(cartTotal).toLocaleString("pt-AO")} Kz</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <input required placeholder="O teu nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": store.primaryColor } as any} />
              <input required placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": store.primaryColor } as any} />
              <input required placeholder="Endereço de entrega" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": store.primaryColor } as any} />
              <button type="submit" disabled={submitting} className="w-full text-white py-4 rounded-xl font-bold text-base transition-colors disabled:opacity-50 shadow-lg mt-2" style={{ backgroundColor: store.primaryColor }}>
                {submitting ? "A processar..." : "Finalizar Compra"}
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* MODAL DE SUCESSO */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${store.primaryColor}20`, color: store.primaryColor }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Efetuado!</h2>
            <p className="text-gray-500 mb-8 text-sm">O teu pedido foi recebido com sucesso. O vendedor entrará em contacto em breve.</p>
            <button onClick={() => setIsSuccess(false)} className="w-full text-white py-3 rounded-xl font-semibold transition-colors" style={{ backgroundColor: store.primaryColor }}>Voltar à Loja</button>
          </div>
        </div>
      )}
    </div>
  );
}