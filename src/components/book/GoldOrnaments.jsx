import { COLORS, BOOK } from '../../constants/book';

function CornerFlourish({ position, rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer corner bracket */}
      <mesh position={[0.045, 0.045, 0]} castShadow>
        <boxGeometry args={[0.1, BOOK.goldBorder * 0.9, 0.004]} />
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[0.045, 0.045, 0]} castShadow>
        <boxGeometry args={[BOOK.goldBorder * 0.9, 0.1, 0.004]} />
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Delicate inner curve suggestion via small bars */}
      <mesh position={[0.075, 0.028, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.05, BOOK.goldBorder * 0.55, 0.003]} />
        <meshStandardMaterial
          color={COLORS.goldBright}
          metalness={0.98}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0.028, 0.075, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[BOOK.goldBorder * 0.55, 0.05, 0.003]} />
        <meshStandardMaterial
          color={COLORS.goldBright}
          metalness={0.98}
          roughness={0.22}
        />
      </mesh>
      {/* Tiny corner diamond */}
      <mesh position={[0.028, 0.028, 0.001]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.022, 0.022, 0.003]} />
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={1}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function GoldOrnaments({ width, height, z = 0.001 }) {
  const inset = BOOK.goldInset;
  const hw = width / 2 - inset;
  const hh = height / 2 - inset;

  return (
    <group position={[0, 0, z]}>
      {/* Fine gold border frame */}
      {/* Top */}
      <mesh position={[0, hh, 0]} castShadow>
        <boxGeometry args={[width - inset * 2, BOOK.goldBorder, 0.0035]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.3} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -hh, 0]} castShadow>
        <boxGeometry args={[width - inset * 2, BOOK.goldBorder, 0.0035]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.3} />
      </mesh>
      {/* Left */}
      <mesh position={[-hw, 0, 0]} castShadow>
        <boxGeometry args={[BOOK.goldBorder, height - inset * 2, 0.0035]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.3} />
      </mesh>
      {/* Right */}
      <mesh position={[hw, 0, 0]} castShadow>
        <boxGeometry args={[BOOK.goldBorder, height - inset * 2, 0.0035]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.3} />
      </mesh>

      {/* Corner ornaments */}
      <CornerFlourish position={[-hw, hh, 0]} rotation={[0, 0, 0]} />
      <CornerFlourish position={[hw, hh, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <CornerFlourish position={[hw, -hh, 0]} rotation={[0, 0, Math.PI]} />
      <CornerFlourish position={[-hw, -hh, 0]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  );
}
