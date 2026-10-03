"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

// Resplandor (bloom) en un archivo aparte: solo se descarga en computadores, donde se usa.
export default function Resplandor({ intensidad = 0.75, umbral = 0.82 }: { intensidad?: number; umbral?: number }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={intensidad} luminanceThreshold={umbral} luminanceSmoothing={0.25} />
    </EffectComposer>
  );
}
