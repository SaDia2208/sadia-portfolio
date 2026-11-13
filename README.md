# Sadia Akter — Creative Portfolio

React + Vite + Tailwind CSS site with a Git-based content manager (Decap CMS), built for Netlify.
All portfolio content is JSON in `/content` and media in `/public/assets`. **Nothing is hard-coded** — adding a JSON file publishes a project.

---

## 1. Run it on your computer

Install [Node.js 20+](https://nodejs.org), then in this folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

**Local content manager (no login needed):**
1. Terminal 1: `npm run dev`
2. Terminal 2: `npm run cms:local` (wait for "listening on port 8081")
3. Open http://localhost:5173/admin

Saving in the CMS writes straight to `content/…` and `public/assets/…` on your computer and the site updates instantly.
Nothing goes online until you push to GitHub (see section 6). If `/admin` shows only "Login with GitHub",
the local proxy in terminal 2 isn't running.

---

## 2. Folder structure

```
content/
  brands/<brand>.json                     ← one file per brand (name, colours, summary…)
  projects/<brand>/<category>/<slug>.json ← one file per project
  settings/profile.json                   ← name, intro, About text, portrait, CV, email, LinkedIn
  settings/experience.json                ← jobs + education (role/dates are left blank until confirmed)
  settings/skills.json                    ← skills groups
  settings/categories.json                ← the shared category list + gallery layout
  settings/cms.json                       ← your GitHub repo name for the CMS
public/assets/<brand>/<category>/         ← original image & video files (never modified)
public/admin/                             ← content manager (config.yml is auto-generated)
src/                                      ← site code (components, galleries, pages)
```

Brands: `cricket-arabia`, `cubuzzle`, `active-arabia`, `tourmatez`
Categories: `single-posts`, `carousels`, `web-banners`, `videos`, `campaigns`

---

## 3. Project record format

Common fields (all optional except `title`):

```json
{
  "title": "Plan your group trip",
  "status": "published",          // or "draft" (drafts never appear on the live site)
  "description": "",
  "contribution": "Social media poster design in Figma",
  "date": "2026-10-01",
  "tools": ["Figma"],
  "tags": [],
  "order": 1,                     // lower = shown first
  "featured": false,              // true = shown on the homepage
  "featuredOrder": 100
}
```

Plus, depending on the category:

| Category | Extra fields |
|---|---|
| `single-posts` | `"image": "/assets/<brand>/single-posts/file.jpg"`, `"alt"` |
| `carousels` | `"slides": [{ "image": "...", "alt": "" }, …]` — order in the list = slide order; first = cover |
| `web-banners` | `"image"`, `"alt"` |
| `videos` | `"video": "/assets/<brand>/videos/file.mp4"` **or** `"videoUrl": "https://youtu.be/…"`, `"poster"`, `"aspect": "9:16" \| "16:9" \| "1:1" \| "4:5"` |
| `campaigns` | `"cover"`, `"objective"`, `"items": [{ "type": "image"\|"video", "file", "url", "poster", "aspect", "caption", "alt" }]` |

---

## 4. How to add new work (example: Tourmatez posters)

**Option A — ask Claude:** share the image files and say *"Add these Figma poster designs to Tourmatez."*
Claude copies the originals into `public/assets/tourmatez/single-posts/` and writes one JSON file per poster in
`content/projects/tourmatez/single-posts/`.

**Option B — content manager:** open `/admin`, choose **Tourmatez · Daily Posts** → **New**, upload the poster,
add a title, set *Tools used* to `Figma`, set *Status* to `published`, Save (and Publish). Repeat for each poster.

**Option C — by hand:**
1. Copy the files (unchanged) to `public/assets/tourmatez/single-posts/` — e.g. `tourmatez-01.jpg` … `tourmatez-07.jpg`.
2. For each, create `content/projects/tourmatez/single-posts/tourmatez-01.json`:
   ```json
   {
     "title": "Plan your group trip with Tourmatez",
     "status": "published",
     "image": "/assets/tourmatez/single-posts/tourmatez-01.jpg",
     "alt": "Bengali travel app poster for Tourmatez",
     "contribution": "Social media poster design in Figma",
     "tools": ["Figma"],
     "order": 1
   }
   ```

Posters are never cropped or re-encoded; the Bengali text inside the images stays exactly as designed.
They are single posts — they only become a carousel if you give the grouping and slide order.

---

## 5. Put it online (GitHub + Netlify) — one-time setup

The project folder is already a Git repository on branch `main` (with `core.longpaths` enabled for Windows).

1. **GitHub:** on github.com create an **empty** repository (e.g. `sadia-portfolio`) — no README, no licence. Then in this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/sadia-portfolio.git
   git push -u origin main
   ```
   (Git for Windows opens a browser window to sign in to GitHub the first time.)
2. **Netlify:** *Add new site → Import an existing project → GitHub →* pick the repo. Everything is read from `netlify.toml`
   (build `npm run build`, publish `dist`, Node 20, page routing, caching and security headers). Click **Deploy**.
   Your site is live at `https://<random-name>.netlify.app` — rename it under *Site configuration → Change site name*.
3. **Tell the project its address** — edit `content/settings/cms.json`:
   ```json
   { "repo": "<your-username>/sadia-portfolio", "branch": "main", "siteUrl": "https://<your-site>.netlify.app" }
   ```
   Commit & push. This turns on the CMS login, the sitemap (`/sitemap.xml`), and full-address link previews
   (the share image is `public/og-image.jpg`, 1200×630).
4. **Content manager login (GitHub OAuth):**
   - On GitHub: *Settings → Developer settings → OAuth Apps → New OAuth App*.
     Homepage URL = your Netlify URL; Authorization callback URL = `https://api.netlify.com/auth/done`.
   - On Netlify: *Site configuration → Access & security → OAuth → Install provider → GitHub*, paste the Client ID and Secret.
   - Visit `https://<your-site>.netlify.app/admin/` (or `https://<your-domain>/admin/`) and click **Login with GitHub**.
     Only GitHub accounts with write access to the repo can save. To let someone else edit, add them as a collaborator on the repo.
   - If your repo's main branch is called `master`, change `"branch"` in `cms.json` to match.

**Troubleshooting login:** "Not Found" in the popup → the OAuth provider isn't installed on Netlify or the Client ID/Secret is wrong.
"Repo not found" / can't save → `repo` in `cms.json` is misspelt or your account lacks write access.
Popup closes but nothing happens → check the callback URL is exactly `https://api.netlify.com/auth/done`.

**After the first deploy, check:** home page entrance + hero · `/work` · each brand page · `/playground` (drag, open a piece) ·
`/admin` login · share the URL in a chat app to see the preview image.

**Custom domain (optional):** *Domain management → Add a domain*. Then update `siteUrl` in `cms.json` and the
GitHub OAuth App's Homepage URL to the new address.

**Free tiers:** GitHub and Netlify's free plans cover a portfolio like this. The content manager itself (Decap CMS) is free and open source.

---

## 6. Publishing future changes

The live site only changes when a commit reaches the `main` branch on GitHub — local edits do **not** appear online by themselves.

- **Via `/admin`:** every **Publish** creates a Git commit on `main` → Netlify rebuilds automatically (≈1–2 min).
  Each save is one build, and Netlify's free plan has a monthly build allowance, so add a batch of posts and then publish
  rather than saving one field at a time. Projects with *Status = draft* are committed but stay hidden on the live site.
- **In the CMS:** *New* creates a project; open an existing one to edit text, **replace** an image (click the image → *Choose different*),
  drag carousel slides to reorder, *Add slide* / remove (✕) a slide, or **Delete entry** (top-right) to remove a project.
  Deleting a project does not delete its image files — remove unused files from the *Media* tab if you want.
- **Via Claude or by hand:** after files change, run
  ```bash
  npm run build
  git add .
  git commit -m "Add Tourmatez posters"
  git push
  ```
  `npm run build` is a safety check; Netlify rebuilds after the push.

Your previous work is protected by Git history — every version of every file can be restored.
The CMS never deletes media files automatically.

---

## 7. Videos — storage plan

| Size / volume | Recommendation |
|---|---|
| Short reels, under ~50 MB each | Upload the MP4 into the project (stored in the repo, served by Netlify). Compress first (e.g. 1080p, H.264). |
| Larger files, or many videos | Upload to YouTube (unlisted is fine) or Vimeo and paste the link in **external video link**. No size limit for the site. |

Limits to be aware of: GitHub rejects single files over 100 MB and warns above 50 MB; repos are best kept under a few GB.
Netlify's free plan has a monthly bandwidth/credit allowance — heavy video traffic is better served from YouTube/Vimeo.
A paid media host (e.g. Cloudinary, Bunny Stream) is only needed if you want self-hosted video at scale — not required now.

Videos only play when a visitor opens them; nothing autoplays.

---

## 8. Things waiting for your details

Edit in `/admin → Site settings` or the JSON files:

- **Portrait** — done (`portrait` = original photo, `portraitCutout` = background-removed copy used in the hero).
- **CV PDF** (`profile.json → cv`) — the *Download CV* buttons appear once a file is set.
- **Email / LinkedIn / socials** — the Contact section shows "Contact details will be added here soon" until then. Your phone number is never shown.
- **Leadmark Communications role title and dates** (`experience.json`) — hidden until filled in.
- **Contact form** — set `contactForm: true` only after enabling *Forms* in Netlify (*Site configuration → Forms → Enable form detection*), then redeploy. Submissions appear in Netlify (free tier: 100/month).
- **Cricket Arabia website** (`brands/cricket-arabia.json → website`) — left blank.
- **Social preview image** — add `public/og-image.jpg` (1200×630) and an `og:image` tag in `index.html` if you'd like link previews with an image.

---

## 9. Adding a brand or category later

- **Brand:** `/admin → ⚙ Brands → New` (or add `content/brands/<slug>.json`). After the next build, upload sections for that brand appear in `/admin` automatically and the brand appears across the site.
- **Category:** `/admin → ⚙ Site settings → Portfolio categories`, add one with a layout (`single`, `carousel`, `banner`, `video`, `campaign`). Never rename an existing slug — it is the folder name.

---

## 10. Accessibility & motion

Keyboard: ← → navigate in viewers, Esc closes, Z zooms, F fullscreen, I toggles details. Swipe works on touch screens.
Animations are disabled automatically for visitors who prefer reduced motion.
