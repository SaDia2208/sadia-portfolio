import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Magnetic } from '../components/ui';
import { CubeGrid, Landscape, Letterbox, RedSlash } from '../components/worlds';
import { artFor, brands, categories, countFor } from '../lib/content';
import { useParallax, usePointerLayers } from '../lib/hooks';

/**
 * Portfolio index as four editorial chapters. While scrolling, the whole environment
 * (background + text colour) cross-fades into the active brand, and a sticky index bar
 * tracks where you are. Each brand has its own composition of real artwork.
 */
export default function BrandChapters() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const b = brands[active] || brands[0];

  return (
    <section aria-label="Brand chapters" className="relative transition-colors duration-[900ms] ease-out" style={{ background: b.theme.bg, color: b.theme.fg }}>
      {brands.map((brand, i) => (
        <article key={brand.slug} id={brand.slug} data-i={i} ref={(el) => (refs.current[i] = el)} aria-labelledby={`ch-${brand.slug}`}
          className="relative flex min-h-[100svh] items-center overflow-hidden py-28">
          <Chapter brand={brand} index={i} active={i === active} />
        </article>
      ))}

      {/* sticky chapter index */}
      <div className="pointer-events-none sticky bottom-5 z-20 -mt-16 flex h-16 items-end justify-center px-4">
        <nav aria-label="Brand chapters" className="pointer-events-auto no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink/85 p-1 text-paper shadow-2xl backdrop-blur">
          {brands.map((brand, i) => (
            <a key={brand.slug} href={`#${brand.slug}`} aria-current={i === active ? 'true' : undefined}
              className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-500"
              style={i === active ? { background: brand.theme.accent, color: brand.slug === 'active-arabia' || brand.slug === 'cricket-arabia' ? '#fff' : '#090909' } : undefined}>
              <span className="font-display text-xs">0{i + 1}</span>{brand.name}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

function Meta({ brand, index, align = 'left', dark = true }) {
  const cats = categories.map((c) => [c, countFor(brand.slug, c.slug)]).filter(([, n]) => n);
  const total = countFor(brand.slug);
  const sub = dark ? 'opacity-70' : 'opacity-75';
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className={`eyebrow ${sub}`}>{brand.industry}</p>
      <h2 id={`ch-${brand.slug}`} className="display mt-3 text-[16vw] leading-[0.85] lg:text-[7.5vw]">{brand.name}</h2>
      <p className={`mt-5 max-w-md text-base leading-relaxed ${sub} ${align === 'center' ? 'mx-auto' : ''}`}>{brand.contribution}</p>
      <ul className={`mt-6 flex flex-wrap gap-2 ${align === 'center' ? 'justify-center' : ''}`} aria-label="Collections">
        {cats.length ? cats.map(([c, n]) => (
          <li key={c.slug}><Link to={`/work/${brand.slug}/${c.slug}`} className="chip border-current/40 hover:border-current">{c.label} <span className="opacity-60">{n}</span></Link></li>
        )) : <li className={`text-sm ${sub}`}>Collection in progress</li>}
      </ul>
      <div className={`mt-8 flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
        <Magnetic to={`/work/${brand.slug}`} className="items-center gap-3 rounded-full px-7 py-4 text-sm font-bold uppercase tracking-wider"
          style={{ background: brand.theme.accent, color: brand.slug === 'active-arabia' || brand.slug === 'cricket-arabia' ? '#fff' : '#090909' }}>
          Explore {brand.name} <Icon name="arrowUpRight" className="h-4 w-4" />
        </Magnetic>
        <span className={`text-xs font-bold uppercase tracking-widest ${sub}`}>{total} piece{total === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}

function Poster({ p, className = '', style, depth }) {
  return (
    <Link to={p.url} data-depth={depth} className={`group block shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] transition-[transform,rotate] duration-700 ease-[var(--ease-out-expo)] hover:z-10 hover:!rotate-0 hover:-translate-y-3 ${className}`} style={style} aria-label={`View ${p.title}`}>
      <img src={p.cover} alt={p.title} loading="lazy" decoding="async" className="block h-auto w-full" />
    </Link>
  );
}

function Chapter({ brand, index, active }) {
  const layers = usePointerLayers();
  const para = useParallax();
  const art = artFor(brand.slug, 4);
  const num = String(index + 1).padStart(2, '0');
  const reveal = `transition-all duration-1000 ease-[var(--ease-out-expo)] ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;
  const setRefs = (el) => { layers.current = el; para.current = el; };

  if (brand.slug === 'cricket-arabia') {
    return (
      <div ref={setRefs} className="relative w-full">
        <Letterbox />
        <div className="hidden lg:block"><RedSlash top="30%" height="22%" /></div>
        <div className="wrap relative grid items-center gap-12 py-16 lg:grid-cols-12">
          <div className={`lg:col-span-5 ${reveal}`}>
            <p className="display hollow mb-3 text-8xl text-[#E3222B] lg:text-[9rem]">{num}</p>
            <Meta brand={brand} index={index} />
          </div>
          {/* cinematic film strip */}
          <div className="relative grid grid-cols-2 items-end gap-3 lg:col-span-7 lg:flex">
            {art.map((p, i) => (
              <div key={p.id} className="lg:w-1/4" data-parallax={[0.05, 0.12, 0.08, 0.15][i]}>
                <Poster p={p} depth={10 + i * 6} style={{ rotate: `${[-4, 2, -2, 4][i]}deg` }} className={`${reveal}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brand.slug === 'cubuzzle') {
    return (
      <div ref={setRefs} className="relative w-full">
        <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden="true"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
          <div className="relative order-2 lg:order-1 lg:col-span-7">
            <CubeGrid size="w-40 sm:w-56" className="absolute -left-6 -top-10 z-0 -rotate-12" />
            <div className="relative grid -rotate-3 grid-cols-3 items-start gap-3 sm:gap-5">
              {art.slice(0, 3).map((p, i) => (
                <div key={p.id} data-parallax={[0.04, -0.06, 0.1][i]} className={['mt-16', '', 'mt-28'][i]}>
                  <Poster p={p} depth={12 + i * 8} className="rounded-xl overflow-hidden" />
                </div>
              ))}
            </div>
          </div>
          <div className={`order-1 lg:order-2 lg:col-span-5 ${reveal}`}>
            <p className="display mb-3 text-8xl text-[#FFD21F] lg:text-[9rem]">{num}</p>
            <Meta brand={brand} index={index} />
          </div>
        </div>
      </div>
    );
  }

  if (brand.slug === 'active-arabia') {
    const [lead, ...rest] = art;
    return (
      <div ref={setRefs} className="relative w-full">
        {[['#FF5A36', 'left-[4%] top-[8%] h-24 w-24'], ['#3BB0E8', 'right-[6%] bottom-[10%] h-32 w-32'], ['#FFC23A', 'right-[40%] top-[6%] h-14 w-14']].map(([c, pos], i) => (
          <span key={i} aria-hidden="true" className={`float pointer-events-none absolute rounded-full ${pos}`} style={{ background: c, animationDelay: `${i}s` }} />
        ))}
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
          <div className={`lg:col-span-5 ${reveal}`}>
            <p className="display hollow mb-3 text-8xl text-[#FF5A36] lg:text-[9rem]">{num}</p>
            <Meta brand={brand} index={index} dark={false} />
          </div>
          <div className="relative min-h-[60vh] lg:col-span-7">
            {lead && <div className="relative z-[1] w-[62%] bg-white p-3 pb-10 shadow-2xl" data-parallax="0.04" style={{ rotate: '-3deg' }}><Poster p={lead} depth={10} className="shadow-none" /></div>}
            {rest.slice(0, 2).map((p, i) => (
              <div key={p.id} className={`absolute z-[2] w-[38%] bg-white p-2 pb-7 shadow-2xl ${i ? 'bottom-0 right-[4%]' : 'right-0 top-[6%]'}`} data-parallax={i ? 0.14 : 0.09} style={{ rotate: `${i ? -5 : 6}deg` }}>
                <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 bg-[#FFC23A]/80" aria-hidden="true" />
                <Poster p={p} depth={20 + i * 10} className="shadow-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brand.slug === 'tourmatez') {
    return (
      <div ref={setRefs} className="relative w-full">
        <span className="pointer-events-none absolute left-1/2 top-[12%] h-[46vw] max-h-[520px] w-[46vw] max-w-[520px] -translate-x-1/2 rounded-full bg-[#FFD43B]" aria-hidden="true" />
        <Landscape className="h-[40%]" />
        <div className="wrap relative">
          {/* fanned deck */}
          <div className="relative mx-auto flex h-[44vh] max-w-3xl items-end justify-center sm:h-[52vh]">
            {art.slice(0, 3).map((p, i) => (
              <div key={p.id} className="absolute bottom-0 w-[36%] sm:w-[30%]" data-parallax={[0.08, 0.02, 0.12][i]}
                style={{ left: `${[8, 35, 62][i]}%`, zIndex: i === 1 ? 2 : 1 }}>
                <Poster p={p} depth={12 + i * 6} className="overflow-hidden rounded-xl ring-4 ring-white" style={{ rotate: `${[-10, 0, 10][i]}deg`, transformOrigin: 'bottom center' }} />
              </div>
            ))}
          </div>
          <div className={`relative z-[3] mx-auto mt-12 max-w-3xl rounded-3xl bg-[#052b17]/85 p-8 backdrop-blur ${reveal}`}>
            <p className="display text-center text-7xl text-[#FFD43B]">{num}</p>
            <Meta brand={brand} index={index} align="center" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setRefs} className="wrap relative grid items-center gap-12 lg:grid-cols-12">
      <div className={`lg:col-span-6 ${reveal}`}><p className="display text-8xl">{num}</p><Meta brand={brand} index={index} /></div>
      <div className="grid grid-cols-2 gap-4 lg:col-span-6">{art.map((p) => <Poster key={p.id} p={p} />)}</div>
    </div>
  );
}
