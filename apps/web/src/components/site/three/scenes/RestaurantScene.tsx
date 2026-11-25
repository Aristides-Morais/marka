import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RestaurantScene({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Group>(null);
  const foodRef = useRef<THREE.Mesh>(null);
  const goldRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    
    // Movimento de câmara lento (Cinematic Drift) - mais afastada
    camera.position.x = Math.sin(t * 0.2) * 0.8;
    camera.position.y = 1.5 + Math.sin(t * 0.3) * 0.2;
    camera.position.z = 6 - scrollProgress * 2; 
    camera.lookAt(0, 0, 0);

    // Rotação do prato
    if (plateRef.current) {
      plateRef.current.rotation.y = t * 0.1;
    }
    // Rotação e flutuação do elemento central (comida)
    if (foodRef.current) {
      foodRef.current.rotation.x = t * 0.15;
      foodRef.current.rotation.y = t * 0.2;
      foodRef.current.position.y = 0.3 + Math.sin(t * 2) * 0.1;
    }
    // Rotação da esfera dourada
    if (goldRef.current) {
      goldRef.current.position.y = 0.15 + Math.cos(t * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Iluminação de Estúdio Premium */}
      <ambientLight intensity={0.6} color="#F1E6D2" />
      <spotLight position={[5, 5, 5]} intensity={3} color="#FFF" penumbra={0.5} />
      <spotLight position={[-5, 2, 2]} intensity={2} color="#9A7634" />
      
      <group ref={plateRef} position={[0, -0.8, 0]}>
        {/* Base do Prato (Cerâmica) */}
        <mesh>
          <cylinderGeometry args={[3, 2.5, 0.15, 64]} />
          <meshStandardMaterial color="#FDFBF7" roughness={0.2} metalness={0.1} />
        </mesh>
        
        {/* Elemento Central (Comida/Arte) */}
        <mesh ref={foodRef} position={[0, 0.5, 0]}>
          <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
          <meshStandardMaterial color="#6B1020" roughness={0.3} metalness={0.7} emissive="#6B1020" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Elemento Secundário Dourado */}
        <mesh ref={goldRef} position={[1.2, 0.2, 1.2]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#9A7634" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}