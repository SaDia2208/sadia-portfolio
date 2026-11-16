import { useEffect, useRef, useState } from 'react';

/**
 * Cursor accent — a ring that trails the real pointer (which stays visible).
 * Grows over links/buttons, says "View" over artwork and "Drag" on the playground canvas.
 * Desktop (fine pointer) only; off for reduced-motion visitors.
 */
export default function Cursor() {
  const ring = useRef(null);
  const [mode, setMode] = useState('idle'); // idle | link | view | drag
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setOn(true);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, visible = false;
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (!visible && ring.current) { visible = true; ring.current.style.opacity = '1'; rx = x; ry = y; }
      const t = e.target;
      if (!(t instanceof Element)) return;
      const explicit = t.closest('[data-cursor]')?.getAttribute('data-cursor');
      const interactive = t.closest('a, button, [role="button"], label, input, textarea, select');
      if (interactive?.querySelector('img') || interactive?.matches('img')) setMode('view');
      else if (interactive) setMode('link');
      else if (explicit) setMode(explicit);
      else setMode('idle');
    };
    const leave = () => { visible = false; if (ring.current) ring.current.style.opacity = '0'; };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); };
  }, []);

  if (!on) return null;
  const size = { idle: 'h-8 w-8', link: 'h-14 w-14', view: 'h-20 w-20 bg-paper', drag: 'h-20 w-20 bg-lime' }[mode];
  const label = mode === 'view' ? 'View' : mode === 'drag' ? 'Drag' : '';
  return (
    <div ref={ring} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[200] opacity-0 mix-blend-difference transition-opacity duration-300">
      <div className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-paper transition-[width,height,background-color] duration-300 ease-out ${size}`}>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink">{label}</span>
      </div>
    </div>
  );
}
