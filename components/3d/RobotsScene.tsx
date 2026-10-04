"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * THANKS robots — original mannequin geometry matching peachworlds / attached ref:
 * glossy black + satin white athletes, cyan rim, circular “DANCING INTO THE FUTURE”,
 * rhythmic dance. Scene scales to viewport so robots always fit.
 */

function Mat({
  color,
  metalness,
  roughness,
  clearcoat = 0,
}: {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.12}
      envMapIntensity={0.85}
    />
  );
}

function Athlete({
  color,
  metalness,
  roughness,
  clearcoat,
  position,
  phase,
  party,
  style,
}: {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  position: [number, number, number];
  phase: number;
  party: boolean;
  style: "reach" | "groove";
}) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const lShin = useRef<THREE.Group>(null);
  const rShin = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const bpm = party ? 3.6 : 2.15;
    const t = clock.elapsedTime * bpm + phase;
    const beat = Math.sin(t);
    const beat2 = Math.sin(t * 2);
    const hop = Math.abs(Math.sin(t));

    if (!root.current) return;

    if (style === "reach") {
      // Black robot ref pose: arm high, opposite leg tucked, energetic leap
      root.current.position.set(
        position[0] + Math.sin(t * 0.5) * 0.04,
        position[1] + hop * (party ? 0.28 : 0.16),
        position[2]
      );
      root.current.rotation.set(
        0.05 + beat * 0.04,
        -0.18 + Math.sin(t * 0.4) * 0.18,
        beat * 0.06
      );
      if (torso.current) torso.current.rotation.x = -0.08 + beat2 * 0.05;
      // Right arm straight up
      if (rArm.current) rArm.current.rotation.set(-2.75 + beat2 * 0.12, 0.15, -0.25);
      if (rFore.current) rFore.current.rotation.set(-0.15 + hop * 0.1, 0, 0);
      // Left arm down by side with swing
      if (lArm.current) lArm.current.rotation.set(0.35 + beat * 0.35, 0.05, 0.55);
      if (lFore.current) lFore.current.rotation.set(0.4 + hop * 0.2, 0, 0);
      // Left leg tucked up
      if (lLeg.current) lLeg.current.rotation.set(1.35 + beat2 * 0.15, 0.05, 0.25);
      if (lShin.current) lShin.current.rotation.set(0.85 + hop * 0.2, 0, 0);
      // Right leg planted / slight bend
      if (rLeg.current) rLeg.current.rotation.set(-0.15 + hop * 0.2, 0, 0.05);
      if (rShin.current) rShin.current.rotation.set(0.35 * hop, 0, 0);
    } else {
      // White robot: three-quarter rear, hunched groove / hop
      root.current.position.set(
        position[0] - Math.sin(t * 0.55) * 0.03,
        position[1] + hop * (party ? 0.2 : 0.12),
        position[2]
      );
      root.current.rotation.set(
        0.12 + beat * 0.05,
        0.95 + Math.sin(t * 0.35) * 0.2,
        -beat * 0.05
      );
      if (torso.current) torso.current.rotation.x = 0.18 + beat2 * 0.06;
      if (rArm.current) rArm.current.rotation.set(0.55 + beat * 0.45, -0.2, -0.85);
      if (rFore.current) rFore.current.rotation.set(0.9 + hop * 0.25, 0, 0);
      if (lArm.current) lArm.current.rotation.set(0.45 + Math.cos(t) * 0.4, 0.15, 0.75);
      if (lFore.current) lFore.current.rotation.set(0.75 + hop * 0.2, 0, 0);
      if (rLeg.current) rLeg.current.rotation.set(0.35 + beat * 0.35, 0, -0.12);
      if (rShin.current) rShin.current.rotation.set(0.55 + hop * 0.3, 0, 0);
      if (lLeg.current) lLeg.current.rotation.set(-0.05 + Math.cos(t) * 0.3, 0, 0.12);
      if (lShin.current) lShin.current.rotation.set(0.4 + hop * 0.25, 0, 0);
    }
  });

  const mat = <Mat color={color} metalness={metalness} roughness={roughness} clearcoat={clearcoat} />;

  return (
    <group ref={root} position={position} scale={1}>
      {/* Helmet head */}
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.175, 36, 36]} />
        {mat}
      </mesh>
      <mesh position={[0, 1.52, 0.02]}>
        <cylinderGeometry args={[0.06, 0.09, 0.12, 16]} />
        {mat}
      </mesh>

      <group ref={torso} position={[0, 1.18, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.23, 0.42, 8, 18]} />
          {mat}
        </mesh>
        {/* Chest plate / athletic volume */}
        <mesh position={[0, 0.08, 0.12]} castShadow>
          <boxGeometry args={[0.32, 0.28, 0.06]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.18, 0.02]} castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          {mat}
        </mesh>
      </group>

      {/* Shoulders */}
      <mesh position={[-0.32, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.105, 18, 18]} />
        {mat}
      </mesh>
      <mesh position={[0.32, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.105, 18, 18]} />
        {mat}
      </mesh>

      {/* Left arm */}
      <group ref={lArm} position={[-0.32, 1.4, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.26, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          {mat}
        </mesh>
        <group ref={lFore} position={[0, -0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.24, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.048, 12, 12]} />
            {mat}
          </mesh>
        </group>
      </group>

      {/* Right arm */}
      <group ref={rArm} position={[0.32, 1.4, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.26, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          {mat}
        </mesh>
        <group ref={rFore} position={[0, -0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.24, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.048, 12, 12]} />
            {mat}
          </mesh>
        </group>
      </group>

      {/* Hips */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
        {mat}
      </mesh>

      {/* Left leg */}
      <group ref={lLeg} position={[-0.13, 0.82, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.078, 0.3, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.072, 12, 12]} />
          {mat}
        </mesh>
        <group ref={lShin} position={[0, -0.5, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.28, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.44, 0.06]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.14, 0.055, 0.26]} />
            {mat}
          </mesh>
        </group>
      </group>

      {/* Right leg */}
      <group ref={rLeg} position={[0.13, 0.82, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.078, 0.3, 6, 12]} />
          {mat}
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.072, 12, 12]} />
          {mat}
        </mesh>
        <group ref={rShin} position={[0, -0.5, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.28, 6, 12]} />
            {mat}
          </mesh>
          <mesh position={[0, -0.44, 0.06]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.14, 0.055, 0.26]} />
            {mat}
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CircularType({ party }: { party: boolean }) {
  const group = useRef<THREE.Group>(null);
  const chars = useMemo(() => "ТАНЦУЯ В БУДУЩЕЕ · ".split(""), []);

  useFrame((_, delta) => {
    // Spin in the plane facing the camera (peachworlds / attached frame)
    if (group.current) group.current.rotation.z += delta * (party ? 0.45 : 0.14);
  });

  const radius = 1.85;
  return (
    <group ref={group} position={[0, 0.95, 0.15]}>
      {chars.map((ch, i) => {
        const a = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        return (
          <Text
            key={`${i}-${ch}`}
            position={[x, y, 0]}
            rotation={[0, 0, a + Math.PI / 2]}
            fontSize={0.2}
            color="#0c4a6e"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.96}
          >
            {ch}
          </Text>
        );
      })}
    </group>
  );
}

