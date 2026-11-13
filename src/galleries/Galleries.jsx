import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Viewer from '../components/Viewer';
import { EmptyState, Icon, Img, PlayBadge, Reveal, SlideBadge } from '../components/ui';
import { useInView } from '../lib/hooks';
import { brandBySlug, categoryBySlug, cssAspect, domainOf } from '../lib/content';

/** Picks the right gallery for a category's layout. Same components for every brand. */
export default function CategoryGallery({ projects, layout, emptyNote, accent = '#d7ff3f' }) {
  if (!projects.length) {
    return <EmptyState title="New work coming soon">{emptyNote || 'Projects in this collection will appear here once they are published.'}</EmptyState>;
  }
  const G = { single: PosterWall, carousel: CarouselStories, banner: BannerShowcase, video: VideoGallery, campaign: CampaignGallery }[layout] || PosterWall;
  return <G projects={projects} accent={accent} />;
}

function DraftTag({ project }) {
  return project.status === 'draft'
    ? <span className="absolute left-3 top-3 z-[2] bg-coral px-2 py-0.5 text-[10px] font-bold text-ink">DRAFT</span>
    : null;
}

/* ---------- Single posts: an editorial poster exhibition ----------
   A repeating 6-beat rhythm of large and small pieces with offset hanging heights.
   Every poster keeps its original proportions (width set by the grid, height natural). */
const WALL = [
  { span: 'col-span-2 md:col-span-4 lg:col-span-5', big: true },
  { span: 'col-span-1 md:col-span-2 lg:col-span-3 lg:mt-40' },
  { span: 'col-span-1 md:col-span-2 lg:col-span-4 lg:mt-16' },
  { span: 'col-span-1 md:col-span-2 lg:col-span-3 lg:col-start-2' },
  { span: 'col-span-1 md:col-span-2 lg:col-span-4 lg:mt-28' },
  { span: 'col-span-2 md:col-span-4 lg:col-span-4 lg:-mt-10', big: true },
];

