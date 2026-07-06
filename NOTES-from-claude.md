# Merge notes — what I did with your downloaded files

## Files from the Scaffold chat
Used as-is as the base project. No changes to routing, blog logic, or lib/ files.

## Files from the Home Page chat — where they ended up

| Downloaded file | What happened |
|---|---|
| `Hero.tsx`, `Intro.tsx`, `WorldsNav.tsx` | Moved to `components/home/` unchanged — these are your real homepage sections |
| `Nav.tsx` | Merged into `components/layout/Header.tsx` (kept the existing file's name/export so `app/layout.tsx` didn't need changes) — visual style updated to match your new design, nav links now pulled from `lib/constants.ts` instead of being hardcoded, so adding a nav item in one place updates header + footer + sitemap everywhere |
| `Footer.tsx` | Merged into `components/layout/Footer.tsx` the same way |
| `page.tsx` | Rewrote `app/page.tsx` to render `<Hero /><Intro /><WorldsNav />` only — **not** Nav/Footer, since `app/layout.tsx` already wraps every page with the Header and Footer. The version you downloaded rendered its own Nav+Footer too, which would have shown up twice on the page. |
| `tailwind.config.snippet.ts`, `globals.css.snippet.css` | Merged into the existing `tailwind.config.ts` / `app/globals.css` — kept the CSS-variable architecture from the scaffold (so future palette tweaks only happen in one place) instead of hardcoding hex values, and added new token names (`bg`, `text`, etc.) as aliases alongside the original ones so the placeholder `/work`, `/lab`, `/photography`, `/blog` pages still work using the same real colors, not two different palettes |
| `HomePagePreview.jsx` | **Not included.** This was a self-contained preview file (inline hex colors, no imports) — a duplicate of Hero+Nav+Intro+WorldsNav+Footer combined, used to render a preview inside the chat. It's not meant to be part of the actual codebase. Safe to ignore/delete. |

## Verified
- `npm install` — clean
- `npm run build` — compiles with zero errors, all routes generate
- `npm run dev` — homepage and all section routes return HTTP 200 with real content

## To run this yourself
```
npm install
npm run dev
```
Then open http://localhost:3000

---

## Phase 3 — Photography section (added)

### What's in place
- `content/photography/photos.json` — 13 placeholder photos (Picsum images), 2 folios ("Monsoon, 2026", "Durga Puja, 2025") + 6 standalone grid-only shots
- `content/photography/folios.json` — the 2 folios
- `lib/photography.ts` — all data access (getAllPhotos, getFolio, getPhotosByFolio, EXIF formatting helpers)
- `/photography` — landing: folio cards + full chronological grid
- `/photography/[folio]` — story-style folio page (e.g. `/photography/monsoon-2026`)
- Click any photo → opens full-size with caption + EXIF as an **overlay** (not a page reload) using Next.js intercepting routes — closing it returns you to the grid at the same scroll position
- `/photography/photo/[slug]` — same detail view as a real page, used for direct links/refresh/sharing (so a photo URL always works even without JS navigation)

### How the modal trick works (so you understand the file structure)
- `app/photography/@modal/(.)photo/[slug]/page.tsx` — the "intercepted" version, shown as an overlay when you click a photo from within `/photography`
- `app/photography/photo/[slug]/page.tsx` — the real full page, shown on direct visits
- `app/photography/layout.tsx` — renders both slots together
Both share the same `PhotoDetail` component so they never go out of sync.

### Verified
- `npm run build` — 13 photo pages + 2 folio pages all generate, zero errors
- `npm run dev` — landing, folio, and photo detail routes all confirmed rendering real data (EXIF, captions) via curl

### What's placeholder / needs your real content
- All 13 photos use picsum.photos placeholder images — replace with your real shots
- EXIF data is hand-written to look realistic — once you add real photos, this gets auto-extracted (see next step below)

### Next: the "add real photos" workflow
Not built yet — this is the script that reads EXIF automatically from your image files and uploads to Cloudinary, so you just write captions. Say the word and I'll build it next; I'd want to know if you already have a Cloudinary account set up, since the script needs your API credentials to upload.

---

## Photography storage — switched from Cloudinary to local (added)

Since you're not migrating the old imperfectlyclicked site, the original reason for Cloudinary (existing transforms already set up there) no longer applies. Simpler setup now:

