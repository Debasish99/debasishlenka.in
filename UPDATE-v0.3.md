# v0.3 update — SEO, sharing, security (code files only)

This update deliberately contains NO content: not your photos, photos.json, home-page text,
blog posts, resume or lab data. Copy the files over your project (same paths) — nothing of yours is overwritten
except the code files listed below.

## What's fixed
1. Every page now has its OWN title, description, canonical URL and share image
   (before, Photography/Work/Lab/Blog/Resume all reused the home page's description and og:url).
2. Photo pages and folios share the PHOTO itself in WhatsApp/Twitter/LinkedIn previews (resized to 1200px).
3. Blog posts without an excerpt get an automatic ~160-char summary from the body (search snippet, listing card,
   RSS, social preview). A hand-written excerpt still wins.
4. Blog post structured data (JSON-LD) now includes image, keywords, modified date, publisher.
5. robots.txt now points search engines at the sitemap and blocks /api/.
6. /admin pages carry noindex, so they stay out of search even if the URL leaks.
7. Basic security headers on every response (nosniff, referrer policy, frame protection, permissions policy).
8. Home page: a "Write — Blog" tile (the grid is now 4 across on desktop, 2x2 on tablet, stacked on phones).

## Files in this update
NEW:      lib/seo.ts, app/admin/layout.tsx
CHANGED:  lib/blog/posts.ts, app/robots.ts, next.config.mjs, components/home/WorldsNav.tsx,
          app/photography/page.tsx, app/work/page.tsx, app/lab/page.tsx, app/blog/page.tsx, app/resume/page.tsx,
          app/photography/[folio]/page.tsx, app/photography/photo/[slug]/page.tsx,
          app/lab/[slug]/page.tsx, app/blog/tag/[tag]/page.tsx, app/blog/[slug]/page.tsx

If you hand-edited any of the 5 simple pages (photography/work/lab/blog/resume page.tsx), don't overwrite that file —
just add the import and replace the `export const metadata` line with the `pageMeta({...})` block from this version.

## Install
No new npm packages. Copy files -> `npm run dev` to check -> commit -> push.

## One thing only YOU can do (Vercel, no code)
Your site is served at www.debasishlenka.in, but every canonical/sitemap/social URL says debasishlenka.in (no www).
Vercel dashboard -> project -> Settings -> Domains -> make `debasishlenka.in` the primary and set
`www.debasishlenka.in` to redirect to it. Then Google sees one consistent address.
