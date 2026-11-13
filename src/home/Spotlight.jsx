import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';
import { brandBySlug, categoryBySlug, featuredProjects, projects } from '../lib/content';

// Dark, brand-tinted environments the stage shifts into as each piece takes over.
const ATMOS = {
  'cricket-arabia': ['#140405', '#E3222B'],
  cubuzzle: ['#050d2b', '#FFD21F'],
  'active-arabia': ['#1d0c05', '#FF5A36'],
  tourmatez: ['#03200f', '#FFD43B'],
};

/**
 * Selected Work — a pinned stage. Scrolling hands the stage from one featured piece to the next:
 * the incoming artwork is uncovered by a mask, the outgoing one recedes. Featured items come from
 * project data (`featured` + `featuredOrder`), so the CMS controls what shows here.
 */
export default function Spotlight() {
  const list = (featuredProjects.length ? featuredProjects : projects).filter((p) => p.cover).slice(0, 8);
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [frac, setFrac] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !list.length) return;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - innerHeight;
        const p = Math.min(Math.max(-r.top / total, 0), 0.9999);
        const f = p * list.length;
        setActive(Math.floor(f));
        setFrac(f % 1);
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [list.length]);

  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * (i + 0.15)) / list.length, behavior: 'smooth' });
  };

  if (!list.length) return null;
  const cur = list[active];
  const [bg, accent] = ATMOS[cur.brand] || ['#090909', '#D8FF35'];
  const brand = brandBySlug[cur.brand];
  const cat = categoryBySlug[cur.category];

  return (
    <section id="selected" ref={ref} data-chapter="02" data-chapter-title="Selected work" aria-labelledby="selected-title"
      className="relative" style={{ height: `${list.length * 85 + 40}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden transition-colors duration-1000" style={{ background: bg }}>
        <span className="pointer-events-none absolute left-[55%] top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px] transition-colors duration-1000" style={{ background: accent }} aria-hidden="true" />

        <div className="wrap relative grid h-full grid-rows-[1fr_auto] gap-4 pb-6 pt-20 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-0">
          {/* Meta column */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <h2 id="selected-title" className="eyebrow flex items-center gap-3" style={{ color: accent }}>
              <span className="font-display text-base tracking-normal">02</span><span className="h-px w-10 bg-current opacity-50" />Selected work
            </h2>
            <div className="mt-4 flex items-end gap-3 lg:mt-8">
              <span key={`n${active}`} className="line-mask display text-[18vw] leading-[0.8] lg:text-[9vw]"><span>{String(active + 1).padStart(2, '0')}</span></span>
              <span className="display hollow pb-2 text-4xl text-paper/60 lg:text-6xl">/{String(list.length).padStart(2, '0')}</span>
            </div>
            <p key={`b${active}`} className="fade-up eyebrow mt-4 text-paper/60 lg:mt-8">{brand?.name} · {cat?.label}</p>
            <h3 key={`t${active}`} className="line-mask display mt-2 text-[9vw] leading-[0.9] lg:text-[3.6vw]"><span>{cur.title}</span></h3>
            {cur.description && <p key={`d${active}`} className="fade-up mt-4 hidden max-w-sm text-sm leading-relaxed text-paper/70 sm:block" style={{ animationDelay: '120ms' }}>{cur.description}</p>}
            <Link to={cur.url} className="mt-6 inline-flex items-center gap-2 border-b-2 pb-1 text-xs font-bold uppercase tracking-[0.2em] transition hover:gap-4" style={{ borderColor: accent, color: accent }}>
              View project <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            {/* Progress — also a way to jump between pieces */}
            <ol className="mt-6 flex gap-1.5 lg:mt-10" aria-label="Selected pieces">
              {list.map((p, i) => (
                <li key={p.id} className="flex-1">
                  <button onClick={() => goTo(i)} aria-label={`Show ${p.title}`} aria-current={i === active ? 'true' : undefined} className="block w-full py-2">
                    <span className="relative block h-[3px] overflow-hidden bg-white/15">
                      <span className="absolute inset-y-0 left-0" style={{ background: accent, width: i < active ? '100%' : i === active ? `${Math.max(frac, 0.08) * 100}%` : '0%' }} />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Stage */}
          <div className="relative order-1 min-h-0 lg:order-2 lg:col-span-7 lg:col-start-6 lg:h-[82svh]">
            {list.map((p, i) => {
              const state = i === active ? 'in' : i < active ? 'past' : 'next';
              return (
                <Link key={p.id} to={p.url} tabIndex={i === active ? 0 : -1} aria-hidden={i !== active} aria-label={`Open ${p.title}`}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    clipPath: state === 'next' ? 'inset(100% 0 0 0)' : 'inset(0 0 0 0)',
                    transform: state === 'past' ? 'scale(0.86) translateY(-6%)' : 'none',
                    opacity: state === 'past' ? 0 : 1,
                    transition: 'clip-path 1.1s var(--ease-out-expo), transform 1.1s var(--ease-out-expo), opacity 0.9s ease',
                    zIndex: i === active ? 2 : 1,
                  }}>
                  <img src={p.cover} alt={p.title} loading={i < 2 ? 'eager' : 'lazy'} decoding="async"
                    className="block h-auto max-h-full w-auto max-w-full object-contain shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]"
                    style={{ transform: i === active ? `translateY(${(0.5 - frac) * 4}%) rotate(${(frac - 0.5) * 1.5}deg)` : undefined, transition: 'transform 0.2s linear' }} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
