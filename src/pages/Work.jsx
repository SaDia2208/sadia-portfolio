import { Link, useSearchParams } from 'react-router-dom';
import { Chapter, EmptyState, Icon, Reveal } from '../components/ui';
import { ProjectCard } from '../galleries/Galleries';
import BrandChapters from '../work/BrandChapters';
import { brandBySlug, brands, categories, categoryBySlug, countFor, projects } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';

export default function Work() {
  useDocumentTitle('Portfolio', 'Social media design, carousels, website banners, videos and campaigns for Cricket Arabia, Cubuzzle, Active Arabia and Tourmatez.');
  return (
    <>
      <section className="grain relative overflow-hidden bg-ink pb-16 pt-32 sm:pt-40">
        <div className="wrap">
          <Chapter n="—" title="Portfolio index" className="fade-up text-lime" />
          <h1 className="display mt-8 text-[24vw] leading-[0.8] lg:text-[16vw]">
            <span className="line-mask"><span>The</span></span>
            <span className="line-mask"><span style={{ animationDelay: '120ms' }} className="hollow">work</span><span className="serif ml-4 text-[0.5em] text-lime" style={{ animationDelay: '200ms' }}>index</span></span>
          </h1>
          <div className="fade-up mt-8 grid gap-8 lg:grid-cols-12" style={{ animationDelay: '300ms' }}>
            <p className="max-w-lg text-lg text-paper/70 lg:col-span-6">
              Four brands, five disciplines each — daily posts, carousels, website banners, videos &amp; reels, and campaigns.
            </p>
            <div className="flex flex-wrap items-start gap-2 lg:col-span-6 lg:justify-end">
              {brands.map((b, i) => (
                <a key={b.slug} href={`#${b.slug}`} className="chip border-white/20 hover:border-transparent hover:text-ink" style={{ '--hover': b.theme.accent }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = b.theme.accent; }} onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}>
                  <span className="font-display">0{i + 1}</span> {b.name}
                </a>
              ))}
              <Link to="/playground" className="chip border-lime text-lime hover:bg-lime hover:text-ink">Explore the playground <Icon name="arrowUpRight" className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </div>
      </section>
      <BrandChapters />
      <AllWork />
    </>
  );
}

function AllWork() {
  const [params, setParams] = useSearchParams();
  const brand = brandBySlug[params.get('brand')] ? params.get('brand') : '';
  const category = categoryBySlug[params.get('category')] ? params.get('category') : '';
  const set = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const list = projects.filter((p) => (!brand || p.brand === brand) && (!category || p.category === category));

  return (
    <section className="bg-paper py-24 text-ink" aria-labelledby="all-work">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="all-work" className="display text-[14vw] sm:text-8xl">All <span className="serif text-violet">work</span></h2>
          <p className="max-w-xs text-sm text-ink/60">Filter by brand and discipline. Everything here is real, published work.</p>
        </div>
        <div className="mt-10 space-y-3">
          <FilterRow label="Brand" value={brand} onChange={(v) => set('brand', v)}
            options={brands.map((b) => [b.slug, b.name, countFor(b.slug, category || undefined)])} total={countFor(undefined, category || undefined)} />
          <FilterRow label="Discipline" value={category} onChange={(v) => set('category', v)}
            options={categories.map((c) => [c.slug, c.label, countFor(brand || undefined, c.slug)])} total={countFor(brand || undefined)} />
        </div>
        <div className="mt-12" aria-live="polite">
          {list.length ? (
            <div className="grid grid-cols-2 items-start gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 60} className={`${p.layout === 'banner' ? 'col-span-2' : ''} ${i % 4 === 1 ? 'lg:mt-16' : i % 4 === 3 ? 'lg:mt-8' : ''}`}>
                  <ProjectCard project={p} aspect={p.layout === 'banner' ? '16 / 9' : '4 / 5'} light />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState dark={false} title={projects.length ? 'Nothing here yet' : 'Uploads in progress'}>
              {projects.length ? 'No published projects match these filters yet.' : 'Work is being added brand by brand. Explore the four brand worlds above in the meantime.'}
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterRow({ label, value, onChange, options, total }) {
  const chip = (active) => `chip whitespace-nowrap ${active ? 'border-ink bg-ink text-lime' : 'border-ink/20 hover:border-ink'}`;
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow w-24 shrink-0 text-ink/50">{label}</span>
      <div className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
        <button className={chip(!value)} aria-pressed={!value} onClick={() => onChange('')}>All <span className="opacity-50">{total}</span></button>
        {options.map(([v, l, n]) => (
          <button key={v} className={chip(value === v)} aria-pressed={value === v} onClick={() => onChange(value === v ? '' : v)}>{l} <span className="opacity-50">{n}</span></button>
        ))}
      </div>
    </div>
  );
}