/** Keeps the whole stage inside the viewport on any aspect ratio. */
function ResponsiveStage({ party }: { party: boolean }) {
  const stage = useRef<THREE.Group>(null);
  const { size, camera } = useThree();

  useFrame((state, delta) => {
    if (!stage.current) return;

    const shortSide = Math.min(size.width, size.height);
    const fit = THREE.MathUtils.clamp(shortSide / 920, 0.4, 0.72);
    stage.current.scale.setScalar(
      THREE.MathUtils.damp(stage.current.scale.x, fit, 6, delta)
    );
    stage.current.position.y = THREE.MathUtils.damp(stage.current.position.y, -0.08, 4, delta);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, size.height < 700 ? 36 : 32, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, size.width < 700 ? 7.4 : 6.6, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.1, 4, delta);
      camera.lookAt(0, 0.75, 0);
      camera.updateProjectionMatrix();
    }

    stage.current.rotation.y = THREE.MathUtils.damp(
      stage.current.rotation.y,
      state.pointer.x * 0.18,
      2.4,
      delta
    );
    stage.current.rotation.x = THREE.MathUtils.damp(
      stage.current.rotation.x,
      -state.pointer.y * 0.06,
      2.4,
      delta
    );
  });

  return (
    <group ref={stage} scale={0.55} position={[0, -0.12, 0]}>
      <Athlete
        color="#222222"
        metalness={0.9}
        roughness={0.18}
        clearcoat={1}
        position={[-0.42, 0, 0.1]}
        phase={0}
        party={party}
        style="reach"
      />
      <Athlete
        color="#f5f5f5"
        metalness={0.22}
        roughness={0.34}
        clearcoat={0.55}
        position={[0.42, 0, 0]}
        phase={1.2}
        party={party}
        style="groove"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <circleGeometry args={[1.25, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      <CircularType party={party} />
    </group>
  );
}

function Scene({ party }: { party: boolean }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e0f2fe", "#94a3b8", 0.7]} />
      <directionalLight position={[3.2, 6, 4]} intensity={1.45} castShadow />
      <spotLight
        position={[-3.4, 3.8, 1.8]}
        intensity={22}
        color="#67e8f9"
        angle={0.4}
        penumbra={0.35}
      />
      <spotLight
        position={[-1.2, 2.8, -1.5]}
        intensity={10}
        color="#22d3ee"
        angle={0.6}
        penumbra={0.5}
      />
      <pointLight position={[-0.7, 1.6, 1.4]} intensity={3.5} color="#a5f3fc" />
      <pointLight position={[2.1, 2.1, 2]} intensity={2.8} color="#ffffff" />
      <pointLight position={[0.6, 2.2, 1.5]} intensity={1.8} color="#ffffff" />

      <ResponsiveStage party={party} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={9} blur={2.4} far={4.5} />
    </>
  );
}

export function RobotsScene({ party }: { party: boolean }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.1, 6.6], fov: 32, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      className="!h-full !w-full"
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <Scene party={party} />
    </Canvas>
  );
}
