import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  scrollProgress: number;
};

export default function BeautyScene({ scrollProgress }: Props) {
  const ringRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const p = scrollProgress;

    camera.position.x = Math.sin(t * 0.1) * 0.5 + p * 0.8;
    camera.position.y = 0.5 + Math.sin(t * 0.15) * 0.08;
    camera.position.z = 4.2 - p * 1.2;
    camera.lookAt(0, 0.1, 0);

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      ringRef.current.rotation.y = t * 0.08;
    }
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t * 0.5) * 0.12;
      sphereRef.current.scale.setScalar(1 + Math.sin(t * 0.4) * 0.03);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.6} color="#FAF7F5" />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#C9A88A" />
      <pointLight position={[-2, 1, 2]} intensity={0.8} color="#5C2A3A" />

      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.06, 32, 80]} />
        <meshStandardMaterial color="#C9A88A" roughness={0.2} metalness={0.4} />
      </mesh>

      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 64, 48]} />
        <meshStandardMaterial
          color="#F5EDE8"
          roughness={0.35}
          metalness={0.1}
          emissive="#C9A88A"
          emissiveIntensity={0.06}
        />
      </mesh>

      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2, Math.sin(angle) * 1.2, -1]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#C9A88A" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}