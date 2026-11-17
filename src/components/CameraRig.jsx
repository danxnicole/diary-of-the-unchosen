import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraRig({ animRef }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0.15, 4.6));
  const currentTarget = useRef(new THREE.Vector3(0, 0.05, 0));
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    const state = animRef?.current;
    if (!state) return;

    desiredPos.current.set(
      state.cameraPosition[0],
      state.cameraPosition[1],
      state.cameraPosition[2]
    );
    desiredTarget.current.set(
      state.cameraTarget[0],
      state.cameraTarget[1],
      state.cameraTarget[2]
    );

    currentPos.current.lerp(desiredPos.current, 0.14);
    currentTarget.current.lerp(desiredTarget.current, 0.14);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