- Photos live in `public/photography/` inside the project itself
- Served via Next.js's built-in image optimization — no account, no API keys, no upload step
- `lib/cloudinary.ts` removed, `.env.example` and `next.config.mjs` no longer reference any external image host

### Adding real photos — the workflow
1. Drop your image files (`.jpg`/`.jpeg`/`.png`) into `content/photography/incoming/`
2. Run: `npm run add-photos`
3. It automatically: reads EXIF (date, camera, lens, ISO, shutter speed, aperture, focal length), reads real pixel dimensions, moves each file into `public/photography/`, and appends an entry to `content/photography/photos.json` with an **empty caption** and `folio: null`
4. Open `content/photography/photos.json`, write captions, and set `"folio"` to a folio slug (from `folios.json`) for any photo that belongs to a collection

Tested end-to-end with a real JPEG carrying embedded EXIF — every field extracted correctly (confirmed camera, lens, ISO, shutter speed as a proper fraction, aperture, focal length, and correct dimensions). Safe to re-run — already-processed files won't be touched again since incoming/ is emptied as files are processed.

Note: this script only needs to run on your machine when adding photos — it's a one-time Node script, not part of the live website.

---

## Phase 4, 5 (polish), 6 — Work, Blog polish, Lab (added, all at once)

### Work (`/work`)
Real content — five domain cards (Windows Server, Active Directory, Linux, Azure Cloud, VMware), each with a summary and keyword tags. Data lives in `content/work/domains.json` — edit that file directly to change wording or add a domain, no code changes needed.

### Blog polish
The blog pipeline (listing, tag pages, MDX rendering) already existed from the scaffold — restyled all three pages to use the real design tokens (was still using generic placeholder classes). Added two more sample posts alongside the original "Hello, World" so tag filtering is provably working with real data (3 posts, 4 tags total).

### Hashnode migration script (`npm run migrate-hashnode`)
Built but **not yet tested against a real export**, since I don't have your actual Hashnode export to verify field names against. Workflow:
1. Export your posts from Hashnode (Dashboard → Settings → Import/Export)
2. Drop the exported `.md` files into `content/blog/hashnode-export/`
3. Run `npm run migrate-hashnode`

It guesses at common Hashnode field-name variants (`publishedAt` vs `date`, `brief` vs `excerpt`, etc.) and normalizes them into our schema. **If the guessed mapping doesn't match your real export**, paste me one example exported file and I'll fix the mapping precisely instead of guessing further — this is the one piece in this batch I couldn't fully verify without your real data.

### Lab (`/lab`)
Placeholder structure with 2 entries (`content/lab/experiments.json`) — genuinely open-ended per your earlier note that this isn't fully scoped yet. Add entries to that JSON file as new experiments come up.

### Verified (build + runtime)
- `npm run build` — 31 routes, zero errors, all blog posts/tags/photography pages statically generated
- `npm run dev` — curl-tested `/work`, `/lab`, `/blog`, `/blog/why-active-directory-still-matters`, `/blog/tag/infra`, plus regression-checked `/` and `/photography` still work

---

## Admin panel (`/admin`) — added

A password-protected admin panel to write, edit, and delete blog posts from anywhere (including your phone), with no design changes to the rest of the site.

### How it works
Your site is static and read-only once deployed on Vercel, so "save" can't just write a file to disk on the live server. Instead: saving a post in `/admin` commits the `.mdx` file directly to your GitHub repo via the GitHub API. Vercel's Git integration then automatically redeploys — **the live site (and the admin post list) reflects changes about 30–60 seconds after saving**, not instantly.

