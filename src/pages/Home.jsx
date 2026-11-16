import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/ui';
import { brands, categories, countFor, experience, profile, projectsFor, skills } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';

/*
  HOME — two panels, following the reference site's organisation.
  Left (sticky): identity + a dial whose needle follows the card in focus.
  Right: a stack of collection cards (brand × category). Scrolling moves the stack; the card in focus is
  large and labelled (category · brand) on either side. Clicking a card opens that collection's full work.
  The page is one screen: the nav swaps the right panel between Work, About and Contact.
  Cards are generated from content: every brand/category with published work becomes a card.
*/

/** One card per brand. Clicking a card opens the brand page with its sections. */
function useCollections() {
  return useMemo(() => brands.map((b) => {
    const list = projectsFor(b.slug).filter((p) => p.cover && p.status !== 'draft');
    const ordered = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)];
    const sections = categories.filter((c) => countFor(b.slug, c.slug)).map((c) => c.label);
    return { key: b.slug, brand: b, cat: { label: b.industry }, sections, covers: ordered.slice(0, 3).map((p) => p.cover), count: list.length, url: `/work/${b.slug}` };
  }).filter((c) => c.covers.length), []);
}

/**
 * Card stack control for a one-screen home: the mouse wheel, a drag or the arrow keys move through the cards.
 * Returns a continuous index p (0 … n-1) that eases toward the target and snaps to the nearest card.
 */
function useStackControl(n, enabled) {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  const target = useRef(0);
  const cur = useRef(0);
  const raf = useRef(0);
  const clamp = (v) => Math.min(Math.max(n - 1, 0), Math.max(0, v));
  const fallback = useRef(0);
  const run = () => {
    cancelAnimationFrame(raf.current);
    // if the browser pauses animation frames (hidden tab), still land on the target
    clearTimeout(fallback.current);
    fallback.current = setTimeout(() => { cancelAnimationFrame(raf.current); raf.current = 0; cur.current = target.current; setP(target.current); }, 700);
    const step = () => {
      const d = target.current - cur.current;
      cur.current = Math.abs(d) < 0.002 ? target.current : cur.current + d * 0.16;
      setP(cur.current);
      if (cur.current === target.current) { raf.current = 0; clearTimeout(fallback.current); } else raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const goTo = (i) => { target.current = clamp(i); run(); };

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || n < 2) return undefined;
    let idle = 0;
    const snap = () => { clearTimeout(idle); idle = setTimeout(() => goTo(Math.round(target.current)), 140); };
    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current = clamp(target.current + delta / 520);
      run(); snap();
    };
    // drag (mouse or touch); a drag never counts as a click on the card
    let startY = null; let startT = 0; let dragged = false;
    const onDown = (e) => { startY = e.clientY; startT = target.current; dragged = false; };
    const onMove = (e) => {
      if (startY == null) return;
      const dy = startY - e.clientY;
      if (Math.abs(dy) > 6) dragged = true;
      if (dragged) { target.current = clamp(startT + dy / 260); run(); }
    };
    const onUp = () => { if (startY == null) return; startY = null; if (dragged) goTo(Math.round(target.current)); };
    const onClick = (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } };
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      const i = Math.round(target.current);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(i + 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(i - 1);
      else return;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(idle);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [n, enabled]);
  useEffect(() => () => { cancelAnimationFrame(raf.current); clearTimeout(fallback.current); }, []);
  return [ref, p, goTo];
}

