import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Viewer from '../components/Viewer';
import { Icon } from '../components/ui';
import { brands, categoryBySlug, projects } from '../lib/content';
import { useDocumentTitle } from '../lib/hooks';

/* ============================================================
   THE PLAYGROUND — an explorable exhibition wall.
   - Each brand is an "island"; its artwork is arranged in a sunflower (phyllotaxis) pattern,
     featured pieces larger. Islands sit on a ring around a central title.
   - Pan: drag / wheel / arrow keys. Zoom: ctrl+wheel, pinch, + / − buttons. Reset: 0 or button.
   - All movement is a single CSS transform on one layer, written in rAF — no per-frame React renders.
   - Content comes from project data, so new published work appears here automatically.
   ============================================================ */

const GOLDEN = 2.399963;
const SPACING = 340;
const MIN_S = 0.25;
const MAX_S = 1.8;
const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function itemSize(p) {
  const m = p.media[0];
  if (p.layout === 'banner') return { w: 620, ratio: 16 / 9 };
  if (m.type !== 'image' && m.aspect) {
    const [a, b] = m.aspect.split(':').map(Number);
    return { w: a > b ? 560 : 300, ratio: a / b };
  }
  return { w: p.featured ? 380 : 290, ratio: 0.8 };
}

function buildLayout() {
  const pool = projects.filter((p) => p.cover && p.status !== 'draft');
  const groups = brands.map((b) => {
    const list = pool.filter((p) => p.brand === b.slug).sort((a, c) => (c.featured - a.featured) || a.order - c.order);
    const radius = SPACING * Math.sqrt(Math.max(list.length, 1)) + 220;
    return { brand: b, list, radius };
  });
  const maxR = Math.max(...groups.map((g) => g.radius));
  const ring = maxR + 480;
  const items = [];
  const islands = groups.map((g, i) => {
    const angle = (-135 + (i * 360) / groups.length) * (Math.PI / 180);
    const cx = Math.cos(angle) * ring;
    const cy = Math.sin(angle) * ring * 0.82;
    g.list.forEach((p, k) => {
      const r = SPACING * Math.sqrt(k + 0.4) * (k ? 1 : 0);
      const t = k * GOLDEN + i;
      const { w, ratio } = itemSize(p);
      items.push({
        p, w, h: w / ratio,
        x: cx + Math.cos(t) * r * 1.08,
        y: cy + Math.sin(t) * r * 1.05,
        rot: ((k * 37 + i * 13) % 9) - 4, // deterministic, gentle tilt
      });
    });
    // Island outline (artwork + label) — used to frame the island when jumping to it.
    const mine = items.filter((it) => it.p.brand === g.brand.slug);
    const labelTop = cy < 0 ? cy - g.radius - 420 : cy + g.radius + 140;
    const xs0 = mine.flatMap((it) => [it.x - it.w / 2, it.x + it.w / 2]).concat([cx - 700, cx + 700]);
    const ys0 = mine.flatMap((it) => [it.y - it.h / 2, it.y + it.h / 2]).concat([labelTop, labelTop + 360]);
    const box = { minX: Math.min(...xs0), maxX: Math.max(...xs0), minY: Math.min(...ys0), maxY: Math.max(...ys0) };
    return { ...g, cx, cy, labelTop, box };
  });
  const xs = items.map((it) => it.x).concat(islands.map((s) => s.cx));
  const ys = items.map((it) => it.y).concat(islands.map((s) => s.cy));
  const pad = 900;
  const bounds = { minX: Math.min(0, ...xs) - pad, maxX: Math.max(0, ...xs) + pad, minY: Math.min(0, ...ys) - pad, maxY: Math.max(0, ...ys) + pad };
  return { items, islands, bounds };
}

