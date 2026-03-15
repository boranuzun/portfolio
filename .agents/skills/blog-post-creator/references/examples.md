# Blog Post Examples

## Complete Example Structure

```markdown
---
title: "How I Migrated My Portfolio From Next.js to Astro"
description: "Why I switched to Astro 5, what I gained in build speed, and the one gotcha that cost me an afternoon."
date: "Mar 15 2026"
draft: true
---

## The Problem

I'd been running my portfolio on Next.js for two years. Build times were creeping up and the bundle size felt wrong for a site that's mostly static content.

## Investigation

I traced the bloat to hydration overhead. Every page was shipping a full React runtime even though nothing on most pages was interactive. I looked at three options:

1. Keep Next.js and add `output: export` — still ships the runtime
2. Eleventy — lightweight but no TypeScript-first story
3. Astro — zero JS by default, islands for the parts that need it

I spent a weekend on the Astro docs and built a prototype.

## The Solution

The migration was mostly mechanical. Content Collections replaced `getStaticProps`, and the frontmatter schema is validated at build time via Zod:

```typescript
// src/content/config.ts
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
  }),
});
```

The one gotcha: Tailwind CSS 4 uses a Vite plugin, not PostCSS. The config looks different from every tutorial you'll find:

```js
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```

## Results

Build time dropped from 12s to 3s. The deployed site ships zero JavaScript on static pages. The chatbot component is the only island, and it hydrates on interaction.

[See the source](https://github.com/boranuzun/portfolio)
```

## Frontmatter Template

Every post must start with:

```markdown
---
title: "Your Post Title Here"
description: "A brief summary of the post (1-2 sentences)."
date: "Mar 15 2026"
draft: true
---
```

**Rules:**
- `title` and `description` are required strings
- `date` accepts any parseable date string (e.g. `"Mar 15 2026"`, `"2026-03-15"`)
- Set `draft: true` while writing; remove or set `false` when ready to publish
- Do not add `published` — it is not in this project's schema and will cause a build error
