import { useEffect, useState } from 'react';
import { preloadFont } from 'troika-three-text';
import { FONTS } from '../constants/book';

const GLYPHS = 'DIARY OF THEUNCHOSEN';

function preload(url) {
  return new Promise((resolve) => {
    preloadFont({ font: url, characters: GLYPHS }, resolve);
  });
}

/**
 * Ensures cover typography fonts are ready before the book mounts,
 * preventing the gold title from popping in mid-scene.
 */
export default function FontGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([preload(FONTS.regular), preload(FONTS.italic)])
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;
  return children;
}
