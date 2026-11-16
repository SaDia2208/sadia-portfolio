import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icon } from './ui';
import { brandBySlug, categoryBySlug, cssAspect, formatDate } from '../lib/content';

/**
 * One lightbox for every gallery.
 * items: [{ media: {type, src, alt, poster, aspect, caption}, project }]
 * - Images: zoom (click / Z key), pan by scrolling or dragging when zoomed.
 * - Videos: native controls (play/pause, volume, fullscreen); never autoplays muted in the background.
 * - Keyboard: ← → navigate, Esc closes, Z zoom, F fullscreen, I info.
 * - Touch: horizontal swipe navigates.
 */
export default function Viewer({ items, index, onIndex, onClose, mode = 'gallery', projectLink = false }) {
  const total = items.length;
  const current = items[index];
  const { media, project } = current || {};
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const focal = useRef({ x: 0.5, y: 0.5 });
  const pointer = useRef(null);
  const [zoom, setZoom] = useState(0); // 0 = fit, otherwise px width
  const [isFs, setIsFs] = useState(false);
  const [showInfo, setShowInfo] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const canFs = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  const go = useCallback((d) => {
    const n = index + d;
    if (n >= 0 && n < total) onIndex(n);
  }, [index, total, onIndex]);

  const toggleZoom = useCallback((e) => {
    if (media?.type !== 'image') return;
    if (zoom) return setZoom(0);
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    focal.current = e?.clientX != null
      ? { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
      : { x: 0.5, y: 0.5 };
    setZoom(Math.max(r.width * 2.2, Math.min(img.naturalWidth || 0, r.width * 3.5)));
  }, [zoom, media]);

  const toggleFs = useCallback(() => {
    if (!canFs) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else dialogRef.current?.requestFullscreen?.().catch(() => {});
  }, [canFs]);

  // Centre the zoomed image on the clicked point.
  useLayoutEffect(() => {
    const s = stageRef.current;
    if (!s || !zoom) return;
    s.scrollLeft = focal.current.x * s.scrollWidth - s.clientWidth / 2;
    s.scrollTop = focal.current.y * s.scrollHeight - s.clientHeight / 2;
  }, [zoom]);

  useEffect(() => setZoom(0), [index]);

  // Scroll lock + focus management.
  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return; // browser exits fullscreen first
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' && tag !== 'VIDEO') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' && tag !== 'VIDEO') { e.preventDefault(); go(-1); }
      else if (e.key.toLowerCase() === 'z') toggleZoom();
      else if (e.key.toLowerCase() === 'f') toggleFs();
      else if (e.key.toLowerCase() === 'i') setShowInfo((v) => !v);
      else if (e.key === 'Tab') {
        // Keep focus inside the dialog.
        const f = dialogRef.current?.querySelectorAll('button:not([disabled]), a[href], video, iframe, [tabindex]:not([tabindex="-1"])');
        if (!f?.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose, toggleZoom, toggleFs]);

  // Swipe (images only, not while zoomed) + drag-to-pan when zoomed.
  const onPointerDown = (e) => {
    pointer.current = { x: e.clientX, y: e.clientY, sl: stageRef.current?.scrollLeft, st: stageRef.current?.scrollTop, moved: false, type: e.pointerType };
  };
  const onPointerMove = (e) => {
    const p = pointer.current;
    if (!p) return;
    if (Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y) > 6) p.moved = true;
    if (zoom && p.type === 'mouse' && stageRef.current) {
      stageRef.current.scrollLeft = p.sl - (e.clientX - p.x);
      stageRef.current.scrollTop = p.st - (e.clientY - p.y);
    }
  };
  const onPointerUp = (e) => {
    const p = pointer.current;
    pointer.current = null;
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (!zoom && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
    else if (!p.moved && e.target === imgRef.current) toggleZoom(e);
  };

  if (!current) return null;
  const brand = brandBySlug[project.brand];
  const cat = categoryBySlug[project.category];
  const isImage = media.type === 'image';
  const caption = media.caption;

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${project.title} — viewer`}
      className="page-in fixed inset-0 z-[100] flex flex-col bg-ink text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{project.title}</p>
          <p className="truncate text-xs text-white/50">
            {brand?.name} · {cat?.label}
            {total > 1 && <span className="ml-2 tabular-nums text-text" aria-live="polite">{mode === 'slides' ? 'Slide ' : ''}{index + 1} / {total}</span>}
          </p>
        </div>
        {isImage && (
          <ToolButton label={zoom ? 'Zoom out (Z)' : 'Zoom in (Z)'} onClick={() => toggleZoom()} icon={zoom ? 'zoomOut' : 'zoomIn'} active={!!zoom} />
        )}
        {canFs && <ToolButton label={isFs ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} onClick={toggleFs} icon={isFs ? 'shrink' : 'expand'} />}
        <ToolButton label="Project details (I)" onClick={() => setShowInfo((v) => !v)} icon="info" active={showInfo} always />
        <button ref={closeRef} onClick={onClose} aria-label="Close viewer (Esc)"
          className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition hover:bg-text">
          <Icon name="close" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Stage */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div ref={stageRef}
            className={`relative min-h-0 flex-1 ${zoom ? 'cursor-grab overflow-auto active:cursor-grabbing' : 'overflow-hidden'} ${isImage ? 'touch-pan-y' : ''}`}
            style={zoom ? { touchAction: 'pan-x pan-y' } : undefined}
            onPointerDown={isImage ? onPointerDown : undefined}
            onPointerMove={isImage ? onPointerMove : undefined}
            onPointerUp={isImage ? onPointerUp : undefined}
            onPointerCancel={() => (pointer.current = null)}>
            <div className={zoom ? 'flex h-max min-h-full w-max min-w-full items-center justify-center p-4' : 'flex h-full w-full items-center justify-center p-3 sm:p-8'}>
              <MediaView key={`${index}-${media.src}`} media={media} imgRef={imgRef} zoom={zoom} title={project.title} />
            </div>
          </div>

          {total > 1 && (
            <>
              <NavButton side="left" disabled={index === 0} onClick={() => go(-1)} />
              <NavButton side="right" disabled={index === total - 1} onClick={() => go(1)} />
            </>
          )}

          {(total > 1 || caption) && (
            <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-1">
              {caption && <p className="text-xs text-white/60">{caption}</p>}
              {total > 1 && total <= 24 && (
                <div className="flex flex-wrap justify-center gap-1.5" role="tablist" aria-label="Choose item">
                  {items.map((_, i) => (
                    <button key={i} role="tab" aria-selected={i === index} aria-label={`Go to ${mode === 'slides' ? 'slide' : 'item'} ${i + 1}`}
                      onClick={() => onIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-text' : 'w-1.5 bg-white/30 hover:bg-white/60'}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info panel */}
        {showInfo && (
          <aside className="absolute inset-x-0 bottom-0 z-10 max-h-[55%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-panel p-6 lg:static lg:max-h-none lg:w-[340px] lg:rounded-none lg:border-l lg:border-t-0">
            <div className="mb-4 flex items-start justify-between gap-3 lg:hidden">
              <span className="eyebrow text-text">Details</span>
              <button onClick={() => setShowInfo(false)} className="text-xs text-white/60 underline">Hide</button>
            </div>
            <ProjectDetails project={project} dark />
            {projectLink && (
              <Link to={project.url} onClick={onClose} className="mt-6 inline-flex items-center gap-2 rounded-full bg-text px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink">
                Open project page <Icon name="arrowUpRight" className="h-4 w-4" />
              </Link>
            )}
          </aside>
        )}
      </div>
    </div>,
    document.body,
  );
}

function MediaView({ media, imgRef, zoom, title }) {
  if (media.type === 'image') {
    return (
      <img ref={imgRef} src={media.src} alt={media.alt || title} draggable={false}
        className={`select-none ${zoom ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain'}`}
        style={zoom ? { width: zoom, height: 'auto' } : undefined} />
    );
  }
  const ratio = cssAspect(media.aspect) || '16 / 9';
  const box = { aspectRatio: ratio, maxHeight: '100%', maxWidth: '100%' };
  const [w, h] = (media.aspect || '16:9').split(':').map(Number);
  // Size to fit the stage while keeping ratio.
  const style = { ...box, height: w / h < 1 ? '100%' : 'auto', width: w / h < 1 ? 'auto' : '100%' };
  if (media.type === 'video') {
    return (
      <video src={media.src} poster={media.poster} controls playsInline preload="metadata"
        className="rounded-lg bg-black" style={style} aria-label={title}>
        Your browser can't play this video.
      </video>
    );
  }
  return (
    <iframe src={media.src} title={title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen loading="lazy" className="rounded-lg bg-black" style={style} />
  );
}

