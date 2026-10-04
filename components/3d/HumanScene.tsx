"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Humanoid({ highlight }: { highlight: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  const glow = (zone: string) => (highlight === zone ? "#ff2d78" : "#e8eefc");

  return (
    <Float speed={1} floatIntensity={0.3} rotationIntensity={0.05}>
      <group ref={group} position={[0, -0.9, 0]} scale={1.15}>
        {/* Head */}
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshPhysicalMaterial
            color={glow("head")}
            transmission={0.55}
            thickness={0.6}
            roughness={0.2}
            metalness={0.1}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 0.85, 0]}>
          <capsuleGeometry args={[0.32, 0.7, 8, 16]} />
          <meshPhysicalMaterial
            color={glow("chest")}
            transmission={0.5}
            thickness={0.8}
            roughness={0.25}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Core */}
        <mesh position={[0, 0.25, 0]}>
          <capsuleGeometry args={[0.28, 0.35, 8, 16]} />
          <meshPhysicalMaterial
            color={glow("core")}
            transmission={0.45}
            roughness={0.3}
            transparent
            opacity={0.75}
          />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.55, 0.85, 0]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[0.09, 0.55, 6, 12]} />
          <meshPhysicalMaterial color={glow("arm-l")} transmission={0.5} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.55, 0.85, 0]} rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[0.09, 0.55, 6, 12]} />
          <meshPhysicalMaterial color={glow("arm-r")} transmission={0.5} transparent opacity={0.8} />
        </mesh>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={1.1} />
        <pointLight position={[0, 1.2, 1]} color="#ff2d78" intensity={highlight ? 0.8 : 0.2} />
      </group>
    </Float>
  );
}

export function HumanScene({ highlight }: { highlight: string }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0.4, 3.2], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <Humanoid highlight={highlight} />
        </Suspense>
      </Canvas>
    </div>
  );
}