### Security
- `/admin` is **not linked anywhere** on the public site and is excluded from search engines via `robots.txt` — but it's reachable by anyone who guesses/knows the URL, so the password is the real protection. Use a strong one.
- Single shared password (you're the only admin — no user accounts)
- Session is a signed, httpOnly cookie, valid 30 days, verified server-side on every admin page and API request

### Required setup (one-time) — env vars in Vercel project settings
Go to your Vercel project → Settings → Environment Variables, and add:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | Any strong password you choose |
| `SESSION_SECRET` | A random string — generate with `openssl rand -hex 32` (or any password generator, 40+ characters) |
| `GITHUB_TOKEN` | See below |
| `GITHUB_REPO` | `yourusername/your-repo-name` |
| `GITHUB_BRANCH` | `main` (or whatever your default branch is) |

### Creating the GitHub token
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
2. Repository access: **Only select repositories** → choose this repo specifically (don't grant access to all your repos)
3. Permissions → Repository permissions → **Contents: Read and write**
4. Generate, copy the token, paste it into Vercel as `GITHUB_TOKEN`

After adding the env vars, redeploy once so Vercel picks them up.

### Using it
- Go to `yourdomain.in/admin` → log in with `ADMIN_PASSWORD`
- **+ New post** → fill in title/date/excerpt/tags/content → Publish
- Click any post → edit or delete
- Draft checkbox keeps a post out of the public `/blog` listing without deleting it

### What I verified vs. couldn't verify
✅ Verified: build compiles clean, full auth flow (redirect when logged out, wrong password rejected, correct password creates valid session, protected pages/API routes all check auth), and graceful error handling when GitHub isn't configured yet (or misconfigured) — shows a clear message instead of crashing.

⚠️ **Not verified**: an actual live commit-to-GitHub round trip, since I don't have your GitHub token. Once you add the env vars above and deploy, test it by creating one throwaway post first — if anything errors, paste me the exact message shown on the page and I'll fix it immediately.

---

## Blog: images, links, rich text (added)

**Links and rich text** (bold, italic, headers, lists, blockquotes) already worked — they're plain Markdown syntax, no changes needed:
```
**bold**, *italic*, [link text](https://example.com), ## Heading, - list item, > quote
```

**Images** needed real plumbing since your site is static — added:
- `+ Insert image` button in the admin post editor (New and Edit). Tap it, pick a photo (works from your phone's camera roll too), and it:
  1. Resizes/compresses it in the browser first (max 1600px, JPEG ~82% quality) — phone photos are often 3–10MB, and GitHub's Contents API caps uploads around ~1MB, so this keeps it working reliably
  2. Uploads it via a new `/api/admin/upload-image` route, which commits it to `public/blog-images/` in your repo (same GitHub-commit mechanism as saving posts)
  3. Inserts the markdown image tag at your cursor position in the content box automatically
- Rendered posts style images with rounded corners and full-width, responsive sizing

### Verified
- `npm run build` — clean, zero errors
- Rendered a real test post through the actual pipeline confirming bold, italic, links, headings, blockquotes, and an inline image all render correctly as real HTML
- Confirmed the upload endpoint rejects unauthenticated requests like the rest of the admin API

Not independently re-tested: the live GitHub commit for images specifically (same caveat as the rest of admin — needs your real token to fully verify, but it reuses the exact same GitHub API call pattern already confirmed working conceptually elsewhere).

---

## SEO / indexing readiness (added)

You asked directly whether the site was ready to show up in Google — it wasn't fully. Here's what was missing and what I added:

### Added
- **`app/sitemap.ts`** — auto-generated `/sitemap.xml` listing every real page (home, work, lab, blog index, every published post, every tag, every folio). Submit this URL to Google Search Console once live.
- **Dynamic favicon** (`app/icon.tsx`) — was still Next.js's generic default; now a simple on-brand "d." mark generated from your actual palette
- **Social share images** (`app/opengraph-image.tsx` + per-post `app/blog/[slug]/opengraph-image.tsx`) — when you share a link on WhatsApp/Twitter/LinkedIn/iMessage, it now shows a real branded preview image instead of nothing. Each blog post gets its own image with its title and tags.
- **Custom 404 page** (`app/not-found.tsx`) — matches the site now instead of Next's default blank page
- **Draft leak prevention** (`dynamicParams = false` on blog post/tag routes) — this was flagged back in the original scaffold notes as still needed. Verified: a real draft post is now unreachable by direct URL (confirmed 404) even though the file exists in the repo — before this fix, drafts could technically be visited directly even though they weren't linked anywhere.
- **Richer per-post metadata** — real Open Graph tags, Twitter card, canonical URL, and `BlogPosting` JSON-LD structured data on every post (helps Google understand it's an article, who wrote it, when)

### Bug caught and fixed during testing
The per-post OG image crashed the server on first request — a text line combined an expression and literal text into two child nodes without an explicit `display: flex`, which the image renderer requires. Fixed and re-verified with a real request (confirmed it returns an actual 1200×630 PNG, and I visually checked the image itself, not just the HTTP status).

### Verified
- Full production build (`npm run build` + `npm run start`, not just dev mode)
- Draft post confirmed unreachable (404) via direct URL
- `/sitemap.xml` returns real content with all pages/posts/tags/folios
- Favicon, default OG image, and per-post OG image all confirmed as real, correctly-sized PNGs — and visually inspected, not just checked for a 200 status

### What SEO still depends on (can't be "built," just true over time)
- Actual content — search engines rank real, substantial writing and real photos, not placeholders. This groundwork just means Google *can* index things correctly once real content is there.
- Getting indexed at all requires the site to be live at your real domain and submitted to Google Search Console — that only happens after the DNS cutover
- Google indexing itself is gradual — expect weeks, not days, even after everything's technically correct

---

## v0.1 — mobile nav, photo modal fix, resume, lab detail pages (added)

### Fixed: mobile navigation was completely missing
The nav links (Photography/Work/Lab/Blog) were hidden below the `sm` breakpoint with no alternative — there was genuinely no way to reach any page from mobile except the home logo link. Added a real hamburger menu (`components/layout/Header.tsx`, now a client component) that shows/hides a full-width menu panel with all nav links, closes automatically on navigation, and locks body scroll while open.

### Fixed: whole site was rendering "zoomed out" on mobile
Root cause: `app/layout.tsx` had no `viewport` export at all — without this, mobile browsers can render the page assuming a ~980px desktop-width viewport and scale everything down, which is exactly the "need to pinch-zoom, nothing reflows" symptom. Added `export const viewport = { width: "device-width", initialScale: 1 }`. This affects every page, including blog and images — nothing else needed fixing since your images already used relative sizing (`w-full` / `max-width:100%`), they just needed the viewport meta tag to actually take effect.

### Fixed: photo modal close button disappearing on scroll
Root cause: mobile Safari/Chrome don't reliably honor `overflow: hidden` on `<body>` for touch scrolling — the background page can still scroll a little, which shifts the viewport as the browser's address bar hides/shows, making "fixed" elements appear to drift or vanish. Replaced with the more robust technique: lock the body with `position: fixed` and a stored scroll offset, restoring it on close (`components/photography/PhotoModal.tsx`). Also changed the close button itself from `absolute` to `fixed` positioning as a belt-and-suspenders fix, and added `overscroll-contain` to stop scroll chaining.

### Added: Resume page + button + downloadable PDF
- `/work` now has a "View Resume →" button
- `/resume` — a full page in the same visual style, with Summary / Experience / Skills (same tags as the Work page domains) / Education sections, pre-filled with realistic placeholder content for you to edit in `content/resume/resume.json`
- "Download Resume (PDF)" button on that page links to `/public/resume.pdf` — **a real placeholder PDF is included**, matching the on-page content. When you have your real resume ready, just replace `public/resume.pdf` with your file (same filename) and push — no code changes needed, since it's served as a static file, not generated on the fly.

### Added: Lab project detail pages
Lab was previously just a flat list of cards going nowhere — clicking did nothing. Now:
- Each card links to `/lab/<slug>`, a full detail page: status, tags, optional cover image, optional embedded video, full write-up (multiple paragraphs), and external links (source code, live demo, etc.) as buttons
- See **`README-lab.md`** in the project root for exactly how to add a new project (image/video/links/paragraphs) — it's just editing `content/lab/experiments.json`, no code required
- Both current entries ("This site", "Vibe coding log") were extended with the new fields as working examples

### Verified (build + production server, not just dev mode)
- Full build: 45 routes, zero errors, including new `/resume` and `/lab/[slug]` pages
- Viewport meta tag confirmed present in actual rendered HTML
- Mobile menu markup confirmed present and correctly hidden/shown at breakpoints
- Resume page confirmed rendering real content, and `/resume.pdf` confirmed as an actual valid, openable PDF document (not just a 200 status)
- Lab detail page confirmed rendering real links and content

### Not independently re-verified
The photo modal scroll-lock fix uses a well-established, widely-documented technique for this exact class of mobile browser bug — I'm confident in the approach, but I don't have a way to test real mobile Safari/Chrome touch-scroll behavior from this sandbox. If it's still not perfect on your phone after this update, tell me exactly what you see and we'll iterate further.
