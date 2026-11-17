import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import * as THREE from 'three';
import Book from './book/Book';
import BookLighting from './lighting/BookLighting';
import SatinBackground from './background/SatinBackground';
import CameraRig from './CameraRig';
import FontGate from './FontGate';
import { COLORS } from '../constants/book';

function Scene({ animRef, reducedMotion }) {
  return (
    <>
      <color attach="background" args={[COLORS.satin]} />
      <SatinBackground />
      <BookLighting />
      <FontGate>
        <Book animRef={animRef} reducedMotion={reducedMotion} />
      </FontGate>
      <CameraRig animRef={animRef} />
      <Preload all />
    </>
  );
}

export default function Experience({ animRef, reducedMotion = false, isMobile = false }) {
  const dpr = useMemo(() => (isMobile ? [1, 1.35] : [1, 1.75]), [isMobile]);

  return (
    <Canvas
      className="experience-canvas"
      dpr={dpr}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(COLORS.satin), 1);
      }}
      camera={{ position: [0, 0.12, 4.85], fov: isMobile ? 40 : 34, near: 0.1, far: 50 }}
      shadows={!isMobile}
    >
      <Suspense fallback={null}>
        <Scene animRef={animRef} reducedMotion={reducedMotion} />
        <AdaptiveDpr />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  );
}
