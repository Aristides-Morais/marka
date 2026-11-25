import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useScrollDrivenScene } from "./useScrollDrivenScene";
import {
  resolveAnimationPreset,
  type SectorKey,
} from "../sectors/sectorAnimationPresets";
import RestaurantScene from "./scenes/RestaurantScene";
import BeautyScene from "./scenes/BeautyScene";
import GenericScene from "./scenes/GenericScene";

type Props = {
  sector: SectorKey;
  primaryColor: string;
  secondaryColor: string;
  animationOverrides?: Record<string, unknown> | null;
};

export default function HeroScene({
  sector,
  primaryColor,
  secondaryColor,
  animationOverrides,
}: Props) {
  const preset = useMemo(
    () => resolveAnimationPreset(sector, animationOverrides),
    [sector, animationOverrides]
  );
  const scrollProgress = useScrollDrivenScene(preset.scrollParallax);
  const is3D = preset.heroMode === "3d";

  return (
    <div
      className="absolute inset-0"
      style={{
        background: is3D
          ? `radial-gradient(circle at 30% 40%, ${primaryColor}22 0%, transparent 60%)`
          : `linear-gradient(135deg, ${primaryColor}18 0%, ${secondaryColor}12 100%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          {preset.sceneKey === "restaurant" ? (
            <RestaurantScene scrollProgress={scrollProgress} />
          ) : preset.sceneKey === "beauty" ? (
            <BeautyScene scrollProgress={scrollProgress} />
          ) : (
            <GenericScene
              scrollProgress={scrollProgress}
              colorA={primaryColor}
              colorB={secondaryColor}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}