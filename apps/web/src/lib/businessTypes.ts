export type BusinessTypeKey = "restaurante" | "salao" | "tatuador" | "clinica" | "boutique" | "ortodontia";

export const BUSINESS_TYPES: Record<BusinessTypeKey, {
  label: string;
  menu: { label: string; href: string }[];
  bookingTitle: string;
  bookingFields: { key: string; label: string; type: "text" | "tel" | "date" | "select" | "textarea" | "file"; options?: string[]; required?: boolean; placeholder?: string }[];
  whatsappIntro: string;
  showTakeaway: boolean;
  showShop: boolean;
  showGalleryLabel: string;
}> = {
  restaurante: {
    label: "Restaurante",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Menu", href: "servicos" },
      { label: "Galeria", href: "galeria" },
      { label: "Eventos", href: "eventos" },
      { label: "Blog", href: "blog" },
      { label: "Contactos", href: "contactos" },
      { label: "Takeaway", href: "takeaway" },
      { label: "Reservas", href: "reservas" },
    ],
    bookingTitle: "Reserve a sua mesa",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true, placeholder: "Ex: Maria dos Santos" },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true, placeholder: "923 000 000" },
      { key: "data", label: "Data", type: "date", required: true },
      { key: "hora", label: "Hora", type: "select", options: ["12:00","13:00","14:00","18:00","19:00","20:00","21:00","22:00"] },
      { key: "pessoas", label: "Nº de pessoas", type: "select", options: ["1","2","3","4","5","6","7","8","10+"] },
      { key: "obs", label: "Observações", type: "textarea", placeholder: "Ex: mesa perto da janela, sem pimenta" },
    ],
    whatsappIntro: "Olá! Quero reservar mesa:",
    showTakeaway: true, showShop: false, showGalleryLabel: "Galeria - Comida, Ambiente e Eventos",
  },
  salao: {
    label: "Salão de Beleza",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Serviços & Preços", href: "servicos" },
      { label: "Portfólio", href: "galeria" },
      { label: "Pacotes & Promoções", href: "eventos" },
      { label: "Depoimentos", href: "depoimentos" },
      { label: "Contactos", href: "contactos" },
      { label: "Marcar", href: "reservas" },
    ],
    bookingTitle: "Marque o seu atendimento",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true },
      { key: "servico", label: "Serviço desejado", type: "select", options: ["Corte","Coloração","Tranças","Unhas","Maquilhagem","Sobrancelhas","Cílios","Penteado","Outro"], required: true },
      { key: "data", label: "Data preferida", type: "date", required: true },
      { key: "hora", label: "Hora preferida", type: "select", options: ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"] },
      { key: "obs", label: "Observações", type: "textarea", placeholder: "Ex: quero loiro, tenho cabelo comprido..." },
    ],
    whatsappIntro: "Olá! Quero marcar:",
    showTakeaway: false, showShop: false, showGalleryLabel: "Portfólio - Antes & Depois",
  },
  tatuador: {
    label: "Tatuador / Estúdio",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Estilos", href: "servicos" },
      { label: "Portfólio", href: "galeria" },
      { label: "Cuidados", href: "faq" },
      { label: "Contactos", href: "contactos" },
      { label: "Orçamento", href: "reservas" },
    ],
    bookingTitle: "Pedir orçamento / Agendar sessão",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true },
      { key: "zona", label: "Zona do corpo", type: "select", options: ["Braço","Antebraço","Costas","Perna","Peito","Pescoço","Mão","Outra"], required: true },
      { key: "tamanho", label: "Tamanho aproximado", type: "select", options: ["Pequeno (até 5cm)","Médio (5-15cm)","Grande (15-30cm)","Cobertura / Grande projeto"] },
      { key: "estilo", label: "Estilo", type: "select", options: ["Realismo","Blackwork","Fine Line","Old School","Tribal","Lettering","Cobertura","Outro"] },
      { key: "cor", label: "Cor ou Preto e Cinzento", type: "select", options: ["Preto e Cinzento","A Cores"] },
      { key: "data", label: "Data preferida", type: "date" },
      { key: "ideia", label: "Ideia / Referência", type: "textarea", placeholder: "Descreve a ideia, cola link do Instagram / imagem de referência", required: true },
      { key: "obs", label: "Observações", type: "textarea", placeholder: "Ex: tenho alergias, já tenho tatuagem no local..." },
    ],
    whatsappIntro: "Olá! Quero orçamento de tatuagem:",
    showTakeaway: false, showShop: false, showGalleryLabel: "Portfólio por Estilo",
  },
  clinica: {
    label: "Clínica / Consultório",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Especialidades", href: "servicos" },
      { label: "Equipa", href: "galeria" },
      { label: "FAQ", href: "faq" },
      { label: "Contactos", href: "contactos" },
      { label: "Marcar Consulta", href: "reservas" },
    ],
    bookingTitle: "Marcar consulta",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true },
      { key: "especialidade", label: "Especialidade", type: "select", options: ["Clínica Geral","Pediatria","Ginecologia","Cardiologia","Dermatologia","Outra"], required: true },
      { key: "data", label: "Data preferida", type: "date", required: true },
      { key: "hora", label: "Hora preferida", type: "select", options: ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"] },
      { key: "motivo", label: "Motivo da consulta", type: "textarea", placeholder: "Descreve o motivo...", required: true },
    ],
    whatsappIntro: "Olá! Quero marcar consulta:",
    showTakeaway: false, showShop: false, showGalleryLabel: "A Nossa Clínica",
  },
  boutique: {
    label: "Boutique / Loja",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Loja", href: "loja" },
      { label: "Novidades", href: "eventos" },
      { label: "Galeria", href: "galeria" },
      { label: "Contactos", href: "contactos" },
      { label: "Encomendar", href: "reservas" },
    ],
    bookingTitle: "Fazer encomenda",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true },
      { key: "morada", label: "Endereço de entrega", type: "textarea", required: true, placeholder: "Bairro, rua, casa..." },
      { key: "pagamento", label: "Método de pagamento", type: "select", options: ["Multicaixa Express","Transferência","Dinheiro na entrega","TPA"] },
      { key: "obs", label: "Observações", type: "textarea", placeholder: "Tamanho, cor, etc." },
    ],
    whatsappIntro: "Olá! Quero encomendar:",
    showTakeaway: false, showShop: true, showGalleryLabel: "Coleção",
  },
  ortodontia: {
    label: "Ortodontia / Placas Dentárias",
    menu: [
      { label: "Início", href: "" },
      { label: "Sobre", href: "sobre" },
      { label: "Tratamentos", href: "servicos" },
      { label: "Antes & Depois", href: "galeria" },
      { label: "FAQ", href: "faq" },
      { label: "Contactos", href: "contactos" },
      { label: "Avaliação", href: "reservas" },
    ],
    bookingTitle: "Pedir avaliação ortodôntica",
    bookingFields: [
      { key: "nome", label: "Nome completo", type: "text", required: true },
      { key: "telefone", label: "Telefone / WhatsApp", type: "tel", required: true },
      { key: "idade", label: "Idade", type: "text", placeholder: "Ex: 24" },
      { key: "tratamento", label: "Tratamento desejado", type: "select", options: ["Aparelho Fixo","Aparelho Invisível","Placas Dentárias","Alinhadores","Clareamento","Não sei - preciso de avaliação"], required: true },
      { key: "jaUsou", label: "Já usou aparelho antes?", type: "select", options: ["Não","Sim"] },
      { key: "data", label: "Data preferida", type: "date" },
      { key: "obs", label: "Observações", type: "textarea", placeholder: "Dor, dúvidas, etc." },
    ],
    whatsappIntro: "Olá! Quero avaliação ortodôntica:",
    showTakeaway: false, showShop: false, showGalleryLabel: "Antes & Depois",
  },
};

