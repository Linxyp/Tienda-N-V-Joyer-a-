"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Materiales
export const oro = new THREE.MeshStandardMaterial({ color: "#f3c972", metalness: 1, roughness: 0.16, envMapIntensity: 1.6 });
export const oroRosa = new THREE.MeshStandardMaterial({ color: "#f0b98a", metalness: 1, roughness: 0.2, envMapIntensity: 1.4 });

/** Talla brillante: culata, dos hileras de facetas en el pabellón, filetín y corona escalonada. */
function geometriaDiamante() {
  const p = [
    new THREE.Vector2(0.0001, -0.64),
    new THREE.Vector2(0.24, -0.4),
    new THREE.Vector2(0.5, -0.08),
    new THREE.Vector2(0.54, -0.02),
    new THREE.Vector2(0.54, 0.03),
    new THREE.Vector2(0.45, 0.15),
    new THREE.Vector2(0.33, 0.25),
    new THREE.Vector2(0.0001, 0.27),
  ];
  const g = new THREE.LatheGeometry(p, 12).toNonIndexed();
  // Cada faceta (dos triángulos) con un tono propio: blancos, hielo y algunos oscuros, como el "fuego" de un brillante
  const tonos = ["#ffffff", "#f3f7ff", "#d9e4f5", "#ffffff", "#b9c8e0", "#fff8ec", "#7f90ad", "#ffffff", "#e8eefa", "#4d5a72"];
  const colores = new Float32Array(g.attributes.position.count * 3);
  const c = new THREE.Color();
  for (let t = 0; t < g.attributes.position.count / 3; t++) {
    const faceta = Math.floor(t / 2);
    c.set(tonos[(faceta * 7 + (faceta % 3)) % tonos.length]);
    for (let v = 0; v < 3; v++) c.toArray(colores, (t * 3 + v) * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colores, 3));
  return g;
}

const materialDiamante = new THREE.MeshPhysicalMaterial({
  color: "#ffffff",
  vertexColors: true,
  metalness: 0.55,
  roughness: 0.02,
  envMapIntensity: 4,
  emissive: "#7d8fae",
  emissiveIntensity: 0.28,
  iridescence: 1,
  iridescenceIOR: 1.8,
  iridescenceThicknessRange: [120, 760],
  clearcoat: 1,
  clearcoatRoughness: 0,
  flatShading: true,
});

export function Diamante(props: ThreeElements["mesh"]) {
  const geo = useMemo(() => geometriaDiamante(), []);
  return <mesh geometry={geo} material={materialDiamante} {...props} />;
}

/** Anillo solitario: aro + engaste de 6 garras + diamante. */
export function Anillo() {
  const garras = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return [Math.cos(a) * 0.36, Math.sin(a) * 0.36] as const;
      }),
    [],
  );
  return (
    <group>
      <mesh material={oro}>
        <torusGeometry args={[1, 0.1, 48, 160]} />
      </mesh>
      {/* hombros del anillo */}
      <mesh material={oro} position={[0, 1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 24, 64]} />
      </mesh>
      {garras.map(([x, z], i) => (
        <mesh key={i} material={oro} position={[x * 0.92, 1.28, z * 0.92]} rotation={[z * 0.6, 0, -x * 0.6]}>
          <cylinderGeometry args={[0.022, 0.034, 0.5, 10]} />
        </mesh>
      ))}
      <Diamante position={[0, 1.52, 0]} scale={0.62} />
    </group>
  );
}

/** Cadena tipo "cubana" en órbita: eslabones instanciados a lo largo de una curva. */
export function Cadena({ radio = 2.05, eslabones = 64 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const curva = new THREE.EllipseCurve(0, 0, radio, radio * 0.86, 0, Math.PI * 2, false, 0);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const giro = new THREE.Quaternion();
    const eje = new THREE.Vector3(1, 0, 0);
    for (let i = 0; i < eslabones; i++) {
      const t = i / eslabones;
      const p = curva.getPoint(t);
      const tg = curva.getTangent(t);
      const ang = Math.atan2(tg.y, tg.x);
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang);
      giro.setFromAxisAngle(eje, i % 2 ? Math.PI / 2 : 0);
      q.multiply(giro);
      m.compose(new THREE.Vector3(p.x, p.y, Math.sin(t * Math.PI * 6) * 0.08), q, new THREE.Vector3(1.35, 1, 1));
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [radio, eslabones]);
  return (
    <instancedMesh ref={ref} args={[undefined, oro, eslabones]}>
      <torusGeometry args={[0.1, 0.034, 12, 28]} />
    </instancedMesh>
  );
}

export function Balines() {
  const grupo = useRef<THREE.Group>(null);
  const datos = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        r: 2.6 + (i % 3) * 0.45,
        a: (i / 9) * Math.PI * 2,
        y: ((i * 37) % 11) / 11 - 0.5,
        s: 0.05 + ((i * 13) % 5) * 0.018,
        rosa: i % 4 === 0,
      })),
    [],
  );
  useFrame((_, dt) => {
    if (grupo.current) grupo.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={grupo}>
      {datos.map((d, i) => (
        <mesh key={i} material={d.rosa ? oroRosa : oro} position={[Math.cos(d.a) * d.r, d.y * 2.2, Math.sin(d.a) * d.r]}>
          <sphereGeometry args={[d.s, 24, 24]} />
        </mesh>
      ))}
    </group>
  );
}

export function Estudio() {
  return (
    <Environment resolution={256} frames={1}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="circle" intensity={5} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} color="#fff6dd" />
        <Lightformer form="circle" intensity={2.5} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} color="#ffe2a8" />
        <Lightformer form="ring" intensity={3} rotation-y={Math.PI / 2} position={[-0.1, -1, -5]} scale={10} color="#fff1cc" />
        <Lightformer form="rect" intensity={6} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[12, 0.6, 1]} />
        <Lightformer form="rect" intensity={4} position={[-6, 0, 4]} rotation-y={Math.PI / 3} scale={[0.6, 8, 1]} color="#fff6e0" />
        <Lightformer form="rect" intensity={4} position={[6, -2, 3]} rotation-y={-Math.PI / 3} scale={[0.5, 6, 1]} />
      </group>
    </Environment>
  );
}

/** Pausa el render cuando la escena no está en pantalla (ahorra batería en celulares). */
export function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

