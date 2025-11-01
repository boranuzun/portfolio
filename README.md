# Boran Uzun — Portfolio (Astro)

Personal website and portfolio built with Astro 5, TypeScript, Tailwind CSS, and Content Collections. It includes a blog, projects, work experience, RSS feed, sitemap, and simple CV redirects.

Live site: https://boranuzun.ch/

## Features

- Fast, static-by-default site powered by Astro 5
- Content Collections for blog, projects, and work entries
- MD/MDX support
- Tailwind CSS 4 (via the official Vite plugin)
- RSS feed that aggregates blog posts and projects (`/rss.xml`)
- Automatic sitemap and `robots.txt`
- Accessible, lightweight UI components

## Tech stack

- Astro 5 (Vite under the hood)
- TypeScript
- Tailwind CSS 4 (`@tailwindcss/vite`)
- MDX (`@astrojs/mdx`)
- Content Collections (`astro:content`)
- SEO utilities: `@astrojs/sitemap`, `@astrojs/rss`
- ESLint (flat config) for Astro/TS/JS

## Getting started

Prerequisites:

- Node.js 20+ (LTS recommended)
- npm (this repo includes a `package-lock.json`)

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The site will be available at the URL printed in the terminal (usually http://localhost:4321).

To expose the dev server on your local network:

```bash
npm run dev:network
```

## Scripts

- `npm run dev` — Start the development server
- `npm run dev:network` — Dev server bound to your LAN IP
- `npm run build` — Typecheck (`astro check`) then build to `dist/`
- `npm run preview` — Preview the production build locally
- `npm run preview:network` — Preview on your LAN
- `npm run lint` — Lint the codebase
- `npm run lint:fix` — Lint and auto-fix issues

## Project structure

```
astro.config.mjs
eslint.config.js
package.json
tsconfig.json
public/
	cv/               # PDF CVs, served as-is
	fonts/
src/
	consts.ts         # Site metadata, counts & socials
	env.d.ts
	types.ts          # Shared types
	components/       # UI components
	content/
		config.ts       # Content collections schemas
		blog/           # Blog posts (MD/MDX)
		projects/       # Project entries (MD/MDX)
		work/           # Work experience entries (MD/MDX)
	layouts/
	lib/
		utils.ts        # Helpers (date, reading time, classnames)
	pages/
		index.astro     # Home
		robots.txt.ts   # Dynamic robots.txt
		rss.xml.ts      # Combined RSS for blog & projects
		blog/
			index.astro
			[...slug].astro
		projects/
			index.astro
			[...slug].astro
		work/
			index.astro
		cv/
			index.astro   # 302 -> /cv/cv.pdf
			en.astro      # 302 -> /cv/cv-eng.pdf
styles/
	global.css
```

Path aliases are configured in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@*": ["./src/*"],
    },
  },
}
```

You can import modules like `@components/Container.astro`, `@lib/utils`, `@consts`, etc.

## Content authoring

Content lives under `src/content/` and is validated by the schemas in `src/content/config.ts`.

### Blog (`src/content/blog`)

Frontmatter schema:

```ts
{
	title: string;
	description: string;
	date: Date;
	draft?: boolean;
}
```

Example `index.md`:

```md
---
title: "Hello World"
description: "My first post"
date: 2025-01-01
draft: false
---

Your content here.
```

### Projects (`src/content/projects`)

Frontmatter schema:

```ts
{
	title: string;
	description: string;
	date: Date;
	draft?: boolean;
	demoURL?: string;
	repoURL?: string;
	websiteURL?: string;
}
```

### Work (`src/content/work`)

Frontmatter schema:

```ts
{
  company: string;
  role: string;
  dateStart: Date;
  dateEnd: Date | string; // e.g. "Present"
}
```

Notes:

- Draft content (`draft: true`) is excluded from listings and the RSS feed.
- The homepage shows a limited number of items; adjust counts in `src/consts.ts` (`SITE.NUM_*_ON_HOMEPAGE`).

## SEO & feeds

- RSS: `/rss.xml` — combines blog posts and projects, sorted by date.
- Sitemap: generated automatically via `@astrojs/sitemap` (configured in `astro.config.mjs`).
- Robots: `/robots.txt` generated in `src/pages/robots.txt.ts` and references the sitemap.

Make sure `site` in `astro.config.mjs` points to your production URL for correct absolute URLs.

## Styling

Tailwind CSS 4 is enabled via the official Vite plugin (`@tailwindcss/vite`). Global styles live in `src/styles/global.css`. Utility class merging uses `tailwind-merge` and `clsx` through `cn()` in `src/lib/utils.ts`.

## Build & deploy

Build the site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The static output is in `dist/`. You can deploy it to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). If deploying to a subpath, set `base` in `astro.config.mjs` accordingly (there’s an example line commented out).

## Configuration

- `astro.config.mjs` — Site URL (`site`), optional `base`, MDX & sitemap integrations, Tailwind plugin
- `src/consts.ts` — Site metadata and social links
- `eslint.config.js` — Flat config for JS/TS/Astro rules

## License & attribution

This project is licensed under the MIT License (see `LICENSE`).

The site layout and content structure are inspired by the "Astro Nano" minimal blog/portfolio approach.

## Contact

Feel free to reach out:

- Website: https://boranuzun.ch/
- Email: contact@boranuzun.ch
- GitHub: https://github.com/boranuzun/
- LinkedIn: https://www.linkedin.com/in/boranuzun/
