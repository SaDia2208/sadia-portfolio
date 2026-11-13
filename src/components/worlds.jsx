/**
 * Four creative worlds — one visual language per brand.
 * Motifs are pure CSS/SVG (no fake artwork). Real project covers are placed into ArtSlots when they exist.
 *   Cricket Arabia → cinematic: letterbox, red slash, outlined block type
 *   Cubuzzle       → kinetic: cube-face tile grid, multicolour letters
 *   Active Arabia  → playful: bouncing colour dots, stickers, taped prints
 *   Tourmatez      → adventurous: sun, layered mountains, horizon
 * Any brand added later falls back to the Generic world using its own theme colours.
 */
import { Link } from 'react-router-dom';
import { ArtSlot, Icon, Magnetic } from './ui';
import { artFor, countFor } from '../lib/content';

/* ---------------- motifs ---------------- */
export function Letterbox() {
  return (
    <>
      <span className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[6%] bg-black" aria-hidden="true" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[6%] bg-black" aria-hidden="true" />
    </>
  );
}

export function RedSlash({ className = '', top = '40%', height = '22%' }) {
  return <span aria-hidden="true" style={{ top, height }} className={`pointer-events-none absolute left-[-10%] w-[130%] -rotate-[8deg] bg-[#E3222B] ${className}`} />;
}

const CUBE = ['#FFD21F', '#E8412F', '#22A45D', '#FFFFFF', '#1546C4', '#FF8A1F', '#22A45D', '#FFD21F', '#E8412F'];
export function CubeGrid({ className = '', size = 'w-56 sm:w-72' }) {
  return (
    <div aria-hidden="true" className={`grid grid-cols-3 gap-2 rounded-2xl bg-[#0b0b0b] p-2 ${size} ${className}`}>
      {CUBE.map((c, i) => (
        <span key={i} className="aspect-square rounded-lg" style={{ background: c, animation: `tile 6s ${i * 0.35}s var(--ease-out-expo) infinite` }} />
      ))}
    </div>
  );
}

const DOTS = [
  ['#FF5A36', 'left-[6%] top-[12%] h-24 w-24'], ['#FFC23A', 'right-[10%] top-[8%] h-36 w-36'],
  ['#3BB0E8', 'left-[38%] bottom-[8%] h-20 w-20'], ['#5BC27A', 'right-[28%] bottom-[18%] h-14 w-14'],
  ['#8054FF', 'left-[46%] top-[14%] h-10 w-10'],
];
export function Dots() {
  return DOTS.map(([c, pos], i) => (
    <span key={i} aria-hidden="true" className={`float pointer-events-none absolute rounded-full ${pos}`} style={{ background: c, animationDelay: `${i * 0.8}s` }} />
  ));
}

export function Landscape({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 420" preserveAspectRatio="none" className={`pointer-events-none absolute inset-x-0 bottom-0 h-[45%] w-full ${className}`}>
      <path d="M0 260 L180 150 L320 230 L520 90 L700 220 L860 130 L1040 240 L1220 120 L1440 220 V420 H0Z" fill="#0a4f2b" />
      <path d="M0 320 L220 230 L420 300 L640 200 L860 300 L1080 220 L1280 290 L1440 250 V420 H0Z" fill="#083d21" />
      <path d="M0 380 L300 330 L620 370 L940 320 L1240 360 L1440 340 V420 H0Z" fill="#052b17" />
    </svg>
  );
}

/* --------------- homepage world panels --------------- */
function WorldMeta({ brand, index, dark = true, accent }) {
  const n = countFor(brand.slug);
  return (
    <div className="relative z-[4] flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="display text-6xl sm:text-7xl" style={{ color: accent }}>0{index + 1}</span>
        <span className={`eyebrow ${dark ? 'text-white/70' : 'text-black/60'}`}>{brand.industry}</span>
      </div>
      <p className={`max-w-sm text-base leading-relaxed ${dark ? 'text-white/80' : 'text-black/75'}`}>{brand.contribution}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Magnetic to={`/work/${brand.slug}`} className="items-center gap-3 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-wider"
          style={{ background: accent, color: dark ? '#0c0c0c' : '#fff' }}>
          Enter this world <Icon name="arrowUpRight" className="h-4 w-4" />
        </Magnetic>
        <span className={`text-xs font-semibold uppercase tracking-widest ${dark ? 'text-white/50' : 'text-black/50'}`}>
          {n ? `${n} project${n > 1 ? 's' : ''}` : 'Collection in progress'}
        </span>
      </div>
    </div>
  );
}