function ToolButton({ label, onClick, icon, active, always = false }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} aria-pressed={active}
      className={`${always ? 'grid' : 'hidden sm:grid'} h-10 w-10 place-items-center rounded-full border transition ${active ? 'border-text text-text' : 'border-white/15 text-white/80 hover:border-white/50 hover:text-white'}`}>
      <Icon name={icon} />
    </button>
  );
}

function NavButton({ side, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={side === 'left' ? 'Previous' : 'Next'}
      className={`absolute top-1/2 z-[5] grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-text hover:text-ink disabled:pointer-events-none disabled:opacity-0 sm:h-14 sm:w-14 ${side === 'left' ? 'left-2 sm:left-5' : 'right-2 sm:right-5'}`}>
      <Icon name={side === 'left' ? 'arrowLeft' : 'arrowRight'} />
    </button>
  );
}

export function ProjectDetails({ project, dark = false }) {
  const brand = brandBySlug[project.brand];
  const cat = categoryBySlug[project.category];
  const muted = dark ? 'text-white/55' : 'text-ink/55';
  const rows = [
    ['Brand', brand?.name],
    ['Category', cat?.longLabel || cat?.label],
    ['Date', formatDate(project.date)],
    ['Tools', project.tools.join(', ')],
  ].filter(([, v]) => v);
  return (
    <div className="space-y-5 text-sm">
      {project.status === 'draft' && <span className="inline-block rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-ink">DRAFT — not visible on live site</span>}
      {project.title && <h3 className="font-display text-3xl leading-tight">{project.title}</h3>}
      {project.description && <p className={`leading-relaxed ${dark ? 'text-white/80' : ''}`}>{project.description}</p>}
      {project.objective && (
        <div><p className={`eyebrow mb-1.5 ${muted}`}>Objective</p><p className="leading-relaxed">{project.objective}</p></div>
      )}
      {project.contribution && (
        <div><p className={`eyebrow mb-1.5 ${muted}`}>My contribution</p><p className="leading-relaxed">{project.contribution}</p></div>
      )}
      <dl className={`grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t pt-4 ${dark ? 'border-white/10' : 'border-ink/15'}`}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents"><dt className={muted}>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span key={t} className={`rounded-full px-2.5 py-1 text-[11px] ${dark ? 'bg-white/10' : 'bg-ink/5'}`}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
