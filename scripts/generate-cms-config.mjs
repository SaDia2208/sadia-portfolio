/**
 * Generates public/admin/config.yml for Decap CMS from:
 *   content/brands/*.json            (one file per brand)
 *   content/settings/categories.json (the shared category list)
 *   content/settings/cms.json        (GitHub repo + branch)
 *
 * It runs automatically before `npm run dev` and `npm run build`, so adding a
 * brand or a category (in the CMS or by editing JSON) creates the matching
 * upload sections on the next build. JSON is valid YAML, so we write JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const cms = readJson('content/settings/cms.json');
const { categories } = readJson('content/settings/categories.json');
const brands = fs
  .readdirSync(path.join(root, 'content/brands'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson(`content/brands/${f}`))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const ASPECTS = ['9:16', '16:9', '1:1', '4:5'];

const common = [
  { label: 'Title', name: 'title', widget: 'string' },
  { label: 'Status', name: 'status', widget: 'select', options: ['published', 'draft'], default: 'draft',
    hint: 'Drafts are saved but never shown on the live site.' },
  { label: 'Short description', name: 'description', widget: 'text', required: false },
  { label: 'My contribution', name: 'contribution', widget: 'text', required: false },
  { label: 'Date', name: 'date', widget: 'datetime', required: false, date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD', picker_utc: true },
  { label: 'Tools used (optional)', name: 'tools', widget: 'list', required: false, hint: 'Only list tools you actually used, e.g. Figma, Canva.' },
  { label: 'Tags (optional)', name: 'tags', widget: 'list', required: false },
  { label: 'Display order', name: 'order', widget: 'number', value_type: 'int', default: 100, required: false,
    hint: 'Lower numbers appear first.' },
  { label: 'Feature on homepage', name: 'featured', widget: 'boolean', default: false, required: false },
  { label: 'Featured order', name: 'featuredOrder', widget: 'number', value_type: 'int', default: 100, required: false },
];

const altField = { label: 'Alt text (describe the image)', name: 'alt', widget: 'string', required: false };

const layoutFields = {
  single: [
    { label: 'Design image', name: 'image', widget: 'image', hint: 'Upload the original file — it is shown uncropped.' },
    altField,
  ],
  carousel: [
    { label: 'Slides (drag to reorder — first slide is the cover)', name: 'slides', widget: 'list', min: 2,
      summary: '{{fields.image}}',
      fields: [{ label: 'Slide image', name: 'image', widget: 'image' }, altField] },
  ],
  banner: [
    { label: 'Banner image (landscape)', name: 'image', widget: 'image' },
    altField,
  ],
  video: [
    { label: 'Video file (MP4)', name: 'video', widget: 'file', required: false,
      hint: 'Keep files under ~50 MB. For bigger videos use the external link field instead.' },
    { label: 'OR external video link (YouTube / Vimeo / direct MP4 URL)', name: 'videoUrl', widget: 'string', required: false },
    { label: 'Thumbnail / poster image', name: 'poster', widget: 'image', required: false },
    { label: 'Aspect ratio', name: 'aspect', widget: 'select', options: ASPECTS, default: '9:16' },
  ],
  campaign: [
    { label: 'Cover image', name: 'cover', widget: 'image', required: false, hint: 'Defaults to the first image asset.' },
    { label: 'Campaign objective', name: 'objective', widget: 'text', required: false },
    { label: 'Campaign assets (drag to reorder)', name: 'items', widget: 'list', min: 1,
      summary: '{{fields.type}} — {{fields.caption}}',
      fields: [
        { label: 'Asset type', name: 'type', widget: 'select', options: ['image', 'video'], default: 'image' },
        { label: 'File (image or MP4)', name: 'file', widget: 'file', required: false },
        { label: 'OR external video link', name: 'url', widget: 'string', required: false },
        { label: 'Video poster (optional)', name: 'poster', widget: 'image', required: false },
        { label: 'Video aspect ratio', name: 'aspect', widget: 'select', options: ASPECTS, required: false },
        { label: 'Caption (e.g. Main poster, Website banner)', name: 'caption', widget: 'string', required: false },
        altField,
      ] },
  ],
};

const projectCollections = [];
for (const brand of brands) {
  for (const cat of categories) {
    const fields = [
      { name: 'brand', widget: 'hidden', default: brand.slug },
      { name: 'category', widget: 'hidden', default: cat.slug },
      common[0],
      ...(layoutFields[cat.layout] || layoutFields.single),
      ...common.slice(1),
    ];
    projectCollections.push({
      name: `${brand.slug}__${cat.slug}`,
      label: `${brand.name} · ${cat.label}`,
      label_singular: `${brand.name} ${cat.label} project`,
      folder: `content/projects/${brand.slug}/${cat.slug}`,
      create: true,
      delete: true,
      extension: 'json',
      format: 'json',
      // Date prefix keeps file names valid even for Bangla-only titles (non-Latin letters are dropped from slugs).
      slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
      identifier_field: 'title',
      summary: '{{title}}  ·  {{status}}',
      sortable_fields: ['order', 'title', 'date'],
      media_folder: `/public/assets/${brand.slug}/${cat.slug}`,
      public_folder: `/assets/${brand.slug}/${cat.slug}`,
      fields,
    });
  }
}

const settingsCollection = {
  name: 'settings',
  label: '⚙ Site settings',
  delete: false,
  editor: { preview: false },
  media_folder: '/public/assets/profile',
  public_folder: '/assets/profile',
  files: [
    { name: 'profile', label: 'Profile, About & Contact', file: 'content/settings/profile.json', format: 'json',
      fields: [
        { label: 'Name', name: 'name', widget: 'string' },
        { label: 'Hero headline', name: 'headline', widget: 'string', required: false },
        { label: 'Tagline (under your name)', name: 'tagline', widget: 'string', required: false },
        { label: 'Closing statement (contact section)', name: 'closing', widget: 'string', required: false },
        { label: 'Roles', name: 'roles', widget: 'list' },
        { label: 'Hero introduction', name: 'intro', widget: 'text' },
        { label: 'Portrait photo', name: 'portrait', widget: 'image', required: false },
        { label: 'Portrait cut-out (transparent background, used in the hero)', name: 'portraitCutout', widget: 'image', required: false },
        { label: 'Portrait alt text', name: 'portraitAlt', widget: 'string', required: false },
        { label: 'CV (PDF)', name: 'cv', widget: 'file', required: false },
        { label: 'About paragraphs', name: 'about', widget: 'list', field: { label: 'Paragraph', name: 'p', widget: 'text' } },
        { label: 'Email', name: 'email', widget: 'string', required: false },
        { label: 'LinkedIn URL', name: 'linkedin', widget: 'string', required: false },
        { label: 'Other social links', name: 'socials', widget: 'list', required: false,
          fields: [{ label: 'Label', name: 'label', widget: 'string' }, { label: 'URL', name: 'url', widget: 'string' }] },
        { label: 'Show contact form (needs Netlify Forms enabled)', name: 'contactForm', widget: 'boolean', default: false, required: false },
      ] },
    { name: 'experience', label: 'Experience & Education', file: 'content/settings/experience.json', format: 'json',
      fields: [
        { label: 'Jobs', name: 'jobs', widget: 'list', fields: [
          { label: 'Company', name: 'company', widget: 'string' },
          { label: 'Role / title', name: 'role', widget: 'string', required: false },
          { label: 'Start (e.g. Jan 2024)', name: 'start', widget: 'string', required: false },
          { label: 'End (or Present)', name: 'end', widget: 'string', required: false },
          { label: 'Location', name: 'location', widget: 'string', required: false },
          { label: 'Responsibilities', name: 'responsibilities', widget: 'list' },
        ] },
        { label: 'Education', name: 'education', widget: 'list', fields: [
          { label: 'Degree', name: 'degree', widget: 'string' },
          { label: 'Institution', name: 'institution', widget: 'string' },
          { label: 'Result', name: 'result', widget: 'string', required: false },
          { label: 'Year', name: 'year', widget: 'string', required: false },
        ] },
      ] },
    { name: 'skills', label: 'Skills', file: 'content/settings/skills.json', format: 'json',
      fields: [{ label: 'Groups', name: 'groups', widget: 'list', fields: [
        { label: 'Group title', name: 'title', widget: 'string' },
        { label: 'Skills', name: 'skills', widget: 'list' },
      ] }] },
    { name: 'categories', label: 'Portfolio categories', file: 'content/settings/categories.json', format: 'json',
      fields: [{ label: 'Categories', name: 'categories', widget: 'list',
        hint: 'Changing a slug moves nothing — only add new categories, never rename existing slugs.',
        fields: [
          { label: 'Slug (folder name, lowercase-with-dashes)', name: 'slug', widget: 'string' },
          { label: 'Short label', name: 'label', widget: 'string' },
          { label: 'Long label', name: 'longLabel', widget: 'string' },
          { label: 'Gallery layout', name: 'layout', widget: 'select', options: ['single', 'carousel', 'banner', 'video', 'campaign'] },
        ] }] },
  ],
};

const brandsCollection = {
  name: 'brands',
  label: '⚙ Brands',
  label_singular: 'Brand',
  folder: 'content/brands',
  create: true,
  delete: false,
  extension: 'json',
  format: 'json',
  slug: '{{fields.slug}}',
  identifier_field: 'name',
  editor: { preview: false },
  fields: [
    { label: 'Slug (folder name, lowercase-with-dashes — never change later)', name: 'slug', widget: 'string' },
    { label: 'Brand name', name: 'name', widget: 'string' },
    { label: 'Order', name: 'order', widget: 'number', value_type: 'int', default: 10 },
    { label: 'Industry', name: 'industry', widget: 'string' },
    { label: 'Website', name: 'website', widget: 'string', required: false },
    { label: 'Summary', name: 'summary', widget: 'text' },
    { label: 'Visual identity', name: 'identity', widget: 'text', required: false },
    { label: 'My contribution', name: 'contribution', widget: 'text', required: false },
    { label: 'Header colours', name: 'theme', widget: 'object', fields: [
      { label: 'Background', name: 'bg', widget: 'color' },
      { label: 'Text', name: 'fg', widget: 'color' },
      { label: 'Accent', name: 'accent', widget: 'color' },
    ] },
    { label: 'Palette swatches', name: 'swatches', widget: 'list', field: { label: 'Colour', name: 'c', widget: 'color' }, required: false },
    { label: 'Category notes', name: 'categoryNotes', widget: 'object', required: false,
      fields: categories.map((c) => ({ label: c.label, name: c.slug, widget: 'string', required: false })) },
  ],
};

const config = {
  backend: { name: 'github', repo: cms.repo, branch: cms.branch || 'main' },
  // Lets you edit locally with `npm run cms:local` + `npm run dev` (no login, writes straight to your files).
  local_backend: true,
  ...(cms.siteUrl ? { site_url: cms.siteUrl, display_url: cms.siteUrl } : {}),
  media_folder: 'public/assets/uploads',
  public_folder: '/assets/uploads',
  slug: { encoding: 'ascii', clean_accents: true },
  collections: [...projectCollections, brandsCollection, settingsCollection],
};

const out = path.join(root, 'public/admin/config.yml');
fs.writeFileSync(out, `# AUTO-GENERATED by scripts/generate-cms-config.mjs — do not edit by hand.\n${JSON.stringify(config, null, 2)}\n`);
if (!cms.repo || cms.repo.startsWith('YOUR-GITHUB-USERNAME')) {
  console.warn('⚠  CMS: content/settings/cms.json still has the placeholder repo — online /admin login will not work until it is set.');
}
console.log(`CMS config: ${projectCollections.length} project sections for ${brands.length} brands → public/admin/config.yml`);
