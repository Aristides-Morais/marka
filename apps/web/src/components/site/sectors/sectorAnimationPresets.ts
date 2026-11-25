export type SectorKey =
  | "food"
  | "beauty"
  | "health"
  | "retail"
  | "realestate"
  | "education"
  | "services"
  | "general";

export type AnimationPreset = {
  heroMode: "3d" | "2.5d";
  sceneKey: "restaurant" | "beauty" | "generic";
  cameraDrift: boolean;
  particleIntensity: number;
  revealDuration: number;
  scrollParallax: boolean;
};

export const sectorAnimationPresets: Record<SectorKey, AnimationPreset> = {
  food: {
    heroMode: "3d",
    sceneKey: "restaurant",
    cameraDrift: true,
    particleIntensity: 0.6,
    revealDuration: 0.9,
    scrollParallax: true,
  },
  beauty: {
    heroMode: "3d",
    sceneKey: "beauty",
    cameraDrift: true,
    particleIntensity: 0.4,
    revealDuration: 1.1,
    scrollParallax: true,
  },
  health: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: false,
    particleIntensity: 0.2,
    revealDuration: 0.8,
    scrollParallax: true,
  },
  retail: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: true,
    particleIntensity: 0.3,
    revealDuration: 0.8,
    scrollParallax: true,
  },
  realestate: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: true,
    particleIntensity: 0.2,
    revealDuration: 1.0,
    scrollParallax: true,
  },
  education: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: false,
    particleIntensity: 0.2,
    revealDuration: 0.8,
    scrollParallax: false,
  },
  services: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: true,
    particleIntensity: 0.3,
    revealDuration: 0.8,
    scrollParallax: true,
  },
  general: {
    heroMode: "2.5d",
    sceneKey: "generic",
    cameraDrift: false,
    particleIntensity: 0.2,
    revealDuration: 0.8,
    scrollParallax: false,
  },
};

export function resolveAnimationPreset(
  sector: SectorKey,
  overrides?: Partial<AnimationPreset> | Record<string, unknown> | null
): AnimationPreset {
  const base = sectorAnimationPresets[sector] || sectorAnimationPresets.general;
  if (!overrides || typeof overrides !== "object") return base;
  const clean: Partial<AnimationPreset> = {};
  const o = overrides as Record<string, unknown>;
  if (o.heroMode === "3d" || o.heroMode === "2.5d") clean.heroMode = o.heroMode;
  if (o.sceneKey === "restaurant" || o.sceneKey === "beauty" || o.sceneKey === "generic")
    clean.sceneKey = o.sceneKey;
  if (typeof o.cameraDrift === "boolean") clean.cameraDrift = o.cameraDrift;
  if (typeof o.particleIntensity === "number") clean.particleIntensity = o.particleIntensity;
  if (typeof o.revealDuration === "number") clean.revealDuration = o.revealDuration;
  if (typeof o.scrollParallax === "boolean") clean.scrollParallax = o.scrollParallax;
  return { ...base, ...clean };
}