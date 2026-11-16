import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Viewer, { ProjectDetails } from '../components/Viewer';
import { Icon, Img, Reveal } from '../components/ui';
import { brandBySlug, categoryBySlug, cssAspect, findProject, projectsFor } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';
import NotFound from './NotFound';

/** A single project — every asset of the project, grouped, with details alongside. */
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
  const wide = project.layout === 'banner';

  return (
    <>
      <section className="shell pt-24 sm:pt-28">
        <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2">
          <Link to="/#work" className="hover:text-text">Work</Link><span>/</span>
          <Link to={`/work/${b}`} className="hover:text-text">{brand.name}</Link><span>/</span>
          <Link to={`/work/${b}/${c}`} className="hover:text-text">{cat.label}</Link>
        </nav>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.25rem,5.5vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em] text-text">{project.title}</h1>
      </section>

      <section className="shell grid gap-10 py-12 lg:grid-cols-12" aria-label="Project">
        <aside className="lg:col-span-4"><div className="panel p-6 lg:sticky lg:top-24"><ProjectDetails project={{ ...project, title: '' }} dark /></div></aside>
        <div className={`lg:col-span-8 ${wide || project.media.length === 1 ? 'space-y-6' : 'grid grid-cols-1 items-start gap-5 sm:grid-cols-2'}`}>
          {project.media.map((m, i) => (
            <Reveal key={i}>
              <button onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={`Open ${m.type === 'image' ? 'image' : 'video'} ${i + 1} of ${project.media.length}`}>
                {m.type === 'image' ? (
                  <div className="overflow-hidden rounded-xl border border-line bg-panel"><Img src={m.src} alt={m.alt || `${project.title} — ${i + 1}`} imgClassName="transition-transform duration-700 group-hover:scale-[1.02]" /></div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-line bg-panel" style={{ aspectRatio: cssAspect(m.aspect) || '16 / 9' }}>
                    {m.poster && <img src={m.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-text/90 text-ink"><Icon name="play" filled className="ml-0.5 h-5 w-5" /></span></span>
                  </div>
                )}
                {(m.caption || project.media.length > 1) && (
                  <p className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    <span>{m.caption || (project.layout === 'carousel' ? `Slide ${i + 1}` : '')}</span><span>{String(i + 1).padStart(2, '0')}</span>
                  </p>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <nav className="shell grid grid-cols-2 gap-3 pb-24" aria-label="More projects">
        {prev ? <Pager p={prev} dir="Previous" /> : <span />}
        {next ? <Pager p={next} dir="Next" right /> : (
          <Link to={`/work/${b}/${c}`} className="panel flex items-center justify-end gap-2 p-5 text-sm text-text hover:border-white/20">All {cat.label.toLowerCase()} <Icon name="arrowRight" className="h-4 w-4" /></Link>
        )}
      </nav>

      {open >= 0 && <Viewer mode={project.layout === 'carousel' ? 'slides' : 'gallery'} items={items} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

function Pager({ p, dir, right }) {
  return (
    <Link to={p.url} className={`panel block p-5 transition-colors hover:border-white/20 ${right ? 'text-right' : ''}`}>
      <span className="label">{dir}</span>
      <span className="mt-2 block truncate font-medium text-text">{p.title}</span>
    </Link>
  );
}