const VIEWS = [
  { key: 'work', label: 'Work' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
];

export default function Home() {
  useDocumentTitle(null);
  const cols = useCollections();
  const { hash } = useLocation();
  const view = VIEWS.find((v) => `#${v.key}` === hash)?.key || 'work';
  const [stackRef, p, goTo] = useStackControl(cols.length, view === 'work');
  const active = Math.round(p);

  return (
    <div className={`mx-auto max-w-[1600px] p-3 lg:grid lg:h-svh lg:grid-rows-1 lg:gap-3 lg:overflow-hidden ${view === 'work' ? 'lg:grid-cols-[minmax(360px,0.82fr)_1.18fr]' : 'lg:grid-cols-1'}`}>
      {/* ---------------- LEFT: identity panel ---------------- */}
      <aside className={`panel relative mb-3 overflow-hidden lg:mb-0 lg:h-full ${view === 'work' ? '' : 'lg:hidden'}`}>
        <div className="flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <Link to="/" className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-text">{profile.name}</Link>
            <p className="label sm:text-right">{profile.roles[0]}<br />{profile.roles[profile.roles.length - 1]}</p>
          </div>

          {view === 'work' && <LogoReel cols={cols} p={p} active={active} onPick={goTo} />}

          <span className="hidden lg:block" aria-hidden="true" />
        </div>
      </aside>

      {/* ---------------- RIGHT: one view at a time — Work, About or Contact ---------------- */}
      <div className="panel flex flex-col overflow-clip lg:h-full">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5 sm:px-8">
          {view !== 'work' && <Link to="/" className="mr-8 hidden font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-text lg:block">{profile.name}</Link>}
          <nav aria-label="Home sections" className="mr-auto flex gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
            {VIEWS.map((v) => (
              <Link key={v.key} to={v.key === 'work' ? '/' : `/#${v.key}`} replace aria-current={view === v.key ? 'page' : undefined}
                className={`transition-colors ${view === v.key ? 'text-text' : 'text-muted hover:text-text'}`}>{v.label}</Link>
            ))}
          </nav>
          <span className="label hidden sm:block">
            {view === 'work' ? `${String(cols.length).padStart(2, '0')} brands` : profile.email ? <a href={`mailto:${profile.email}`} className="hover:text-text">{profile.email} ↗</a> : null}
          </span>
        </div>

        {view === 'work' && (
          <>
            {/* desktop: card stack moved by wheel / drag / arrow keys */}
            <section id="work" ref={stackRef} aria-label="Brands" className="relative hidden min-h-0 flex-1 touch-none select-none overflow-hidden lg:block">
              <Stack cols={cols} p={p} active={active} onPick={goTo} />
            </section>

            {/* mobile / tablet: swipeable cards */}
            <section id="work-m" aria-label="Brands" className="lg:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-6 sm:px-6">
                {cols.map((c, i) => (
                  <Link key={c.key} to={c.url} className="group w-[78%] shrink-0 snap-center sm:w-[46%]">
                    <CardArt c={c} />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {c.brand.logo && <img src={c.brand.logo} alt="" className="h-10 w-auto shrink-0 rounded-lg ring-1 ring-white/10" />}
                      <div className="min-w-0 flex-1">
                        <p className="label truncate">{c.cat.label}</p>
                        <p className="mt-1 truncate text-lg font-medium text-text">{c.brand.name}</p>
                      </div>
                      <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {view !== 'work' && (
          <div key={view} className="page-in min-h-0 flex-1 lg:overflow-y-auto [&_section]:border-t-0">
            {view === 'about' ? <About /> : <Contact />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Logo reel (left panel) ----------------
   The four brand logos repeat in a vertical reel. It moves with the card stack, so the logo of the
   brand in focus always sits on the centre line, bright; the others fade above and below. */
function BrandMark({ brand, on }) {
  return brand.logo ? (
    <img src={brand.logo} alt={brand.name} className={`h-[100px] w-auto rounded-2xl object-contain ring-1 ring-white/10 transition-all duration-500 ${on ? 'scale-100 opacity-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]' : 'scale-90 opacity-50 grayscale'}`} />
  ) : (
    <span className={`text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium tracking-[-0.03em] transition-colors duration-500 ${on ? 'text-text' : 'text-muted'}`}>{brand.name}</span>
  );
}

function LogoReel({ cols, p, active, onPick }) {
  const n = Math.max(cols.length, 1);
  const ROW = 124;
  const REPEAT = 5; // the list repeats so the reel never runs out
  const mid = Math.floor(REPEAT / 2) * n;
  const cur = cols[active];
  return (
    <div className="my-8 hidden lg:block">
      <div className="relative h-[480px] overflow-hidden [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)]">
        <div className="absolute inset-x-0 top-1/2" style={{ transform: `translateY(${-(mid + p) * ROW - ROW / 2}px)`, transition: 'transform 120ms linear' }}>
          {Array.from({ length: REPEAT * n }, (_, k) => {
            const c = cols[k % n];
            const d = Math.abs(k - (mid + p));
            const on = d < 0.5;
            return (
              <button key={k} type="button" onClick={() => onPick(k % n)} aria-label={`Show ${c.brand.name}`} tabIndex={on ? -1 : 0}
                className="flex w-full items-center justify-center" style={{ height: ROW, opacity: Math.max(0.15, 1 - d * 0.32) }}>
                <BrandMark brand={c.brand} on={on} />
              </button>
            );
          })}
        </div>
      </div>
      <p className="label mt-6 text-center">
        {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}{cur ? ` · ${cur.brand.name} · ${cur.count} ${cur.count === 1 ? 'work' : 'works'}` : ''}
      </p>
    </div>
  );
}

/* ---------------- Card stack (right panel, desktop) ---------------- */
function CardArt({ c, large = false, showStack = true }) {
  const [front, ...back] = c.covers;
  return (
    <div className={`relative ${large ? 'h-full' : 'aspect-[4/5]'} overflow-visible`}>
      {back.slice(0, 2).map((src, i) => (
        <img key={src} src={src} alt="" aria-hidden="true" loading="lazy"
          className="absolute inset-0 h-full w-full rounded-xl object-cover transition-opacity duration-500"
          style={{ opacity: showStack ? 0.5 : 0, transform: `rotate(${i ? 5 : -5}deg) translate(${i ? 6 : -6}%, 2%) scale(0.94)` }} />
      ))}
      <img src={front} alt="" loading="lazy" className="relative block h-full w-full rounded-xl object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]" />
    </div>
  );
}

function Stack({ cols, p, active, onPick }) {
  if (!cols.length) return <p className="label grid h-full place-items-center">Collections coming soon</p>;
  const ROW = 44;
  return (
    <div className="relative h-full">
      {cols.map((c, i) => {
        const d = i - p;
        const ad = Math.abs(d);
        if (ad > 1.9) return null;
        const isActive = i === active;
        const scale = 1 - Math.min(ad, 1) * 0.58;
        const style = {
          transform: `translate(-50%, -50%) translateY(${d * 82}%) scale(${scale})`,
          opacity: ad <= 1 ? 1 - ad * 0.35 : Math.max(0, 0.65 - (ad - 1) * 0.8),
          zIndex: 10 - Math.round(ad * 2),
        };
        const inner = <div className="h-full w-full"><CardArt c={c} large showStack={ad < 0.35} /></div>;
        return isActive ? (
          <Link key={c.key} to={c.url} aria-label={`Open ${c.brand.name} (${c.count} works)`}
            className="group absolute left-1/2 top-1/2 aspect-[4/5] h-[66%]" style={style}>
            {inner}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              Open {c.brand.name} ↗
            </span>
          </Link>
        ) : (
          <button key={c.key} type="button" onClick={() => onPick(i)} aria-label={`Show ${c.brand.name} — ${c.cat.label}`}
            className="absolute left-1/2 top-1/2 aspect-[4/5] h-[66%]" style={style}>
            {inner}
          </button>
        );
      })}

      {/* drum label: brand on the right (the logo reel in the left panel already marks the brand) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[26%] overflow-hidden" aria-hidden="true">
        <div className="absolute left-6 top-1/2" style={{ transform: `translateY(${-p * ROW - ROW / 2}px)` }}>
          {cols.map((c, i) => <DrumRow key={c.key} d={i - p} text={c.brand.name} align="left" ROW={ROW} sub={`${c.count} ${c.count === 1 ? 'work' : 'works'} · ${c.sections.length} ${c.sections.length === 1 ? 'section' : 'sections'}`} />)}
        </div>
      </div>

      <ul className="sr-only">
        {cols.map((c) => <li key={c.key}><Link to={c.url}>{c.brand.name} ({c.count} works)</Link></li>)}
      </ul>
      <p className="label absolute bottom-5 left-6 z-30 whitespace-nowrap">Scroll · drag · arrow keys</p>
    </div>
  );
}

function DrumRow({ d, text, sub, align, ROW }) {
  const ad = Math.abs(d);
  return (
    <div className={`flex flex-col justify-center whitespace-nowrap ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
      style={{ height: ROW, opacity: Math.max(0.12, 1 - ad * 0.45), transform: `scale(${ad < 0.5 ? 1 : 0.86})`, transformOrigin: align === 'right' ? 'right center' : 'left center', transition: 'transform .3s' }}>
      <span className={`text-[clamp(1.05rem,1.6vw,1.5rem)] tracking-[-0.02em] ${ad < 0.5 ? 'font-medium text-text' : 'text-muted'}`}>{text}</span>
      {sub && ad < 0.5 && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{sub}</span>}
    </div>
  );
}

/* ---------------- About (like the reference: heading, text, small photo, timeline) ---------------- */
function About() {
  const [lead, ...rest] = profile.about;
  return (
    <section id="about" className="scroll-mt-3 border-t border-line px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="about-title">
      <div className="grid gap-10 xl:grid-cols-[160px_1fr]">
        <p className="label pt-2">Hello</p>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-start">
        <div className="max-w-2xl">
          <h2 id="about-title" className="text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-text">
            A bit more <span className="serif font-normal">about me</span>
          </h2>
          <p className="mt-8 text-[17px] leading-relaxed text-text">{lead}</p>
          {rest.map((t, i) => <p key={i} className="mt-4 text-[15px] leading-relaxed text-muted">{t}</p>)}
        </div>
          <div className="w-40 overflow-hidden rounded-xl border border-line bg-panel-2 sm:w-52 lg:ml-auto lg:mt-2 lg:w-60">
            <img src={profile.portrait} alt={profile.portraitAlt} loading="lazy" className="block aspect-[4/5] w-full object-cover" style={{ transform: 'scale(1.45)', transformOrigin: '50% 58%' }} />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 xl:grid-cols-[160px_1fr]">
        <p className="label pt-1">Experience</p>
        <ul className="border-t border-line">
          {experience.jobs.map((j) => (
            <li key={j.company} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[150px_1fr]">
              <p className="font-mono text-[12px] text-muted">{[j.start, j.end].filter(Boolean).join(' — ') || 'Work'}</p>
              <div>
                <p className="font-medium text-text">{j.role ? `${j.role} · ` : ''}{j.company}</p>
                <ul className="mt-2 space-y-1 text-[14px] text-muted">{j.responsibilities.map((r) => <li key={r}>— {r}</li>)}</ul>
              </div>
            </li>
          ))}
          {experience.education.map((e) => (
            <li key={e.degree} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[150px_1fr]">
              <p className="font-mono text-[12px] text-muted">{e.year || 'Education'}</p>
              <div>
                <p className="font-medium text-text">{e.degree}</p>
                <p className="mt-1 text-[14px] text-muted">{e.institution}{e.result && ` · ${e.result}`}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 grid gap-10 xl:grid-cols-[160px_1fr]">
        <p className="label pt-1">Skills</p>
        <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {skills.groups.map((g) => (
            <div key={g.title}>
              <p className="text-[14px] font-medium text-text">{g.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{g.skills.join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  const links = [
    profile.email && { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/[^+\d]/g, '').replace(/^0/, '+880')}` },
    profile.linkedin && { label: 'LinkedIn', value: 'View profile', href: profile.linkedin },
    ...(profile.socials || []).map((s) => ({ label: s.label, value: 'Visit', href: s.url })),
    profile.cv && { label: 'CV', value: 'Download', href: profile.cv },
  ].filter(Boolean);
  return (
    <section id="contact" className="scroll-mt-3 border-t border-line px-6 py-16 sm:px-8 sm:py-20" aria-labelledby="contact-title">
      <div className="grid gap-10 xl:grid-cols-[160px_1fr]">
        <p className="label pt-2">Contact</p>
        <div>
          <h2 id="contact-title" className="text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-text">
            Let's work <span className="serif font-normal">together</span>
          </h2>
          {profile.closing && <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">{profile.closing}</p>}
          {links.length ? (
            <ul className="mt-8 max-w-xl border-t border-line">
              {links.map((l) => (
                <li key={l.label} className="border-b border-line">
                  <a href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" className="group flex items-center justify-between py-4">
                    <span className="label">{l.label}</span>
                    <span className="flex items-center gap-2 text-text">{l.value}<Icon name="arrowUpRight" className="h-4 w-4 text-muted group-hover:text-text" /></span>
                  </a>
                </li>
              ))}
            </ul>
          ) : <p className="mt-6 text-[15px] text-muted">Email and social links will be added here soon.</p>}
        </div>
      </div>
    </section>
  );
}
