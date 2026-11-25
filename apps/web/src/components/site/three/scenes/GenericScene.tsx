import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  scrollProgress: number;
  colorA: string;
  colorB: string;
};

export default function GenericScene({ scrollProgress, colorA, colorB }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const p = scrollProgress;
    camera.position.z = 5 - p * 1.5;
    camera.position.y = Math.sin(t * 0.15) * 0.15 + p * 0.2;
    camera.lookAt(0, 0, 0);
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={0.8} />

      <mesh position={[0, 0, -2]} scale={[8, 5, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={colorA} transparent opacity={0.15} />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.8;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * 1.1,
              -0.5 - i * 0.15,
            ]}
          >
            <sphereGeometry args={[0.12 + (i % 3) * 0.06, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? colorA : colorB}
              roughness={0.5}
              metalness={0.2}
              transparent
              opacity={0.25}
            />
          </mesh>
        );
      })}
    </group>
  );
}