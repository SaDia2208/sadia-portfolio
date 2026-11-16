import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const SEEN_KEY = 'sa-entrance-seen';
const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Plays the entrance once per browser session; skippable; never for reduced-motion visitors. */
export function useEntrance() {
  const [state, setState] = useState(() => {
    try {
      if (prefersReduced() || sessionStorage.getItem(SEEN_KEY)) return 'done';
    } catch { return 'done'; }
    return 'intro';
  });
  const finish = () => {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked — fine */ }
    setState('done');
  };
  return [state, finish];
}

/* ---------------- 00 — Entrance curtain ---------------- */
export function Entrance({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(t) {
      const p = Math.min(1, (t - start) / 1500);
      setN(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setLeaving(true);
    });
    const skip = (e) => { if (e.type === 'keydown' && e.key === 'Tab') return; setLeaving(true); };
    window.addEventListener('keydown', skip);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', skip); };
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 850);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return createPortal(
    <div className={`fixed inset-0 z-[80] flex flex-col justify-between bg-ink p-5 text-paper sm:p-10 ${leaving ? 'curtain-up' : ''}`} role="status" aria-label="Loading portfolio">
      <div className="flex items-start justify-between">
        <p className="font-display text-2xl uppercase tracking-wide">Sadia Akter</p>
        <button onClick={() => setLeaving(true)} className="eyebrow rounded-full border border-white/25 px-4 py-2 hover:border-lime hover:text-lime">Skip intro</button>
      </div>
      <div>
        <p className="serif text-3xl text-paper/70 sm:text-5xl"><span className="line-mask"><span>entering the</span></span></p>
        <p className="display text-[17vw] leading-[0.82] sm:text-[11vw]"><span className="line-mask"><span style={{ animationDelay: '150ms' }}>Creative <span className="text-lime">universe</span></span></span></p>
      </div>
      <div className="flex items-end justify-between gap-6">
        <span className="h-px flex-1 origin-left bg-lime" style={{ animation: 'count-bar 1.5s linear both' }} />
        <span className="display tabular-nums text-6xl sm:text-8xl">{String(n).padStart(3, '0')}</span>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- Chapter progress rail ---------------- */
export function ChapterRail() {
  const [cur, setCur] = useState({ n: '01', t: 'The entrance' });
  const [p, setP] = useState(0);
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-chapter]')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCur({ n: e.target.dataset.chapter, t: e.target.dataset.chapterTitle }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; setP(h > 0 ? scrollY / h : 0); }); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', on); };
  }, []);
  return (
    <div className={`pointer-events-none fixed bottom-24 right-6 z-40 hidden flex-row-reverse items-end gap-3 text-right text-paper mix-blend-difference transition-opacity duration-500 lg:flex ${cur.n === '01' ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
      <span className="relative h-24 w-[2px] bg-current/25"><span className="absolute inset-x-0 top-0 bg-current" style={{ height: `${p * 100}%` }} /></span>
      <span>
        <span key={cur.n} className="line-mask font-display text-3xl leading-none"><span>{cur.n}</span></span>
        <span className="sr-only">{cur.t}</span>
      </span>
    </div>
  );
}
