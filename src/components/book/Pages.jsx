import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BOOK, COLORS } from '../../constants/book';
import { createPageTexture } from '../../utils/textures';
import PageMesh from './PageMesh';

export default function Pages({ animRef, reducedMotion = false }) {
  const pageTexture = useMemo(() => createPageTexture(), []);
  const blockRef = useRef();
  const edgeRef = useRef();
  const { pageCount, width, thickness, coverThickness, pageWidth, pageHeight } = BOOK;

  const hingeX = -width / 2 + 0.02;
  const blockDepth = Math.max(0.05, thickness - coverThickness * 2 - 0.05);

  useFrame(() => {
    if (!blockRef.current || !animRef?.current) return;
    const open = animRef.current.coverOpen ?? 0;
    // Collapse page mass while cover is open so the swinging board never clips through it
    const depthScale = Math.max(0.22, 1 - open * 0.72);
    const widthScale = 1 - open * 0.04;
    blockRef.current.scale.set(widthScale, 0.985, depthScale);
    blockRef.current.material.opacity = 0.55 + (1 - open) * 0.45;
    if (edgeRef.current) {
      edgeRef.current.visible = open < 0.35;
    }
  });

  return (
    <group position={[hingeX, 0, 0]}>
      <mesh ref={blockRef} position={[pageWidth * 0.5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[pageWidth * 0.94, pageHeight * 0.965, blockDepth]} />
        <meshStandardMaterial
          color={COLORS.ivoryShadow}
          roughness={0.92}
          metalness={0}
          transparent
        />
      </mesh>

      <mesh ref={edgeRef} position={[pageWidth * 0.97, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[blockDepth * 0.85, pageHeight * 0.965, 0.008]} />
        <meshStandardMaterial color={COLORS.ivory} roughness={0.72} metalness={0.04} />
      </mesh>

      {Array.from({ length: pageCount }, (_, i) => (
        <PageMesh
          key={i}
          index={i}
          total={pageCount}
          animRef={animRef}
          pageTexture={pageTexture}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
