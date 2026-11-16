import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Magnetic } from '../components/ui';
import { featuredProjects, profile, projects } from '../lib/content';
import { usePointerLayers } from '../lib/hooks';

// Posters orbiting the portrait. Positions are art-directed; dx/dy is the direction each one scatters on scroll.
const ORBIT = [
  { cls: 'left-[3%] top-[30%] w-[11vw]', rot: '-9deg', fx: '-40vw', fy: '-10vh', depth: 26, delay: 700, dx: -1, dy: -0.6 },
  { cls: 'left-[15%] top-[52%] w-[9.5vw]', rot: '6deg', fx: '-30vw', fy: '40vh', depth: 18, delay: 820, dx: -1.1, dy: 0.7 },
  { cls: 'right-[4%] top-[27%] w-[11.5vw]', rot: '8deg', fx: '40vw', fy: '-20vh', depth: 30, delay: 760, dx: 1, dy: -0.7 },
  { cls: 'right-[17%] top-[55%] w-[9vw]', rot: '-5deg', fx: '30vw', fy: '40vh', depth: 20, delay: 900, dx: 1.1, dy: 0.6 },
];

/** Scroll progress through a tall pinned section, written to the CSS variable --p (0 → 1). One rAF loop, no re-renders. */
function useSceneProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.setProperty('--p', '0'); return; }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      el.style.setProperty('--p', p.toFixed(4));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return ref;
}

const fadeOut = (k = 1.8) => ({ opacity: `calc(1 - var(--p) * ${k})` });

