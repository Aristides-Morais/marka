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

// Conteúdo Premium Padrão para cada setor
const DEFAULT_CONTENT: Record<Sector, SiteContent> = {
  food: {
    seo: { title: "Alive Restaurante & Lounge | Alta Cozinha em Luanda", description: "Viva uma experiência gastronómica inesquecível no Alive. Pratos de autor, ambiente sofisticado e reservas online." },
    heroTitle: "Onde Cada Prato Conta Uma História",
    heroSubtitle: "Ingredientes frescos, sabores intensos e uma experiência desenhada para despertar os seus sentidos. Venha viver a alta cozinha em Luanda.",
    buttonText: "Reservar Mesa",
    aboutTitle: "A Nossa Paixão pela Alta Cozinha",
    aboutText: "Fundado em 2018, o Restaurante Alive nasceu do sonho de trazer para Luanda uma fusão perfeita entre a tradição angolana e as técnicas culinárias mais modernas do mundo. A nossa cozinha é liderada pelo Chef João Silva, que combina ingredientes locais frescos com um toque de sofisticação internacional.",
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
      { name: "Ana Rita", text: "Atenção aos detalhes no prato e no serviço. Voltarei com certeza!", role: "Food Blogger" },
    ],
    faq: [
      { q: "É necessário fazer reserva?", a: "Recomendamos vivamente a reserva, especialmente aos fins de semana, para garantir o seu lugar." },
      { q: "Têm opções vegetarianas?", a: "Sim, o nosso chef prepara opções vegetarianas deliciosas mediante pedido prévio." },
      { q: "Qual é o horário de funcionamento?", a: "Abrimos de terça a domingo, das 12h às 23h." },
      { q: "Fazem eventos privados?", a: "Sim, temos um espaço lounge dedicado para eventos privados. Contacte-nos para mais informações." },
    ],
    blog: [
      { title: "A Arte de Preparar um Mufete Perfeito", excerpt: "Descubra os segredos do nosso chef para grelhar o peixe na perfeição e o equilíbrio do óleo de palma.", date: "15 Nov 2026", content: "O segredo do mufete perfeito começa na frescura do peixe. No Alive, recebemos o cacusso diariamente diretamente do mercado. A arte está em não sobrecarregar o peixe com temperos fortes, deixando o sabor natural brilhar..." },
      { title: "Harmonização de Vinhos com Pratos Angolanos", excerpt: "Saiba qual vinho escolher para acompanhar o Calulu ou a Muamba de Galinha.", date: "02 Nov 2026", content: "Muitos pensam que a comida angolana não combina com vinho. Neste artigo, o nosso sommelier explica como os vinhos brancos mais ácidos cortam a gordura do óleo de palma..." },
    ],
  },
  // ... (Os outros setores mantêm os fallbacks simples)
  beauty: { heroTitle: "Realce a Sua Beleza Natural", heroSubtitle: "Tratamentos exclusivos e um ambiente feito para relaxar.", aboutTitle: "O Seu Momento de Cuidado", aboutText: "No nosso salão, cada cliente é única. Oferecemos tratamentos de cabelo, unhas e estética com profissionais experientes.", servicesTitle: "Tratamentos", services: [{ name: "Corte e Escova", desc: "Corte personalizado e escova modelada.", price: "Sob consulta" }] },
  retail: { heroTitle: "Elegância Que Define Você", heroSubtitle: "A nova coleção chegou.", aboutTitle: "Curadoria de Estilo", aboutText: "Selecionamos as melhores peças.", servicesTitle: "Destaques" },
  health: { heroTitle: "A Sua Saúde em Boas Mãos", heroSubtitle: "Cuidados médicos de excelência.", aboutTitle: "Sobre a Clínica", aboutText: "Profissionais dedicados ao seu bem-estar.", servicesTitle: "Especialidades" },
  realestate: { heroTitle: "Encontre o Seu Novo Lar", heroSubtitle: "Os melhores imóveis de Luanda.", aboutTitle: "Sobre Nós", aboutText: "Ajudamos a realizar o seu sonho.", servicesTitle: "Imóveis" },
  education: { heroTitle: "Construa o Seu Futuro", heroSubtitle: "Formação de excelência.", aboutTitle: "Sobre a Escola", aboutText: "Educação focada no sucesso.", servicesTitle: "Cursos" },
  services: { heroTitle: "Soluções para o Seu Negócio", heroSubtitle: "Consultoria e serviços profissionais.", aboutTitle: "Sobre Nós", aboutText: "Experiência ao seu serviço.", servicesTitle: "Serviços" },
  general: { heroTitle: "Bem-vindo", heroSubtitle: "Conheça a nossa oferta.", aboutTitle: "Sobre Nós", aboutText: "Feito a pensar em si.", servicesTitle: "Oferta" }
};

export function mergeWithDefaults(raw: SiteContent | null, sector: Sector, businessName: string): SiteContent {
  // Força o setor food para o Alive para garantir o design correto
  const isAlive = businessName.toLowerCase().includes("alive");
  const finalSector = isAlive ? "food" : sector;
  
  const defaults = DEFAULT_CONTENT[finalSector] || DEFAULT_CONTENT.general;
  const finalContent = { ...defaults };

  // Só aceita texto do Super Admin se for válido
  if (raw?.heroTitle && raw.heroTitle.length > 10 && raw.heroTitle !== "ESTAMOS VIVOS" && raw.heroTitle !== "Elegância Que Define Você") {
    finalContent.heroTitle = raw.heroTitle;
  }
  if (raw?.heroSubtitle && raw.heroSubtitle.length > 10 && raw.heroSubtitle !== "A nova coleção chegou.") {
    finalContent.heroSubtitle = raw.heroSubtitle;
  }
  
  if (raw?.aboutTitle && raw.aboutTitle !== "Curadoria de Estilo") finalContent.aboutTitle = raw.aboutTitle;
  if (raw?.aboutText && raw.aboutText !== "Selecionamos as melhores peças.") finalContent.aboutText = raw.aboutText;
  
  if (raw?.services && raw.services.length > 0 && finalSector !== "food") finalContent.services = raw.services;
  else if (finalSector === "food") finalContent.services = defaults.services; // Força o menu do restaurante

  // GALERIA ATUALIZADA COM 8 IMAGENS DE PRATOS VARIADOS
  if (!finalContent.gallery || finalContent.gallery.length === 0 || finalSector === "food") {
    finalContent.gallery = [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80", // Mesa posta
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",  // Prato de carne
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",  // Prato gourmet
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", // Restaurante interior
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",  // Bife
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80", // Salmão
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",  // Massa
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80", // Salada
    ];
  }
  
  return finalContent;
}