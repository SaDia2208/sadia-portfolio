import { Icon, Magnetic } from '../components/ui';
import { useDocumentTitle } from '../lib/hooks';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="grain relative flex min-h-[90svh] flex-col justify-center overflow-hidden bg-ink pt-24">
      <p className="display hollow pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[48vw] leading-none text-white/10" aria-hidden="true">404</p>
      <div className="wrap relative">
        <p className="eyebrow text-lime">Error 404</p>
        <h1 className="display mt-6 text-[18vw] leading-[0.84] lg:text-[10vw]">Lost the <span className="serif text-coral">thread.</span></h1>
        <p className="mt-6 max-w-md text-lg text-paper/70">This page doesn't exist — it may have been moved or renamed.</p>
        <Magnetic to="/work" className="mt-10 items-center gap-2 rounded-full bg-lime px-7 py-4 text-sm font-bold uppercase tracking-wider text-ink">
          Back to the work <Icon name="arrowRight" className="h-4 w-4" />
        </Magnetic>
      </div>
    </section>
  );
}
