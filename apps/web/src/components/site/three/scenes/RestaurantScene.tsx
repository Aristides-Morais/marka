import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  scrollProgress: number;
};

export default function RestaurantScene({ scrollProgress }: Props) {
  const plate1 = useRef<THREE.Mesh>(null);
  const plate2 = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const p = scrollProgress;

    camera.position.x = Math.sin(t * 0.15) * 0.6 + p * 1.2;
    camera.position.y = 0.8 + Math.sin(t * 0.2) * 0.1 - p * 0.3;
    camera.position.z = 4.5 - p * 1.5;
    camera.lookAt(0, 0.2, 0);

    if (plate1.current) {
      plate1.current.rotation.y = t * 0.12;
      plate1.current.position.y = 0.2 + Math.sin(t * 0.6) * 0.08;
    }
    if (plate2.current) {
      plate2.current.rotation.y = -t * 0.09 + 1.2;
      plate2.current.position.y = -0.3 + Math.sin(t * 0.5 + 1) * 0.06;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(t * 0.8) * 0.3;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} color="#F1E6D2" />
      <pointLight ref={lightRef} position={[2, 3, 2]} intensity={1.8} color="#9A7634" distance={10} />
      <pointLight position={[-3, 1, 1]} intensity={0.6} color="#6B1020" distance={8} />

      <mesh ref={plate1} position={[0, 0.2, 0]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.5, 0.08, 64]} />
        <meshStandardMaterial
          color="#FBF6EC"
          roughness={0.3}
          metalness={0.1}
          emissive="#9A7634"
          emissiveIntensity={0.05}
        />
      </mesh>

      <mesh ref={plate2} position={[1.2, -0.3, -0.8]} rotation={[-Math.PI / 2.5, 0.4, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.06, 48]} />
        <meshStandardMaterial color="#FBF6EC" roughness={0.4} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.45, 48, 32]} />
        <meshStandardMaterial
          color="#6B1020"
          roughness={0.25}
          metalness={0.15}
          emissive="#6B1020"
          emissiveIntensity={0.08}
        />
      </mesh>

      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 1.6 + ((i * 37) % 8) / 10;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              0.1 + ((i * 23) % 12) / 10,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.02 + ((i * 13) % 3) / 100, 8, 8]} />
            <meshBasicMaterial color="#9A7634" transparent opacity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}