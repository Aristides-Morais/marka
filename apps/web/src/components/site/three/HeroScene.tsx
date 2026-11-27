import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";

const RestaurantScene = lazy(() => import("./scenes/RestaurantScene"));
const GenericScene = lazy(() => import("./scenes/GenericScene"));

type Props = {
  sector: string;
  primaryColor: string;
  secondaryColor: string;
  heroImage?: string;
  experience?: string;
};

export default function HeroScene({ sector, primaryColor, secondaryColor, heroImage, experience }: Props) {
  const isClassic = experience === "classic";

  // CLASSIC = foto parada, sem 3D, sem rotação
  if (isClassic) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        {heroImage && (
          <img src={heroImage} alt="Hero Background" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  if (sector === "food") {
    return (
      <div className="absolute inset-0 bg-[#1a1412]">
        <Canvas camera={{ position: [0, 0.5, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <RestaurantScene scrollProgress={0} />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {heroImage && (
        <img src={heroImage} alt="Hero Background" className="absolute inset-0 h-full w-full object-cover opacity-60 scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate]" />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}cc 0%, ${secondaryColor}66 100%)` }} />
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}