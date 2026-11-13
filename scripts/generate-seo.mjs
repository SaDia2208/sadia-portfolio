/**
 * Writes public/robots.txt and (once a site URL is known) public/sitemap.xml.
 * The site URL comes from content/settings/cms.json → "siteUrl" (e.g. https://sadia-akter.netlify.app).
 * Runs before every build, so new brands, collections and projects are added to the sitemap automatically.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const { siteUrl = '' } = read('content/settings/cms.json');
const base = siteUrl.replace(/\/$/, '');
const robotsPath = path.join(root, 'public/robots.txt');
const sitemapPath = path.join(root, 'public/sitemap.xml');

let robots = 'User-agent: *\nAllow: /\nDisallow: /admin/\n';

if (base) {
  const { categories } = read('content/settings/categories.json');
  const brands = fs.readdirSync(path.join(root, 'content/brands')).filter((f) => f.endsWith('.json')).map((f) => read(`content/brands/${f}`));
  const urls = ['/', '/work', '/playground'];
  for (const b of brands) {
    urls.push(`/work/${b.slug}`);
    for (const c of categories) {
      const dir = path.join(root, 'content/projects', b.slug, c.slug);
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      const published = files.filter((f) => read(`content/projects/${b.slug}/${c.slug}/${f}`).status !== 'draft');
      if (!published.length) continue;
      urls.push(`/work/${b.slug}/${c.slug}`);
      published.forEach((f) => urls.push(`/work/${b.slug}/${c.slug}/${f.replace(/\.json$/, '')}`));
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, xml);
  robots += `\nSitemap: ${base}/sitemap.xml\n`;
  console.log(`SEO: sitemap with ${urls.length} pages`);
} else {
  if (fs.existsSync(sitemapPath)) fs.unlinkSync(sitemapPath);
  console.log('SEO: no siteUrl in content/settings/cms.json yet — sitemap skipped');
}
fs.writeFileSync(robotsPath, robots);
