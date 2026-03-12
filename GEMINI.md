# Project Overview

This is a personal website and portfolio built with Astro 5, TypeScript, Tailwind CSS 4, and Content Collections. It includes a blog, projects, work experience, RSS feed, sitemap, and simple CV redirects.

It also features an AI Chatbot backend powered by Google Gemini API, running on Cloudflare Workers and routed through Cloudflare AI Gateway.

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

## Development Conventions

- **Tech Stack**: Astro 5, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), MDX (`@astrojs/mdx`).
- **Styling**: Tailwind CSS 4 is used for styling. Utility class merging uses `tailwind-merge` and `clsx` through a custom `cn()` helper located in `src/lib/utils.ts`. Global styles are defined in `src/styles/global.css`.
- **Content Management**: Content is managed using Astro Content Collections located in `src/content/`.
  - Collections exist for `blog`, `projects`, and `work`.
  - Content is authored in MD/MDX format.
  - Draft content (`draft: true` in frontmatter) is excluded from listings and RSS feeds.
  - Frontmatter schemas are strictly validated using Zod in `src/content/config.ts`.
- **Path Aliases**: The project uses path aliases configured in `tsconfig.json` (e.g., `@components/*`, `@layouts/*`, `@lib/*`, `@consts`, `@data/*`).
- **SEO & Feeds**: The site automatically generates a combined RSS feed (`/rss.xml`), a sitemap (`@astrojs/sitemap`), and a `robots.txt` file.
- **Linting**: ESLint is configured with the flat config format (`eslint.config.js`) for Astro, TypeScript, and JavaScript files.
