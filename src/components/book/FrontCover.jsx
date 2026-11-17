import { useMemo } from 'react';
import { BOOK, COLORS } from '../../constants/book';
import { createLeatherTexture, createLeatherBumpTexture } from '../../utils/textures';
import GoldOrnaments from './GoldOrnaments';
import CoverTitle from './CoverTitle';

export default function FrontCover() {
  const leatherMap = useMemo(() => createLeatherTexture(), []);
  const bumpMap = useMemo(() => createLeatherBumpTexture(), []);

  const { width, height, coverThickness } = BOOK;

  return (
    <group>
      {/* Main hardcover board — pivot is at left (spine) edge */}
      <mesh
        position={[width / 2, 0, coverThickness / 2]}
        castShadow
        receiveShadow
      >
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

      {/* Slight bevel lip on outer face */}
      <mesh position={[width / 2, 0, coverThickness + 0.001]} castShadow>
        <boxGeometry args={[width - 0.02, height - 0.02, 0.004]} />
        <meshStandardMaterial
          color={COLORS.leatherHighlight}
          map={leatherMap}
          roughness={0.48}
          metalness={0.06}
        />
      </mesh>

      {/* Interior liner */}
      <mesh position={[width / 2, 0, -0.001]} receiveShadow>
        <boxGeometry args={[width - 0.03, height - 0.03, 0.006]} />
        <meshStandardMaterial
          color={COLORS.ivory}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Gold detailing + title on exterior */}
      <group position={[width / 2, 0, coverThickness + 0.004]}>
        <GoldOrnaments width={width - 0.04} height={height - 0.04} />
        <CoverTitle z={0.006} />
      </group>
    </group>
  );
}
