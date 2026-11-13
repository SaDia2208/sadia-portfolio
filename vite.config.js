import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In development, make /admin and /admin/ open the content manager (Netlify already does this in production).
const adminRoute = {
  name: 'admin-route',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
};

// Link-preview tags. Social networks need absolute URLs, so they use "siteUrl" from content/settings/cms.json.
const socialMeta = {
  name: 'social-meta',
  transformIndexHtml(html) {
    let siteUrl = '';
    try { siteUrl = JSON.parse(fs.readFileSync('content/settings/cms.json', 'utf8')).siteUrl || ''; } catch { /* optional */ }
    const base = siteUrl.replace(/\/$/, '');
    const tags = [
      `<meta property="og:image" content="${base}/og-image.jpg" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      '<meta property="og:image:alt" content="Sadia Akter — I turn ideas into visual impact." />',
      `<meta name="twitter:image" content="${base}/og-image.jpg" />`,
      ...(base ? [`<meta property="og:url" content="${base}/" />`, `<link rel="canonical" href="${base}/" />`] : []),
    ];
    return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
  },
};

export default defineConfig({
  plugins: [adminRoute, socialMeta, react(), tailwindcss()],
  // Build files go to /_app so they never mix with the portfolio media in /assets.
  build: { assetsDir: '_app' },
});
