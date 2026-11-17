import { Text } from '@react-three/drei';
import { COLORS, FONTS } from '../../constants/book';

export default function CoverTitle({ z = 0.024 }) {
  return (
    <group position={[0, 0.08, z]}>
      <Text
        font={FONTS.regular}
        fontSize={0.1}
        letterSpacing={0.16}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.22, 0]}
        maxWidth={1.35}
        textAlign="center"
        outlineWidth={0}
      >
        DIARY OF THE
        <meshStandardMaterial
          color={COLORS.gold}
          metalness={0.92}
          roughness={0.25}
          emissive={COLORS.goldDeep}
          emissiveIntensity={0.14}
          toneMapped={false}
        />
      </Text>

      <Text
        font={FONTS.italic}
        fontSize={0.235}
        letterSpacing={0.05}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.04, 0]}
        maxWidth={1.45}
        textAlign="center"
      >
        UNCHOSEN
        <meshStandardMaterial
          color={COLORS.goldBright}
          metalness={0.96}
          roughness={0.18}
          emissive={COLORS.gold}
          emissiveIntensity={0.16}
          toneMapped={false}
        />
      </Text>

      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.55, 0.006, 0.002]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.95} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.24, 0]}>
        <boxGeometry args={[0.2, 0.004, 0.002]} />
        <meshStandardMaterial color={COLORS.goldBright} metalness={0.98} roughness={0.22} />
      </mesh>
    </group>
  );
}
