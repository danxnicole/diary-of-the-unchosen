import { useMemo } from 'react';
import * as THREE from 'three';
import { BOOK, COLORS } from '../../constants/book';
import { createLeatherTexture, createLeatherBumpTexture } from '../../utils/textures';

export default function Spine() {
  const leatherMap = useMemo(() => createLeatherTexture(), []);
  const bumpMap = useMemo(() => createLeatherBumpTexture(), []);
  const { width, height, thickness } = BOOK;

  const spineGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      thickness / 2,
      thickness / 2,
      height - 0.02,
      28,
      1,
      true,
      Math.PI * 0.5,
      Math.PI
    );
    return geo;
  }, [height, thickness]);

  const bandGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      thickness / 2 + 0.002,
      thickness / 2 + 0.002,
      0.03,
      28,
      1,
      true,
      Math.PI * 0.5,
      Math.PI
    );
    return geo;
  }, [thickness]);

  return (
    <group position={[-width / 2, 0, 0]}>
      <mesh geometry={spineGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={COLORS.leather}
          map={leatherMap}
          bumpMap={bumpMap}
          bumpScale={0.01}
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flush curved gold bands — no blocky boxes poking through */}
      {[-0.72, -0.38, 0.38, 0.72].map((y) => (
        <mesh key={y} geometry={bandGeo} position={[0, y, 0]} castShadow>
          <meshStandardMaterial
            color={COLORS.gold}
            metalness={0.95}
            roughness={0.28}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
