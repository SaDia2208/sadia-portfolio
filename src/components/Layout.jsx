import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './ui';
import { brands, profile } from '../lib/content';
import { useScrolled } from '../lib/hooks';

const NAV = [
  { label: 'Work', to: '/#work' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

// Brand pages (/work/:brand and /work/:brand/:category) share one "page" so switching categories doesn't jump.
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
    if (hash && pathname !== '/') {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(t);
    }
    if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function Header() {
  const scrolled = useScrolled(16);
  const { pathname, hash } = useLocation();
  const active = (to) => (to === '/#work' ? pathname.startsWith('/work') || (pathname === '/' && hash === '#work') : pathname === '/' && hash === to.slice(1));
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'border-b border-line bg-ink/80 backdrop-blur-md' : 'border-b border-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-md focus:bg-text focus:px-3 focus:py-2 focus:text-ink">Skip to content</a>
      <div className="shell flex h-14 items-center justify-between sm:h-16">
        <Link to="/" className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-text">{profile.name}</Link>
        <nav aria-label="Main" className="flex items-center gap-5 sm:gap-8">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} aria-current={active(n.to) ? 'page' : undefined}
              className={`font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${active(n.to) ? 'text-text' : 'text-muted hover:text-text'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-medium text-text">{profile.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{profile.roles.join(' · ')}</p>
        </div>
        <div>
          <p className="label">Brands</p>
          <ul className="mt-4 space-y-2 text-sm">
            {brands.map((b) => <li key={b.slug}><Link to={`/work/${b.slug}`} className="text-muted transition-colors hover:text-text">{b.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="label">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => <li key={n.label}><Link to={n.to} className="text-muted transition-colors hover:text-text">{n.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="shell flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] uppercase tracking-[0.1em] text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Artwork shown belongs to the respective brands</p>
      </div>
    </footer>
  );
}

function BackToTop() {
  const show = useScrolled(1200);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-panel text-text transition-all duration-300 hover:bg-panel-2 ${show ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
      <Icon name="arrowUp" className="h-4 w-4" />
    </button>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const immersive = pathname === '/playground';
  return (
    <>
      <ScrollManager />
      {pathname !== '/' && <Header />}
      <main id="main" key={pageKey(pathname)} className="page-in min-h-[70vh]">
        <Outlet />
      </main>
      {!immersive && pathname !== '/' && <Footer />}
      {!immersive && pathname !== '/' && <BackToTop />}
    </>
  );
}
