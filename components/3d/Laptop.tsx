"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * HERO 3D — clay CRT workstation (Ayush portfolio ref) + coffee cup with googly eyes.
 * Base + clay keyboard fixed; only monitor tracks cursor. Cup eyes track,
 * cup body fixed. Convex «Добро пожаловать» CRT preserved.
 */

const BABY_BLUE = "#b4b8c0";
const BABY_BLUE_MID = "#9ea3ab";
const BABY_BLUE_DARK = "#7e848d";
const BABY_BLUE_LIGHT = "#d4d7dc";
const BEZEL_DARK = "#2a2e35";
const STICKER_LIME = "#b6e34a";
const STICKER_LILAC = "#d4c4f0";
const BTN_PINK = "#f7a0bc";
const BTN_YELLOW = "#f2c63a";
const PLAQUE_PINK = "#f5a8c0";

/**
 * CRT screen text — edit here to change copy, size, and placement.
 * Canvas is 512×384. Origin top-left; text is drawn centered by default.
 */
const CRT_SCREEN = {
  lines: ["Добро", "пожаловать!"] as string[],
  /** CSS font-family name registered via FontFace */
  fontFamily: "BenzinBold",
  fontUrl: "/fonts/benzin-bold.otf",
  fontSize: 55,
  /** Vertical gap between line centers */
  lineGap: 80,
  /** Block center on the 512×384 texture */
  centerX: 260,
  centerY: 202,
  color: "#0a3578",
  shadowColor: "#062a5c",
};

