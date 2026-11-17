import { useMemo } from 'react';
import { BOOK, COLORS } from '../../constants/book';
import { createLeatherTexture, createLeatherBumpTexture } from '../../utils/textures';
import GoldOrnaments from './GoldOrnaments';

/**
 * Physically separate exterior back-cover surface — burgundy leather,
 * gold border + corner ornaments, no lettering.
 */
export default function BackCover() {
  const leatherMap = useMemo(() => createLeatherTexture(), []);
  const bumpMap = useMemo(() => createLeatherBumpTexture(), []);
  const { width, height, coverThickness, thickness } = BOOK;

  // Back cover sits at the rear of the closed book (negative Z).
  const z = -thickness / 2 + coverThickness / 2;

  return (
    <group position={[0, 0, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, coverThickness]} />
        <meshStandardMaterial
          color={COLORS.leather}
          map={leatherMap}
          bumpMap={bumpMap}
          bumpScale={0.012}
          roughness={0.52}
          metalness={0.08}
        />
      </mesh>

      {/* Exterior face points toward -Z when the book is closed upright */}
      <group position={[0, 0, -coverThickness / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow>
          <boxGeometry args={[width - 0.02, height - 0.02, 0.004]} />
          <meshStandardMaterial
            color={COLORS.leatherHighlight}
            map={leatherMap}
            roughness={0.48}
            metalness={0.06}
          />
        </mesh>
        <GoldOrnaments width={width - 0.04} height={height - 0.04} z={0.004} />
      </group>

      {/* Interior liner facing the pages (+Z) */}
      <mesh position={[0, 0, coverThickness / 2 + 0.001]} receiveShadow>
        <boxGeometry args={[width - 0.03, height - 0.03, 0.006]} />
        <meshStandardMaterial color={COLORS.ivory} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}
