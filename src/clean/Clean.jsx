/**
 * Clean premium components (2026-11 redesign).
 * One set of building blocks used by the homepage and every brand page, so all four brands
 * (and any brand added later in the CMS) get the same structure automatically.
 */
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Viewer from '../components/Viewer';
import { Icon, Img, Reveal } from '../components/ui';
import { artFor, brandBySlug, categoryBySlug, countFor, cssAspect } from '../lib/content';
import { useInView } from '../lib/hooks';

/* ---------- small pieces ---------- */
export function SectionHead({ label, title, accent, children, className = '' }) {
  return (
    <div className={`mb-10 grid gap-6 sm:mb-14 md:grid-cols-12 ${className}`}>
      <p className="label md:col-span-3 md:pt-3">{label}</p>
      <div className="md:col-span-9">
        <h2 className="text-[clamp(2rem,4.6vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-text">
          {title} {accent && <span className="serif font-normal">{accent}</span>}
        </h2>
        {children && <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{children}</div>}
      </div>
    </div>
  );
}

export function EmptyPanel({ title = 'Nothing here yet', children }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-20 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-line text-muted"><Icon name="layers" className="h-5 w-5" /></span>
      <p className="mt-5 text-lg font-medium text-text">{title}</p>
      {children && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

function Caption({ title, sub, n }) {
  return (
    <div className="mt-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium text-text">{title}</p>
        {sub && <p className="mt-0.5 truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{sub}</p>}
      </div>
      {n != null && <span className="font-mono text-[11px] text-muted">{String(n).padStart(2, '0')}</span>}
    </div>
  );
}

/* ---------- Brand card (homepage + /work) ---------- */
export function BrandCard({ brand, index }) {
  const art = artFor(brand.slug, 3);
  const n = countFor(brand.slug);
  return (
    <Link to={`/work/${brand.slug}`} className="group panel relative block overflow-hidden p-5 transition-colors duration-500 hover:border-white/20 sm:p-6">
      {/* quiet brand glow */}
      <span className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-25" style={{ background: brand.theme.accent }} aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-4">
        <span className="label min-w-0 truncate">{String(index + 1).padStart(2, '0')} — {brand.industry}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-all duration-500 group-hover:rotate-45 group-hover:border-white/30 group-hover:text-text">
          <Icon name="arrowUpRight" className="h-4 w-4" />
        </span>
      </div>
      {/* artwork fan */}
      <div className="relative mt-6 flex aspect-[16/10] items-end justify-center overflow-hidden rounded-xl bg-panel-2">
        {art.length ? art.map((p, i) => (
          <img key={p.id} src={p.cover} alt="" loading="lazy" decoding="async"
            className="absolute bottom-[-6%] w-[34%] rounded-md shadow-[0_24px_48px_-16px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[var(--ease-out-expo)]"
            style={{
              left: `${[33, 8, 58][i]}%`, zIndex: i === 0 ? 2 : 1,
              transform: `rotate(${[0, -7, 7][i]}deg) translateY(${i === 0 ? '0' : '8%'})`,
            }} />
        )) : <span className="label self-center">Collection in progress</span>}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
      </div>
      <div className="relative mt-5 flex items-end justify-between gap-4">
        <h3 className="text-2xl font-medium tracking-[-0.02em] text-text sm:text-3xl">{brand.name}</h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{n} {n === 1 ? 'piece' : 'pieces'}</span>
      </div>
    </Link>
  );
}

/* ---------- Generic work tile (Selected Work) ---------- */
export function WorkTile({ project, index }) {
  const brand = brandBySlug[project.brand];
  const cat = categoryBySlug[project.category];
  return (
    <Link to={project.url} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-line bg-panel">
        <Img src={project.cover} alt={project.title} imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
        <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
      </div>
      <Caption title={project.title} sub={`${brand?.name} · ${cat?.label}`} n={index + 1} />
    </Link>
  );
}

/* ---------- Category navigation (brand pages) ---------- */
export function CategoryNav({ brandSlug, categories, active }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {categories.map((c) => {
        const on = c.slug === active;
        const n = countFor(brandSlug, c.slug);
        return (
          <Link key={c.slug} to={`/work/${brandSlug}/${c.slug}`} preventScrollReset aria-current={on ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${on ? 'border-text bg-text text-ink' : 'border-line text-muted hover:border-white/25 hover:text-text'}`}>
            {c.label}<span className={on ? 'text-ink/60' : 'text-muted/70'}>{n}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------- Galleries ---------- */
export function CategoryGallery({ layout, projects, brand }) {
  if (layout === 'video') return <VideoGallery projects={projects} brand={brand} />;
  if (!projects.length) return <EmptyPanel>{`New ${brand.name} work in this category will appear here once it's published.`}</EmptyPanel>;
  if (layout === 'carousel') return <CarouselGallery projects={projects} />;
  if (layout === 'banner') return <BannerGallery projects={projects} />;
  if (layout === 'campaign') return <CampaignGallery projects={projects} />;
  return <PostGrid projects={projects} />;
}

/** Daily posts — even grid, each design at its own proportions, opens the full-screen viewer. */
function PostGrid({ projects }) {
  const items = useMemo(() => projects.map((p) => ({ media: p.media[0], project: p })), [projects]);
  const [open, setOpen] = useState(-1);
  return (
    <>
      <div className="grid grid-cols-2 items-start gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 60}>
            <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Open ${p.title}`}>
              <div className="relative overflow-hidden rounded-xl border border-line bg-panel">
                <Img src={p.media[0].src} alt={p.media[0].alt || p.title} imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-text opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  <Icon name="expand" className="h-4 w-4" />
                </span>
              </div>
              <Caption title={p.title} n={i + 1} />
            </button>
          </Reveal>
        ))}
      </div>
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

/** Carousel posts — each project is one swipeable card; slides stay together and in order. */
function CarouselGallery({ projects }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {projects.map((p) => <CarouselCard key={p.id} project={p} onOpen={(i) => setOpen({ project: p, index: i })} />)}
      </div>
      {open && (
        <Viewer mode="slides" items={open.project.media.map((m) => ({ media: m, project: open.project }))}
          index={open.index} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function CarouselCard({ project, onOpen }) {
  const track = useRef(null);
  const [cur, setCur] = useState(0);
  const total = project.media.length;
  const go = (i) => {
    const el = track.current;
    if (!el) return;
    const n = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setCur(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <article className="panel p-3 sm:p-4">
      <div className="relative overflow-hidden rounded-xl bg-panel-2">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" role="group" aria-roledescription="carousel" aria-label={project.title}>
          {project.media.map((m, i) => (
            <button key={i} onClick={() => onOpen(i)} className="w-full shrink-0 snap-center" aria-label={`Open slide ${i + 1} of ${total}`}>
              <Img src={m.src} alt={m.alt || `${project.title} — slide ${i + 1}`} />
            </button>
          ))}
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-text backdrop-blur">{cur + 1} / {total}</span>
        {total > 1 && (
          <>
            <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous slide"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-text backdrop-blur transition-opacity hover:bg-ink disabled:opacity-0"><Icon name="arrowLeft" className="h-4 w-4" /></button>
            <button onClick={() => go(cur + 1)} disabled={cur === total - 1} aria-label="Next slide"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-text backdrop-blur transition-opacity hover:bg-ink disabled:opacity-0"><Icon name="arrowRight" className="h-4 w-4" /></button>
          </>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="truncate font-medium text-text">{project.title}</p>
          {project.description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{project.description}</p>}
        </div>
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          {project.media.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === cur ? 'w-5 bg-text' : 'w-1.5 bg-white/25'}`} />)}
        </div>
      </div>
    </article>
  );
}

/** Website banners — full width, original aspect ratio, never cropped. */
function BannerGallery({ projects }) {
  const items = useMemo(() => projects.map((p) => ({ media: p.media[0], project: p })), [projects]);
  const [open, setOpen] = useState(-1);
  return (
    <>
      <div className="space-y-10">
        {projects.map((p, i) => (
          <Reveal key={p.id}>
            <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Open banner ${p.title}`}>
              <div className="overflow-hidden rounded-xl border border-line bg-panel">
                <Img src={p.media[0].src} alt={p.media[0].alt || p.title} imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.01]" />
              </div>
              <Caption title={p.title} sub={p.description} n={i + 1} />
            </button>
          </Reveal>
        ))}
      </div>
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

/** Videos & reels — two subcategories (AI Video Creations / Video Editing & Reels), thumbnails, plays on click. */
const VIDEO_TYPES = [['all', 'All videos'], ['ai', 'AI Video Creations'], ['editing', 'Video Editing & Reels']];
function VideoGallery({ projects, brand }) {
  const [type, setType] = useState('all');
  const list = type === 'all' ? projects : projects.filter((p) => (p.videoType || 'editing') === type);
  const items = list.map((p) => ({ media: p.media[0], project: p }));
  const [open, setOpen] = useState(-1);
  const count = (t) => (t === 'all' ? projects.length : projects.filter((p) => (p.videoType || 'editing') === t).length);
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Video type">
        {VIDEO_TYPES.map(([t, label]) => (
          <button key={t} onClick={() => setType(t)} aria-pressed={type === t}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${type === t ? 'bg-panel-2 text-text ring-1 ring-white/20' : 'text-muted hover:text-text'}`}>
            {label} <span className="ml-1 font-mono text-[11px] text-muted">{count(t)}</span>
          </button>
        ))}
      </div>
      {!list.length ? (
        <EmptyPanel title="No videos yet">{`${brand.name} ${type === 'ai' ? 'AI video creations' : type === 'editing' ? 'edits and reels' : 'videos'} will appear here once they're published.`}</EmptyPanel>
      ) : (
        <div className="grid grid-cols-2 items-start gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => {
            const m = p.media[0];
            const wide = m.aspect === '16:9';
            return (
              <Reveal key={p.id} delay={(i % 4) * 60} className={wide ? 'col-span-2' : ''}>
                <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Play ${p.title}`}>
                  <VideoThumb media={m} title={p.title} />
                  <Caption title={p.title} sub={`${p.videoType === 'ai' ? 'AI video' : 'Edit / reel'} · ${m.aspect || 'video'}`} />
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

function VideoThumb({ media, title }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="relative overflow-hidden rounded-xl border border-line bg-panel" style={{ aspectRatio: cssAspect(media.aspect) || '9 / 16' }}>
      {media.poster ? (
        <img src={media.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      ) : media.type === 'video' && inView ? (
        <video src={`${media.src}#t=0.5`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted">{title}</span>
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-text/90 text-ink transition-transform duration-300 group-hover:scale-110">
          <Icon name="play" filled className="ml-0.5 h-5 w-5" />
        </span>
      </span>
    </div>
  );
}

/** Campaigns & offers — one card per campaign; opens its own page with every asset grouped together. */
function CampaignGallery({ projects }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
      {projects.map((p) => {
        const imgs = p.media.filter((m) => m.type === 'image').length;
        const vids = p.media.length - imgs;
        return (
          <Reveal key={p.id}>
            <Link to={p.url} className="group panel block p-3 sm:p-4">
              <div className="relative overflow-hidden rounded-xl bg-panel-2">
                {p.cover ? <Img src={p.cover} alt="" fit="contain" aspect="4 / 3" imgClassName="transition-transform duration-700 group-hover:scale-[1.02]" /> : <div className="aspect-[4/3]" />}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4 px-1">
                <div className="min-w-0">
                  <p className="font-medium text-text">{p.title}</p>
                  {(p.objective || p.description) && <p className="mt-1 line-clamp-2 text-sm text-muted">{p.objective || p.description}</p>}
                  <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                    {[imgs && `${imgs} image${imgs > 1 ? 's' : ''}`, vids && `${vids} video${vids > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Icon name="arrowUpRight" className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:rotate-45 group-hover:text-text" />
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
