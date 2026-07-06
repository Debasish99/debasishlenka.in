# debasishlenka.in

Personal site rebuild — a single Next.js app replacing a Hashnode-hosted blog,
unifying home/story, photography, work, lab/hobbies, and a self-hosted MDX
blog.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**, driven entirely by CSS-variable design tokens (see below)
- **MDX** blog content, in-repo, validated with **Zod**
- **Cloudinary** for photography (continuing the existing setup from
  imperfectlyclicked.vercel.app)
- **Vercel** for hosting + preview deployments

## Project structure

```
app/
  layout.tsx          Root layout — header, footer, metadata
  page.tsx             Home
  photography/         Photography gallery (placeholder — owned by chat 03)
  work/                 Professional work (placeholder — owned by chat 04)
  lab/                  Hobbies / experiments (placeholder — owned by chat 06)
  blog/
    page.tsx            Post listing
    [slug]/page.tsx      Post detail (renders MDX via next-mdx-remote/rsc)
    tag/[tag]/page.tsx   Posts filtered by tag

components/
  ui/                  Small reusable primitives (Button, Container, SectionHeading)
  layout/              Header, Footer

content/
  blog/                MDX post files. Frontmatter validated by lib/blog/schema.ts

lib/
  blog/
    schema.ts           Zod frontmatter schema
    posts.ts             Data access layer (list/get posts, tags)
  cloudinary.ts          Cloudinary URL builder
  constants.ts            Site metadata + nav config
  utils.ts                 cn() class-merging helper
```

This structure is the contract other chats in the project build against —
route folders, file names, and the exported function names in `lib/blog/`
should stay stable even as their contents get filled in.

## Design tokens (placeholder)

All color and type values live as CSS variables in `app/globals.css`, and
`tailwind.config.ts` reads them rather than hardcoding hex codes or font
names. This means once the **"00 - Design Direction"** chat lands on a
palette and type scale, only `globals.css` needs to change — no component
code should need to change.

## Blog content contract

Frontmatter shape (see `lib/blog/schema.ts`):

```yaml
---
title: "Post title"
date: "2026-07-02"       # ISO date
excerpt: "One-line summary"
tags: ["tag-one", "tag-two"]
coverImage: "optional-cloudinary-public-id"
draft: false
---
```

The **"05 - Blog Migration"** chat owns the authoritative version of
`schema.ts` / `posts.ts` (handling Hashnode's field-name inconsistencies
across export formats) — the versions here are a working placeholder with
the same function signatures, so route pages don't need to change when the
real version is dropped in.

## Cloudinary

Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local` (see `.env.example`).
`lib/cloudinary.ts` builds URLs using the same `c_scale,w_720` /
`c_scale,w_1600` transform convention already used on
imperfectlyclicked.vercel.app.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Cloudinary cloud name
npm run dev
```

## Deployment pipeline (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the GitHub repo. Vercel
   auto-detects Next.js — no custom build settings needed.
3. Add environment variables in Vercel (Project Settings → Environment
   Variables): `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` for Production, Preview,
   and Development.
4. Every push to `main` deploys to production; every other branch/PR gets
   its own preview URL automatically — no extra config required.
5. **Do not** connect the `debasishlenka.in` domain in Vercel yet. Build and
   review on the `*.vercel.app` preview URL until the site is ready.

## DNS cutover plan (Hashnode → Vercel) — not yet executed

Domain `debasishlenka.in` is registered on Hostinger and currently points at
Hashnode. When the new site is ready to go live:

1. In Vercel: Project Settings → Domains → add `debasishlenka.in` and
   `www.debasishlenka.in`. Vercel will show the exact records to add (an
   `A`/`ALIAS` record for the apex domain, a `CNAME` for `www`).
2. In Hostinger's DNS zone for `debasishlenka.in`, replace the existing
   Hashnode records with the ones Vercel provides.
3. DNS propagation can take anywhere from a few minutes to ~48 hours.
   Vercel will show the domain as "Invalid Configuration" until it
   propagates, then flip to "Valid" and auto-issue an SSL certificate.
4. Keep the Hashnode blog untouched until the new site's domain is
   confirmed live and the blog migration is verified — treat this as a
   one-way door only once posts, images, and redirects are all checked.
5. Consider adding redirects from old Hashnode post URLs to their new
   `/blog/[slug]` equivalents if the URL structure changes, to avoid
   breaking inbound links/SEO.

This step is intentionally **not** being done in this chat — it happens once
the blog migration and other sections are ready.