function CricketWorld({ brand, index }) {
  const art = artFor(brand.slug, 2);
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0b0b0b] py-28 text-white">
      <Letterbox />
      <RedSlash top="27%" height="12%" />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
        <h3 className="display relative z-[2] text-[26vw] lg:col-span-7 lg:text-[13vw]">
          <span className="hollow block">Cricket</span>
          <span className="block text-white">Arabia</span>
        </h3>
        <div className="relative z-[4] flex gap-4 lg:col-span-5">
          <ArtSlot project={art[0]} tone="#141414" ink="#E3222B" label="Cricket Arabia" className="w-1/2 -rotate-3 shadow-[0_40px_80px_-20px_rgba(227,34,43,0.5)]" />
          <ArtSlot project={art[1]} tone="#1e0b0c" ink="#fff" label="Cricket Arabia" className="mt-16 w-1/2 rotate-2" />
        </div>
        <div className="lg:col-span-6"><WorldMeta brand={brand} index={index} accent="#E3222B" /></div>
      </div>
    </div>
  );
}

function CubuzzleWorld({ brand, index }) {
  const art = artFor(brand.slug, 2);
  const letters = brand.name.toUpperCase().split('');
  const colors = ['#FFD21F', '#ffffff', '#E8412F', '#22A45D', '#FFD21F', '#ffffff', '#FF8A1F', '#E8412F'];
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#1546C4] py-28 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="display flex flex-wrap text-[22vw] lg:text-[11vw]" aria-label={brand.name}>
            {letters.map((l, i) => (
              <span key={i} aria-hidden="true" className="inline-block transition-transform duration-500 hover:-translate-y-4 hover:rotate-6" style={{ color: colors[i % colors.length] }}>{l}</span>
            ))}
          </h3>
          <div className="mt-10"><WorldMeta brand={brand} index={index} accent="#FFD21F" /></div>
        </div>
        <div className="relative lg:col-span-5">
          <CubeGrid className="absolute -left-10 -top-14 z-0 rotate-[-10deg] opacity-90" size="w-40 sm:w-52" />
          <div className="relative z-[1] grid grid-cols-2 gap-4">
            <ArtSlot project={art[0]} tone="#0f3496" ink="#FFD21F" label="Cubuzzle" className="rounded-2xl" />
            <ArtSlot project={art[1]} tone="#FFD21F" ink="#1546C4" label="Cubuzzle" className="mt-14 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveWorld({ brand, index }) {
  const art = artFor(brand.slug, 3);
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#FFE7D1] py-28 text-[#1E1A17]">
      <Dots />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
        <div className="relative z-[2] lg:col-span-6">
          <h3 className="display text-[24vw] leading-[0.8] lg:text-[12vw]">
            <span className="block">Active</span>
            <span className="serif -mt-2 block text-[0.62em] text-[#FF5A36]">Arabia</span>
          </h3>
          <span className="absolute -right-2 top-0 rotate-12 rounded-full bg-[#3BB0E8] px-4 py-2 text-xs font-extrabold uppercase text-white">Play-first</span>
          <div className="mt-10"><WorldMeta brand={brand} index={index} dark={false} accent="#FF5A36" /></div>
        </div>
        <div className="relative z-[2] flex items-start justify-center gap-3 lg:col-span-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`relative w-1/3 bg-white p-2 pb-8 shadow-xl ${['-rotate-6 mt-10', 'rotate-3', '-rotate-2 mt-20'][i]}`}>
              <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#FFC23A]/80" aria-hidden="true" />
              <ArtSlot project={art[i]} tone="#FFF4EA" ink="#FF5A36" label="Active Arabia" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TourmatezWorld({ brand, index }) {
  const art = artFor(brand.slug, 3);
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0E6B3A] py-28 text-white">
      <span className="pointer-events-none absolute right-[8%] top-[10%] h-[34vw] max-h-[420px] w-[34vw] max-w-[420px] rounded-full bg-[#FFD43B]" aria-hidden="true" />
      <Landscape />
      <div className="wrap relative grid items-end gap-12 lg:grid-cols-12">
        <div className="relative z-[2] lg:col-span-6">
          <p className="serif text-4xl text-[#FFD43B] sm:text-5xl">Figma posters for the road</p>
          <h3 className="display mt-2 text-[22vw] lg:text-[11vw]">Tourmatez</h3>
          <div className="mt-8"><WorldMeta brand={brand} index={index} accent="#FFD43B" /></div>
        </div>
        <div className="relative z-[2] flex items-end gap-3 lg:col-span-6">
          {[0, 1, 2].map((i) => (
            <ArtSlot key={i} project={art[i]} tone="#0a4f2b" ink="#FFD43B" label="Tourmatez poster"
              className={`w-1/3 rounded-xl ring-4 ring-white/90 ${['mb-0', 'mb-16', 'mb-6'][i]}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericWorld({ brand, index }) {
  const { bg, fg, accent } = brand.theme;
  const art = artFor(brand.slug, 2);
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden py-28" style={{ background: bg, color: fg }}>
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="display text-[18vw] lg:text-[10vw]">{brand.name}</h3>
          <div className="mt-8"><WorldMeta brand={brand} index={index} accent={accent} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {art.length ? art.map((p) => <ArtSlot key={p.id} project={p} />) : <ArtSlot tone={accent} ink={bg} label={brand.name} className="col-span-2" />}
        </div>
      </div>
    </div>
  );
}

const WORLD = { 'cricket-arabia': CricketWorld, cubuzzle: CubuzzleWorld, 'active-arabia': ActiveWorld, tourmatez: TourmatezWorld };
export function BrandWorld({ brand, index }) {
  const W = WORLD[brand.slug] || GenericWorld;
  return <W brand={brand} index={index} />;
}

/* --------------- brand page heroes (different structure from the home panels) --------------- */
function HeroMeta({ brand, dark = true }) {
  return (
    <dl className={`grid gap-5 text-sm sm:grid-cols-3 ${dark ? 'text-white/85' : 'text-black/80'}`}>
      <div><dt className="eyebrow opacity-60">Industry</dt><dd className="mt-2">{brand.industry}</dd></div>
      <div><dt className="eyebrow opacity-60">My contribution</dt><dd className="mt-2 leading-relaxed">{brand.contribution}</dd></div>
      <div><dt className="eyebrow opacity-60">Visual identity</dt><dd className="mt-2 leading-relaxed">{brand.identity}</dd>
        {brand.website && <a href={brand.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">{brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}<Icon name="arrowUpRight" className="h-4 w-4" /></a>}
      </div>
    </dl>
  );
}

function Crumb({ brand, dark = true }) {
  return (
    <nav aria-label="Breadcrumb" className={`fade-up eyebrow ${dark ? 'text-white/60' : 'text-black/60'}`}>
      <Link to="/work" className="hover:underline">Portfolio</Link> / {brand.name}
    </nav>
  );
}

/** A real poster flying into a hero composition. */
function HeroPoster({ p, className = '', rot = '0deg', fx = '0', fy = '40vh', delay = 300, frame = '' }) {
  if (!p) return null;
  return (
    <Link to={p.url} aria-label={`View ${p.title}`} className={`fly-in group block shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] ${frame} ${className}`}
      style={{ '--rot': rot, '--fx': fx, '--fy': fy, animationDelay: `${delay}ms` }}>
      <img src={p.cover} alt={p.title} decoding="async" className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]" />
    </Link>
  );
}

export function BrandHero({ brand, index }) {
  // The top featured piece gets its own "Featured artwork" stage below, so the hero uses the next ones.
  const all = artFor(brand.slug, 4);
  const art = all.length > 1 ? all.slice(1) : all;
  const num = String(index + 1).padStart(2, '0');

  if (brand.slug === 'cricket-arabia') {
    return (
      <section className="relative overflow-hidden bg-[#0b0b0b] pb-24 pt-32 text-white">
        <Letterbox />
        <div className="wrap relative">
          <Crumb brand={brand} />
          <div className="relative mt-10">
            <RedSlash top="56%" height="30%" />
            <p className="display hollow absolute -top-8 right-0 text-[30vw] leading-none text-white/15 lg:right-auto lg:left-[44%] lg:text-[18vw]" aria-hidden="true">{num}</p>
            <div className="relative z-[2] mt-8 flex gap-3 lg:absolute lg:right-0 lg:top-[-1rem] lg:mt-0 lg:w-[36%] lg:gap-4">
              <HeroPoster p={art[0]} className="w-1/2" rot="-4deg" fx="30vw" delay={350} />
              <HeroPoster p={art[1]} className="mt-10 w-1/2" rot="3deg" fx="40vw" delay={480} />
            </div>
            <h1 className="display relative text-[19vw] lg:text-[12.5vw]">
              <span className="line-mask"><span className="text-[#E3222B]">Cricket</span></span>
              <span className="line-mask"><span style={{ animationDelay: '120ms' }}>Arabia.</span></span>
            </h1>
          </div>
          <div className="relative mt-14 grid gap-10 lg:grid-cols-12">
            <p className="serif text-3xl leading-tight lg:col-span-4 lg:text-4xl">{brand.summary}</p>
            <div className="lg:col-span-7 lg:col-start-6"><HeroMeta brand={brand} /></div>
          </div>
        </div>
      </section>
    );
  }

  if (brand.slug === 'cubuzzle') {
    return (
      <section className="relative overflow-hidden bg-[#1546C4] pb-24 pt-32 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden="true"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Crumb brand={brand} />
            <p className="display mt-10 text-3xl text-[#FFD21F]">World {num}</p>
            <h1 className="display mt-2 text-[21vw] text-[#FFD21F] lg:text-[11vw]"><span className="line-mask"><span>{brand.name}</span></span></h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">{brand.summary}</p>
          </div>
          <div className="relative flex justify-center lg:col-span-5">
            <CubeGrid size="w-56 sm:w-72" className="absolute -left-2 -top-6 rotate-[-8deg] sm:left-0" />
            <HeroPoster p={art[0]} className="relative z-[1] ml-16 mt-16 w-[62%] overflow-hidden rounded-2xl" rot="5deg" fx="30vw" delay={400} />
          </div>
          <div className="lg:col-span-12"><HeroMeta brand={brand} /></div>
        </div>
      </section>
    );
  }

  if (brand.slug === 'active-arabia') {
    return (
      <section className="relative overflow-hidden bg-[#FFE7D1] pb-24 pt-32 text-[#1E1A17]">
        <Dots />
        <div className="wrap relative">
          <Crumb brand={brand} dark={false} />
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
            <h1 className="lg:col-span-8">
              <span className="display block text-[22vw] lg:text-[12vw]">Active</span>
              <span className="serif -mt-4 block text-[16vw] leading-none text-[#FF5A36] lg:text-[8vw]">Arabia</span>
            </h1>
            <div className="relative lg:col-span-4">
              <span className="absolute -left-4 -top-4 z-[2] inline-block -rotate-6 rounded-full bg-[#3BB0E8] px-5 py-2 text-sm font-extrabold uppercase text-white">World {num}</span>
              {art[0] && <HeroPoster p={art[0]} className="mx-auto w-[70%] lg:w-full" frame="bg-white p-3 pb-10" rot="4deg" fx="30vw" delay={400} />}
            </div>
            <p className="text-lg leading-relaxed lg:col-span-6">{brand.summary}</p>
          </div>
          <div className="mt-14"><HeroMeta brand={brand} dark={false} /></div>
        </div>
      </section>
    );
  }

  if (brand.slug === 'tourmatez') {
    return (
      <section className="relative overflow-hidden bg-[#0E6B3A] pb-40 pt-32 text-white">
        {/* Sun rises behind the info card; the title stays on clear green. */}
        <span className="pointer-events-none absolute right-[-8%] top-[46%] h-[70vw] max-h-[620px] w-[70vw] max-w-[620px] rounded-full bg-[#FFD43B] sm:right-[6%]" aria-hidden="true" />
        <div className="absolute right-[4%] top-[17%] z-[3] hidden w-[27vw] max-w-[420px] lg:flex lg:gap-4">
          <HeroPoster p={art[0]} className="w-1/2 overflow-hidden rounded-xl ring-4 ring-white" rot="-6deg" fx="0" fy="50vh" delay={450} />
          <HeroPoster p={art[1]} className="-mt-16 w-1/2 overflow-hidden rounded-xl ring-4 ring-white" rot="5deg" fx="0" fy="60vh" delay={580} />
        </div>
        <Landscape className="z-[1] h-[34%]" />
        <div className="wrap relative z-[2]">
          <Crumb brand={brand} />
          <p className="serif mt-12 text-4xl text-[#FFD43B] sm:text-6xl">Figma posters for the road</p>
          <h1 className="display mt-1 text-[22vw] text-white lg:text-[15vw]"><span className="line-mask"><span>{brand.name}</span></span></h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">{brand.summary}</p>
          <div className="relative z-[2] mt-14 max-w-5xl rounded-3xl bg-[#052b17]/85 p-6 backdrop-blur sm:p-8"><HeroMeta brand={brand} /></div>
        </div>
      </section>
    );
  }

  const { bg, fg, accent } = brand.theme;
  return (
    <section className="relative overflow-hidden pb-24 pt-32" style={{ background: bg, color: fg }}>
      <div className="wrap relative">
        <Crumb brand={brand} />
        <h1 className="display mt-10 text-[18vw] lg:text-[11vw]" style={{ color: accent }}>{brand.name}</h1>
        <p className="mt-6 max-w-xl text-lg opacity-85">{brand.summary}</p>
        <div className="mt-12"><HeroMeta brand={brand} /></div>
        {art.length > 0 && <div className="mt-12 grid grid-cols-3 gap-4">{art.map((p) => <ArtSlot key={p.id} project={p} />)}</div>}
      </div>
    </section>
  );
}