export default function Playground() {
  useDocumentTitle('Playground', 'An explorable wall of creative work by Sadia Akter.');
  const { items, islands, bounds } = useMemo(buildLayout, []);
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const mapRectRef = useRef(null);
  const zoomLabelRef = useRef(null);
  const view = useRef({ x: 0, y: 0, s: 0.55 });
  const drag = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const inertia = useRef(0);
  const moved = useRef(false);
  const [open, setOpen] = useState(-1);
  const [hover, setHover] = useState(null);
  const [listView, setListView] = useState(false);
  const [hint, setHint] = useState(true);
  const tipRef = useRef(null);

  const home = useCallback(() => {
    const st = stageRef.current;
    const vw = st?.clientWidth || innerWidth, vh = st?.clientHeight || innerHeight;
    const s = vw < 700 ? 0.27 : Math.min(0.55, vw / 2700);
    return { x: vw / 2, y: vh / 2, s };
  }, []);

  /* ---------- render the view (transform + minimap) ---------- */
  const apply = useCallback(() => {
    const st = stageRef.current, w = worldRef.current;
    if (!st || !w) return;
    const v = view.current;
    const vw = st.clientWidth, vh = st.clientHeight;
    // keep part of the world on screen
    v.s = Math.min(MAX_S, Math.max(MIN_S, v.s));
    v.x = Math.min(vw / 2 - bounds.minX * v.s, Math.max(vw / 2 - bounds.maxX * v.s, v.x));
    v.y = Math.min(vh / 2 - bounds.minY * v.s, Math.max(vh / 2 - bounds.maxY * v.s, v.y));
    w.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`;
    if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(v.s * 100)}%`;
    const r = mapRectRef.current;
    if (r) {
      const W = bounds.maxX - bounds.minX, H = bounds.maxY - bounds.minY;
      r.style.left = `${((-v.x / v.s - bounds.minX) / W) * 100}%`;
      r.style.top = `${((-v.y / v.s - bounds.minY) / H) * 100}%`;
      r.style.width = `${(vw / v.s / W) * 100}%`;
      r.style.height = `${(vh / v.s / H) * 100}%`;
    }
  }, [bounds]);

  const animateTo = useCallback((target, ms = 700) => {
    cancelAnimationFrame(inertia.current);
    const from = { ...view.current };
    if (prefersReduced()) { Object.assign(view.current, target); apply(); return; }
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const k = ease(Math.min(1, (now - start) / ms));
      view.current = { x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k, s: from.s + (target.s - from.s) * k };
      apply();
      if (k < 1) inertia.current = requestAnimationFrame(step);
    };
    inertia.current = requestAnimationFrame(step);
  }, [apply]);

  const zoomAt = useCallback((factor, sx, sy) => {
    const v = view.current;
    const ns = Math.min(MAX_S, Math.max(MIN_S, v.s * factor));
    const wx = (sx - v.x) / v.s, wy = (sy - v.y) / v.s;
    view.current = { s: ns, x: sx - wx * ns, y: sy - wy * ns };
    apply();
  }, [apply]);

  const focusWorldPoint = useCallback((wx, wy, s = view.current.s) => {
    const st = stageRef.current;
    animateTo({ s, x: st.clientWidth / 2 - wx * s, y: st.clientHeight / 2 - wy * s });
  }, [animateTo]);

  useEffect(() => {
    view.current = home();
    apply();
    const onResize = () => apply();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(inertia.current); };
  }, [apply, home]);

  /* ---------- wheel: pan, or zoom with ctrl / trackpad pinch ---------- */
  useEffect(() => {
    const st = stageRef.current;
    const onWheel = (e) => {
      if (listView || open >= 0) return;
      e.preventDefault();
      cancelAnimationFrame(inertia.current);
      setHint(false);
      const rect = st.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top);
      else { view.current.x -= e.deltaX; view.current.y -= e.deltaY; apply(); }
    };
    st.addEventListener('wheel', onWheel, { passive: false });
    return () => st.removeEventListener('wheel', onWheel);
  }, [apply, zoomAt, listView, open]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (open >= 0 || listView) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const step = 140, st = stageRef.current;
      const map = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (map[e.key]) {
        e.preventDefault();
        const v = view.current;
        animateTo({ ...v, x: v.x + map[e.key][0], y: v.y + map[e.key][1] }, 280);
      } else if (e.key === '+' || e.key === '=') zoomAt(1.2, st.clientWidth / 2, st.clientHeight / 2);
      else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.2, st.clientWidth / 2, st.clientHeight / 2);
      else if (e.key === '0') animateTo(home());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [animateTo, zoomAt, home, open, listView]);

  /* ---------- pointer: drag with inertia, two-finger pinch ---------- */
  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cancelAnimationFrame(inertia.current);
    setHint(false);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.current.s };
      drag.current = null;
      return;
    }
    moved.current = false;
    drag.current = { x: e.clientX, y: e.clientY, vx: 0, vy: 0, t: performance.now(), sx: e.clientX, sy: e.clientY };
  };
  const onPointerMove = (e) => {
    if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`;
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const rect = stageRef.current.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const target = pinch.current.s * (d / pinch.current.d);
      zoomAt(target / view.current.s, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      moved.current = true;
      return;
    }
    const dr = drag.current;
    if (!dr) return;
    const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
    if (!moved.current && Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) > 6) {
      moved.current = true;
      stageRef.current.setPointerCapture?.(e.pointerId);
    }
    if (!moved.current) return;
    const now = performance.now(), dt = Math.max(1, now - dr.t);
    dr.vx = dx / dt; dr.vy = dy / dt; dr.x = e.clientX; dr.y = e.clientY; dr.t = now;
    view.current.x += dx; view.current.y += dy;
    apply();
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const dr = drag.current;
    drag.current = null;
    if (!dr || !moved.current || prefersReduced()) return;
    let { vx, vy } = dr;
    let last = performance.now();
    const glide = (now) => {
      const dt = now - last; last = now;
      view.current.x += vx * dt; view.current.y += vy * dt;
      vx *= Math.pow(0.94, dt / 16); vy *= Math.pow(0.94, dt / 16);
      apply();
      if (Math.hypot(vx, vy) > 0.02) inertia.current = requestAnimationFrame(glide);
    };
    if (Math.hypot(vx, vy) > 0.1) inertia.current = requestAnimationFrame(glide);
  };

  const openItem = (i, e) => {
    if (moved.current && e.detail !== 0) return; // it was a drag, not a click (keyboard clicks have detail 0)
    setHover(null);
    setOpen(i);
  };

  const viewerItems = useMemo(() => items.map((it) => ({ media: it.p.media[0].type === 'image' ? it.p.media[0] : { type: 'image', src: it.p.cover, alt: it.p.title }, project: it.p })), [items]);
  const W = bounds.maxX - bounds.minX, H = bounds.maxY - bounds.minY;

  return (
    <section className="relative h-[100svh] overflow-hidden bg-ink" aria-label="Creative playground">
      <h1 className="sr-only">The creative playground — an explorable wall of Sadia Akter's work</h1>

      {/* ---------- canvas ---------- */}
      <div ref={stageRef} className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}>
        {/* dotted floor that moves with the world */}
        <div ref={worldRef} className="absolute left-0 top-0 origin-top-left will-change-transform">
          <div className="pointer-events-none absolute" aria-hidden="true"
            style={{ left: bounds.minX, top: bounds.minY, width: W, height: H, backgroundImage: 'radial-gradient(rgba(245,243,235,0.13) 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

          {/* islands: glow + label */}
          {islands.map((isl, i) => (
            <div key={isl.brand.slug} aria-hidden="true">
              <span className="pointer-events-none absolute rounded-full" style={{
                left: isl.cx - isl.radius - 260, top: isl.cy - isl.radius - 260, width: (isl.radius + 260) * 2, height: (isl.radius + 260) * 2,
                background: `radial-gradient(circle, ${isl.brand.theme.accent}33 0%, ${isl.brand.theme.accent}10 45%, transparent 70%)`,
              }} />
              <div className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-center" style={{ left: isl.cx, top: isl.labelTop }}>
                <p className="font-display text-[64px] leading-none" style={{ color: isl.brand.theme.accent }}>{String(i + 1).padStart(2, '0')}</p>
                <p className="display hollow text-[230px] leading-[0.85] text-paper/80">{isl.brand.name}</p>
                <p className="mt-4 text-[26px] font-bold uppercase tracking-[0.3em] text-paper/50">{isl.brand.industry}</p>
              </div>
            </div>
          ))}

          {/* centre title */}
          <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: 0, top: 0 }} aria-hidden="true">
            <p className="serif text-[72px] leading-none text-lime">the creative</p>
            <p className="display text-[220px] leading-[0.82] text-paper">Playground</p>
            <p className="mt-6 text-[28px] font-bold uppercase tracking-[0.3em] text-paper/50">Drag · Scroll · Pinch · Click a piece</p>
          </div>

          {/* artwork */}
          {items.map((it, i) => (
            <button key={it.p.id} type="button"
              className="group absolute block -translate-x-1/2 -translate-y-1/2 outline-offset-8 focus-visible:outline-4"
              style={{ left: it.x, top: it.y, width: it.w, rotate: `${it.rot}deg` }}
              onClick={(e) => openItem(i, e)}
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && focusWorldPoint(it.x, it.y, Math.max(view.current.s, 0.7))}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(it.p)}
              onPointerLeave={() => setHover(null)}
              aria-label={`${it.p.title} — ${brands.find((b) => b.slug === it.p.brand)?.name}. Open`}>
              <span className="block shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-3 group-hover:scale-[1.04]">
                <img src={it.p.cover} alt="" draggable={false} loading="lazy" decoding="async" className="block h-auto w-full bg-ash" style={{ minHeight: it.h * 0.5 }} />
              </span>
              {it.p.featured && <span className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-lime text-ink" aria-hidden="true"><Icon name="star" filled className="h-5 w-5" /></span>}
            </button>
          ))}
        </div>
      </div>

      {/* keeps the nav and controls legible over moving artwork */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-44 bg-gradient-to-b from-ink via-ink/80 to-transparent" aria-hidden="true" />

      {/* hover tooltip (screen space so it stays readable at any zoom) */}
      <div ref={tipRef} className={`pointer-events-none fixed left-0 top-0 z-30 max-w-xs bg-paper px-4 py-3 text-ink shadow-xl transition-opacity duration-200 ${hover ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
        {hover && (
          <>
            <p className="eyebrow text-ink/60">{brands.find((b) => b.slug === hover.brand)?.name} · {categoryBySlug[hover.category]?.label}</p>
            <p className="mt-1 font-display text-2xl uppercase leading-none">{hover.title}</p>
          </>
        )}
      </div>

      {/* first-visit hint */}
      {hint && (
        <div className="fade-up pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-4 sm:bottom-10" aria-hidden="true">
          <p className="rounded-full bg-paper/95 px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-ink shadow-xl">
            <span className="hidden sm:inline">Drag or scroll to explore · ctrl + scroll to zoom</span>
            <span className="sm:hidden">Drag to explore · pinch to zoom · tap to open</span>
          </p>
        </div>
      )}

      {/* ---------- controls ---------- */}
      <div className="absolute right-4 top-32 z-20 flex flex-row items-end gap-2 sm:right-6 sm:top-24 sm:flex-col">
        <button onClick={() => setListView(true)} className="flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-lime">
          <Icon name="menu" className="h-4 w-4" /> List view
        </button>
        <Link to="/work" className="flex items-center gap-2 rounded-full border border-white/25 bg-ink/70 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-paper backdrop-blur hover:border-lime hover:text-lime">
          Portfolio <Icon name="arrowUpRight" className="h-4 w-4" />
        </Link>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full border border-white/15 bg-ink/80 p-1 text-paper backdrop-blur sm:bottom-6 sm:right-6" role="group" aria-label="Canvas controls">
        <CtrlButton label="Zoom out (−)" onClick={() => { const st = stageRef.current; zoomAt(1 / 1.25, st.clientWidth / 2, st.clientHeight / 2); }}><span className="text-xl leading-none">−</span></CtrlButton>
        <span ref={zoomLabelRef} className="w-12 text-center text-xs font-bold tabular-nums" aria-live="polite" />
        <CtrlButton label="Zoom in (+)" onClick={() => { const st = stageRef.current; zoomAt(1.25, st.clientWidth / 2, st.clientHeight / 2); }}><span className="text-xl leading-none">+</span></CtrlButton>
        <button onClick={() => animateTo(home())} className="ml-1 rounded-full bg-lime px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink" aria-label="Reset view (0)">Reset</button>
      </div>

      {/* minimap — click to travel */}
      <div className="absolute bottom-6 left-6 z-20 hidden h-[120px] w-[170px] overflow-hidden rounded-lg border border-white/15 bg-ink/80 backdrop-blur sm:block"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          focusWorldPoint(bounds.minX + ((e.clientX - r.left) / r.width) * W, bounds.minY + ((e.clientY - r.top) / r.height) * H);
        }}
        role="button" tabIndex={-1} aria-label="Mini map">
        {islands.map((isl) => (
          <span key={isl.brand.slug} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${((isl.cx - bounds.minX) / W) * 100}%`, top: `${((isl.cy - bounds.minY) / H) * 100}%`, background: isl.brand.theme.accent }} />
        ))}
        <span ref={mapRectRef} className="pointer-events-none absolute border border-lime bg-lime/10" />
      </div>

      {/* brand jump bar */}
      <nav className="no-scrollbar absolute left-4 right-4 top-20 z-10 flex gap-2 overflow-x-auto sm:left-6 sm:right-auto sm:top-24" aria-label="Jump to brand">
        {islands.map((isl) => (
          <button key={isl.brand.slug} onClick={() => {
              const st = stageRef.current, b = isl.box;
              const fit = Math.min((st.clientWidth * 0.92) / (b.maxX - b.minX), ((st.clientHeight - 170) * 0.92) / (b.maxY - b.minY), 0.75);
              focusWorldPoint((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2 - 40 / fit, fit);
            }}
            className="shrink-0 rounded-full border border-white/20 bg-ink/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-paper backdrop-blur transition hover:border-transparent"
            onMouseEnter={(e) => { e.currentTarget.style.background = isl.brand.theme.accent; e.currentTarget.style.color = '#090909'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
            {isl.brand.name}
          </button>
        ))}
      </nav>

      {/* ---------- accessible list alternative ---------- */}
      {listView && <ListView onClose={() => setListView(false)} />}

      {open >= 0 && <Viewer items={viewerItems} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} projectLink />}
    </section>
  );
}

function CtrlButton({ label, onClick, children }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">{children}</button>
  );
}

function ListView({ onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="All playground work as a list" className="page-in fixed inset-0 z-[70] overflow-y-auto bg-paper text-ink">
      <div className="wrap py-8">
        <div className="flex items-center justify-between">
          <p className="display text-4xl sm:text-6xl">All pieces</p>
          <button ref={closeRef} onClick={onClose} className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold uppercase tracking-wider text-lime">Back to canvas <Icon name="close" className="h-4 w-4" /></button>
        </div>
        {brands.map((b) => {
          const list = projects.filter((p) => p.brand === b.slug && p.cover && p.status !== 'draft');
          if (!list.length) return null;
          return (
            <section key={b.slug} className="mt-12">
              <h2 className="eyebrow border-b border-ink/15 pb-3" style={{ color: b.slug === 'active-arabia' ? '#c2401f' : undefined }}>{b.name}</h2>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
                {list.map((p) => (
                  <li key={p.id}>
                    <Link to={p.url} className="group block">
                      <img src={p.cover} alt="" loading="lazy" className="block h-auto w-full bg-ink/5 transition-transform duration-500 group-hover:-translate-y-1" />
                      <span className="mt-2 block text-sm font-semibold leading-snug">{p.title}</span>
                      <span className="text-xs text-ink/55">{categoryBySlug[p.category]?.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
