import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon, Marquee } from './ui';
import { brands, profile } from '../lib/content';
import { useScrolled } from '../lib/hooks';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Portfolio', to: '/work' },
  { label: 'Playground', to: '/playground' },
  { label: 'Skills', to: '/#create' },
  { label: 'Experience', to: '/#experience' },
  { label: 'Contact', to: '/#contact' },
];

// Brand pages (/work/:brand and /work/:brand/:category) share one "page" so switching tabs doesn't jump.
const pageKey = (pathname) => {
  const m = pathname.match(/^\/work\/([^/]+)(?:\/[^/]+)?\/?$/);
  return m ? `/work/${m[1]}` : pathname;
};

function ScrollManager() {
  const { pathname, hash } = useLocation();
  const prev = useRef(pathname);
  useEffect(() => {
    const samePage = pageKey(prev.current) === pageKey(pathname) && prev.current !== pathname;
    prev.current = pathname;
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(t);
    }
    if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function Header() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (to) => {
    if (to === '/work') return pathname.startsWith('/work');
    if (to === '/playground') return pathname === '/playground';
    if (to === '/') return pathname === '/' && !hash;
    return pathname === '/' && hash === to.slice(1);
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:bg-lime focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      {/* Difference blending keeps the nav legible over any artwork or brand colour. */}
      <header className={`fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference transition-[padding] duration-500 ${scrolled ? 'py-3' : 'py-5 sm:py-7'}`}>
        <div className="wrap flex items-center justify-between">
          <Link to="/" className="group flex items-baseline gap-2" aria-label="Sadia Akter — home">
            <span className="font-display text-2xl uppercase leading-none tracking-wide sm:text-[28px]">Sadia&nbsp;Akter</span>
            <span className="serif hidden text-lg leading-none sm:inline">/ creative playground</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
            {NAV.map((n, i) => (
              <Link key={n.label} to={n.to} aria-current={isActive(n.to) ? 'page' : undefined}
                className="group relative flex items-start gap-1 text-[13px] font-semibold uppercase tracking-[0.14em]">
                <span className="text-[9px] opacity-60">0{i + 1}</span>
                <span>{n.label}</span>
                <span className={`absolute -bottom-1.5 left-4 right-0 h-[2px] origin-left bg-current transition-transform duration-500 ${isActive(n.to) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
          </nav>
          <button onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Open menu"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] xl:hidden">
            Menu <Icon name="menu" />
          </button>
        </div>
      </header>

      {open && (
        <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu" className="page-in fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-lime text-ink">
          <div className="wrap flex items-center justify-between py-5">
            <span className="font-display text-2xl uppercase">Sadia Akter</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-12 w-12 place-items-center rounded-full bg-ink text-lime"><Icon name="close" /></button>
          </div>
          <nav aria-label="Mobile" className="wrap flex-1 pt-4">
            <ul>
              {NAV.map((n, i) => (
                <li key={n.label} className="line-mask border-b border-ink/15">
                  <Link to={n.to} style={{ animationDelay: `${i * 55}ms` }} className="flex items-baseline justify-between py-2">
                    <span className="display text-[17vw] sm:text-8xl">{n.label}</span>
                    <span className="font-display text-lg">0{i + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-8">Creative worlds</p>
            <div className="mt-3 flex flex-wrap gap-2 pb-10">
              {brands.map((b) => <Link key={b.slug} to={`/work/${b.slug}`} className="chip border-ink/30 hover:bg-ink hover:text-lime">{b.name}</Link>)}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink pt-16 text-paper">
      <Marquee items={['Social media design', 'Figma posters', 'Carousels', 'Web banners', 'Campaigns', 'AI-assisted video']}
        className="border-y border-white/10 py-4 font-display text-2xl uppercase text-smoke" />
      <div className="wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="serif text-3xl leading-tight text-paper/90 sm:text-4xl">{profile.tagline || profile.roles.join(' · ')}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:col-span-6 md:col-start-7 md:grid-cols-3">
          {NAV.map((n) => <Link key={n.label} to={n.to} className="text-paper/60 transition hover:text-lime">{n.label}</Link>)}
          {brands.map((b) => <Link key={b.slug} to={`/work/${b.slug}`} className="text-paper/60 transition hover:text-lime">{b.name}</Link>)}
        </nav>
      </div>
      <p className="display hollow-thin select-none whitespace-nowrap px-2 text-center text-[21vw] text-paper/25" aria-hidden="true">Sadia Akter</p>
      <div className="wrap flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-smoke sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}. Artwork shown belongs to the respective brands.</p>
        <p>Brand names and logos are property of their owners.</p>
      </div>
    </footer>
  );
}

function BackToTop() {
  const show = useScrolled(1200);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-lime text-ink transition-all duration-500 hover:rotate-[-12deg] ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
      <Icon name="arrowUp" />
    </button>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="main" key={pageKey(pathname)} className="page-in min-h-[70vh]">
        <Outlet />
      </main>
      {/* The playground is a full-screen experience: no footer or back-to-top. */}
      {pathname !== '/playground' && <Footer />}
      {pathname !== '/playground' && <BackToTop />}
    </>
  );
}
