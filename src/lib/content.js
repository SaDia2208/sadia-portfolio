/**
 * Content layer. Every portfolio record lives in /content as JSON:
 *   content/brands/<brand>.json
 *   content/projects/<brand>/<category>/<project-slug>.json
 *   content/settings/*.json
 * Pages never hard-code projects — they read from here, so adding a JSON file
 * (via the CMS or by hand) is all it takes to publish new work.
 */
import profile from '../../content/settings/profile.json';
import experience from '../../content/settings/experience.json';
import skills from '../../content/settings/skills.json';
import categoriesFile from '../../content/settings/categories.json';

const brandModules = import.meta.glob('../../content/brands/*.json', { eager: true, import: 'default' });
const projectModules = import.meta.glob('../../content/projects/**/*.json', { eager: true, import: 'default' });

export { profile, experience, skills };

export const categories = categoriesFile.categories;
export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

export const brands = Object.values(brandModules).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
export const brandBySlug = Object.fromEntries(brands.map((b) => [b.slug, b]));

const SHOW_DRAFTS = import.meta.env.DEV;

/** Turns a YouTube / Vimeo / MP4 link into a playable media item. */
export function parseVideoUrl(url, extra = {}) {
  if (!url) return null;
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) {
    return { type: 'embed', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`, poster: extra.poster || `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`, provider: 'YouTube', ...strip(extra, 'poster') };
  }
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return { type: 'embed', src: `https://player.vimeo.com/video/${vm[1]}`, provider: 'Vimeo', ...extra };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return { type: 'video', src: u, ...extra };
  return { type: 'embed', src: u, ...extra };
}

function strip(obj, key) {
  const { [key]: _omit, ...rest } = obj;
  return rest;
}

const isVideoFile = (src = '') => /\.(mp4|webm|mov)(\?|$)/i.test(src);

function buildMedia(raw, layout) {
  switch (layout) {
    case 'carousel':
      return (raw.slides || []).filter((s) => s?.image).map((s) => ({ type: 'image', src: s.image, alt: s.alt }));
    case 'video': {
      const extra = { poster: raw.poster || undefined, aspect: raw.aspect || '9:16' };
      if (raw.video) return [{ type: 'video', src: raw.video, ...extra }];
      const v = parseVideoUrl(raw.videoUrl, extra);
      return v ? [v] : [];
    }
    case 'campaign':
      return (raw.items || [])
        .map((it) => {
          const extra = { caption: it.caption, alt: it.alt, poster: it.poster || undefined, aspect: it.aspect || undefined };
          if (it.url) return parseVideoUrl(it.url, extra);
          if (!it.file) return null;
          if (it.type === 'video' || isVideoFile(it.file)) return { type: 'video', src: it.file, ...extra, aspect: extra.aspect || '9:16' };
          return { type: 'image', src: it.file, ...extra };
        })
        .filter(Boolean);
    case 'banner':
    case 'single':
    default:
      return raw.image ? [{ type: 'image', src: raw.image, alt: raw.alt }] : [];
  }
}

function normalize(raw, filePath) {
  const parts = filePath.split('/');
  const slug = parts.at(-1).replace(/\.json$/, '');
  const category = raw.category || parts.at(-2);
  const brand = raw.brand || parts.at(-3);
  const cat = categoryBySlug[category];
  const layout = cat?.layout || 'single';
  const media = buildMedia(raw, layout);
  const firstImage = media.find((m) => m.type === 'image')?.src;
  const cover = raw.cover || firstImage || media.find((m) => m.poster)?.poster || null;
  return {
    id: `${brand}/${category}/${slug}`,
    slug,
    brand,
    category,
    layout,
    title: raw.title || slug,
    description: raw.description || '',
    contribution: raw.contribution || '',
    objective: raw.objective || '',
    date: raw.date || '',
    tags: (raw.tags || []).filter(Boolean),
    tools: (raw.tools || []).filter(Boolean),
    status: raw.status || 'published',
    featured: !!raw.featured,
    featuredOrder: raw.featuredOrder ?? 100,
    order: raw.order ?? 100,
    cover,
    media,
    url: `/work/${brand}/${category}/${slug}`,
  };
}

const byOrder = (a, b) =>
  a.order - b.order || (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title);

export const projects = Object.entries(projectModules)
  .map(([p, raw]) => normalize(raw, p))
  .filter((p) => p.media.length > 0 && brandBySlug[p.brand] && categoryBySlug[p.category])
  .filter((p) => p.status !== 'draft' || SHOW_DRAFTS)
  .sort(byOrder);

export const projectsFor = (brand, category) =>
  projects.filter((p) => (!brand || p.brand === brand) && (!category || p.category === category));

export const featuredProjects = projects
  .filter((p) => p.featured && p.status !== 'draft')
  .sort((a, b) => a.featuredOrder - b.featuredOrder || byOrder(a, b));

/**
 * Real artwork for decorative compositions (hero layers, brand worlds).
 * Featured work first, then display order. Only published projects that have an image cover.
 */
export function artFor(brand, n = 4) {
  const pool = projects.filter((p) => p.cover && p.status !== 'draft' && (!brand || p.brand === brand));
  const ranked = [...pool.filter((p) => p.featured), ...pool.filter((p) => !p.featured)];
  return ranked.slice(0, n);
}

export const findProject =(brand, category, slug) =>
  projects.find((p) => p.brand === brand && p.category === category && p.slug === slug);

export const countFor = (brand, category) => projectsFor(brand, category).length;

export function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export const domainOf = (url) => (url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

/** "9:16" -> "9 / 16" for CSS aspect-ratio */
export const cssAspect = (a) => (a ? a.replace(':', ' / ') : undefined);