export function PosterWall({ projects, accent }) {
  const items = useMemo(() => projects.map((p) => ({ media: p.media[0], project: p })), [projects]);
  const [open, setOpen] = useState(-1);
  return (
    <>
      <div className="grid grid-cols-2 items-start gap-x-4 gap-y-14 md:grid-cols-6 lg:grid-cols-12 lg:gap-x-8">
        {projects.map((p, i) => {
          const beat = WALL[i % WALL.length];
          return (
            <Reveal key={p.id} delay={(i % 3) * 80} className={beat.span}>
              <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Open ${p.title}`}>
                <div className="relative overflow-hidden bg-ash shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2">
                  <DraftTag project={p} />
                  <Img src={p.media[0].src} alt={p.media[0].alt || p.title} imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]" />
                  <span className="absolute right-3 top-3 grid h-11 w-11 scale-0 place-items-center rounded-full text-ink transition-transform duration-500 group-hover:scale-100" style={{ background: accent }}>
                    <Icon name="zoomIn" className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-display text-lg" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={beat.big ? 'display text-2xl leading-tight sm:text-3xl' : 'text-sm font-semibold leading-snug'}>{p.title}</span>
                </div>
                {beat.big && p.description && <p className="mt-2 max-w-md pl-9 text-sm leading-relaxed text-paper/60">{p.description}</p>}
              </button>
            </Reveal>
          );
        })}
      </div>
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

/* ---------- Carousels: each project is a swipeable story strip; opens the slide viewer ---------- */
export function CarouselStories({ projects, accent }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="space-y-20">
        {projects.map((p, i) => (
          <Reveal key={p.id}>
            <article>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="display text-5xl" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display text-3xl sm:text-5xl">{p.title}</h3>
                    {p.description && <p className="mt-1 max-w-xl text-sm text-paper/60">{p.description}</p>}
                  </div>
                </div>
                <button onClick={() => setOpen({ project: p, index: 0 })} className="inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-paper hover:text-ink">
                  Play story <Icon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
              <StoryStrip project={p} onOpen={(index) => setOpen({ project: p, index })} />
            </article>
          </Reveal>
        ))}
      </div>
      {open && (
        <Viewer mode="slides" items={open.project.media.map((m) => ({ media: m, project: open.project }))}
          index={open.index} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function StoryStrip({ project, onOpen }) {
  const strip = useRef(null);
  const scroll = (d) => strip.current?.scrollBy({ left: d * strip.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="relative">
      <div ref={strip} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" role="list" aria-label={`${project.title} slides`}>
        {project.media.map((m, i) => (
          <button key={i} role="listitem" onClick={() => onOpen(i)} aria-label={`Open slide ${i + 1} of ${project.media.length}`}
            className="group relative w-[72vw] shrink-0 snap-start sm:w-[30vw] lg:w-[22vw]">
            <div className="relative overflow-hidden bg-ash">
              {i === 0 && <span className="absolute left-3 top-3 z-[2]"><SlideBadge count={project.media.length} /></span>}
              <Img src={m.src} alt={m.alt || `${project.title} — slide ${i + 1}`} imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <span className="mt-2 block text-left text-xs text-smoke">Slide {i + 1}</span>
          </button>
        ))}
      </div>
      {project.media.length > 3 && (
        <div className="mt-3 hidden justify-end gap-2 sm:flex">
          <button onClick={() => scroll(-1)} aria-label="Scroll slides left" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 hover:bg-paper hover:text-ink"><Icon name="arrowLeft" /></button>
          <button onClick={() => scroll(1)} aria-label="Scroll slides right" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 hover:bg-paper hover:text-ink"><Icon name="arrowRight" /></button>
        </div>
      )}
    </div>
  );
}

/* ---------- Website banners: large landscape compositions, browser frame or original ---------- */
export function BannerShowcase({ projects }) {
  const [mockup, setMockup] = useState(true);
  const [open, setOpen] = useState(-1);
  const items = useMemo(() => projects.map((p) => ({ media: p.media[0], project: p })), [projects]);
  return (
    <>
      <div className="mb-10 flex justify-end">
        <div role="group" aria-label="Banner display" className="inline-flex rounded-full border border-white/20 p-1 text-xs font-bold uppercase tracking-wider">
          {[['In browser', true], ['Original', false]].map(([label, v]) => (
            <button key={label} onClick={() => setMockup(v)} aria-pressed={mockup === v}
              className={`rounded-full px-4 py-2 transition ${mockup === v ? 'bg-paper text-ink' : 'text-paper/60 hover:text-paper'}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-20">
        {projects.map((p, i) => {
          const brand = brandBySlug[p.brand];
          return (
            <Reveal key={p.id} variant="wipe">
              <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Open banner ${p.title}`}>
                <div className={`relative overflow-hidden ${mockup ? 'rounded-xl border border-white/15 bg-[#1b1b1b] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]' : ''}`}>
                  <DraftTag project={p} />
                  {mockup && (
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
                      <span className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#ff6159]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c941]" /></span>
                      <span className="mx-auto max-w-sm flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-center text-[11px] text-paper/60">{domainOf(brand?.website) || brand?.name}</span>
                    </div>
                  )}
                  <Img src={p.media[0].src} alt={p.media[0].alt || p.title} imgClassName="transition-transform duration-[1.2s] group-hover:scale-[1.01]" />
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-12">
                  <span className="font-display text-2xl text-smoke sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display text-3xl sm:col-span-8 sm:text-4xl">{p.title}</span>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-paper/60 transition group-hover:text-paper sm:col-span-3 sm:justify-end">Full screen <Icon name="expand" className="h-4 w-4" /></span>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

/* ---------- Videos & reels: poster-like thumbnails, play only on request ---------- */
export function VideoGallery({ projects }) {
  const [open, setOpen] = useState(-1);
  const items = useMemo(() => projects.map((p) => ({ media: p.media[0], project: p })), [projects]);
  return (
    <>
      <div className="grid grid-cols-2 items-start gap-4 sm:gap-6 md:grid-cols-4">
        {projects.map((p, i) => {
          const m = p.media[0];
          const wide = m.aspect === '16:9';
          return (
            <Reveal key={p.id} delay={(i % 4) * 70} className={`${wide ? 'col-span-2' : ''} ${!wide && i % 2 ? 'md:mt-16' : ''}`}>
              <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Play video ${p.title}`}>
                <VideoThumb media={m} title={p.title} draft={p.status === 'draft'} />
                <p className="display mt-3 text-2xl leading-tight">{p.title}</p>
                <p className="text-xs uppercase tracking-widest text-smoke">{m.aspect || 'Video'}{m.provider ? ` · ${m.provider}` : ''}</p>
              </button>
            </Reveal>
          );
        })}
      </div>
      {open >= 0 && <Viewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

export function VideoThumb({ media, title, draft }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="relative overflow-hidden bg-ash" style={{ aspectRatio: cssAspect(media.aspect) || '9 / 16' }}>
      {draft && <span className="absolute left-3 top-3 z-[2] bg-coral px-2 py-0.5 text-[10px] font-bold text-ink">DRAFT</span>}
      {media.poster ? (
        <Img src={media.poster} alt="" fit="cover" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-105" />
      ) : media.type === 'video' && inView ? (
        <video src={`${media.src}#t=0.5`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="display absolute inset-0 grid place-items-center p-4 text-center text-2xl text-white/30">{title}</span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute inset-0 grid place-items-center"><PlayBadge /></span>
    </div>
  );
}

/* ---------- Campaigns: grouped creatives, each opens its own project page ---------- */
export function CampaignGallery({ projects, accent }) {
  return (
    <div className="space-y-6">
      {projects.map((p, i) => {
        const imgs = p.media.filter((m) => m.type === 'image').length;
        const vids = p.media.length - imgs;
        return (
          <Reveal key={p.id}>
            <Link to={p.url} className="group grid items-center gap-6 border-t border-white/15 pt-6 md:grid-cols-12">
              <span className="display text-6xl md:col-span-1" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="relative overflow-hidden bg-ash md:col-span-5">
                <DraftTag project={p} />
                {p.cover ? <Img src={p.cover} alt="" fit="contain" aspect="4 / 3" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" /> : <div className="aspect-[4/3]" />}
              </div>
              <div className="md:col-span-5 md:col-start-8">
                <h3 className="display text-5xl leading-none sm:text-6xl">{p.title}</h3>
                {(p.objective || p.description) && <p className="mt-4 text-paper/70">{p.objective || p.description}</p>}
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-smoke">
                  {[imgs && `${imgs} image${imgs > 1 ? 's' : ''}`, vids && `${vids} video${vids > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition group-hover:gap-4">Open campaign <Icon name="arrowRight" className="h-4 w-4" /></span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ---------- Generic card (portfolio index) ---------- */
export function ProjectCard({ project, aspect = '4 / 5', light = false }) {
  const brand = brandBySlug[project.brand];
  const cat = categoryBySlug[project.category];
  const m = project.media[0];
  const isVideo = m.type !== 'image' && !project.cover;
  return (
    <Link to={project.url} className="group block">
      <div className={`relative overflow-hidden ${light ? 'bg-ink/5' : 'bg-ash'}`}>
        <DraftTag project={project} />
        {isVideo ? (
          <div style={{ aspectRatio: aspect }} className="relative"><div className="absolute inset-0"><VideoThumb media={{ ...m, aspect: undefined }} title={project.title} /></div></div>
        ) : (
          <Img src={project.cover} alt="" fit="contain" aspect={aspect} imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <span className="absolute right-3 top-3 flex gap-1.5">
          {project.layout === 'carousel' && <SlideBadge count={project.media.length} />}
          {m.type !== 'image' && project.cover && <span className="bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-lime">VIDEO</span>}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{project.title}</p>
          <p className={`truncate text-xs ${light ? 'text-ink/50' : 'text-smoke'}`}>{brand?.name} · {cat?.label}</p>
        </div>
        <Icon name="arrowUpRight" className="mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45" />
      </div>
    </Link>
  );
}
