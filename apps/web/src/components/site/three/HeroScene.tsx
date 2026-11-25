import { Suspense, lazy } from "react";

const RestaurantScene = lazy(() => import("./scenes/RestaurantScene"));
const GenericScene = lazy(() => import("./scenes/GenericScene"));

type Props = {
  sector: string;
  primaryColor: string;
  secondaryColor: string;
  heroImage?: string;
};

export default function HeroScene({ sector, primaryColor, secondaryColor, heroImage }: Props) {
  // Para Restaurantes, usamos a cena 3D animada (com os pratos)
  if (sector === "food") {
    return (
      <div className="absolute inset-0 bg-[#1a1412]">
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-[#6B1020] to-[#1a1412]" />}>
          <RestaurantScene scrollProgress={0} />
        </Suspense>
        {/* Vinheta escura para o texto brilhar */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80 pointer-events-none" />
      </div>
    );
  }

  // Para TODOS os outros setores, usamos uma composição elegante com a imagem real, 
  // texturas de grão e gradientes premium. Zero bolinhas.
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {heroImage && (
        <img
          src={heroImage}
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover opacity-60 scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
        />
      )}
      <div 
        className="absolute inset-0" 
        style={{ background: `linear-gradient(135deg, ${primaryColor}cc 0%, ${secondaryColor}66 100%)` }} 
      />
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}