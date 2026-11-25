// apps/web/src/lib/sectorContent.ts

export type SectorContent = {
  seo: { title: string; description: string };
  hero: { title: string; subtitle: string; cta: string };
  about: { title: string; text: string; mission: string; vision: string };
  services: { title: string; items: { name: string; desc: string; price: string }[] };
  testimonials: { name: string; text: string; role: string }[];
  faq: { q: string; a: string }[];
  blog: { title: string; excerpt: string; date: string; content: string }[];
};

export const SECTOR_CONTENT: Record<string, SectorContent> = {
  food: {
    seo: {
      title: "Restaurante e Lounge Alive | Sabores Inesquecíveis em Luanda",
      description: "Descubra o Restaurante Alive. Cozinha de autor, ambiente acolhedor e os melhores cocktails de Luanda. Reserve a sua mesa hoje.",
    },
    hero: {
      title: "Uma Experiência Gastronómica Inesquecível",
      subtitle: "Onde cada prato conta uma história. Ingredientes frescos, sabores intensos e um ambiente desenhado para momentos únicos.",
      cta: "Reservar Mesa",
    },
    about: {
      title: "A Nossa Paixão pela Alta Cozinha",
      text: "Fundado em 2018, o Restaurante Alive nasceu do sonho de trazer para Luanda uma fusão perfeita entre a tradição angolana e as técnicas culinárias mais modernas do mundo. A nossa cozinha é liderada pelo Chef João Silva, que combina ingredientes locais frescos com um toque de sofisticação internacional.",
      mission: "Proporcionar momentos inesquecíveis através da gastronomia, oferecendo um serviço impecável e pratos que celebram a cultura e o sabor.",
      vision: "Ser reconhecido como o destino gastronómico número um de Luanda, elevando a experiência culinária angolana a padrões internacionais.",
    },
    services: {
      title: "O Nosso Menu",
      items: [
        { name: "Mufete de Cacusso", desc: "Peixe fresco grelhado na brasa, acompanhado de feijão de óleo de palma, banana pão e farofa.", price: "12.500 Kz" },
        { name: "Calulu de Carne Seca", desc: "Cozido lentamente com quiabos, jimboa e óleo de palma, servido com funge de bombó.", price: "10.000 Kz" },
        { name: "Cocktail Alive Signature", desc: "Gin, maracujá fresco, hortelã e um toque secreto de especiarias.", price: "4.500 Kz" },
        { name: "Bife à Casa com Batata Trufada", desc: "Corte nobre de novilho, molho de cogumelos, batata rústica com azeite de trufa.", price: "18.000 Kz" },
      ],
    },
    testimonials: [
      { name: "Maria Fernandes", text: "O melhor Mufete de Luanda! O ambiente é super elegante e o atendimento é de outro mundo.", role: "Cliente Fiel" },
      { name: "Carlos Andrade", text: "Festejei o meu aniversário no Alive e superou todas as expectativas. O cocktail de maracujá é divinal.", role: "Cliente" },
    ],
    faq: [
      { q: "É necessário fazer reserva?", a: "Recomendamos vivamente a reserva, especialmente aos fins de semana, para garantir o seu lugar." },
      { q: "Têm opções vegetarianas?", a: "Sim, o nosso chef prepara opções vegetarianas deliciosas mediante pedido prévio." },
      { q: "Qual é o horário de funcionamento?", a: "Abrimos de terça a domingo, das 12h às 23h." },
    ],
    blog: [
      { title: "A Arte de Preparar um Mufete Perfeito", excerpt: "Descubra os segredos do nosso chef para grelhar o peixe na perfeição e o equilíbrio do óleo de palma.", date: "15 Nov 2026", content: "O segredo do mufete perfeito começa na frescura do peixe..." },
      { title: "Harmonização de Vinhos com Pratos Angolanos", excerpt: "Saiba qual vinho escolher para acompanhar o Calulu ou a Muamba de Galinha.", date: "02 Nov 2026", content: "Muitos pensam que a comida angolana não combina com vinho..." },
    ],
  },
  
  retail: {
    seo: {
      title: "MARKA Store | Moda e Estilo Exclusivo em Luanda",
      description: "Descubra a nova coleção. Peças únicas, qualidade premium e entrega rápida em Luanda. Compre pelo WhatsApp.",
    },
    hero: {
      title: "Elegância Que Define Você",
      subtitle: "A nova coleção chegou. Descubra peças exclusivas desenhadas para destacar a sua personalidade única.",
      cta: "Ver Coleção",
    },
    about: {
      title: "Curadoria de Estilo",
      text: "A MARKA Store não é apenas uma loja, é um conceito. Selecionamos cuidadosamente cada peça para garantir que os nossos clientes tenham acesso ao que há de mais moderno e elegante na moda contemporânea.",
      mission: "Elevar a autoestima dos nossos clientes através da moda, oferecendo atendimento personalizado e peças de alta qualidade.",
      vision: "Ser a referência em moda premium em Angola, expandindo a nossa curadoria para todo o continente.",
    },
    services: {
      title: "Destaques da Coleção",
      items: [
        { name: "Vestido Midi de Seda", desc: "Vestido fluido com caimento perfeito, ideal para eventos diurnos.", price: "35.000 Kz" },
        { name: "Blazer Estruturado", desc: "Corte alfaiataria, perfeito para looks de trabalho ou smart casual.", price: "28.000 Kz" },
        { name: "Malha de Cashmere", desc: "Toque macio e aconchegante, disponível em várias cores.", price: "22.000 Kz" },
      ],
    },
    testimonials: [
      { name: "Ana Silva", text: "A qualidade das peças é surreal. O vestido de seda foi o sucesso da festa!", role: "Cliente VIP" },
      { name: "Joana Costa", text: "Atendimento pelo WhatsApp super rápido. Recebi a minha encomenda em 24 horas.", role: "Cliente" },
    ],
    faq: [
      { q: "Fazem entregas ao domicílio?", a: "Sim, entregamos em toda Luanda. O prazo é de 24 a 48 horas úteis." },
      { q: "Como posso pagar?", a: "Aceitamos Multicaixa Express, transferência bancária e pagamento na entrega." },
      { q: "Posso trocar uma peça?", a: "Aceitamos trocas num prazo de 3 dias, desde que a peça esteja com etiqueta e sem uso." },
    ],
    blog: [
      { title: "Como Montar um Look de Trabalho Elegante", excerpt: "Dicas essenciais para aliar profissionalismo e estilo no dia a dia do escritório.", date: "10 Nov 2026", content: "O segredo de um look de trabalho perfeito está no equilíbrio..." },
      { title: "Tendências de Moda para a Próxima Estação", excerpt: "As cores, cortes e tecidos que vão dominar o mundo da moda.", date: "28 Out 2026", content: "Esta estação promete ser marcada por cores quentes..." },
    ],
  }
};