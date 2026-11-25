import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RestaurantScene({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Group>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    
    // Movimento de câmara lento (Cinematic Drift)
    camera.position.x = Math.sin(t * 0.2) * 0.5;
    camera.position.y = 1.2 + Math.sin(t * 0.3) * 0.1;
    camera.position.z = 5 - scrollProgress * 2;
    camera.lookAt(0, 0, 0);

    // Rotação super lenta do prato
    if (plateRef.current) {
      plateRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Iluminação de Estúdio Premium */}
      <ambientLight intensity={0.3} color="#F1E6D2" />
      <spotLight position={[5, 5, 5]} intensity={2} color="#FFF" penumbra={1} castShadow />
      <spotLight position={[-5, 2, 2]} intensity={1} color="#9A7634" />
      
      <group ref={plateRef} position={[0, -0.5, 0]}>
        {/* Base do Prato (Cerâmica) */}
        <mesh>
          <cylinderGeometry args={[2.5, 2, 0.1, 64]} />
          <meshStandardMaterial color="#FDFBF7" roughness={0.2} metalness={0.1} />
        </mesh>
        
        {/* Elemento Central (Comida/Arte) */}
        <mesh position={[0, 0.3, 0]}>
          <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />
          <meshStandardMaterial color="#6B1020" roughness={0.4} metalness={0.6} emissive="#6B1020" emissiveIntensity={0.1} />
        </mesh>
        
        {/* Elemento Secundário Dourado */}
        <mesh position={[0.8, 0.15, 0.8]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#9A7634" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}