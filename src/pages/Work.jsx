import { useSearchParams } from 'react-router-dom';
import { Reveal } from '../components/ui';
import { BrandCard, EmptyPanel, SectionHead, WorkTile } from '../clean/Clean';
import { brandBySlug, brands, projects } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';

/** /work — all brands, then every published piece with a simple brand filter. */
export default function Work() {
  useDocumentTitle('Work', 'Social media design, carousels, website banners, videos and campaigns for Cricket Arabia, Cubuzzle, Active Arabia and Tourmatez.');
  const [params, setParams] = useSearchParams();
  const brand = brandBySlug[params.get('brand')] ? params.get('brand') : '';
  const list = projects.filter((p) => p.cover && (!brand || p.brand === brand));
  const setBrand = (v) => { const n = new URLSearchParams(params); v ? n.set('brand', v) : n.delete('brand'); setParams(n, { replace: true, preventScrollReset: true }); };
  const chip = (on) => `rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${on ? 'border-text bg-text text-ink' : 'border-line text-muted hover:text-text'}`;

  return (
    <>
      <section className="shell pt-28 sm:pt-32">
        <SectionHead label="Work" title="Brands &" accent="projects">Choose a brand to see its daily posts, carousels, website banners, videos and campaigns.</SectionHead>
        <div className="grid gap-3 md:grid-cols-2 lg:gap-4">
          {brands.map((b, i) => <Reveal key={b.slug} delay={(i % 2) * 80}><BrandCard brand={b} index={i} /></Reveal>)}
        </div>
      </section>
      <section className="shell py-28" aria-labelledby="all-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="all-title" className="text-2xl font-medium tracking-[-0.02em] text-text sm:text-3xl">All work</h2>
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter by brand">
            <button className={chip(!brand)} aria-pressed={!brand} onClick={() => setBrand('')}>All</button>
            {brands.map((b) => <button key={b.slug} className={chip(brand === b.slug)} aria-pressed={brand === b.slug} onClick={() => setBrand(brand === b.slug ? '' : b.slug)}>{b.name}</button>)}
          </div>
        </div>
        {list.length ? (
          <div className="grid grid-cols-2 items-start gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 50}><WorkTile project={p} index={i} /></Reveal>)}
          </div>
        ) : <EmptyPanel>No published work for this brand yet.</EmptyPanel>}
      </section>
    </>
  );
}
