import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';
import { useDocumentTitle } from '../lib/hooks';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center pt-24">
      <p className="label">Error 404</p>
      <h1 className="mt-5 text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[1] tracking-[-0.04em] text-text">Page <span className="serif font-normal">not found.</span></h1>
      <p className="mt-5 max-w-md text-[15px] text-muted">This page doesn't exist — it may have been moved or renamed.</p>
      <Link to="/" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-medium text-ink">Back home <Icon name="arrowRight" className="h-4 w-4" /></Link>
    </section>
  );
}
