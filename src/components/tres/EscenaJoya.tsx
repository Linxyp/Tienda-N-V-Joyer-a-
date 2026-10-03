"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Anillo, Balines, Cadena, Estudio, useVisible } from "./piezas";

function Joya({ compacto }: { compacto: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const anillo = useRef<THREE.Group>(null);
  const cadena = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, dt) => {
    if (!grupo.current || !anillo.current || !cadena.current) return;
    // Paralaje suave con el puntero
    grupo.current.rotation.y = THREE.MathUtils.damp(grupo.current.rotation.y, pointer.x * 0.45, 3, dt);
    grupo.current.rotation.x = THREE.MathUtils.damp(grupo.current.rotation.x, -pointer.y * 0.25, 3, dt);
    anillo.current.rotation.y += dt * 0.35;
    cadena.current.rotation.z += dt * 0.08;
    cadena.current.rotation.x = 1.2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });
  const escala = compacto ? 0.78 : 1;
  return (
    <group ref={grupo} scale={escala}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
        <group ref={anillo} rotation={[0.18, 0, -0.12]}>
          <Anillo />
        </group>
      </Float>
      <group ref={cadena} rotation={[1.2, 0, 0]}>
        <Cadena />
      </group>
      <Balines />
    </group>
  );
}

export default function EscenaJoya({ className }: { className?: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const visible = useVisible(contenedor);
  // La escena solo se monta en el navegador (dynamic + ssr: false), así que se puede leer window al iniciar
  const [compacto, setCompacto] = useState(() => window.matchMedia("(max-width: 768px)").matches);
  // En equipos modestos se omite el resplandor (bloom)
  const [efectos] = useState(() => (navigator.hardwareConcurrency ?? 8) > 4);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const actualizar = () => setCompacto(mq.matches);
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  return (
    <div ref={contenedor} className={className} style={{ maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)" }}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, compacto ? 1.5 : 1.8]}
        camera={{ position: [0, 0.35, 7.4], fov: 34 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        {/* Mismo color del fondo de la sección: el borde se difumina con la máscara del contenedor */}
        <color attach="background" args={["#0b0a08"]} />
        <ambientLight intensity={0.25} />
        <spotLight position={[4, 6, 6]} angle={0.4} penumbra={1} intensity={60} color="#fff3d6" />
        <pointLight position={[-4, -2, 3]} intensity={12} color="#ffcf7a" />
        <Estudio />
        <Joya compacto={compacto} />
        <Sparkles count={compacto ? 40 : 90} scale={[9, 6, 4]} size={2.4} speed={0.35} opacity={0.9} color="#f6d98f" />
        {efectos && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.82} luminanceSmoothing={0.25} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
