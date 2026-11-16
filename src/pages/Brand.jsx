import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '../components/ui';
import { CategoryGallery, CategoryNav } from '../clean/Clean';
import { brandBySlug, brands, categories, categoryBySlug, countFor, domainOf, projectsFor } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';
import NotFound from './NotFound';

/**
 * Brand page — one reusable layout for every brand.
 * Header → category navigation (Daily Posts, Carousels, Banners, Videos & Reels, Campaigns) → gallery → next brand.
 */
export default function Brand() {
  const { brand: slug, category: catSlug } = useParams();
  const brand = brandBySlug[slug];
  useDocumentTitle(brand ? `${brand.name}${catSlug && categoryBySlug[catSlug] ? ` · ${categoryBySlug[catSlug].label}` : ''}` : 'Not found', brand?.summary);
  if (!brand) return <NotFound />;
  if (catSlug && !categoryBySlug[catSlug]) return <Navigate to={`/work/${slug}`} replace />;

  const index = brands.findIndex((b) => b.slug === slug);
  // Default category: the first one that has work (usually Daily Posts).
  const active = categoryBySlug[catSlug] || categories.find((c) => countFor(slug, c.slug)) || categories[0];
  const list = projectsFor(slug, active.slug);
  const total = countFor(slug);

  return (
    <>
      {/* ---------- compact header: the collection opened from a card ---------- */}
      <section className="shell pt-20 sm:pt-24" aria-labelledby="brand-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/#work" className="label inline-flex items-center gap-2 transition-colors hover:text-text"><Icon name="arrowLeft" className="h-3.5 w-3.5" /> All brands</Link>
          <BrandSwitcher current={slug} />
        </div>
        <div className="mt-8 grid items-end gap-6 lg:grid-cols-12">
          <div className="flex items-center gap-5 sm:gap-7 lg:col-span-7">
            {brand.logo && <img src={brand.logo} alt="" className="h-16 w-auto shrink-0 rounded-2xl ring-1 ring-white/10 sm:h-24" />}
            <div className="min-w-0">
              <p className="label flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: brand.theme.accent }} />{String(index + 1).padStart(2, '0')} — {brand.industry}</p>
              <h1 id="brand-title" className="mt-3 text-[clamp(2.25rem,6vw,4.75rem)] font-medium leading-[0.95] tracking-[-0.045em] text-text">{brand.name}</h1>
            </div>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[15px] leading-relaxed text-muted">{brand.summary}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {total} {total === 1 ? 'piece' : 'pieces'}
              {brand.website && <> · <a href={brand.website} target="_blank" rel="noreferrer" className="text-text underline-offset-4 hover:underline">{domainOf(brand.website)} ↗</a></>}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <div className="sticky top-14 z-30 mt-8 border-y border-line bg-ink/95 backdrop-blur-md sm:top-16">
        <div className="shell py-3">
          <CategoryNav brandSlug={slug} categories={categories} active={active.slug} />
        </div>
      </div>

      <section className="shell pb-28 pt-10 sm:pt-14" aria-labelledby="cat-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 id="cat-title" className="text-2xl font-medium tracking-[-0.02em] text-text sm:text-3xl">{active.longLabel || active.label}</h2>
            {brand.categoryNotes?.[active.slug] && <p className="mt-2 max-w-xl text-sm text-muted">{brand.categoryNotes[active.slug]}</p>}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{list.length} {list.length === 1 ? 'project' : 'projects'}</span>
        </div>
        <CategoryGallery key={`${slug}-${active.slug}`} layout={active.layout} projects={list} brand={brand} />
      </section>

      <NextBrand current={index} />
    </>
  );
}

/** Small logo row to jump between the four brands — echoes the logo reel on the homepage. */
function BrandSwitcher({ current }) {
  return (
    <nav aria-label="Brands" className="flex items-center gap-2">
      {brands.map((b) => {
        const on = b.slug === current;
        return (
          <Link key={b.slug} to={`/work/${b.slug}`} aria-label={b.name} aria-current={on ? 'page' : undefined} title={b.name}
            className={`overflow-hidden rounded-lg ring-1 transition-all duration-300 ${on ? 'ring-white/60' : 'opacity-45 grayscale ring-white/10 hover:opacity-100 hover:grayscale-0'}`}>
            {b.logo ? <img src={b.logo} alt="" className="h-8 w-auto sm:h-9" /> : <span className="block px-3 py-2 font-mono text-[10px] uppercase text-text">{b.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function NextBrand({ current }) {
  const next = brands[(current + 1) % brands.length];
  if (!next || brands.length < 2) return null;
  return (
    <section className="shell pb-24">
      <Link to={`/work/${next.slug}`} className="group panel flex items-center justify-between gap-6 p-6 transition-colors hover:border-white/20 sm:p-10">
        <div className="flex items-center gap-5 sm:gap-7">
          {next.logo && <img src={next.logo} alt="" className="h-14 w-auto shrink-0 rounded-xl ring-1 ring-white/10 sm:h-20" />}
          <div>
          <p className="label">Next brand</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text sm:text-5xl">{next.name}</p>
          </div>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-muted transition-all group-hover:rotate-45 group-hover:border-white/30 group-hover:text-text sm:h-14 sm:w-14">
          <Icon name="arrowUpRight" className="h-5 w-5" />
        </span>
      </Link>
    </section>
  );
}
