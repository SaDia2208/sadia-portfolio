import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../lib/hooks';

const paths = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 9h16M4 15h16',
  play: 'M8 5.5v13l11-6.5z',
  zoomIn: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4M11 8v6M8 11h6',
  zoomOut: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4M8 11h6',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  shrink: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8h.01',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  star: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z',
};

export function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.8, filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

/** Fades/rises content as it enters the viewport. variant="wipe" uncovers it with a clip mask instead. */
export function Reveal({ as: Tag = 'div', delay = 0, variant = 'reveal', className = '', style, children, ...rest }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -10% 0px' });
  return (
    <Tag ref={ref} className={`${variant} ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/** Headline lines that slide up out of a mask, one after another. */
export function Lines({ lines, delay = 0, step = 110, className = '' }) {
  return lines.map((l, i) => (
    <span key={i} className={`line-mask ${l.className || ''} ${className}`}>
      <span style={{ animationDelay: `${delay + i * step}ms` }}>{l.text}</span>
    </span>
  ));
}

/** Image that keeps its original proportions unless `fit` is set. Lazy, with a skeleton. */
export function Img({ src, alt = '', className = '', imgClassName = '', fit = 'natural', eager = false, aspect, style }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const fixed = fit !== 'natural';
  return (
    <div className={`${className.split(" ").includes("absolute") ? "" : "relative"} overflow-hidden ${!loaded && !failed ? 'skeleton' : ''} ${className}`}
      style={{ ...(aspect ? { aspectRatio: aspect } : !loaded && !fixed ? { aspectRatio: '4 / 5' } : {}), ...style }}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-ash text-smoke">
          <span className="flex flex-col items-center gap-2 text-xs"><Icon name="image" className="h-6 w-6" />Image not found</span>
        </div>
      ) : (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
          className={`${fixed ? `absolute inset-0 h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}` : 'block h-auto w-full'} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`} />
      )}
    </div>
  );
}

/**
 * A slot in a composition reserved for real artwork. Shows the project cover when one exists;
 * otherwise a clearly labelled empty frame — never a fake design.
 */
export function ArtSlot({ project, tone = '#1a1a1a', ink = '#f4f1ea', label, className = '', aspect = '4 / 5', fit = 'cover', style }) {
  if (project?.cover) {
    return (
      // Artwork is shown whole, at its own proportions — never cropped.
      <Link to={project.url} className={`group relative block overflow-hidden ${className}`} style={style} aria-label={`View ${project.title}`}>
        <Img src={project.cover} alt="" imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
      </Link>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect, background: tone, color: ink, ...style }} aria-hidden="true">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)` }} />
      <div className="absolute inset-3 border border-current/40" />
      <span className="absolute bottom-4 left-4 right-4 text-[9px] font-bold uppercase leading-snug tracking-[0.22em] opacity-80">
        {label || 'Artwork slot'}<br /><span className="opacity-60">awaiting upload</span>
      </span>
    </div>
  );
}

/** Button/link that leans toward the pointer. */
export function Magnetic({ to, href, onClick, className = '', children, strength = 0.3, ...rest }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };
  const props = { ref, onPointerMove: move, onPointerLeave: reset, className: `inline-flex transition-transform duration-300 ease-out ${className}`, ...rest };
  if (to) return <Link to={to} {...props}>{children}</Link>;
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button type="button" onClick={onClick} {...props}>{children}</button>;
}

/** Kinetic type band. */
export function Marquee({ items, className = '', reverse = false, sep = '✦' }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div className={`${reverse ? 'marquee-rev' : 'marquee'} flex w-max`}>
        {row.map((w, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6">{w}</span><span className="px-2 text-[0.6em]">{sep}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title = 'New work coming soon', children, dark = true }) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden border px-6 py-20 text-center sm:py-28 ${dark ? 'border-white/12 text-smoke' : 'border-ink/15 text-ink/60'}`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 16px)' }} />
      <p className={`display relative text-4xl sm:text-6xl ${dark ? 'text-paper' : 'text-ink'}`}>{title}</p>
      {children && <p className="relative mt-4 max-w-md text-sm leading-relaxed">{children}</p>}
    </div>
  );
}

/** Chapter marker used across the site: "01 — The Statement". */
export function Chapter({ n, title, className = '' }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      <span className="font-display text-base tracking-normal">{n}</span>
      <span className="h-px w-10 bg-current opacity-50" />
      {title}
    </p>
  );
}

export function SlideBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-lime backdrop-blur">
      <Icon name="layers" className="h-3.5 w-3.5" /> {count} SLIDES
    </span>
  );
}

export function PlayBadge({ large = false }) {
  return (
    <span className={`grid place-items-center rounded-full bg-lime text-ink transition-transform duration-500 group-hover:scale-110 ${large ? 'h-20 w-20' : 'h-14 w-14'}`}>
      <Icon name="play" filled className={large ? 'ml-1 h-8 w-8' : 'ml-0.5 h-6 w-6'} />
    </span>
  );
}

/** The portrait, art-directed: masked frame, offset colour plate, no filters on the photo. */
export function Portrait({ src, alt, shape = 'arch', className = '', plate = '#d7ff3f', focus = '50% 62%', zoom = 1.3, eager = false }) {
  const radius = shape === 'arch' ? 'rounded-t-[999px]' : shape === 'pill' ? 'rounded-[999px]' : '';
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5 ${radius}`} style={{ background: plate }} aria-hidden="true" />
      <div className={`relative h-full w-full overflow-hidden bg-[#e9e9eb] ${radius}`}>
        {src ? (
          <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
            className="absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${zoom})`, transformOrigin: focus }} />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-ash font-display text-6xl text-lime">SA</div>
        )}
      </div>
    </div>
  );
}
