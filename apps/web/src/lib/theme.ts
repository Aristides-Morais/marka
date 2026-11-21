export type LinkItem = { label: string; url: string };

export const FONTS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
  "Oswald",
  "Dancing Script",
];

export function loadFont(family?: string | null) {
  if (!family) return;
  const id = "gf-" + family.replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.id = id;
  l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
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