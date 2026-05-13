# Portfolio — Boran Uzun (boranuzun.ch)

Personal portfolio website with blog, projects, work experience, RSS feed, sitemap, an Obsidian-style D3 knowledge graph, and an AI chatbot backend.

## Tech Stack

- **Astro 6** — static-first SSG, Vite under the hood
- **TypeScript** — strict mode (`astro/tsconfigs/strict`)
- **Tailwind CSS 4** — via `@tailwindcss/vite` Vite plugin (not PostCSS)
- **MDX** — via `@astrojs/mdx`
- **Astro Content Collections** — for blog, projects, and work entries (Content Layer API)
- **D3 v7** — Obsidian-style force-directed knowledge graph per blog post (local sidebar + full modal)
- **Cloudflare Workers + AI Gateway** — chatbot backend (`chatbot-worker/`)
- **Google Gemini API** — LLM powering the chatbot
- **ESLint** — flat config format (`eslint.config.js`) for Astro, TypeScript, and JavaScript files
- **Prettier** — code formatter with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`
- **Lefthook** — git hooks runner (configured in `lefthook.yml`)

## Prerequisites

**Playwright / Chromium** is required before the first build. `rehype-mermaid` uses a headless browser to render Mermaid diagrams as static SVGs at build time.

```sh
npx playwright install --with-deps chromium
```

The CI workflows install this automatically via `npx playwright install chromium`.

## Building and Running

### Frontend (Astro)

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Start development server on local network**: `npm run dev:network`
- **Typecheck and build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Preview on local network**: `npm run preview:network`
- **Lint the codebase**: `npm run lint` (or `npm run lint:fix` to auto-fix issues)
- **Format code**: `npm run format` (or `npm run format:check` to check only)
- **Run all checks**: `npm run test` (format check + lint + Vitest + chatbot tests + build)
- **Run site unit tests**: `npm run test:site`

### Chatbot Backend (Cloudflare Worker)

The chatbot backend is located in the `chatbot-worker/` directory.

- **Install dependencies**: `cd chatbot-worker && npm install`
- **Configuration**: Create a `.dev.vars` file in `chatbot-worker/` with `GEMINI_API_KEY=your_api_key_here`
- **Start development server**: `npm run dev`
- **Run tests**: `npm test`
- **Deploy**: `npm run deploy`

## Development Conventions

### Styling

- Tailwind CSS 4 is used for all styling via utility classes.
- Global styles are defined in `src/styles/global.css`.
- Class merging uses `tailwind-merge` and `clsx` through a custom `cn()` helper in `src/lib/utils.ts`.

### Font Loading

Fonts are loaded via Astro's `fontProviders.fontsource()` with per-page injection — Astro only downloads a font on pages where it detects usage. **Do not add new `font-*` Tailwind classes to globally-rendered components** (layouts, `Header.astro`, `Footer.astro`) unless that font is already loaded everywhere. Use a system font stack via `style="font-family: ui-monospace, monospace"` when you need a monospace appearance in global components without incurring a font download.

### Path Aliases

Configured in `tsconfig.json` — `@*` maps to `./src/*`. Examples: `@components/Header.astro`, `@lib/utils`, `@consts`.

### Routing and Trailing Slashes

`trailingSlash: "always"` is set in `astro.config.mjs`. All internal hrefs must end with `/` (e.g. `/blog/my-post/`). Omitting the trailing slash causes a 404 on Cloudflare Pages. This applies to links generated in TypeScript (e.g. `graph.ts`) as well as Astro templates.

### Icons

Always use Lucide SVG icons via `@lucide/astro`. Never use Unicode characters or emoji as icons.

### Content Collections

Content lives in `src/content/` and is strictly validated via Zod in `src/content.config.ts` (top-level file, not inside `src/content/`).

- **blog**: `title`, `description`, `date`, `tags?`, `draft?`
- **work**: `company`, `role`, `dateStart`, `dateEnd` (Date | `"Present"`)
- **projects**: `title`, `description`, `date`, `draft?`, `repoURL?`, `websiteURL?`, `technologies?`, `cover?`, `coverAlt?`

Blog and project content uses a folder-per-entry structure: `src/content/blog/<kebab-case-slug>/index.md`.

Draft content (`draft: true` in frontmatter) is excluded from all listings and the RSS feed.

### Knowledge Graph

The force-directed graph (`src/lib/graph.ts` + `src/components/ForceGraph.astro`) connects blog posts using two link types:

- **tag edges** — direct post-to-post edges between posts that share at least one tag (no intermediate tag nodes)
- **explicit edges** — extracted at build time by scanning each post body for markdown links matching `/blog/<slug>` (e.g. `[Astro architecture](/blog/astro-architecture/)`)

When writing blog posts, use standard markdown links `[readable title](/blog/slug/)` to create explicit graph connections. Bare paths like `/blog/slug` are also parsed by the regex but are less readable.

Key types exported from `graph.ts`:

```ts
type GraphNode = {
	id: string;
	label: string;
	type: "post";
	href?: string;
	weight: number;
	isCurrent?: boolean;
};
type GraphLink = { source: string; target: string; type: "tag" | "explicit" };
type LinkedPost = {
	title: string;
	href: string;
	linkType: "tag" | "explicit";
	sharedTags?: string[];
};
```

Node IDs follow the pattern `post-${post.id}`. All hrefs must include a trailing slash.

The `buildLocalGraph` function returns the depth-1 neighbourhood of a post (tag neighbours + explicit link neighbours). `buildFullGraph` returns all posts with all inter-post edges. `computeBacklinks` returns posts that link to a given post (via tags or explicit links).

### SEO & Feeds

- Combined RSS feed auto-generated at `/rss.xml`
- Sitemap auto-generated via `@astrojs/sitemap`
- `robots.txt` generated at `src/pages/robots.txt.ts`
- JSON-LD structured data for blog posts and projects via `src/lib/schema.ts`

### Linting and Formatting

ESLint uses the flat config format. Rules of note:

- Semicolons required (`semi: ["error", "always"]`)
- No quote-style enforcement

Prettier is configured for Astro and Tailwind class sorting. Both run as git pre-commit hooks via Lefthook.

### Testing

- **Site unit tests**: Vitest (`vitest.config.ts`) — run with `npm run test:site`
- **Chatbot Worker tests**: Vitest inside `chatbot-worker/` — run with `npm run test:chatbot`
- **Full test suite**: `npm run test` runs format check, lint, both Vitest suites, and a production build

`src/lib/__tests__/graph.test.ts` covers `parseExplicitLinks`, `buildLocalGraph`, `buildFullGraph`, and `computeBacklinks`. When modifying `graph.ts`, update these tests to match the new behaviour.

### Git Worktrees

Feature work is done in git worktrees under `.worktrees/` (already in `.gitignore`). To work on a feature:

```sh
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>
npm install
npm run dev
```

The worktree has its own `node_modules` and dev server. Changes made in the worktree do not affect the main working directory until merged.
