"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { lazy, Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { AvisarListo, Diamante, Estudio, esLigero, oro, useVisible } from "./piezas";

const Resplandor = lazy(() => import("./Resplandor"));

function Gema({ ligero }: { ligero: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  const aro2 = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    if (!grupo.current || !aro.current || !aro2.current) return;
    grupo.current.rotation.y += dt * 0.45;
    grupo.current.rotation.x = THREE.MathUtils.damp(grupo.current.rotation.x, 0.35 - pointer.y * 0.3, 3, dt);
    aro.current.rotation.z += dt * 0.25;
    aro2.current.rotation.z -= dt * 0.18;
  });
  return (
    <Float speed={1.6} floatIntensity={0.8} rotationIntensity={0.2}>
      <group ref={grupo}>
        <Diamante scale={1.55} position={[0, 0.15, 0]} ligero={ligero} />
      </group>
      <mesh ref={aro} material={oro} rotation={[1.25, 0.2, 0]}>
        <torusGeometry args={[2.05, 0.022, 16, 200]} />
      </mesh>
      <mesh ref={aro2} material={oro} rotation={[1.9, -0.4, 0]}>
        <torusGeometry args={[2.35, 0.012, 12, 200]} />
      </mesh>
    </Float>
  );
}

export default function EscenaGema({ className, alListo }: { className?: string; alListo?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  // Solo se monta en el navegador (dynamic + ssr: false): se decide la versión según el dispositivo
  const [ligero] = useState(esLigero);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)",
      }}
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={ligero ? [1, 1.75] : [1, 1.6]}
        camera={{ position: [0, 0.5, 7.8], fov: 34 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#12100c"]} />
        <ambientLight intensity={0.3} />
        <spotLight position={[3, 6, 5]} angle={0.45} penumbra={1} intensity={70} color="#fff3d6" />
        <pointLight position={[-3, -2, 2]} intensity={14} color="#ffd38a" />
        <Estudio resolucion={ligero ? 128 : 256} />
        <Gema ligero={ligero} />
        <Sparkles count={ligero ? 26 : 50} scale={[7, 5, 3]} size={ligero ? 2.8 : 2.2} speed={0.3} color="#f6d98f" />
        {!ligero && (
          <Suspense fallback={null}>
            <Resplandor intensidad={0.9} umbral={0.8} />
          </Suspense>
        )}
        <AvisarListo alListo={alListo} />
      </Canvas>
    </div>
  );
}
