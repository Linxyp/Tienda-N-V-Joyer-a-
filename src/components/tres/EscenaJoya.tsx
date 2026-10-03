"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Anillo, AvisarListo, Balines, Cadena, Estudio, esLigero, useVisible } from "./piezas";

function Joya({ ligero }: { ligero: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const anillo = useRef<THREE.Group>(null);
  const cadena = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, dt) => {
    if (!grupo.current || !anillo.current || !cadena.current) return;
    // Paralaje suave con el puntero (en celular el puntero no se mueve y queda centrado)
    grupo.current.rotation.y = THREE.MathUtils.damp(grupo.current.rotation.y, pointer.x * 0.45, 3, dt);
    grupo.current.rotation.x = THREE.MathUtils.damp(grupo.current.rotation.x, -pointer.y * 0.25, 3, dt);
    anillo.current.rotation.y += dt * 0.35;
    cadena.current.rotation.z += dt * 0.08;
    cadena.current.rotation.x = 1.2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });
  return (
    <group ref={grupo} scale={ligero ? 0.95 : 1}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
        <group ref={anillo} rotation={[0.18, 0, -0.12]}>
          <Anillo ligero={ligero} />
        </group>
      </Float>
      <group ref={cadena} rotation={[1.2, 0, 0]}>
        <Cadena />
      </group>
      <Balines />
    </group>
  );
}

export default function EscenaJoya({ className, alListo }: { className?: string; alListo?: () => void }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const visible = useVisible(contenedor);
  // La escena solo se monta en el navegador (dynamic + ssr: false), así que se puede consultar la pantalla al iniciar
  const [ligero, setLigero] = useState(esLigero);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (pointer: coarse)");
    const actualizar = () => setLigero(mq.matches);
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);
  // El resplandor (bloom) solo en computadores con buen procesador: es lo más costoso por cuadro
  const [bloom] = useState(() => !esLigero() && (navigator.hardwareConcurrency ?? 8) > 4);

  return (
    <div
      ref={contenedor}
      className={className}
      style={{
        maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)",
      }}
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={ligero ? [1, 1.75] : [1, 1.8]}
        camera={{ position: [0, 0.35, 7.4], fov: 34 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        {/* Mismo color del fondo de la sección: el borde se difumina con la máscara del contenedor */}
        <color attach="background" args={["#0b0a08"]} />
        <ambientLight intensity={0.25} />
        <spotLight position={[4, 6, 6]} angle={0.4} penumbra={1} intensity={60} color="#fff3d6" />
        <pointLight position={[-4, -2, 3]} intensity={12} color="#ffcf7a" />
        <Estudio resolucion={ligero ? 128 : 256} />
        <Joya ligero={ligero} />
        <Sparkles count={ligero ? 34 : 90} scale={[9, 6, 4]} size={ligero ? 3 : 2.4} speed={0.35} opacity={0.9} color="#f6d98f" />
        {bloom && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.82} luminanceSmoothing={0.25} />
          </EffectComposer>
        )}
        <AvisarListo alListo={alListo} />
      </Canvas>
    </div>
  );
}
