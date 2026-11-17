import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BOOK } from '../../constants/book';
import FrontCover from './FrontCover';
import BackCover from './BackCover';
import Spine from './Spine';
import Pages from './Pages';

/**
 * Assembled hardcover diary — consistent local coordinates & spine hinges.
 * Reads continuous state from animRef (updated by scroll progress).
 */
export default function Book({ animRef, reducedMotion = false }) {
  const rootRef = useRef();
  const frontPivotRef = useRef();

  useFrame(() => {
    const state = animRef?.current;
    if (!state || !rootRef.current) return;

    rootRef.current.position.set(state.position[0], state.position[1], state.position[2]);
    rootRef.current.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2]);

    if (frontPivotRef.current) {
      frontPivotRef.current.rotation.y = reducedMotion ? 0 : -state.coverAngle;
    }
  });

  const { width, thickness, coverThickness } = BOOK;

  return (
    <group ref={rootRef}>
      <BackCover />
      <Spine />
      <Pages animRef={animRef} reducedMotion={reducedMotion} />

      <group
        ref={frontPivotRef}
        position={[-width / 2, 0, thickness / 2 - coverThickness / 2]}
      >
        <FrontCover />
      </group>
    </group>
  );
}
