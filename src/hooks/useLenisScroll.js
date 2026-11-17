import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getBookState } from '../animation/bookState';

gsap.registerPlugin(ScrollTrigger);

/**
 * Single pinned GSAP ScrollTrigger sequence synchronized with Lenis.
 * Normalized progress (0–1) maps to the eight cinematic stages.
 */
export function useLenisScroll(animRef, options = {}) {
  const { reducedMotion = false, isMobile = false } = options;
  const lenisRef = useRef(null);

  useEffect(() => {
    const hero = document.querySelector('#hero');
    if (!hero || !animRef) return undefined;

    animRef.current = getBookState(0, isMobile);

    if (reducedMotion) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const progress = { value: 0 };
    const scrollLength = isMobile ? '+=550%' : '+=650%';

    const tween = gsap.to(progress, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        id: 'diary-book-sequence',
        trigger: hero,
        start: 'top top',
        end: scrollLength,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          animRef.current = getBookState(self.progress, isMobile);
        },
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('resize', onResize);
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [animRef, reducedMotion, isMobile]);

  return lenisRef;
}
