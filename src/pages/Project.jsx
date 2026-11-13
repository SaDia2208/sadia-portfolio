import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Viewer, { ProjectDetails } from '../components/Viewer';
import { Icon, Img, Reveal } from '../components/ui';
import { VideoThumb } from '../galleries/Galleries';
import { brandBySlug, categoryBySlug, cssAspect, findProject, projectsFor } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';
import NotFound from './NotFound';

/** Shareable page for any single project — used for campaigns, featured work and deep links. */
export default function Project() {
  const { brand: b, category: c, slug } = useParams();
  const project = findProject(b, c, slug);
  useDocumentTitle(project ? project.title : 'Not found', project?.description);
  const [open, setOpen] = useState(-1);
  if (!project) return <NotFound />;

  const brand = brandBySlug[b];
  const cat = categoryBySlug[c];
  const siblings = projectsFor(b, c);
  const idx = siblings.findIndex((p) => p.id === project.id);
  const prev = siblings[idx - 1], next = siblings[idx + 1];
  const items = project.media.map((m) => ({ media: m, project }));
  const isBanner = project.layout === 'banner';
  const accent = brand.theme.accent;

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40" style={{ background: brand.theme.bg, color: brand.theme.fg }}>
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="fade-up eyebrow flex flex-wrap gap-1.5 opacity-70">
            <Link to="/work" className="hover:underline">Portfolio</Link>/
            <Link to={`/work/${b}`} className="hover:underline">{brand.name}</Link>/
            <Link to={`/work/${b}/${c}`} className="hover:underline">{cat.label}</Link>
          </nav>
          <h1 className="display mt-8 text-[15vw] leading-[0.85] lg:text-[8vw]"><span className="line-mask"><span>{project.title}</span></span></h1>
        </div>
      </section>

      <section className="bg-ink py-14 sm:py-20" aria-label="Project">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3"><div className="lg:sticky lg:top-24"><ProjectDetails project={{ ...project, title: '' }} dark /></div></aside>
          <div className={`lg:col-span-9 ${isBanner ? 'space-y-10' : 'grid grid-cols-1 items-start gap-6 sm:grid-cols-2'}`}>
            {project.media.map((m, i) => (
              <Reveal key={i} delay={(i % 2) * 80} className={!isBanner && i % 2 ? 'sm:mt-16' : ''}>
                <button onClick={() => setOpen(i)} className="group block w-full text-left"
                  aria-label={`Open ${m.type === 'image' ? 'image' : 'video'} ${i + 1} of ${project.media.length}`}>
                  {m.type === 'image' ? (
                    <div className="overflow-hidden bg-ash">
                      <Img src={m.src} alt={m.alt || `${project.title} — ${i + 1}`} imgClassName="transition-transform duration-700 group-hover:scale-[1.02]" />
                    </div>
                  ) : (
                    <div style={{ aspectRatio: cssAspect(m.aspect) }}><VideoThumb media={m} title={project.title} /></div>
                  )}
                  <span className="mt-2 flex items-center justify-between text-xs text-smoke">
                    <span>{m.caption || (project.layout === 'carousel' ? `Slide ${i + 1}` : '')}</span>
                    {project.media.length > 1 && <span className="font-display text-sm" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span>}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <nav className="border-t border-white/10 bg-ink" aria-label="More projects">
        <div className="wrap grid grid-cols-2 gap-4 py-12">
          <div>{prev && <PagerLink p={prev} dir="← Previous" />}</div>
          <div className="text-right">{next ? <PagerLink p={next} dir="Next →" /> : (
            <Link to={`/work/${b}/${c}`} className="inline-flex items-center gap-2 font-bold uppercase tracking-wider hover:text-lime">All {cat.label} <Icon name="arrowRight" className="h-4 w-4" /></Link>
          )}</div>
        </div>
      </nav>

      {open >= 0 && <Viewer mode={project.layout === 'carousel' ? 'slides' : 'gallery'} items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

function PagerLink({ p, dir }) {
  return (
    <Link to={p.url} className="group inline-block">
      <span className="eyebrow text-smoke">{dir}</span>
      <span className="display mt-2 block text-3xl leading-none group-hover:text-lime sm:text-5xl">{p.title}</span>
    </Link>
  );
}
