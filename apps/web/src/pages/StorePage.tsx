import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { fontStack, heroSize, isDark, loadFont, parseExtra, prettyName, textOn, type ExtraTheme } from "../lib/theme";

type Product = { id: string; name: string; description: string | null; price: number; stock: number; imageUrl: string | null };
type CartItem = Product & { quantity: number };

type Store = {
  name: string;
  logoUrl: string;
  primaryColor: string;
  phone: string;
  iban: string;
  expressNumber: string;
  bankName: string;
  feedbackPhone: string;
  address: string;
  bgColor: string;
  bgImage: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  extra: ExtraTheme;
  products: Product[];
};

export default function StorePage() {
  const { slug } = useParams();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastTotal, setLastTotal] = useState(0);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiFetch<Product[]>("/api/v1/products", { skipAuth: true, tenant: slug }),
      apiFetch<any>("/api/v1/business/info", { skipAuth: true, tenant: slug }),
    ])
      .then(([productsData, b]) => {
        const productList = Array.isArray(productsData) ? productsData : [];
        const extra = parseExtra(b.theme);
        loadFont(b.fontFamily);
        loadFont(extra.headingFont);
        setStore({
          name: b.name,
          logoUrl: b.logoUrl || "",
          primaryColor: b.primaryColor || "#1A4D2E",
          phone: b.phone || "",
          iban: b.iban || "",
          expressNumber: b.expressNumber || "",
          bankName: b.bankName || "",
          feedbackPhone: b.feedbackPhone || "",
          address: b.address || "",
          bgColor: b.storeBgColor || "",
          bgImage: b.storeBgImage || "",
          fontFamily: b.fontFamily || "",
          heroTitle: b.storeHeroTitle || "",
          heroSubtitle: b.storeHeroSubtitle || "",
          heroImage: b.storeHeroImage || "",
          extra,
          products: productList.map((p: any) => ({ ...p, price: Number(p.price), stock: Number(p.stock) })),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast("Limite de stock atingido!");
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setErrorMsg(null);
    showToast("Produto adicionado!");
  }

  function decreaseQuantity(productId: string) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === productId ? (item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item) : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(productId: string) {
    setCart((prev) => prev.map((item) => (item.id === productId && item.quantity < item.stock ? { ...item, quantity: item.quantity + 1 } : item)));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  const cartSubtotal = cart.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 1500 : 0;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemCount = cart.reduce((acc, item) => acc + Number(item.quantity), 0);

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await apiFetch("/api/v1/orders", {
        method: "POST",
        skipAuth: true,
        tenant: slug,
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          items: cart.map((item) => ({ productId: item.id, quantity: Number(item.quantity) })),
        }),
      });
      setLastTotal(cartTotal);
      setCart([]);
      setFormData({ name: "", phone: "", address: "" });
      setIsCartOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#1A4D2E" }}></div>
      </div>
    );
  if (!store) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-red-500 font-bold">Loja não encontrada.</div>;

  const primary = store.primaryColor;
  const ex = store.extra;
  const displayName = prettyName(store.name);
  const filteredProducts = store.products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const body = fontStack(store.fontFamily);
  const heading = fontStack(ex.headingFont || store.fontFamily);

  const pageBg = store.bgColor || "#F4F5F7";
  const bgStyle: CSSProperties = {
    backgroundColor: pageBg,
    backgroundImage: store.bgImage ? `url(${store.bgImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    fontFamily: body,
  };
  const darkPage = !store.bgImage && isDark(pageBg);
  const sectionBox = store.bgImage ? "bg-white/85 backdrop-blur rounded-2xl px-4 py-3" : "";
  const sectionTitle = store.bgImage ? "#111827" : darkPage ? "#FFFFFF" : "#111827";
  const sectionCount = store.bgImage ? "#6B7280" : darkPage ? "#D1D5DB" : "#6B7280";

  const headerBg = ex.headerBg || "#FFFFFF";
  const headerText = textOn(headerBg);
  const cardBg = ex.cardBg || "#FFFFFF";
  const cardText = textOn(cardBg);

  const bannerCustom = !!ex.bannerBg;
  const bannerBackground = bannerCustom ? ex.bannerBg : `linear-gradient(135deg, ${primary}1A, #FFFFFF)`;
  const bannerDark = bannerCustom && isDark(ex.bannerBg);
  const heroTitleColor = ex.titleColor || (bannerCustom ? textOn(ex.bannerBg) : "#111827");
  const heroSubColor = ex.subtitleColor || (bannerDark ? "rgba(255,255,255,0.85)" : "#4B5563");

  const heroText = store.heroTitle || `Bem-vindo à ${displayName}`;
  const heroWords = heroText.split(" ");
  const heroLast = !ex.titleColor && heroWords.length > 1 ? heroWords.pop() : "";
  const heroFirst = heroWords.join(" ");

  const features = [
    { icon: "🚚", title: "Entrega ao domicílio", text: "Taxa fixa de 1.500 Kz" },
    { icon: "💳", title: "Pagamento fácil", text: "IBAN ou Express" },
    { icon: "🔒", title: "Compra segura", text: "Os teus dados protegidos" },
    { icon: "💬", title: "Suporte rápido", text: store.phone ? "Fala connosco no WhatsApp" : "Estamos para ajudar" },
  ];

  function goToProducts() {
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen relative text-gray-800 pb-20 md:pb-0" style={bgStyle}>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl text-sm font-medium animate-bounce" style={{ backgroundColor: primary, color: textOn(primary) }}>
          {toast}
        </div>
      )}

      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ backgroundColor: headerBg, color: headerText, borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 min-h-16 md:min-h-20 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/${slug}`} className="shrink-0 w-10 h-10 md:w-auto md:px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors" style={{ backgroundColor: "rgba(127,127,127,0.18)", color: headerText }} title="Voltar às reservas">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden md:block">Reservas</span>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" className="w-10 h-10 shrink-0 rounded-full object-cover border border-black/5 shadow-sm" />
              ) : (
                <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-lg shadow-sm" style={{ backgroundColor: primary, color: textOn(primary) }}>
                  {displayName.charAt(0)}
                </div>
              )}
              <span
                title={displayName}
                className="font-extrabold tracking-tight leading-tight line-clamp-2 break-words text-sm md:text-lg min-w-0"
                style={{ fontFamily: heading, overflowWrap: "anywhere" }}
              >
                {displayName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Procurar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 border border-gray-200 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ "--tw-ring-color": primary } as any}
            />
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative shrink-0 p-2.5 rounded-full transition-colors shadow-lg" style={{ backgroundColor: primary, color: textOn(primary) }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">{cartItemCount}</span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Banner */}
        <section className="rounded-3xl overflow-hidden shadow-xl grid md:grid-cols-2 mb-6" style={{ background: bannerBackground }}>
          <div className="p-7 md:p-12 flex flex-col justify-center min-w-0">
            <h1 className="font-extrabold leading-tight break-words" style={{ color: heroTitleColor, fontFamily: heading, fontSize: heroSize(heroText), overflowWrap: "anywhere" }}>
              {heroFirst} {heroLast && <span style={{ color: primary }}>{heroLast}</span>}
            </h1>
            <p className="mt-4 text-base md:text-lg" style={{ color: heroSubColor }}>
              {store.heroSubtitle || "Descobre os nossos produtos e faz o teu pedido em poucos cliques."}
            </p>
            <button onClick={goToProducts} className="mt-6 self-start font-semibold px-7 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: primary, color: textOn(primary) }}>
              Ver produtos
            </button>
          </div>
          {store.heroImage ? (
            <img src={store.heroImage} alt="" className="w-full h-56 md:h-full min-h-[240px] object-cover" />
          ) : (
            <div className="min-h-[180px] md:min-h-[320px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}99)` }}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="" className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white/40 shadow-2xl" />
              ) : (
                <span className="font-extrabold text-8xl" style={{ color: textOn(primary) }}>{displayName.charAt(0)}</span>
              )}
            </div>
          )}
        </section>

        {/* Vantagens */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl p-4 shadow-sm border border-black/5 flex items-center gap-3" style={{ backgroundColor: cardBg, color: cardText }}>
              <span className="text-2xl w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}1A` }}>
                {f.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{f.title}</p>
                <p className="text-xs leading-tight mt-0.5 opacity-60">{f.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Pesquisa (telemóvel) */}
        <div className="md:hidden relative mb-6">
          <input
            type="text"
            placeholder="Procurar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": primary } as any}
          />
        </div>

        <div id="produtos" className={`flex justify-between items-end mb-6 scroll-mt-24 ${sectionBox}`}>
          <h2 className="text-2xl font-bold" style={{ color: sectionTitle, fontFamily: heading }}>Destaques para você</h2>
          <span className="text-sm" style={{ color: sectionCount }}>{filteredProducts.length} produtos</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-500">Tente pesquisar por outro nome.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-3xl p-3 md:p-4 shadow-sm border border-black/5 flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: cardBg, color: cardText }}>
                <div className="aspect-square bg-black/5 rounded-2xl relative overflow-hidden mb-4">
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
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2 break-words mb-1" style={{ fontFamily: heading }}>{product.name}</h3>
                  {product.description && <p className="text-xs mb-3 line-clamp-2 opacity-60">{product.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-2 gap-2">
                    <span className="text-lg md:text-xl font-extrabold" style={{ color: primary }}>
                      {Number(product.price).toLocaleString("pt-AO")} Kz
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shadow-md shrink-0"
                      style={{ backgroundColor: primary, color: textOn(primary) }}
                    >
                      <span className="hidden md:block text-sm font-medium">Adicionar</span>
                      <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(store.address || store.phone) && (
          <footer className={`mt-12 text-center text-sm ${store.bgImage ? "bg-white/85 rounded-2xl py-4 text-gray-600" : darkPage ? "text-gray-300" : "text-gray-500"}`}>
            {store.address && <p>📍 {store.address}</p>}
            {store.phone && <p className="mt-1">📞 {store.phone}</p>}
          </footer>
        )}
      </main>

      {isCartOpen && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />}

      {/* Carrinho */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            O teu Carrinho
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center mt-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-6">O teu carrinho está vazio.</p>
              <button onClick={() => setIsCartOpen(false)} className="px-6 py-2.5 rounded-full font-medium transition-colors" style={{ backgroundColor: primary, color: textOn(primary) }}>
                Começar a comprar
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100"></div>}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm break-words">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{Number(item.price).toLocaleString("pt-AO")} Kz / un</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                      <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-full transition-colors">-</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-full disabled:opacity-50 transition-colors">+</button>
                    </div>
                    <span className="font-bold" style={{ color: primary }}>
                      {(Number(item.price) * Number(item.quantity)).toLocaleString("pt-AO")} Kz
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-xl">{errorMsg}</div>}
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-900">{Number(cartSubtotal).toLocaleString("pt-AO")} Kz</span></div>
              <div className="flex justify-between text-gray-500"><span>Taxa de Entrega</span><span className="font-medium text-gray-900">{Number(deliveryFee).toLocaleString("pt-AO")} Kz</span></div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-extrabold text-xl" style={{ color: primary }}>{Number(cartTotal).toLocaleString("pt-AO")} Kz</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <input required placeholder="O teu nome completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primary } as any} />
              <input required placeholder="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primary } as any} />
              <input required placeholder="Endereço de entrega" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primary } as any} />
              <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl font-bold text-base transition-colors disabled:opacity-50 shadow-lg mt-2" style={{ backgroundColor: primary, color: textOn(primary) }}>
                {submitting ? "A processar..." : "Finalizar Compra"}
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Sucesso */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4" style={{ color: primary }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Pedido Efetuado!</h2>
            <p className="text-gray-500 mb-6 text-sm text-center">Para finalizar, efetue o pagamento e envie o comprovativo no WhatsApp.</p>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dados para Pagamento ({store.bankName || "Transferência"})</h3>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">IBAN</p>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                  <span className="font-mono text-sm text-gray-800 truncate pr-2">{store.iban || "Não configurado"}</span>
                  <button onClick={() => { navigator.clipboard.writeText(store.iban || ""); alert("IBAN Copiado!"); }} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">Copiar</button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Express</p>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                  <span className="font-mono text-sm text-gray-800">{store.expressNumber || "Não configurado"}</span>
                  <button onClick={() => { navigator.clipboard.writeText(store.expressNumber || ""); alert("Express Copiado!"); }} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">Copiar</button>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${store.phone?.replace(/\D/g, "")}?text=Olá, acabei de fazer o pedido no valor de ${Number(lastTotal).toLocaleString("pt-AO")} Kz. Vou enviar o comprovativo agora.`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition-colors mb-4 shadow-md"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar Comprovativo no WhatsApp
            </a>

            <div className="flex flex-col items-center gap-3">
              {store.feedbackPhone && (
                <a href={`https://wa.me/${store.feedbackPhone?.replace(/\D/g, "")}?text=Olá, gostaria de deixar uma reclamação/sugestão sobre o meu pedido.`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-gray-800 underline font-medium">
                  Reclamações ou Sugestões
                </a>
              )}
              <button onClick={() => setIsSuccess(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                Fechar e voltar à loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}