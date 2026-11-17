import { useEffect, useRef, useState } from 'react';
import Experience from './components/Experience';
import { useLenisScroll } from './hooks/useLenisScroll';
import { createInitialBookState } from './animation/bookState';
import './styles/App.css';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return mobile;
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const animRef = useRef(createInitialBookState(false));

  useEffect(() => {
    animRef.current = createInitialBookState(isMobile);
  }, [isMobile]);

  useLenisScroll(animRef, { reducedMotion, isMobile });

  return (
    <div className="app">
      <div id="scroll-root" className="scroll-root">
        <section id="hero" className="hero" aria-label="Diary of the Unchosen">
          <Experience
            animRef={animRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
          <div className="hero-grain" aria-hidden="true" />
        </section>
      </div>
    </div>
  );
}
