import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOOK, COLORS } from '../../constants/book';

/**
 * Curved deformable page with hinge at local x = 0.
 * turnProgress 0 = right stack, 1 = left stack after a natural curl.
 */
export default function PageMesh({
  index = 0,
  total = BOOK.pageCount,
  animRef,
  pageTexture,
  reducedMotion = false,
}) {
  const meshRef = useRef();
  const { pageWidth, pageHeight, pageSegmentsX, pageSegmentsY, thickness, coverThickness } =
    BOOK;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      pageWidth,
      pageHeight,
      pageSegmentsX,
      pageSegmentsY
    );
    geo.translate(pageWidth / 2, 0, 0);
    const pos = geo.attributes.position;
    geo.userData.original = new Float32Array(pos.array.length);
    geo.userData.original.set(pos.array);
    geo.computeVertexNormals();
    return geo;
  }, [pageWidth, pageHeight, pageSegmentsX, pageSegmentsY]);

  const restZRight =
    thickness / 2 - coverThickness - 0.02 - (index / Math.max(total - 1, 1)) * 0.03;

  const restZLeft =
    -thickness / 2 + coverThickness + 0.02 + (index / Math.max(total - 1, 1)) * 0.03;

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const turnProgress = animRef?.current?.pageTurns?.[index] ?? 0;
    const t = reducedMotion ? 0 : THREE.MathUtils.clamp(turnProgress, 0, 1);
    const pos = mesh.geometry.attributes.position;
    const original = mesh.geometry.userData.original;

    const angle = t * Math.PI;
    const mid = Math.sin(t * Math.PI);

    for (let i = 0; i < pos.count; i += 1) {
      const ox = original[i * 3];
      const oy = original[i * 3 + 1];
      const u = THREE.MathUtils.clamp(ox / pageWidth, 0, 1);

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Strong mid-turn paper arch so the sheet reads as flexible, not a rigid panel
      const arch = Math.sin(u * Math.PI) * mid * (0.48 + 0.18 * u);
      const px = ox * cos - arch * sin * 0.55;
      const pz = ox * sin + arch * (0.85 + 0.25 * Math.abs(cos));
      const wave = Math.sin(oy * 2.6 + u * 3.1) * mid * 0.02 * u;

      pos.setXYZ(i, px, oy + wave * 0.35, pz + wave);
    }

    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    const ease = t * t * (3 - 2 * t);
    mesh.position.z = THREE.MathUtils.lerp(restZRight, restZLeft, ease);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      renderOrder={30 + index}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color={COLORS.ivory}
        map={pageTexture}
        roughness={0.86}
        metalness={0}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={1 + index}
        polygonOffsetUnits={1}
      />
    </mesh>
  );
}