function makeCrtTexture(fontFamily: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#1a6fd4";
  ctx.fillRect(0, 0, 512, 384);

  ctx.fillStyle = "rgba(0,40,120,0.28)";
  for (let y = 0; y < 384; y += 3) {
    ctx.fillRect(0, y, 512, 1);
  }
  for (let x = 0; x < 512; x += 5) {
    ctx.fillRect(x, 0, 1, 384);
  }

  const { lines, fontSize, lineGap, centerX, centerY, color, shadowColor } = CRT_SCREEN;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontSize}px "${fontFamily}", Arial, sans-serif`;

  const startY = centerY - ((lines.length - 1) * lineGap) / 2;

  lines.forEach((line, i) => {
    const y = startY + i * lineGap;
    ctx.fillStyle = shadowColor;
    ctx.fillText(line, centerX + 2, y + 3);
    ctx.fillStyle = color;
    ctx.fillText(line, centerX, y);
  });

  const vig = ctx.createRadialGradient(256, 192, 70, 256, 192, 270);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,18,55,0.5)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 512, 384);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function useCrtTexture() {
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tex: THREE.CanvasTexture | null = null;

    const apply = (family: string) => {
      tex = makeCrtTexture(family);
      if (!cancelled && tex) setMap(tex);
    };

    (async () => {
      try {
        const face = new FontFace(CRT_SCREEN.fontFamily, `url(${CRT_SCREEN.fontUrl})`, {
          weight: "700",
          style: "normal",
        });
        await face.load();
        document.fonts.add(face);
        await document.fonts.ready;
        if (!cancelled) apply(CRT_SCREEN.fontFamily);
      } catch {
        if (!cancelled) apply("Arial");
      }
    })();

    return () => {
      cancelled = true;
      tex?.dispose();
    };
  }, []);

  return map;
}

function StarMesh({
  color,
  base,
  scale = 1,
  phase = 0,
}: {
  color: string;
  base: [number, number, number];
  scale?: number;
  phase?: number;
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? 0.18 : 0.065;
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 2,
    });
  }, []);

  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const ox = pointer.x * 0.28;
    const oy = pointer.y * 0.18;
    ref.current.position.x = THREE.MathUtils.damp(
      ref.current.position.x,
      base[0] + ox * (0.7 + phase * 0.15),
      16,
      delta
    );
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      base[1] + oy * (0.55 + phase * 0.25) + Math.sin(t * 1.1 + phase) * 0.04,
      16,
      delta
    );
    ref.current.position.z = base[2] + pointer.x * 0.06;
    ref.current.rotation.z = phase + t * 0.35 + pointer.x * 0.55;
  });

  return (
    <mesh ref={ref} geometry={geom} position={base} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

/**
 * Tall takeaway coffee cup with lid + googly eyes that track the cursor.
 * Group origin = bottom center (flush on pedestal top).
 * Stands upright facing the user; only pupils move.
 */
function CoffeeCup({
  position,
  rotation = [0, 0, 0],
  interactive,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  interactive: boolean;
}) {
  const leftPupil = useRef<THREE.Group>(null);
  const rightPupil = useRef<THREE.Group>(null);
  const cupRef = useRef<THREE.Group>(null);
  const { pointer, camera } = useThree();
  const eyeWorld = useMemo(() => new THREE.Vector3(), []);

  // Tall cup — ~20% shorter than previous
  const BODY_H = 0.704;
  const BODY_Y = BODY_H / 2;
  const EYE_Y = BODY_H * 0.72;
  const TOP_R = 0.185;
  const BOT_R = 0.138;
  const EYE_R = 0.052;
  const EYE_Z = TOP_R + 0.01;
  const PUPIL_R = 0.025;
  const IRIS_R = 0.032;
  // How far the iris/pupil/black-dot unit can travel on the eyeball
  const LOOK_MAX = EYE_R * 0.55;
  const PUPIL_DEPTH = EYE_R * 0.78;

  useFrame((_, delta) => {
    if (!leftPupil.current || !rightPupil.current || !cupRef.current) return;

    let lookX = 0;
    let lookY = 0;
    if (interactive) {
      cupRef.current.getWorldPosition(eyeWorld);
      const projected = eyeWorld.project(camera);
      // Stronger tracking so the whole pupil (incl. black center) clearly follows the cursor
      lookX = THREE.MathUtils.clamp((pointer.x - projected.x) * 0.12, -LOOK_MAX, LOOK_MAX);
      lookY = THREE.MathUtils.clamp((pointer.y - projected.y) * 0.1, -LOOK_MAX, LOOK_MAX);
    }

    // Keep pupil assembly on the front hemisphere of the white eyeball
    const r2 = LOOK_MAX * LOOK_MAX;
    const clampOnEye = (lx: number, ly: number) => {
      const d2 = lx * lx + ly * ly;
      if (d2 > r2) {
        const s = LOOK_MAX / Math.sqrt(d2);
        return [lx * s, ly * s] as const;
      }
      return [lx, ly] as const;
    };
    const [lx, ly] = clampOnEye(lookX, lookY);
    const lz = Math.sqrt(Math.max(0.0001, PUPIL_DEPTH * PUPIL_DEPTH - lx * lx - ly * ly));

    // Move iris + pupil + black center + their highlights as one unit
    leftPupil.current.position.x = THREE.MathUtils.damp(leftPupil.current.position.x, -0.062 + lx, 22, delta);
    leftPupil.current.position.y = THREE.MathUtils.damp(leftPupil.current.position.y, EYE_Y + ly, 22, delta);
    leftPupil.current.position.z = THREE.MathUtils.damp(leftPupil.current.position.z, EYE_Z + lz, 22, delta);

    rightPupil.current.position.x = THREE.MathUtils.damp(rightPupil.current.position.x, 0.062 + lx, 22, delta);
    rightPupil.current.position.y = THREE.MathUtils.damp(rightPupil.current.position.y, EYE_Y + ly, 22, delta);
    rightPupil.current.position.z = THREE.MathUtils.damp(rightPupil.current.position.z, EYE_Z + lz, 22, delta);
  });

  return (
    <group ref={cupRef} position={position} rotation={rotation}>
      {/* Paper cup body — tall tapered cylinder, upright */}
      <mesh castShadow position={[0, BODY_Y, 0]}>
        <cylinderGeometry args={[TOP_R, BOT_R, BODY_H, 36]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.78} />
      </mesh>
      {/* Cardboard sleeve — lower band so eyes sit on white cup above it */}
      <mesh position={[0, BODY_Y - 0.14, 0]}>
        <cylinderGeometry args={[TOP_R + 0.01, BOT_R + 0.03, 0.22, 36]} />
        <meshStandardMaterial color="#e4d0ae" roughness={0.85} />
      </mesh>
      {/* Lid rim */}
      <mesh position={[0, BODY_H + 0.018, 0]}>
        <cylinderGeometry args={[TOP_R + 0.028, TOP_R + 0.028, 0.045, 32]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.42} />
      </mesh>
      {/* Lid dome */}
      <mesh position={[0, BODY_H + 0.052, 0]}>
        <cylinderGeometry args={[0.11, 0.135, 0.038, 24]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.38} />
      </mesh>
      {/* Sip hole */}
      <mesh position={[0.055, BODY_H + 0.075, 0.035]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.018, 12]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Eyes: white sclera + natural specular, dark gray-blue iris around black pupil */}
      {([-0.062, 0.062] as const).map((ex) => (
        <group key={ex} position={[ex, EYE_Y, EYE_Z]}>
          <mesh>
            <sphereGeometry args={[EYE_R, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.18} metalness={0.05} />
          </mesh>
          {/* Soft natural highlight */}
          <mesh position={[-0.014, 0.016, EYE_R * 0.78]}>
            <sphereGeometry args={[0.011, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.008, 0.01, EYE_R * 0.88]}>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      <group ref={leftPupil} position={[-0.062, EYE_Y, EYE_Z + EYE_R * 0.72]}>
        {/* Dark gray-blue iris */}
        <mesh position={[0, 0, -0.001]}>
          <sphereGeometry args={[IRIS_R, 16, 16]} />
          <meshStandardMaterial color="#3d4f63" roughness={0.4} emissive="#2a3848" emissiveIntensity={0.08} />
        </mesh>
        {/* Black pupil */}
        <mesh position={[0, 0, 0.006]}>
          <sphereGeometry args={[PUPIL_R, 14, 14]} />
          <meshStandardMaterial color="#050505" roughness={0.25} />
        </mesh>
        {/* Tiny black center + color specular */}
        <mesh position={[0, 0, 0.014]}>
          <sphereGeometry args={[PUPIL_R * 0.45, 12, 12]} />
          <meshStandardMaterial color="#000000" roughness={0.15} />
        </mesh>
        <mesh position={[-0.004, 0.005, 0.02]}>
          <sphereGeometry args={[0.0045, 10, 10]} />
          <meshBasicMaterial color="#6b7d90" />
        </mesh>
        <mesh position={[-0.002, 0.003, 0.022]}>
          <sphereGeometry args={[0.0022, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group ref={rightPupil} position={[0.062, EYE_Y, EYE_Z + EYE_R * 0.72]}>
        <mesh position={[0, 0, -0.001]}>
          <sphereGeometry args={[IRIS_R, 16, 16]} />
          <meshStandardMaterial color="#3d4f63" roughness={0.4} emissive="#2a3848" emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <sphereGeometry args={[PUPIL_R, 14, 14]} />
          <meshStandardMaterial color="#050505" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <sphereGeometry args={[PUPIL_R * 0.45, 12, 12]} />
          <meshStandardMaterial color="#000000" roughness={0.15} />
        </mesh>
        <mesh position={[-0.004, 0.005, 0.02]}>
          <sphereGeometry args={[0.0045, 10, 10]} />
          <meshBasicMaterial color="#6b7d90" />
        </mesh>
        <mesh position={[-0.002, 0.003, 0.022]}>
          <sphereGeometry args={[0.0022, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function useResumePlaqueTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = PLAQUE_PINK;
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = '700 22px "Arial", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VIEW RESUME", 128, 34);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, []);
}

/**
 * Ayush-style clay CRT workstation (ayushdhibardesigns.framer.website):
 * Fixed base + clay keyboard on pedestal; only the monitor head tracks the cursor.
 * Cup eyes track pointer; cup body stays put. Convex «Добро пожаловать» CRT kept.
 */

function ClayKeyboard({ position }: { position: [number, number, number] }) {
  const rows = [
    { z: -0.2, cols: 13, w: 0.085 },
    { z: -0.07, cols: 13, w: 0.085 },
    { z: 0.06, cols: 12, w: 0.09 },
    { z: 0.19, cols: 11, w: 0.094 },
  ];

  const keys: React.ReactNode[] = [];
  rows.forEach((row, r) => {
    const gap = 0.016;
    const totalW = row.cols * (row.w + gap);
    const startX = -totalW / 2 + row.w / 2;
    for (let c = 0; c < row.cols; c++) {
      const isSpace = r === 3 && c >= 3 && c <= 7;
      if (isSpace && c > 3) continue;
      const w = isSpace ? row.w * 5 + gap * 4 : row.w;
      const x = isSpace
        ? startX + 3 * (row.w + gap) + w / 2 - row.w / 2
        : startX + c * (row.w + gap);
      keys.push(
        <RoundedBox
          key={`${r}-${c}`}
          args={[w, 0.085, 0.1]}
          radius={0.018}
          position={[x, 0.095, row.z]}
          castShadow
        >
          <meshStandardMaterial
            color={isSpace ? BABY_BLUE_LIGHT : c % 3 === 0 ? "#c5c9d0" : "#e6e8ec"}
            roughness={0.42}
          />
        </RoundedBox>
      );
    }
  });

  return (
    <group position={position}>
      {/* Thick clay chassis */}
      <RoundedBox args={[1.62, 0.16, 0.68]} radius={0.06} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial color={BABY_BLUE} roughness={0.55} />
      </RoundedBox>
      {/* Raised key deck with slight tilt toward user */}
      <group position={[0, 0.11, 0.02]} rotation={[0.06, 0, 0]}>
        <RoundedBox args={[1.48, 0.05, 0.56]} radius={0.028} castShadow>
          <meshStandardMaterial color={BABY_BLUE_MID} roughness={0.5} />
        </RoundedBox>
        <group position={[0, 0.02, 0]}>{keys}</group>
      </group>
    </group>
  );
}

/** Clay mouse on the pedestal, to the right of the keyboard. */
function ClayMouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.28, 0]}>
      {/* Oval foot — same ellipsoid as the body, a little larger */}
      <mesh castShadow position={[0, 0.03, 0]} scale={[1.08, 0.36, 1.62]}>
        <sphereGeometry args={[0.15, 48, 32]} />
        <meshStandardMaterial color={BABY_BLUE} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 0.112, 0]} scale={[0.9, 0.48, 1.35]}>
        <sphereGeometry args={[0.15, 32, 24]} />
        <meshStandardMaterial color={BABY_BLUE_LIGHT} roughness={0.46} />
      </mesh>
      {/* Center split along the shell */}
      <mesh position={[0, 0.168, 0.02]}>
        <boxGeometry args={[0.024, 0.045, 0.18]} />
        <meshStandardMaterial color="#3e434a" roughness={0.42} />
      </mesh>
      {/* Scroll wheel sitting in the split */}
      <mesh castShadow position={[0, 0.186, -0.015]} rotation={[0.2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color={BABY_BLUE_DARK} roughness={0.38} />
      </mesh>
      {/* Short cable toward the computer */}
      <mesh position={[0, 0.028, -0.2]} rotation={[1.35, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 10]} />
        <meshStandardMaterial color={BABY_BLUE_MID} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Fixed computer base (stand) — does not track cursor */
function ComputerBase() {
  const plaqueMap = useResumePlaqueTexture();

  return (
    <group>
      <RoundedBox args={[1.72, 0.28, 1.05]} radius={0.09} position={[0, -0.78, 0.08]} castShadow>
        <meshStandardMaterial color={BABY_BLUE} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[0.92, 0.07, 0.06]} radius={0.02} position={[0, -0.78, 0.58]}>
        <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
      </RoundedBox>
      <group position={[0, -0.62, 0.595]}>
        <RoundedBox args={[0.52, 0.11, 0.028]} radius={0.012} castShadow>
          <meshStandardMaterial color={PLAQUE_PINK} roughness={0.45} />
        </RoundedBox>
        {plaqueMap ? (
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[0.48, 0.09]} />
            <meshBasicMaterial map={plaqueMap} transparent />
          </mesh>
        ) : null}
      </group>
      {[-0.08, 0, 0.08].map((z, i) => (
        <mesh key={i} position={[0.84, -0.78, z]}>
          <boxGeometry args={[0.02, 0.14, 0.035]} />
          <meshStandardMaterial color={BABY_BLUE_DARK} roughness={0.55} />
        </mesh>
      ))}

      {/* Fixed neck / stand — does not track cursor */}
      <mesh castShadow position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.28, 28]} />
        <meshStandardMaterial color={BABY_BLUE_MID} roughness={0.56} />
      </mesh>
      {[-0.08, 0, 0.08].map((x) => (
        <mesh key={x} position={[x, -0.42, 0.3]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color="#8b9098" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Monitor screen/head only — pivots on the fixed neck */
function MonitorHead() {
  const screenMap = useCrtTexture();
  const convexGlass = useMemo(() => {
    const width = 1.18;
    const height = 0.86;
    const bulge = 0.26;
    const geo = new THREE.PlaneGeometry(width, height, 64, 48);
    const pos = geo.attributes.position;
    const hw = width / 2;
    const hh = height / 2;
    for (let i = 0; i < pos.count; i++) {
      const nx = THREE.MathUtils.clamp(pos.getX(i) / hw, -1, 1);
      const ny = THREE.MathUtils.clamp(pos.getY(i) / hh, -1, 1);
      const z = bulge * Math.cos((nx * Math.PI) / 2) * Math.cos((ny * Math.PI) / 2);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  /** Flat sticky note with one corner peeling off the wall. */
  const lilacSticker = useMemo(() => {
    const width = 0.24;
    const height = 0.28;
    const geo = new THREE.PlaneGeometry(width, height, 24, 28);
    const pos = geo.attributes.position;
    const hw = width / 2;
    const hh = height / 2;
    // Peel the bottom-right corner (local +x, -y)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const nx = THREE.MathUtils.clamp((x + hw) / width, 0, 1);
      const ny = THREE.MathUtils.clamp((hh - y) / height, 0, 1);
      // Stronger toward bottom-right corner
      const t = Math.pow(Math.max(0, nx * 0.55 + ny * 0.7 - 0.72) / 0.53, 1.35);
      if (t > 0) {
        const lift = t * 0.055;
        const curl = t * 0.04;
        pos.setZ(i, lift);
        pos.setX(i, x - curl * 0.35);
        pos.setY(i, y + curl * 0.55);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <RoundedBox args={[1.78, 1.42, 1.15]} radius={0.16} position={[0, 0.42, -0.06]} castShadow>
        <meshStandardMaterial color={BABY_BLUE} roughness={0.52} />
      </RoundedBox>

      <mesh position={[0, 1.02, 0.2]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.5]} />
        <meshStandardMaterial color={BABY_BLUE_LIGHT} transparent opacity={0.45} roughness={0.28} />
      </mesh>

      <RoundedBox args={[1.42, 1.08, 0.14]} radius={0.08} position={[0, 0.48, 0.5]}>
        <meshStandardMaterial color={BEZEL_DARK} roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[1.28, 0.96, 0.06]} radius={0.055} position={[0, 0.48, 0.56]}>
        <meshStandardMaterial color="#1a1d22" roughness={0.55} />
      </RoundedBox>

      <mesh geometry={convexGlass} position={[0, 0.48, 0.58]} castShadow>
        {screenMap ? (
          <meshStandardMaterial
            map={screenMap}
            emissiveMap={screenMap}
            emissive="#3b82f6"
            emissiveIntensity={0.4}
            roughness={0.14}
            metalness={0.05}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial color="#1a6fd4" emissive="#1a6fd4" emissiveIntensity={0.4} />
        )}
      </mesh>
      <mesh position={[0.22, 0.7, 0.84]} rotation={[-0.35, 0.2, 0.06]}>
        <planeGeometry args={[0.28, 0.15]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      <pointLight position={[0, 0.45, 1.2]} intensity={0.9} color="#3b82f6" distance={3} />

      <mesh castShadow position={[0.92, 0.72, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.06, 20]} />
        <meshStandardMaterial color={BTN_PINK} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.93, 0.48, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.07, 20]} />
        <meshStandardMaterial color={BTN_YELLOW} roughness={0.35} />
      </mesh>
      <mesh position={[0.97, 0.5, 0.18]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.97, 0.46, 0.18]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.97, 0.44, 0.12]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.022, 0.005, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <group position={[-0.72, 0.98, 0.52]} rotation={[0.08, 0.12, -0.18]}>
        <RoundedBox args={[0.28, 0.28, 0.012]} radius={0.01} castShadow>
          <meshStandardMaterial color={STICKER_LIME} roughness={0.7} />
        </RoundedBox>
        <mesh position={[0.1, 0.1, 0.01]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.08, 0.08, 0.008]} />
          <meshStandardMaterial color="#d4f07a" roughness={0.65} />
        </mesh>
      </group>

      {/* Flat paper lilac sticker with a peeled corner */}
      <mesh
        geometry={lilacSticker}
        position={[0.892, 0.2, 0.16]}
        rotation={[0.04, Math.PI / 2, -0.12]}
      >
        <meshStandardMaterial
          color={STICKER_LILAC}
          roughness={0.92}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Laptop({ interactive = true }: { interactive?: boolean }) {
  const monitorRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!monitorRef.current) return;
    // Only the screen/head tracks the cursor — neck stays fixed
    const targetX = interactive ? pointer.y * 0.18 : 0;
    const targetY = interactive ? pointer.x * 0.32 : 0;
    monitorRef.current.rotation.x = THREE.MathUtils.damp(
      monitorRef.current.rotation.x,
      targetX,
      14,
      delta
    );
    monitorRef.current.rotation.y = THREE.MathUtils.damp(
      monitorRef.current.rotation.y,
      targetY,
      14,
      delta
    );
  });

  // Pedestal top ≈ -1.12 + 0.21 = -0.91
  const deskTop = -0.91;
  // Neck top joint (local to computer group): -0.48 + 0.14 = -0.34
  const neckJointY = -0.34;

  return (
    <group position={[0.08, -0.55, 0]} rotation={[0.08, -0.52, 0]} scale={0.784}>
      {/* Fixed stage — pedestal, base, neck, keyboard never rotate with cursor */}
      <RoundedBox args={[3.05, 0.42, 2.15]} radius={0.1} position={[0, -1.12, 0.35]} castShadow>
        <meshStandardMaterial color="#f7f5f2" roughness={0.58} />
      </RoundedBox>

      <group position={[0, -0.08, 0]}>
        <ComputerBase />
      </group>

      {/* Clay keyboard fixed on white pedestal, in front of the stand */}
      <ClayKeyboard position={[0, -0.91, 1.15]} />
      <ClayMouse position={[1.18, -0.91, 1.02]} />

      {/* Screen only — pivots on the fixed neck joint */}
      <group ref={monitorRef} position={[0, -0.08 + neckJointY, 0]}>
        <group position={[0, -neckJointY, 0]}>
          <MonitorHead />
        </group>
      </group>

      {/* Cup upright facing user; only pupils follow cursor */}
      <CoffeeCup
        position={[-1.28, deskTop + 0.004, 0.55]}
        // Cancel parent three-quarter yaw/pitch so the cup faces the camera
        rotation={[-0.08, 0.52, 0]}
        interactive={interactive}
      />

      <StarMesh color="#b6bdf8" base={[-2.15, 0.15, 0.45]} scale={1.05} phase={0.2} />
      <StarMesh color="#6c78be" base={[2.25, 0.05, 0.4]} scale={0.85} phase={1.1} />
      <StarMesh color="#69579b" base={[2.0, 0.55, -0.25]} scale={0.55} phase={2.0} />
      <StarMesh color="#23338d" base={[-1.95, 0.65, -0.2]} scale={0.45} phase={2.8} />

      <group position={[-3.15, 0.18, 0.4]}>
        <mesh>
          <sphereGeometry args={[0.155, 24, 24]} />
          <meshPhysicalMaterial
            color="#e8ecff"
            transparent
            opacity={0.62}
            roughness={0.08}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        <mesh position={[0.05, 0.06, 0.1]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <mesh position={[0.07, 0.08, 0.115]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      </group>
      <mesh position={[2.5, 0.35, -0.3]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshPhysicalMaterial
          color="#1c1767"
          transparent
          opacity={0.42}
          roughness={0.1}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      <hemisphereLight args={["#f4f5f7", "#c5c8ce", 0.9]} />
      <directionalLight position={[-2.5, 5.5, 4]} intensity={1.4} />
      <directionalLight position={[3.2, 2.2, 2.5]} intensity={0.4} color="#c8ccd2" />
      <ambientLight intensity={0.42} />
    </group>
  );
}
