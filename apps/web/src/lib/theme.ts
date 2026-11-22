export type LinkItem = { label: string; url: string };

export type ExtraTheme = {
  headerBg: string;
  bannerBg: string;
  cardBg: string;
  titleColor: string;
  subtitleColor: string;
  bookingTitleColor: string;
  bookingSubtitleColor: string;
  headingFont: string;
};

export const EMPTY_EXTRA: ExtraTheme = {
  headerBg: "",
  bannerBg: "",
  cardBg: "",
  titleColor: "",
  subtitleColor: "",
  bookingTitleColor: "",
  bookingSubtitleColor: "",
  headingFont: "",
};

export function parseExtra(raw: any): ExtraTheme {
  const out: ExtraTheme = { ...EMPTY_EXTRA };
  if (raw && typeof raw === "object") {
    (Object.keys(out) as (keyof ExtraTheme)[]).forEach((k) => {
      if (typeof raw[k] === "string") out[k] = raw[k];
    });
  }
  return out;
}

// weights: pesos que o Google Fonts realmente tem (se pedirmos um que não existe, a letra não carrega)
export const FONT_LIST: { name: string; weights: string }[] = [
  { name: "Inter", weights: "400;500;600;700" },
  { name: "Poppins", weights: "400;500;600;700" },
  { name: "Montserrat", weights: "400;500;600;700" },
  { name: "Raleway", weights: "400;500;600;700" },
  { name: "Nunito", weights: "400;500;600;700" },
  { name: "Quicksand", weights: "400;500;600;700" },
  { name: "Open Sans", weights: "400;500;600;700" },
  { name: "Roboto", weights: "400;500;700" },
  { name: "Lato", weights: "400;700" },
  { name: "Josefin Sans", weights: "400;500;600;700" },
  { name: "Playfair Display", weights: "400;500;600;700" },
  { name: "Cormorant Garamond", weights: "400;500;600;700" },
  { name: "Lora", weights: "400;500;600;700" },
  { name: "Merriweather", weights: "400;700" },
  { name: "DM Serif Display", weights: "" },
  { name: "Oswald", weights: "400;500;600;700" },
  { name: "Bebas Neue", weights: "" },
  { name: "Dancing Script", weights: "400;500;600;700" },
  { name: "Pacifico", weights: "" },
  { name: "Great Vibes", weights: "" },
];

export const FONTS = FONT_LIST.map((f) => f.name);

export function loadFont(family?: string | null) {
  if (!family) return;
  const id = "gf-" + family.replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const f = FONT_LIST.find((x) => x.name === family);
  const w = f && f.weights ? `:wght@${f.weights}` : "";
  const l = document.createElement("link");
  l.id = id;
  l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}${w}&display=swap`;
  document.head.appendChild(l);
}

export function fontStack(family?: string | null) {
  return family ? `"${family}", system-ui, sans-serif` : undefined;
}

export function normalizeUrl(u: string) {
  const v = u.trim();
  if (!v) return v;
  return /^(https?:|tel:|mailto:)/i.test(v) ? v : "https://" + v;
}

export const HEX = /^#[0-9A-Fa-f]{6}$/;

export function isDark(hex?: string | null) {
  if (!hex || !HEX.test(hex)) return false;
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

// Cor de texto legível sobre um fundo
export function textOn(bg?: string | null, light = "#FFFFFF", dark = "#18181B") {
  return isDark(bg) ? light : dark;
}

// "Sara_La_Belle_Salão" -> "Sara La Belle Salão" (permite quebrar em várias linhas)
export function prettyName(name?: string | null) {
  return (name || "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();
}

// Tamanho do título grande conforme o comprimento do texto
export function heroSize(text: string) {
  const n = text.length;
  if (n <= 10) return "3.75rem";
  if (n <= 18) return "3rem";
  if (n <= 30) return "2.25rem";
  return "1.75rem";
}

export type Preset = {
  name: string;
  primaryColor: string;
  storeBgColor: string;
  bookingBgColor: string;
  fontFamily: string;
} & ExtraTheme;

export const PRESETS: Preset[] = [
  {
    name: "Roxo Elegante",
    primaryColor: "#7C3AED",
    storeBgColor: "#F5F3FF",
    bookingBgColor: "#2E1065",
    fontFamily: "Poppins",
    headerBg: "#FFFFFF",
    bannerBg: "#EDE9FE",
    cardBg: "#FFFFFF",
    titleColor: "#4C1D95",
    subtitleColor: "#6D28D9",
    bookingTitleColor: "#FFFFFF",
    bookingSubtitleColor: "#DDD6FE",
    headingFont: "Playfair Display",
  },
  {
    name: "Dourado & Preto",
    primaryColor: "#C9A227",
    storeBgColor: "",
    bookingBgColor: "#0A0A0A",
    fontFamily: "Montserrat",
    headerBg: "#000000",
    bannerBg: "#1A1A1A",
    cardBg: "#FFFFFF",
    titleColor: "#F5D76E",
    subtitleColor: "#D4D4D8",
    bookingTitleColor: "#F5D76E",
    bookingSubtitleColor: "#D4D4D8",
    headingFont: "Cormorant Garamond",
  },
  {
    name: "Verde Natural",
    primaryColor: "#15803D",
    storeBgColor: "",
    bookingBgColor: "#052E16",
    fontFamily: "Nunito",
    headerBg: "#FFFFFF",
    bannerBg: "#DCFCE7",
    cardBg: "#FFFFFF",
    titleColor: "#14532D",
    subtitleColor: "#4D7C0F",
    bookingTitleColor: "#FFFFFF",
    bookingSubtitleColor: "#BBF7D0",
    headingFont: "Lora",
  },
  {
    name: "Rosa Suave",
    primaryColor: "#DB2777",
    storeBgColor: "#FFF7FA",
    bookingBgColor: "#500724",
    fontFamily: "Quicksand",
    headerBg: "#FFF1F2",
    bannerBg: "#FCE7F3",
    cardBg: "#FFFFFF",
    titleColor: "#831843",
    subtitleColor: "#BE185D",
    bookingTitleColor: "#FFFFFF",
    bookingSubtitleColor: "#FBCFE8",
    headingFont: "Playfair Display",
  },
  {
    name: "Oceano",
    primaryColor: "#0284C7",
    storeBgColor: "",
    bookingBgColor: "#082F49",
    fontFamily: "Inter",
    headerBg: "#FFFFFF",
    bannerBg: "#E0F2FE",
    cardBg: "#FFFFFF",
    titleColor: "#0C4A6E",
    subtitleColor: "#0369A1",
    bookingTitleColor: "#FFFFFF",
    bookingSubtitleColor: "#BAE6FD",
    headingFont: "Montserrat",
  },
  {
    name: "Laranja Quente",
    primaryColor: "#EA580C",
    storeBgColor: "",
    bookingBgColor: "#1C1917",
    fontFamily: "Open Sans",
    headerBg: "#FFFFFF",
    bannerBg: "#FFEDD5",
    cardBg: "#FFFFFF",
    titleColor: "#7C2D12",
    subtitleColor: "#9A3412",
    bookingTitleColor: "#FFFFFF",
    bookingSubtitleColor: "#FED7AA",
    headingFont: "Oswald",
  },
];