# Portfolio — Boran Uzun (boranuzun.ch)

Personal portfolio website with blog, projects, work experience, RSS feed, sitemap, and an AI chatbot backend.

## Tech Stack

- **Astro 5** — static-first SSG, Vite under the hood
- **TypeScript** — strict mode (`astro/tsconfigs/strict`)
- **Tailwind CSS 4** — via `@tailwindcss/vite` Vite plugin (not PostCSS)
- **MDX** — via `@astrojs/mdx`
- **Astro Content Collections** — for blog, projects, and work entries
- **Cloudflare Workers + AI Gateway** — chatbot backend (`chatbot-worker/`)
- **Google Gemini API** — LLM powering the chatbot
- **ESLint** — flat config format (`eslint.config.js`) for Astro, TypeScript, and JavaScript files

## Building and Running

### Frontend (Astro)

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Start development server on local network**: `npm run dev:network`
- **Typecheck and build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint the codebase**: `npm run lint` (or `npm run lint:fix` to auto-fix issues)

### Chatbot Backend (Cloudflare Worker)

The chatbot backend is located in the `chatbot-worker/` directory.

- **Install dependencies**: `cd chatbot-worker && npm install`
- **Configuration**: Create a `.dev.vars` file in `chatbot-worker/` with your API key:
  ```env
  GEMINI_API_KEY=your_api_key_here
  ```
- **Start development server**: `npm run dev`
- **Deploy**: `npm run deploy`

## Project Structure

```
/
├── astro.config.mjs         # Astro config (site URL, MDX, sitemap, Tailwind Vite plugin)
├── eslint.config.js         # Flat ESLint config (JS + TS + Astro rules)
├── package.json
├── tsconfig.json            # Strict TS, baseUrl ".", @* → ./src/* path aliases
├── chatbot-worker/          # Cloudflare Worker for AI chatbot backend
├── public/
│   ├── cv/                  # PDF CVs served as static files
│   └── fonts/
└── src/
    ├── consts.ts            # SITE, HOME, BLOG, WORK, PROJECTS, SOCIALS constants
    ├── types.ts             # Shared TS types (Site, Metadata, Socials, SkillCategory, Skills)
    ├── env.d.ts
    ├── components/          # Astro UI components
    ├── content/
    │   ├── config.ts        # Content collection schemas (Zod)
    │   ├── blog/            # Blog posts — one folder per post, index.md/mdx inside
    │   ├── projects/        # Project entries
    │   └── work/            # Work experience entries
    ├── data/
    │   └── skills.json      # Skills data (SkillCategory[])
    ├── layouts/
    │   └── PageLayout.astro
    ├── lib/
    │   ├── utils.ts         # Helpers: date formatting, reading time, cn()
    │   └── schema.ts        # JSON-LD schema helpers
    ├── pages/               # Astro file-based routing
    └── styles/
        └── global.css
```

## Development Conventions

### Styling

- Tailwind CSS 4 is used for all styling via utility classes.
- Global styles are defined in `src/styles/global.css`.
- Class merging uses `tailwind-merge` and `clsx` through a custom `cn()` helper in `src/lib/utils.ts`.

### Path Aliases

Configured in `tsconfig.json` — `@*` maps to `./src/*`:

```ts
import Component from "@components/Header.astro";
import { cn } from "@lib/utils";
import { SITE } from "@consts";
```

### Content Collections

Content lives in `src/content/` and is strictly validated via Zod in `src/content/config.ts`.

- **blog**: `title`, `description`, `date`, `draft?`
- **work**: `company`, `role`, `dateStart`, `dateEnd` (Date | `"Present"`)
- **projects**: `title`, `description`, `date`, `draft?`, `demoURL?`, `repoURL?`, `websiteURL?`, `technologies?`

Blog and project content uses a folder-per-entry structure: `src/content/blog/<kebab-case-slug>/index.md`.

Draft content (`draft: true` in frontmatter) is excluded from all listings and the RSS feed.

### SEO & Feeds

- Combined RSS feed auto-generated at `/rss.xml`
- Sitemap auto-generated via `@astrojs/sitemap`
- `robots.txt` generated at `src/pages/robots.txt.ts`

### Linting

ESLint uses the flat config format. Rules of note:
- Semicolons required (`semi: ["error", "always"]`)
- No quote-style enforcement

### No Test Suite

Correctness is enforced by TypeScript strict mode, ESLint, and `astro check` (run as part of `npm run build`).
