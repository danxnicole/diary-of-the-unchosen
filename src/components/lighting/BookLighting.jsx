import { Environment } from '@react-three/drei';
import { COLORS } from '../../constants/book';

export default function BookLighting() {
  return (
    <>
      <ambientLight intensity={0.62} color={COLORS.satinLight} />

      <directionalLight
        position={[3.8, 5.5, 4.5]}
        intensity={1.45}
        color="#FFF8F0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00025}
      />

      <directionalLight position={[-3.5, 2.2, 2.5]} intensity={0.5} color={COLORS.satin} />
      <directionalLight position={[1.5, 3, -3]} intensity={0.28} color={COLORS.pink} />
      <pointLight
        position={[1.4, 1.8, 2.2]}
        intensity={0.6}
        color={COLORS.goldBright}
        distance={9}
      />
      <pointLight position={[-1.2, 0.8, 1.5]} intensity={0.25} color={COLORS.satinLight} distance={7} />

      <Environment preset="apartment" environmentIntensity={0.28} />
    </>
  );
}
