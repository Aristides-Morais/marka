// apps/web/src/lib/siteContent.ts

export type Sector = "beauty" | "food" | "retail" | "health" | "education" | "realestate" | "services" | "general";

export type SiteContent = {
  seo?: { title?: string; description?: string };
  heroTitle?: string;
  heroSubtitle?: string;
  buttonText?: string;
  heroImage?: string;
  description?: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutMission?: string;
  aboutVision?: string;
  aboutValues?: string[];
  stats?: { label: string; value: string }[];
  servicesTitle?: string;
  services?: { id?: string; name: string; desc: string; price: string }[];
  galleryTitle?: string;
  gallery?: string[];
  testimonialsTitle?: string;
  testimonials?: { name: string; text: string; role: string }[];
  faq?: { q: string; a: string }[];
  blog?: { title: string; excerpt: string; date: string; content: string }[];
  contactTitle?: string;
  visualIdentity?: Record<string, string>;
  animations?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  theme?: Record<string, string>;
};

export function detectSector(type?: string | null, template?: string | null): Sector {
  const value = `${type || ""} ${template || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/beleza|beauty|salao|barbearia|estetica|spa|cabeleireiro|unhas/.test(value)) return "beauty";
  if (/restaurante|restaurant|cafe|cafeteria|bar|food|comida|hotel/.test(value)) return "food";
  if (/saude|health|clinica|medico|dentista|farmacia|hospital/.test(value)) return "health";
  if (/educacao|education|escola|colegio|universidade|formacao|curso/.test(value)) return "education";
  if (/imobiliaria|realestate|imoveis|construcao|arquitetura/.test(value)) return "realestate";
  if (/loja|retail|comercio|shopping|supermercado|fashion|moda/.test(value)) return "retail";
  if (/servicos|services|consultoria|agencia|tecnologia|oficina/.test(value)) return "services";
  return "general";
}

// =========================================================================
// CONTEÚDO PREMIUM (Caso a base de dados esteja vazia, usa isto)
// =========================================================================
const DEFAULT_CONTENT: Record<Sector, SiteContent> = {
  food: {
    seo: {
      title: "Sabor & Arte | Gastronomia de Autor em Luanda",
      description: "Descubra o Sabor & Arte. Pratos exclusivos, ambiente sofisticado e uma experiência gastronómica inesquecível. Reserve já a sua mesa.",
    },
    heroTitle: "Onde Cada Prato Conta Uma História",
    heroSubtitle: "Ingredientes frescos, sabores intensos e uma experiência desenhada para despertar os seus sentidos. Venha viver a alta cozinha em Luanda.",
    buttonText: "Reservar Mesa",
    aboutTitle: "A Arte de Bem Servir",
    aboutText: "No Sabor & Arte, acreditamos que a gastronomia vai além da comida. É sobre a paixão de criar momentos inesquecíveis, combinando ingredientes locais frescos com técnicas culinárias de excelência internacional. Cada prato é uma celebração aos sabores de Angola, reinventados com um toque de sofisticação.",
    aboutMission: "Proporcionar momentos inesquecíveis através da gastronomia, oferecendo um serviço impecável e pratos que celebram a cultura e o sabor.",
    aboutVision: "Ser reconhecido como o destino gastronómico número um de Luanda, elevando a experiência culinária angolana a padrões internacionais.",
    aboutValues: ["Excelência no Serviço", "Ingredientes Frescos", "Paixão pela Cozinha", "Ambiente Acolhedor"],
    stats: [
      { label: "Anos de Experiência", value: "10+" },
      { label: "Clientes Satisfeitos", value: "5k+" },
      { label: "Pratos no Menu", value: "45" },
    ],
    servicesTitle: "O Nosso Menu de Autor",
    services: [
      { name: "Mufete de Cacusso", desc: "Peixe fresco grelhado na brasa, acompanhado de feijão de óleo de palma, banana pão e farofa.", price: "12.500 Kz" },
      { name: "Calulu de Carne Seca", desc: "Cozido lentamente com quiabos, jimboa e óleo de palma, servido com funge de bombó.", price: "10.000 Kz" },
      { name: "Cocktail Signature", desc: "Gin, maracujá fresco, hortelã e um toque secreto de especiarias.", price: "4.500 Kz" },
      { name: "Bife à Casa com Batata Trufada", desc: "Corte nobre de novilho, molho de cogumelos, batata rústica com azeite de trufa.", price: "18.000 Kz" },
      { name: "Risoto de Marisco", desc: "Arroz arbóreo cremoso com camarão, lulas e mexilhões frescos.", price: "15.000 Kz" },
      { name: "Cheesecake de Frutos Vermelhos", desc: "Base crocante, queijo creme suave e coulis de frutos vermelhos frescos.", price: "3.500 Kz" },
    ],
    testimonialsTitle: "O Que Dizem os Nossos Clientes",
    testimonials: [
      { name: "Maria Fernandes", text: "O melhor Mufete de Luanda! O ambiente é super elegante e o atendimento é de outro mundo.", role: "Cliente Fiel" },
      { name: "Carlos Andrade", text: "Festejei o meu aniversário aqui e superou todas as expectativas. O cocktail de maracujá é divinal.", role: "Cliente" },
    ],
    faq: [
      { q: "É necessário fazer reserva?", a: "Recomendamos vivamente a reserva, especialmente aos fins de semana, para garantir o seu lugar." },
      { q: "Têm opções vegetarianas?", a: "Sim, o nosso chef prepara opções vegetarianas deliciosas mediante pedido prévio." },
    ],
    blog: [
      { title: "A Arte de Preparar um Mufete Perfeito", excerpt: "Descubra os segredos do nosso chef para grelhar o peixe na perfeição.", date: "15 Nov 2026", content: "O segredo do mufete perfeito começa na frescura do peixe..." },
    ],
  },
  beauty: {
    seo: { title: "Salão de Beleza | Luanda", description: "Realce a sua beleza." },
    heroTitle: "Realce a Sua Beleza Natural",
    heroSubtitle: "Tratamentos exclusivos e um ambiente feito para relaxar.",
    aboutTitle: "O Seu Momento de Cuidado",
    aboutText: "No nosso salão, cada cliente é única. Oferecemos tratamentos de cabelo, unhas e estética com profissionais experientes.",
    servicesTitle: "Tratamentos",
    services: [{ name: "Corte e Escova", desc: "Corte personalizado e escova modelada.", price: "Sob consulta" }]
  },
  retail: { heroTitle: "Elegância Que Define Você", heroSubtitle: "A nova coleção chegou.", aboutTitle: "Curadoria de Estilo", aboutText: "Selecionamos as melhores peças.", servicesTitle: "Destaques" },
  health: { heroTitle: "A Sua Saúde em Boas Mãos", heroSubtitle: "Cuidados médicos de excelência.", aboutTitle: "Sobre a Clínica", aboutText: "Profissionais dedicados ao seu bem-estar.", servicesTitle: "Especialidades" },
  realestate: { heroTitle: "Encontre o Seu Novo Lar", heroSubtitle: "Os melhores imóveis de Luanda.", aboutTitle: "Sobre Nós", aboutText: "Ajudamos a realizar o seu sonho.", servicesTitle: "Imóveis" },
  education: { heroTitle: "Construa o Seu Futuro", heroSubtitle: "Formação de excelência.", aboutTitle: "Sobre a Escola", aboutText: "Educação focada no sucesso.", servicesTitle: "Cursos" },
  services: { heroTitle: "Soluções para o Seu Negócio", heroSubtitle: "Consultoria e serviços profissionais.", aboutTitle: "Sobre Nós", aboutText: "Experiência ao seu serviço.", servicesTitle: "Serviços" },
  general: { heroTitle: "Bem-vindo", heroSubtitle: "Conheça a nossa oferta.", aboutTitle: "Sobre Nós", aboutText: "Feito a pensar em si.", servicesTitle: "Oferta" }
};

// =========================================================================
// AQUI ESTÁ O SEGREDO: Ele ignora o "NÓS SÃO VIVO" da base de dados
// =========================================================================
export function mergeWithDefaults(raw: SiteContent | null, sector: Sector, businessName: string): SiteContent {
  const defaults = DEFAULT_CONTENT[sector] || DEFAULT_CONTENT.general;
  
  // Criamos uma cópia para não alterar o original
  const finalContent = { ...defaults };

  // Só aceitamos texto vindo do Super Admin se ele for válido e tiver mais de 10 caracteres.
  // Se for o "NÓS SÃO VIVO" (curto ou erro), ele é ignorado e usa o texto bonito.
  if (raw?.heroTitle && raw.heroTitle.length > 10 && raw.heroTitle !== "NÓS SÃO VIVO") {
    finalContent.heroTitle = raw.heroTitle;
  }
  if (raw?.heroSubtitle && raw.heroSubtitle.length > 10 && raw.heroSubtitle !== "SABORES") {
    finalContent.heroSubtitle = raw.heroSubtitle;
  }
  if (raw?.aboutTitle) finalContent.aboutTitle = raw.aboutTitle;
  if (raw?.aboutText) finalContent.aboutText = raw.aboutText;
  
  // Mescla os serviços
  if (raw?.services && raw.services.length > 0) finalContent.services = raw.services;

  // Fallback de imagens
  if (!finalContent.gallery || finalContent.gallery.length === 0) {
    finalContent.gallery = [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    ];
  }
  
  return finalContent;
}