export function normalizeType(raw: string): BusinessTypeKey {
  const v = (raw || "").toLowerCase();
  if (v.includes("salao") || v.includes("beleza") || v.includes("cabeleireiro") || v.includes("barbear")) return "salao";
  if (v.includes("tatu") || v.includes("tattoo") || v.includes("estudio")) return "tatuador";
  if (v.includes("ortodont") || v.includes("placa") || v.includes("dental") || v.includes("dent")) return "ortodontia";
  if (v.includes("clinica") || v.includes("consultorio") || v.includes("medico") || v.includes("saude")) return "clinica";
  if (v.includes("boutique") || v.includes("loja") || v.includes("comercio") || v.includes("shop") || v.includes("moda")) return "boutique";
  return "restaurante"; // default: se for Alive Restaurante & Lounge, cai aqui se o tipo vier vazio
}

// Se o nome tiver Restaurante, força restaurante mesmo que o tipo seja "loja comercio"
export function resolveType(business: any): BusinessTypeKey {
  const name = `${business?.name || ""}`.toLowerCase();
  if (name.includes("restaur") || name.includes("lounge")) return "restaurante";
  if (name.includes("tatu")) return "tatuador";
  if (name.includes("ortodont") || name.includes("placa")) return "ortodontia";
  if (name.includes("clinica")) return "clinica";
  if (name.includes("salao") || name.includes("beleza")) return "salao";
  if (name.includes("boutique")) return "boutique";
  return normalizeType(`${business?.type || ""} ${business?.category || ""} ${business?.template || ""}`);
}