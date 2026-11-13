import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** True once the element has scrolled into view (stays true). */
export function useInView(options = { rootMargin: '200px 0px' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView];
}

export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Sadia Akter` : 'Sadia Akter — Creative Content Designer & AI-Assisted Video Editor';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return scrolled;
}

/**
 * Scroll-linked drift. Every child with data-parallax="0.15" inside the returned ref
 * moves at that fraction of scroll relative to the container's centre. One rAF loop, transform only.
 */
export function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const root = ref.current;
    if (!root) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const offset = r.top + r.height / 2 - window.innerHeight / 2;
      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const k = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = `translate3d(0, ${(-offset * k).toFixed(1)}px, 0)`;
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return ref;
}

/**
 * Pointer-responsive layering: children with data-depth="20" shift up to that many px
 * opposite the pointer. Fine pointers only (no effect on touch).
 */
export function usePointerLayers() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || reduced() || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0, x = 0, y = 0;
    const apply = () => {
      raf = 0;
      root.querySelectorAll('[data-depth]').forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 0;
        el.style.translate = `${(-x * d).toFixed(1)}px ${(-y * d).toFixed(1)}px`;
      });
    };
    const move = (e) => {
      const r = root.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => { x = 0; y = 0; if (!raf) raf = requestAnimationFrame(apply); };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); };
  }, []);
  return ref;
}
