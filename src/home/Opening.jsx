import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon, Magnetic } from '../components/ui';
import { featuredProjects, profile, projects } from '../lib/content';
import { useParallax, usePointerLayers } from '../lib/hooks';

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

/* ---------------- 01 — Hero ---------------- */
// Posters orbiting the portrait. Positions are art-directed, not random.
const ORBIT = [
  { cls: 'left-[3%] top-[30%] w-[11vw]', rot: '-9deg', fx: '-40vw', fy: '-10vh', depth: 26, drift: 0.18, delay: 700 },
  { cls: 'left-[15%] top-[52%] w-[9.5vw]', rot: '6deg', fx: '-30vw', fy: '40vh', depth: 18, drift: 0.32, delay: 820 },
  { cls: 'right-[4%] top-[27%] w-[11.5vw]', rot: '8deg', fx: '40vw', fy: '-20vh', depth: 30, drift: 0.22, delay: 760 },
  { cls: 'right-[17%] top-[55%] w-[9vw]', rot: '-5deg', fx: '30vw', fy: '40vh', depth: 20, drift: 0.36, delay: 900 },
];

export function Hero({ holding }) {
  const layers = usePointerLayers();
  const para = useParallax();
  const pool = (featuredProjects.length ? featuredProjects : projects).filter((p) => p.cover);
  // Spread the orbit across brands.
  const seen = new Set();
  const art = [...pool.filter((p) => !seen.has(p.brand) && seen.add(p.brand)), ...pool].filter((p, i, a) => a.indexOf(p) === i).slice(0, ORBIT.length);
  const cutout = profile.portraitCutout || profile.portrait;

  return (
    <section ref={(el) => { layers.current = el; para.current = el; }} data-chapter="01" data-chapter-title="The entrance"
      className={`grain relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink ${holding ? 'hold' : ''}`} aria-label="Introduction">
      <h1 className="sr-only">{profile.name} — {profile.headline}</h1>

      {/* atmosphere */}
      <span className="pointer-events-none absolute -left-[15%] top-[10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-violet/25 blur-[140px]" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-[10%] bottom-[-25%] -z-10 h-[45vw] w-[45vw] rounded-full bg-coral/20 blur-[140px]" aria-hidden="true" />

      {/* Line 1 — sits BEHIND the portrait */}
      <p aria-hidden="true" className="display absolute inset-x-0 top-[11svh] z-0 text-center text-[24vw] text-paper sm:top-[10svh] lg:text-[min(15.5vw,25svh)]">
        <span className="line-mask"><span style={{ animationDelay: '0ms' }}>I turn ideas</span></span>
      </p>

      {/* Lime disc + portrait cut-out */}
      <div className="absolute inset-x-0 bottom-0 z-[2] flex justify-center" data-depth="8">
        <div className="relative h-[58svh] sm:h-[70svh] lg:h-[74svh]">
          <span className="disc-in absolute left-1/2 top-[3%] -z-10 aspect-square h-[60%] -translate-x-1/2 rounded-full bg-lime" style={{ animationDelay: '250ms' }} aria-hidden="true" />
          <span className="disc-in absolute left-1/2 top-[3%] -z-10 aspect-square h-[60%] -translate-x-[12%] translate-y-[8%] rounded-full border-2 border-violet" style={{ animationDelay: '420ms' }} aria-hidden="true" />
          <img src={cutout} alt={profile.portraitAlt} decoding="async" fetchpriority="high"
            className="enter relative h-full w-auto max-w-none select-none object-contain object-bottom" style={{ animationDelay: '380ms' }} draggable={false} />
        </div>
      </div>

      {/* Real artwork orbit (desktop) */}
      <div className="hidden lg:block" aria-hidden="false">
        {art.map((p, i) => {
          const o = ORBIT[i];
          return (
            <div key={p.id} data-parallax={o.drift} className={`absolute z-[1] ${o.cls}`}>
              <div data-depth={o.depth}>
                <Link to={p.url} className="fly-in group block shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]" aria-label={`View ${p.title}`}
                  style={{ '--rot': o.rot, '--fx': o.fx, '--fy': o.fy, animationDelay: `${o.delay}ms` }}>
                  <img src={p.cover} alt="" loading="eager" decoding="async" className="block w-full transition-transform duration-500 group-hover:scale-105" />
                  <span className="pointer-events-none absolute -bottom-6 left-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-paper/0 transition-colors group-hover:text-paper/80">{p.title}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {/* Mobile: two posters tucked at the sides */}
      <div className="lg:hidden" aria-hidden="true">
        {art.slice(0, 2).map((p, i) => (
          <img key={p.id} src={p.cover} alt="" className={`fly-in absolute z-[1] w-[27vw] shadow-2xl ${i ? 'right-[2%] top-[44svh]' : 'left-[2%] top-[50svh]'}`}
            style={{ '--rot': i ? '7deg' : '-8deg', '--fx': i ? '40vw' : '-40vw', '--fy': '0', animationDelay: `${700 + i * 120}ms` }} />
        ))}
      </div>

      {/* "into" + Line 3 — sits IN FRONT of the portrait */}
      <p aria-hidden="true" className="serif fade-up absolute inset-x-0 top-[31svh] z-[3] text-center text-[12vw] leading-none text-lime sm:inset-x-auto sm:left-[10%] sm:top-[36svh] lg:left-[22%] lg:top-[34svh] lg:text-[min(7vw,12svh)]" style={{ animationDelay: '520ms' }}>into</p>
      <p aria-hidden="true" className="display absolute inset-x-0 bottom-[3svh] z-[3] flex flex-col items-center leading-[0.8] sm:flex-row sm:justify-center sm:gap-[2vw]">
        <span className="line-mask"><span className="hollow text-paper text-[23vw] sm:text-[17vw] lg:text-[min(13.5vw,24svh)]" style={{ animationDelay: '600ms' }}>Visual</span></span>
        <span className="line-mask"><span className="text-coral text-[23vw] sm:text-[17vw] lg:text-[min(13.5vw,24svh)]" style={{ animationDelay: '700ms' }}>impact.</span></span>
      </p>

      {/* Vertical identity strip */}
      <p className="fade-up absolute right-3 top-1/2 z-[4] hidden origin-center -translate-y-1/2 translate-x-[calc(50%-12px)] rotate-90 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em] text-paper/70 sm:block" style={{ animationDelay: '1000ms' }}>
        {profile.name} — {profile.tagline}
      </p>

      {/* Explore */}
      <div className="fade-up absolute bottom-[30svh] right-[5%] z-[5] sm:bottom-[34svh] lg:right-[31%] lg:bottom-[38svh]" style={{ animationDelay: '1100ms' }}>
        <Magnetic to="/work" strength={0.35}
          className="group h-24 w-24 flex-col items-center justify-center rounded-full bg-coral text-center text-ink shadow-[0_0_0_6px_rgba(9,9,9,0.4)] sm:h-32 sm:w-32">
          <Icon name="arrowUpRight" className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" />
          <span className="mt-1 text-[10px] font-extrabold uppercase leading-tight tracking-wider sm:text-[11px]">Explore<br />my work</span>
        </Magnetic>
      </div>

      <a href="#selected" className="fade-up absolute bottom-6 left-5 z-[4] hidden items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-paper/60 hover:text-lime lg:flex" style={{ animationDelay: '1200ms' }}>
        <span className="bob grid h-10 w-6 place-items-start justify-center rounded-full border border-current pt-1.5"><span className="h-2 w-[2px] bg-current" /></span>
        Scroll
      </a>
    </section>
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
