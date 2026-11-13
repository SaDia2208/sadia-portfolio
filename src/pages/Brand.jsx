import { Link, Navigate, useParams } from 'react-router-dom';
import CategoryGallery from '../galleries/Galleries';
import { BrandHero } from '../components/worlds';
import { EmptyState, Icon, Reveal } from '../components/ui';
import { artFor, brandBySlug, brands, categories, categoryBySlug, countFor, projectsFor } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';
import NotFound from './NotFound';

export default function Brand() {
  const { brand: slug, category: catSlug } = useParams();
  const brand = brandBySlug[slug];
  useDocumentTitle(brand ? `${brand.name}${catSlug && categoryBySlug[catSlug] ? ` · ${categoryBySlug[catSlug].label}` : ''}` : 'Not found', brand?.summary);
  if (!brand) return <NotFound />;
  if (catSlug && !categoryBySlug[catSlug]) return <Navigate to={`/work/${slug}`} replace />;

  const index = brands.findIndex((b) => b.slug === slug);
  const active = categoryBySlug[catSlug] || null; // null = "All" view
  const filled = categories.filter((c) => countFor(slug, c.slug));
  const highlight = artFor(slug, 1)[0];
  const { accent } = brand.theme;
  const tab = (on) => `flex shrink-0 items-baseline gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${on ? 'text-ink' : 'text-paper/60 hover:text-paper'}`;
  const onStyle = { background: accent, color: brand.slug === 'active-arabia' || brand.slug === 'cricket-arabia' ? '#fff' : '#090909' };

  return (
    <>
      <BrandHero brand={brand} index={index} />

      {highlight && (
        <section className="relative overflow-hidden bg-ink py-20 sm:py-28" aria-label="Featured artwork">
          <span className="pointer-events-none absolute right-[10%] top-1/2 h-[60vmin] w-[60vmin] -translate-y-1/2 rounded-full opacity-20 blur-[120px]" style={{ background: accent }} aria-hidden="true" />
          <div className="wrap relative grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow" style={{ color: accent }}>Featured artwork</p>
              <h2 className="display mt-4 text-5xl sm:text-7xl">{highlight.title}</h2>
              {highlight.description && <p className="mt-4 text-paper/70">{highlight.description}</p>}
              <Link to={highlight.url} className="mt-8 inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-bold uppercase tracking-wider" style={{ borderColor: accent }}>View project <Icon name="arrowUpRight" className="h-4 w-4" /></Link>
            </div>
            <Reveal variant="wipe" className="lg:col-span-7 lg:col-start-6">
              <Link to={highlight.url} className="block"><img src={highlight.cover} alt={highlight.title} loading="lazy" decoding="async" className="mx-auto block h-auto max-h-[82vh] w-auto max-w-full shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]" /></Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Category selection */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md">
        <nav className="wrap no-scrollbar flex gap-1 overflow-x-auto pb-3 pt-16 sm:pt-[4.5rem]" aria-label={`${brand.name} collections`}>
          <Link to={`/work/${slug}`} preventScrollReset aria-current={!active ? 'page' : undefined} className={tab(!active)} style={!active ? onStyle : undefined}>
            All<span className="opacity-60">{countFor(slug)}</span>
          </Link>
          {categories.map((c, i) => {
            const n = countFor(slug, c.slug);
            const on = active?.slug === c.slug;
            return (
              <Link key={c.slug} to={`/work/${slug}/${c.slug}`} preventScrollReset aria-current={on ? 'page' : undefined}
                className={`${tab(on)} ${!n && !on ? 'opacity-40' : ''}`} style={on ? onStyle : undefined}>
                <span className="font-display text-[10px] opacity-70">0{i + 1}</span>{c.label}<span className="opacity-60">{n || 'soon'}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-ink">
        {active ? (
          <CollectionSection brand={brand} cat={active} index={categories.indexOf(active)} />
        ) : filled.length ? (
          filled.map((c) => <CollectionSection key={c.slug} brand={brand} cat={c} index={categories.indexOf(c)} linked />)
        ) : (
          <section className="wrap py-20"><EmptyState title="New work coming soon">{brand.name} projects will appear here once they are published.</EmptyState></section>
        )}
      </div>

      <NextBrand current={index} />
    </>
  );
}

/** One collection (category) of a brand, using the gallery made for that format. */
function CollectionSection({ brand, cat, index, linked = false }) {
  const list = projectsFor(brand.slug, cat.slug);
  return (
    <section className="relative scroll-mt-32 border-b border-white/10 pb-16 pt-24 sm:pb-24 sm:pt-28" aria-labelledby={`cat-${cat.slug}`}>
      <div className="wrap">
        <div className="mb-14 grid items-end gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="font-display text-2xl" style={{ color: brand.theme.accent }}>{String(index + 1).padStart(2, '0')} <span className="text-paper/40">/ {list.length} piece{list.length === 1 ? '' : 's'}</span></p>
            <h2 id={`cat-${cat.slug}`} className="display mt-2 text-[13vw] leading-[0.85] md:text-[7vw]">
              <span className="line-mask" key={cat.slug}><span>{cat.longLabel || cat.label}</span></span>
            </h2>
          </div>
          <div className="md:col-span-4">
            {brand.categoryNotes?.[cat.slug] && <p className="max-w-sm text-paper/60">{brand.categoryNotes[cat.slug]}</p>}
            {linked && <Link to={`/work/${brand.slug}/${cat.slug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-paper/70 hover:text-paper">Only this collection <Icon name="arrowRight" className="h-4 w-4" /></Link>}
          </div>
        </div>
        <CategoryGallery key={`${brand.slug}-${cat.slug}`} projects={list} layout={cat.layout} accent={brand.theme.accent}
          emptyNote={`${brand.name} ${cat.label.toLowerCase()} will appear here once they are published.`} />
      </div>
    </section>
  );
}

function NextBrand({ current }) {
  const next = brands[(current + 1) % brands.length];
  if (!next || brands.length < 2) return null;
  return (
    <Link to={`/work/${next.slug}`} className="group relative block overflow-hidden" style={{ background: next.theme.bg, color: next.theme.fg }}>
      <div className="wrap relative py-20 sm:py-28">
        <p className="eyebrow opacity-70">Next world →</p>
        <p className="display mt-4 text-[18vw] leading-[0.82] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-6 lg:text-[11vw]">{next.name}</p>
        <span className="absolute bottom-20 right-6 grid h-20 w-20 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45 sm:right-10 sm:h-28 sm:w-28"
          style={{ background: next.theme.accent, color: next.theme.bg }}>
          <Icon name="arrowUpRight" className="h-8 w-8" />
        </span>
      </div>
    </Link>
  );
}