/*
  THE ENTRANCE — a pinned scene. The section is taller than the screen; its stage stays put while you scroll:
  0.0  composition at rest
  →    "I turn" / "ideas" split apart, posters scatter outward, "into / visual impact" lifts away,
       the portrait settles, and the lime disc grows until it floods the screen —
  1.0  the stage is solid lime and hands over to the lime band below.
*/
export default function Hero({ holding }) {
  const layers = usePointerLayers();
  const scene = useSceneProgress();
  const pool = (featuredProjects.length ? featuredProjects : projects).filter((p) => p.cover);
  const seen = new Set();
  const art = [...pool.filter((p) => !seen.has(p.brand) && seen.add(p.brand)), ...pool]
    .filter((p, i, a) => a.indexOf(p) === i).slice(0, ORBIT.length);
  const cutout = profile.portraitCutout || profile.portrait;

  return (
    <section ref={scene} data-chapter="01" data-chapter-title="The entrance" style={{ '--p': 0 }}
      className={`relative h-[175svh] motion-reduce:h-[100svh] ${holding ? 'hold' : ''}`} aria-label="Introduction">
      <div ref={layers} className="grain sticky top-0 isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink">
        <h1 className="sr-only">{profile.name} — {profile.headline}</h1>

        {/* atmosphere */}
        <span className="pointer-events-none absolute -left-[15%] top-[10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-violet/25 blur-[140px]" aria-hidden="true" />
        <span className="pointer-events-none absolute -right-[10%] bottom-[-25%] -z-10 h-[45vw] w-[45vw] rounded-full bg-coral/20 blur-[140px]" aria-hidden="true" />

        {/* Line 1 — BEHIND the portrait; the two halves split apart on scroll */}
        <p aria-hidden="true" className="display absolute inset-x-0 top-[11svh] z-0 flex flex-col items-center text-[24vw] text-paper sm:top-[10svh] sm:flex-row sm:justify-center sm:gap-[0.25em] lg:text-[min(15.5vw,25svh)]">
          <span className="line-mask" style={{ transform: 'translateX(calc(var(--p) * -38vw))' }}><span>I turn</span></span>
          <span className="line-mask" style={{ transform: 'translateX(calc(var(--p) * 38vw))' }}><span style={{ animationDelay: '90ms' }}>ideas</span></span>
        </p>

        {/* The lime disc — grows to flood the stage */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center" aria-hidden="true">
          <div className="relative h-[58svh] sm:h-[70svh] lg:h-[74svh]">
            <span className="absolute left-1/2 top-[3%] aspect-square h-[60%]"
              style={{ transform: 'translateX(-50%) scale(calc(1 + var(--p) * var(--p) * 9))' }}>
              <span className="disc-in absolute inset-0 rounded-full bg-lime" style={{ animationDelay: '250ms' }} />
            </span>
            <span className="absolute left-1/2 top-[3%] aspect-square h-[60%] -translate-x-[12%] translate-y-[8%]" style={fadeOut(3)}>
              <span className="disc-in absolute inset-0 rounded-full border-2 border-violet" style={{ animationDelay: '420ms' }} />
            </span>
          </div>
        </div>

        {/* Portrait — breaks out of a thin frame: head and shoulders rise above its top edge */}
        <div className="absolute inset-x-0 bottom-0 z-[2] flex justify-center" data-depth="8">
          <div className="relative h-[58svh] sm:h-[70svh] lg:h-[74svh]"
            style={{ transform: 'translateY(calc(var(--p) * 4svh)) scale(calc(1 - var(--p) * 0.12))', transformOrigin: 'bottom center' }}>
            <span className="pointer-events-none absolute inset-x-[6%] bottom-0 top-[42%] -z-[1]" style={fadeOut(2.5)} aria-hidden="true">
              <span className="disc-in absolute inset-0 border-2 border-paper/40" style={{ animationDelay: '560ms' }} />
            </span>
            <img src={cutout} alt={profile.portraitAlt} decoding="async" fetchpriority="high" draggable={false}
              className="enter relative h-full w-auto max-w-none select-none object-contain object-bottom" style={{ animationDelay: '380ms' }} />
          </div>
        </div>

        {/* Real artwork orbit (desktop) — scatters outward on scroll */}
        <div className="hidden lg:block">
          {art.map((p, i) => {
            const o = ORBIT[i];
            return (
              <div key={p.id} className={`absolute z-[3] ${o.cls}`}
                style={{ transform: `translate(calc(var(--p) * ${o.dx * 32}vw), calc(var(--p) * ${o.dy * 40}vh)) rotate(calc(var(--p) * ${o.dx * 18}deg))` }}>
                <div data-depth={o.depth}>
                  <Link to={p.url} className="fly-in group block shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]" aria-label={`View ${p.title}`}
                    style={{ '--rot': o.rot, '--fx': o.fx, '--fy': o.fy, animationDelay: `${o.delay}ms` }}>
                    <img src={p.cover} alt="" loading="eager" decoding="async" className="block w-full transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        {/* Mobile: two posters tucked at the sides */}
        <div className="lg:hidden" aria-hidden="true">
          {art.slice(0, 2).map((p, i) => (
            <div key={p.id} className={`absolute z-[1] w-[27vw] ${i ? 'right-[2%] top-[44svh]' : 'left-[2%] top-[50svh]'}`}
              style={{ transform: `translate(calc(var(--p) * ${i ? 40 : -40}vw), calc(var(--p) * -10vh))` }}>
              <img src={p.cover} alt="" className="fly-in block w-full shadow-2xl"
                style={{ '--rot': i ? '7deg' : '-8deg', '--fx': i ? '40vw' : '-40vw', '--fy': '0', animationDelay: `${700 + i * 120}ms` }} />
            </div>
          ))}
        </div>

        {/* "into" + Line 3 — IN FRONT of the portrait; lifts away on scroll */}
        <div className="pointer-events-none absolute inset-0 z-[4]" style={{ transform: 'translateY(calc(var(--p) * -14svh))', ...fadeOut(1.6) }}>
          <p aria-hidden="true" className="serif fade-up absolute inset-x-0 top-[31svh] text-center text-[12vw] leading-none text-lime sm:inset-x-auto sm:left-[10%] sm:top-[36svh] lg:left-[22%] lg:top-[34svh] lg:text-[min(7vw,12svh)]" style={{ animationDelay: '520ms' }}>into</p>
          <p aria-hidden="true" className="display absolute inset-x-0 bottom-[3svh] flex flex-col items-center leading-[0.8] sm:flex-row sm:justify-center sm:gap-[2vw]">
            <span className="line-mask"><span className="hollow text-paper text-[23vw] sm:text-[17vw] lg:text-[min(13.5vw,24svh)]" style={{ animationDelay: '600ms' }}>Visual</span></span>
            <span className="line-mask"><span className="text-coral text-[23vw] sm:text-[17vw] lg:text-[min(13.5vw,24svh)]" style={{ animationDelay: '700ms' }}>impact.</span></span>
          </p>
        </div>

        {/* Hand-off line, revealed on the flooded lime stage */}
        <p aria-hidden="true" className="display pointer-events-none absolute inset-x-0 top-[12svh] z-[5] text-center text-[13vw] leading-[0.85] text-ink lg:text-[7vw]"
          style={{ opacity: 'calc((var(--p) - 0.72) * 4)', transform: 'translateY(calc((1 - var(--p)) * 6svh))' }}>
          Now, the <span className="serif">proof.</span>
        </p>

        {/* Vertical identity strip */}
        <div className="pointer-events-none absolute inset-0 z-[4] hidden sm:block" style={fadeOut(2)}>
          <p className="fade-up absolute right-3 top-1/2 origin-center -translate-y-1/2 translate-x-[calc(50%-12px)] rotate-90 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em] text-paper/70"
            style={{ animationDelay: '1000ms' }}>
            {profile.name} — {profile.tagline}
          </p>
        </div>

        {/* Explore */}
        <div className="fade-up absolute bottom-[30svh] right-[5%] z-[6] sm:bottom-[34svh] lg:right-[31%] lg:bottom-[38svh]" style={{ animationDelay: '1100ms' }}>
          <div style={{ ...fadeOut(2.2), transform: 'scale(calc(1 - var(--p) * 0.5))' }}>
            <Magnetic to="/work" strength={0.35}
              className="group h-24 w-24 flex-col items-center justify-center rounded-full bg-coral text-center text-ink shadow-[0_0_0_6px_rgba(9,9,9,0.4)] sm:h-32 sm:w-32">
              <Icon name="arrowUpRight" className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" />
              <span className="mt-1 text-[10px] font-extrabold uppercase leading-tight tracking-wider sm:text-[11px]">Explore<br />my work</span>
            </Magnetic>
          </div>
        </div>

        <div className="absolute bottom-6 left-5 z-[4] hidden lg:block" style={fadeOut(4)}>
        <a href="#selected" className="fade-up flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-paper/60 hover:text-lime"
          style={{ animationDelay: '1200ms' }}>
          <span className="bob grid h-10 w-6 place-items-start justify-center rounded-full border border-current pt-1.5"><span className="h-2 w-[2px] bg-current" /></span>
          Scroll
        </a>
        </div>
      </div>
    </section>
  );
}
