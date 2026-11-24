/** Tipos e conteúdo por defeito do site institucional multiempresa */

export type Testimonial = {
  id: string;
  name: string;
  role?: string;
  text: string;
  avatarUrl?: string;
  rating?: number;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl?: string;
  publishedAt?: string;
};

export type MenuItem = {
  label: string;
  href: string;
};

export type SeoPage = {
  title?: string;
  description?: string;
};

export type SiteContent = {
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
  gallery?: string[];
  servicesTitle?: string;
  galleryTitle?: string;
  contactTitle?: string;
  contactIntro?: string;
  hours?: string;
  visualIdentity?: Record<string, string>;
  testimonials?: Testimonial[];
  testimonialsTitle?: string;
  faq?: FaqItem[];
  faqTitle?: string;
  posts?: BlogPost[];
  blogTitle?: string;
  menu?: MenuItem[];
  privacyTitle?: string;
  privacyBody?: string;
  termsTitle?: string;
  termsBody?: string;
  stats?: { label: string; value: string }[];
  seo?: {
    home?: SeoPage;
    about?: SeoPage;
    services?: SeoPage;
    contact?: SeoPage;
  };
};

export type Sector =
  | "beauty"
  | "food"
  | "retail"
  | "health"
  | "education"
  | "realestate"
  | "services"
  | "general";

