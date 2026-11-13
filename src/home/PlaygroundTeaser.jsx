import { Link } from 'react-router-dom';
import { Icon, Magnetic } from '../components/ui';
import { projects } from '../lib/content';

/** Chapter 03 — a kinetic wall of real covers that invites visitors into the playground. */
export default function PlaygroundTeaser() {
  const covers = projects.filter((p) => p.cover && p.status !== 'draft');
  if (!covers.length) return null;
  const rows = [0, 1, 2].map((r) => {
    const shifted = [...covers.slice(r * 3), ...covers.slice(0, r * 3)];
    return [...shifted, ...shifted];
  });
  return (
    <section id="playground" data-chapter="03" data-chapter-title="Playground" aria-labelledby="pg-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink py-24">
      {/* moving wall */}
      <div className="absolute inset-[-20%] flex -rotate-[8deg] flex-col justify-center gap-5 opacity-60" aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className={`${r % 2 ? 'marquee-rev' : 'marquee'} flex w-max gap-5`} style={{ animationDuration: `${60 + r * 12}s` }}>
            {row.map((p, i) => (
              <img key={`${p.id}-${i}`} src={p.cover} alt="" loading="lazy" decoding="async" className="h-[32svh] w-auto shrink-0 sm:h-[38svh]" />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,9,9,0.35)_0%,rgba(9,9,9,0.92)_70%)]" aria-hidden="true" />

      <div className="wrap relative text-center">
        <p className="eyebrow flex items-center justify-center gap-3 text-lime">
          <span className="font-display text-base tracking-normal">03</span><span className="h-px w-10 bg-current opacity-50" />The playground
        </p>
        <h2 id="pg-title" className="display mt-6 text-[17vw] leading-[0.82] lg:text-[11vw]">
          Get lost in<br /><span className="serif text-lime">the</span> <span className="hollow">work.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-paper/75">Every piece on one explorable wall — drag, zoom and open anything that catches your eye.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Magnetic to="/playground" strength={0.3}
            className="group h-36 w-36 flex-col items-center justify-center rounded-full bg-lime text-center text-ink">
            <Icon name="arrowUpRight" className="h-7 w-7 transition-transform duration-500 group-hover:rotate-45" />
            <span className="mt-1 text-xs font-extrabold uppercase tracking-wider">Enter the<br />playground</span>
          </Magnetic>
          <Link to="/work" className="text-xs font-bold uppercase tracking-[0.2em] text-paper/70 underline-offset-8 hover:text-lime hover:underline">or browse the portfolio</Link>
        </div>
      </div>
    </section>
  );
}