export function detectSector(
  type?: string | null,
  template?: string | null
): Sector {
  const value = `${type || ""} ${template || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/beleza|beauty|salao|barbearia|estetica|spa|cabeleireiro|unhas/.test(value))
    return "beauty";
  if (/restaurante|restaurant|cafe|cafeteria|bar|food|comida|hotel/.test(value))
    return "food";
  if (/saude|health|clinica|medico|dentista|farmacia|hospital/.test(value))
    return "health";
  if (/educacao|education|escola|colegio|universidade|formacao|curso/.test(value))
    return "education";
  if (/imobiliaria|realestate|imoveis|construcao|arquitetura/.test(value))
    return "realestate";
  if (/loja|retail|comercio|shopping|supermercado|fashion|moda/.test(value))
    return "retail";
  if (/servicos|services|consultoria|agencia|tecnologia|oficina/.test(value))
    return "services";
  return "general";
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** Conteúdo institucional completo por sector — páginas nunca ficam vazias */
export function defaultContentForSector(
  sector: Sector,
  businessName: string
): SiteContent {
  const n = businessName || "o nosso negócio";

  const baseLegal = {
    privacyTitle: "Política de Privacidade",
    privacyBody: `A ${n} respeita a sua privacidade e trata os dados pessoais de acordo com a legislação aplicável em Angola.\n\nRecolhemos apenas os dados necessários para prestar os nossos serviços (nome, contacto, preferências de marcação ou encomenda). Estes dados não são vendidos a terceiros.\n\nPode solicitar acesso, correcção ou eliminação dos seus dados através dos nossos contactos oficiais.\n\nUtilizamos cookies técnicos essenciais ao funcionamento do website. Ao continuar a navegar, aceita a nossa política de privacidade.\n\nÚltima actualização: ${new Date().getFullYear()}.`,
    termsTitle: "Termos de Uso",
    termsBody: `Ao utilizar o website e os serviços da ${n}, aceita os presentes termos.\n\nOs conteúdos (textos, imagens, logótipos) são propriedade da ${n} ou dos respectivos titulares e não podem ser reproduzidos sem autorização.\n\nReservamo-nos o direito de alterar preços, horários e condições de serviço com aviso prévio razoável. Marcações e encomendas estão sujeitas a disponibilidade e confirmação.\n\nEm caso de dúvida, contacte-nos pelos canais oficiais indicados no website.`,
  };

  const commonMenu: MenuItem[] = [
    { label: "Início", href: "" },
    { label: "Sobre", href: "sobre" },
    { label: "Serviços", href: "servicos" },
    { label: "Depoimentos", href: "depoimentos" },
    { label: "FAQ", href: "faq" },
    { label: "Contactos", href: "contactos" },
  ];

  const packs: Record<Sector, SiteContent> = {
    beauty: {
      heroTitle: `${n}`,
      heroSubtitle:
        "Cuidado personalizado, resultados visíveis e um momento só seu. Descubra tratamentos pensados para realçar a sua beleza natural.",
      buttonText: "Marcar horário",
      aboutTitle: `A história da ${n}`,
      aboutText: `Na ${n}, acreditamos que a beleza começa pelo bem-estar. Cada cliente é recebido com atenção individual, produtos de qualidade e uma equipa apaixonada pelo que faz.\n\nO nosso espaço foi pensado para ser um refúgio: ambiente acolhedor, higiene rigorosa e técnicas actualizadas.`,
      aboutMission:
        "Oferecer experiências de beleza e bem-estar com excelência técnica e atendimento humano.",
      aboutVision:
        "Ser referência de confiança e qualidade na região, inovando com responsabilidade.",
      aboutValues: [
        "Atenção ao detalhe",
        "Higiene e segurança",
        "Formação contínua",
        "Respeito pela individualidade",
      ],
      servicesTitle: "Tratamentos e serviços",
      galleryTitle: "O nosso trabalho",
      contactTitle: "Reserve o seu momento",
      contactIntro:
        "Escolha o horário que mais lhe convém. Confirmamos a marcação por mensagem.",
      hours: "Terça a Sábado · 09:00 – 19:00",
      testimonialsTitle: "O que dizem os nossos clientes",
      testimonials: [
        {
          id: uid(),
          name: "Mariana S.",
          role: "Cliente há 2 anos",
          text: "Saio sempre renovada. A equipa ouve o que quero e recomenda com honestidade.",
          rating: 5,
        },
        {
          id: uid(),
          name: "Carla M.",
          role: "Coloração",
          text: "A coloração ficou exactamente como imaginei. Profissionais atentas.",
          rating: 5,
        },
        {
          id: uid(),
          name: "Joana P.",
          role: "Tratamento facial",
          text: "O tratamento facial fez diferença real na pele. Voltarei com certeza.",
          rating: 5,
        },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        {
          id: uid(),
          question: "Como marco um horário?",
          answer:
            "Pode marcar pelo website (reservas), WhatsApp ou telefone. Confirmamos a disponibilidade no mesmo dia sempre que possível.",
        },
        {
          id: uid(),
          question: "Qual a política de cancelamento?",
          answer:
            "Pedimos que avise com pelo menos 4 horas de antecedência para podermos disponibilizar o horário a outra pessoa.",
        },
        {
          id: uid(),
          question: "Trabalham com produtos específicos?",
          answer:
            "Utilizamos marcas profissionais seleccionadas. Se tiver alergias ou preferências, diga-nos na marcação.",
        },
        {
          id: uid(),
          question: "Aceitam grupos ou noivas?",
          answer:
            "Sim. Para eventos e noivas, contacte-nos com antecedência para montarmos um plano personalizado.",
        },
      ],
      blogTitle: "Dicas de beleza e bem-estar",
      posts: [
        {
          id: uid(),
          title: "Como cuidar da coloração em casa",
          slug: "cuidar-coloracao-casa",
          excerpt:
            "Truques simples para manter a cor viva por mais tempo entre visitas ao salão.",
          body: "Use champô específico para cabelo pintado, evite água muito quente e aplique máscara hidratante uma vez por semana. Proteja o cabelo do sol em dias intensos.",
          publishedAt: "2026-10-12",
        },
        {
          id: uid(),
          title: "Rotina de pele para clima tropical",
          slug: "rotina-pele-tropical",
          excerpt:
            "Limpeza, hidratação e protecção solar: o essencial para o dia-a-dia em Luanda.",
          body: "De manhã, limpe suavemente, hidrate e use protector solar. À noite, remova a maquilhagem e invista num sérum adequado ao seu tipo de pele.",
          publishedAt: "2026-09-28",
        },
      ],
      stats: [
        { value: "8+", label: "Anos de experiência" },
        { value: "2.400+", label: "Clientes atendidos" },
        { value: "15", label: "Tratamentos" },
        { value: "4.9", label: "Avaliação média" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: {
          title: `${n} | Beleza e bem-estar`,
          description: `Salão ${n}: cortes, coloração, tratamentos e estética.`,
        },
        about: { title: `Sobre nós | ${n}`, description: `Conheça a equipa da ${n}.` },
        services: { title: `Serviços | ${n}`, description: `Tratamentos na ${n}.` },
        contact: { title: `Contactos | ${n}`, description: `Marque horário.` },
      },
    },

    food: {
      heroTitle: "Boa comida. Bons momentos.",
      heroSubtitle:
        "Sabores preparados com cuidado, ambiente acolhedor e serviço atento.",
      buttonText: "Ver menu",
      aboutTitle: `A ${n}`,
      aboutText: `Na ${n} cozinhamos com ingredientes frescos e respeito pelas tradições, sem medo de um toque contemporâneo.\n\nQueremos que cada visita seja simples e memorável: pratos bem apresentados, atendimento simpático e um espaço onde apetece ficar.`,
      aboutMission: "Servir comida honesta e saborosa, com hospitalidade genuína.",
      aboutVision: "Ser o restaurante de referência na zona para quem valoriza sabor e ambiente.",
      aboutValues: ["Ingredientes de qualidade", "Cozinha limpa e consistente", "Preço justo", "Hospitalidade"],
      servicesTitle: "O nosso menu",
      galleryTitle: "Ambiente e pratos",
      contactTitle: "Reserve a sua mesa",
      contactIntro: "Reservas por telefone ou WhatsApp. Também aceitamos pedidos para takeaway.",
      hours: "Todos os dias · 11:30 – 22:00",
      testimonialsTitle: "Quem já se sentou à nossa mesa",
      testimonials: [
        { id: uid(), name: "Paulo R.", role: "Cliente frequente", text: "O bitoque está sempre no ponto. Ambiente familiar.", rating: 5 },
        { id: uid(), name: "Ana L.", role: "Jantar em família", text: "Trouxe a família no domingo. Todos gostaram.", rating: 5 },
        { id: uid(), name: "Miguel T.", role: "Almoço de trabalho", text: "Ideal para almoços de trabalho: menu variado e ambiente calmo.", rating: 4 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Fazem reservas?", answer: "Sim. Reserve por telefone ou WhatsApp, especialmente ao fim-de-semana e em grupos." },
        { id: uid(), question: "Têm opções vegetarianas?", answer: "Sim. Informe alergias ou restrições ao encomendar." },
        { id: uid(), question: "Fazem entregas ou takeaway?", answer: "Aceitamos takeaway. Para entrega, confirme disponibilidade e zona." },
        { id: uid(), question: "Aceitam eventos privados?", answer: "Para grupos maiores, fale connosco com antecedência." },
      ],
      blogTitle: "Da cozinha",
      posts: [
        { id: uid(), title: "Os clássicos que não saem do menu", slug: "classicos-menu", excerpt: "Porque alguns pratos permanecem favoritos.", body: "Consistência é a nossa prioridade. Mantemos as receitas base e ajustamos apenas a frescura dos ingredientes.", publishedAt: "2026-10-05" },
        { id: uid(), title: "Como pedir takeaway sem complicações", slug: "takeaway-facil", excerpt: "Passo a passo para encomendar.", body: "Escolha no menu, envie pelo WhatsApp com o seu nome e hora de levantamento.", publishedAt: "2026-09-18" },
      ],
      stats: [
        { value: "12+", label: "Anos a servir" },
        { value: "40+", label: "Pratos no menu" },
        { value: "500+", label: "Refeições/semana" },
        { value: "4.8", label: "Satisfação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Restaurante`, description: `Menu, reservas e takeaway.` },
        about: { title: `Sobre | ${n}`, description: `A história da ${n}.` },
        services: { title: `Menu | ${n}`, description: `Pratos e especialidades.` },
        contact: { title: `Contactos | ${n}`, description: `Reservas e localização.` },
      },
    },

    health: {
      heroTitle: `${n}`,
      heroSubtitle: "Cuidado clínico com proximidade humana. Consultas e acompanhamento focados na sua saúde.",
      buttonText: "Marcar consulta",
      aboutTitle: `Sobre a ${n}`,
      aboutText: `A ${n} nasceu da vontade de oferecer cuidados de saúde acessíveis, claros e humanos.\n\nValorizamos o tempo de escuta, a explicação transparente das opções de tratamento e o acompanhamento contínuo.`,
      aboutMission: "Prestar cuidados de saúde de qualidade, com ética e proximidade.",
      aboutVision: "Ser uma referência de confiança para famílias e empresas da comunidade.",
      aboutValues: ["Ética profissional", "Escuta activa", "Actualização clínica", "Confidencialidade"],
      servicesTitle: "Especialidades e cuidados",
      galleryTitle: "Instalações",
      contactTitle: "Agende a sua consulta",
      contactIntro: "Indique a especialidade e a preferência de horário.",
      hours: "Segunda a Sexta · 08:00 – 17:30 · Sábado 08:00 – 12:00",
      testimonialsTitle: "Experiências dos nossos pacientes",
      testimonials: [
        { id: uid(), name: "Sofia A.", role: "Consulta de rotina", text: "Atendimento pontual e explicações claras.", rating: 5 },
        { id: uid(), name: "Ricardo N.", role: "Acompanhamento", text: "O acompanhamento foi regular e profissional.", rating: 5 },
        { id: uid(), name: "Helena C.", role: "Primeira visita", text: "Instalações limpas e equipa simpática.", rating: 5 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como marco uma consulta?", answer: "Pelo website, telefone ou WhatsApp." },
        { id: uid(), question: "Que documentos devo levar?", answer: "Documento de identificação e exames anteriores relevantes." },
        { id: uid(), question: "Aceitam seguros ou empresas?", answer: "Trabalhamos com várias modalidades. Confirme connosco." },
        { id: uid(), question: "Há atendimento de urgência?", answer: "Para urgências vitais, dirija-se aos serviços de emergência." },
      ],
      blogTitle: "Saúde e prevenção",
      posts: [
        { id: uid(), title: "A importância das consultas de rotina", slug: "consultas-rotina", excerpt: "Prevenir é mais simples do que tratar.", body: "Consultas periódicas permitem detectar alterações cedo e ajustar hábitos.", publishedAt: "2026-10-01" },
        { id: uid(), title: "Preparar-se para a primeira consulta", slug: "primeira-consulta", excerpt: "Lista prática do que levar.", body: "Anote sintomas, medicamentos actuais e dúvidas. Chegue com alguns minutos de antecedência.", publishedAt: "2026-09-10" },
      ],
      stats: [
        { value: "10+", label: "Anos de clínica" },
        { value: "6", label: "Especialidades" },
        { value: "8.000+", label: "Consultas" },
        { value: "98%", label: "Recomendação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Clínica`, description: `Cuidados de saúde. Marque consulta.` },
        about: { title: `Sobre | ${n}`, description: `A equipa da ${n}.` },
        services: { title: `Serviços | ${n}`, description: `Especialidades e cuidados.` },
        contact: { title: `Contactos | ${n}`, description: `Marcações e localização.` },
      },
    },

    retail: {
      heroTitle: `${n}`,
      heroSubtitle: "Selecção cuidada, qualidade e estilo.",
      buttonText: "Ver loja",
      aboutTitle: `A ${n}`,
      aboutText: `Na ${n} escolhemos cada produto com critério: qualidade, utilidade e um design que acompanha o seu estilo.`,
      aboutMission: "Oferecer produtos de qualidade com uma experiência de compra agradável.",
      aboutVision: "Ser a loja de referência pela curadoria e pelo serviço.",
      aboutValues: ["Curadoria", "Transparência", "Atendimento", "Sustentabilidade"],
      servicesTitle: "Destaques da loja",
      galleryTitle: "Colecção",
      contactTitle: "Fale connosco",
      contactIntro: "Dúvidas sobre tamanhos, stock ou encomendas? Estamos disponíveis.",
      hours: "Segunda a Sábado · 09:00 – 19:00",
      testimonialsTitle: "Opiniões de quem compra",
      testimonials: [
        { id: uid(), name: "Inês F.", text: "Peças com boa qualidade e atendimento atento.", rating: 5 },
        { id: uid(), name: "Bruno K.", text: "Encomenda rápida e bem embalada.", rating: 5 },
        { id: uid(), name: "Teresa V.", text: "Boa selecção e preços justos.", rating: 4 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como funciona a encomenda online?", answer: "Escolha os produtos e siga as instruções de pagamento e levantamento ou entrega." },
        { id: uid(), question: "Posso trocar ou devolver?", answer: "Sim, dentro do prazo indicado e com o produto em condições." },
        { id: uid(), question: "Têm stock de todos os tamanhos?", answer: "O stock é actualizado com frequência. Pergunte se não encontrar o seu." },
      ],
      blogTitle: "Novidades e inspirações",
      posts: [
        { id: uid(), title: "Como combinar peças da nova colecção", slug: "combinar-coleccao", excerpt: "Ideias práticas para o dia-a-dia.", body: "Comece por uma peça-base neutra e acrescente textura ou cor.", publishedAt: "2026-10-08" },
      ],
      stats: [
        { value: "500+", label: "Produtos" },
        { value: "5", label: "Anos" },
        { value: "3.200+", label: "Clientes" },
        { value: "4.7", label: "Avaliação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Loja`, description: `Produtos e colecções.` },
        about: { title: `Sobre | ${n}`, description: `A loja ${n}.` },
        services: { title: `Produtos | ${n}`, description: `Destaques.` },
        contact: { title: `Contactos | ${n}`, description: `Fale connosco.` },
      },
    },

    education: {
      heroTitle: `${n}`,
      heroSubtitle: "Formação prática, acompanhamento próximo e um ambiente feito para aprender.",
      buttonText: "Ver cursos",
      aboutTitle: `Sobre a ${n}`,
      aboutText: `A ${n} dedica-se a formar pessoas com programas claros, professores experientes e foco na aplicação prática.`,
      aboutMission: "Formar com rigor e proximidade, preparando para desafios reais.",
      aboutVision: "Ser uma escola de referência pela qualidade pedagógica.",
      aboutValues: ["Rigor", "Prática", "Inclusão", "Melhoria contínua"],
      servicesTitle: "Cursos e formação",
      galleryTitle: "Campus e actividades",
      contactTitle: "Fale com a secretaria",
      contactIntro: "Esclarecemos dúvidas sobre cursos, horários e inscrições.",
      hours: "Segunda a Sexta · 08:30 – 18:00",
      testimonialsTitle: "Quem já formou connosco",
      testimonials: [
        { id: uid(), name: "Daniela R.", role: "Ex-aluna", text: "Metodologia clara e professores disponíveis.", rating: 5 },
        { id: uid(), name: "Carlos M.", role: "Curso técnico", text: "Bom equilíbrio entre teoria e prática.", rating: 5 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como me inscrevo?", answer: "Contacte a secretaria. Indicamos vagas, valores e documentos." },
        { id: uid(), question: "Os cursos têm certificado?", answer: "Sim, mediante assiduidade e aproveitamento." },
        { id: uid(), question: "Há horários pós-laboral?", answer: "Vários cursos têm turmas em horário pós-laboral." },
      ],
      blogTitle: "Recursos e artigos",
      posts: [
        { id: uid(), title: "Como escolher o curso certo", slug: "escolher-curso", excerpt: "Perguntas antes de se inscrever.", body: "Defina o objectivo profissional, o tempo disponível e o formato.", publishedAt: "2026-09-22" },
      ],
      stats: [
        { value: "20+", label: "Cursos" },
        { value: "1.500+", label: "Formandos" },
        { value: "12", label: "Anos" },
        { value: "96%", label: "Conclusão" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Formação`, description: `Cursos e formação.` },
        about: { title: `Sobre | ${n}`, description: `A ${n}.` },
        services: { title: `Cursos | ${n}`, description: `Oferta formativa.` },
        contact: { title: `Contactos | ${n}`, description: `Inscrições.` },
      },
    },

    realestate: {
      heroTitle: `${n}`,
      heroSubtitle: "Imóveis seleccionados e acompanhamento transparente.",
      buttonText: "Ver oportunidades",
      aboutTitle: `A ${n}`,
      aboutText: `Na ${n} trabalhamos com seriedade: informação clara sobre cada imóvel, visitas organizadas e apoio em todas as etapas.`,
      aboutMission: "Ligar pessoas aos espaços certos, com transparência.",
      aboutVision: "Ser a imobiliária de confiança pela qualidade do portefólio.",
      aboutValues: ["Transparência", "Discrição", "Rigor", "Acompanhamento"],
      servicesTitle: "Imóveis em destaque",
      galleryTitle: "Propriedades",
      contactTitle: "Fale com um consultor",
      contactIntro: "Descreva o que procura e entraremos em contacto.",
      hours: "Segunda a Sexta · 09:00 – 18:00 · Sábado sob marcação",
      testimonialsTitle: "Clientes satisfeitos",
      testimonials: [
        { id: uid(), name: "Família Mendes", text: "Processo claro do início ao fim.", rating: 5 },
        { id: uid(), name: "André S.", role: "Investidor", text: "Boa selecção de oportunidades.", rating: 5 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como agendo uma visita?", answer: "Indique o imóvel e a disponibilidade." },
        { id: uid(), question: "Trabalham com arrendamento e venda?", answer: "Sim. Diga-nos o seu objectivo." },
        { id: uid(), question: "Quais os documentos habituais?", answer: "O consultor indica a lista na primeira conversa." },
      ],
      blogTitle: "Mercado e dicas",
      posts: [
        { id: uid(), title: "Checklist antes de visitar um imóvel", slug: "checklist-visita", excerpt: "O que observar em cada visita.", body: "Luz natural, estado de conservação, acessos e custos associados.", publishedAt: "2026-10-03" },
      ],
      stats: [
        { value: "120+", label: "Imóveis" },
        { value: "9", label: "Anos" },
        { value: "400+", label: "Negócios" },
        { value: "4.9", label: "Satisfação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Imobiliária`, description: `Imóveis e oportunidades.` },
        about: { title: `Sobre | ${n}`, description: `A ${n}.` },
        services: { title: `Imóveis | ${n}`, description: `Destaques.` },
        contact: { title: `Contactos | ${n}`, description: `Fale com um consultor.` },
      },
    },

    services: {
      heroTitle: `${n}`,
      heroSubtitle: "Soluções profissionais, processos claros e resultados que pode medir.",
      buttonText: "Falar connosco",
      aboutTitle: `Quem é a ${n}`,
      aboutText: `A ${n} apoia empresas e profissionais com serviços especializados, comunicação transparente e foco em resultados.`,
      aboutMission: "Entregar soluções que resolvem problemas reais.",
      aboutVision: "Ser o parceiro preferencial pela fiabilidade.",
      aboutValues: ["Clareza", "Cumprimento", "Melhoria contínua", "Parceria"],
      servicesTitle: "O que fazemos",
      galleryTitle: "Portefólio",
      contactTitle: "Vamos conversar",
      contactIntro: "Descreva o seu projecto. Respondemos com uma proposta adequada.",
      hours: "Segunda a Sexta · 09:00 – 18:00",
      testimonialsTitle: "Cases e depoimentos",
      testimonials: [
        { id: uid(), name: "Empresa Alpha", role: "Cliente corporativo", text: "Cumpriram prazos e mantiveram-nos informados.", rating: 5 },
        { id: uid(), name: "João L.", role: "Empreendedor", text: `Proposta clara e execução sólida. Recomendo a ${n}.`, rating: 5 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como começa um projecto?", answer: "Com uma conversa de diagnóstico e depois uma proposta." },
        { id: uid(), question: "Trabalham com empresas de qualquer dimensão?", answer: "Sim. Adaptamos o âmbito ao cliente." },
        { id: uid(), question: "Qual o prazo médio?", answer: "Indicamos prazos realistas na proposta." },
      ],
      blogTitle: "Recursos",
      posts: [
        { id: uid(), title: "Como preparar um briefing eficaz", slug: "briefing-eficaz", excerpt: "Informação que acelera propostas.", body: "Objectivos, prazos, público e restrições: quanto mais claro o briefing, melhor a solução.", publishedAt: "2026-09-30" },
      ],
      stats: [
        { value: "150+", label: "Projectos" },
        { value: "7", label: "Anos" },
        { value: "60+", label: "Clientes" },
        { value: "4.9", label: "Satisfação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: `${n} | Serviços`, description: `Soluções profissionais.` },
        about: { title: `Sobre | ${n}`, description: `A ${n}.` },
        services: { title: `Serviços | ${n}`, description: `O que fazemos.` },
        contact: { title: `Contactos | ${n}`, description: `Peça uma proposta.` },
      },
    },

    general: {
      heroTitle: n,
      heroSubtitle: "Qualidade, confiança e um atendimento pensado para si.",
      buttonText: "Saber mais",
      aboutTitle: `Sobre a ${n}`,
      aboutText: `A ${n} existe para servir bem: com clareza, respeito pelo seu tempo e compromisso com a qualidade.`,
      aboutMission: "Servir com excelência e proximidade.",
      aboutVision: "Crescer com a confiança de quem nos escolhe.",
      aboutValues: ["Qualidade", "Transparência", "Compromisso", "Respeito"],
      servicesTitle: "A nossa oferta",
      galleryTitle: "Galeria",
      contactTitle: "Contacte-nos",
      contactIntro: "Estamos prontos para responder às suas questões.",
      hours: "Segunda a Sexta · 09:00 – 18:00",
      testimonialsTitle: "Depoimentos",
      testimonials: [
        { id: uid(), name: "Cliente satisfeito", text: "Atendimento profissional e resultado à altura.", rating: 5 },
        { id: uid(), name: "Maria G.", text: "Recomendo pela seriedade e pelo acompanhamento.", rating: 5 },
      ],
      faqTitle: "Perguntas frequentes",
      faq: [
        { id: uid(), question: "Como vos contacto?", answer: "Por telefone, WhatsApp ou formulário na página de contactos." },
        { id: uid(), question: "Onde estão localizados?", answer: "Veja a morada e o mapa na página Localização." },
      ],
      blogTitle: "Novidades",
      posts: [
        { id: uid(), title: "Bem-vindo ao nosso website", slug: "bem-vindo", excerpt: "Conheça as nossas páginas e serviços.", body: "Explore o site para saber mais sobre nós e como falar connosco.", publishedAt: "2026-10-01" },
      ],
      stats: [
        { value: "5+", label: "Anos" },
        { value: "500+", label: "Clientes" },
        { value: "100%", label: "Dedicação" },
        { value: "4.8", label: "Avaliação" },
      ],
      menu: commonMenu,
      ...baseLegal,
      seo: {
        home: { title: n, description: `Website oficial da ${n}.` },
        about: { title: `Sobre | ${n}`, description: `Conheça a ${n}.` },
        services: { title: `Serviços | ${n}`, description: `A nossa oferta.` },
        contact: { title: `Contactos | ${n}`, description: `Fale connosco.` },
      },
    },
  };

  return packs[sector] || packs.general;
}

/** Junta conteúdo publicado com defaults do sector (nada fica vazio) */
export function mergeWithDefaults(
  published: SiteContent | null | undefined,
  sector: Sector,
  businessName: string
): SiteContent {
  const defaults = defaultContentForSector(sector, businessName);
  if (!published) return defaults;
  return {
    ...defaults,
    ...published,
    testimonials: published.testimonials?.length ? published.testimonials : defaults.testimonials,
    faq: published.faq?.length ? published.faq : defaults.faq,
    posts: published.posts?.length ? published.posts : defaults.posts,
    stats: published.stats?.length ? published.stats : defaults.stats,
    aboutValues: published.aboutValues?.length ? published.aboutValues : defaults.aboutValues,
    menu: published.menu?.length ? published.menu : defaults.menu,
    privacyBody: published.privacyBody || defaults.privacyBody,
    termsBody: published.termsBody || defaults.termsBody,
    seo: { ...defaults.seo, ...published.seo },
  };
}