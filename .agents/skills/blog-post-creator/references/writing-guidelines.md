# Blog Post Writing Guidelines

Complete style guide for creating blog posts for boranuzun.ch.

## Tone and Voice

- **Direct and conversational** - Write like you're explaining to a friend
- **First-person perspective** - Use "I did...", "I found...", "I noticed..."
- **Self-aware and honest** - Admit mistakes and dead ends openly
- **No corporate speak** - Avoid buzzwords, flowery metaphors, and hype
- **Code-first** - Show concrete examples before abstract theory

## Structure Pattern

Use this proven flow:

1. **Opening** - Hook the reader, establish the real problem or motivation
2. **Investigation** - Show your process, dead ends, and trade-offs considered
3. **Solution** - Working, practical, code-first explanation
4. **Results** - What changed, what worked, what failed, what is next

## Heading Levels

Use **H2 headings only** for blog posts. Example:

```markdown
## The Problem

## How I Approached This

## The Solution

## What I Learned
```

## Code Examples

- Always include working, tested code
- Show actual project paths and context
- Use backticks for file references: `src/lib/utils.ts`
- Include language identifiers in code blocks: ` ```typescript `

## Links and References

- Link to relevant repos, docs, or source material
- Use markdown format: `[text](url)`

## Formatting

- Use `**bold**` for emphasis, not _italic_
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Break complex ideas into numbered steps

## Don't Do This

- ❌ Write in third person
- ❌ Use "we" for personal situations
- ❌ Over-explain technical concepts (readers know the space)
- ❌ Use marketing language or hype
- ❌ Include unnecessary preamble

## Tech Stack Context

Reference naturally when relevant:

- Astro 5, Content Collections
- TypeScript (strict mode)
- Tailwind CSS 4 (via `@tailwindcss/vite`, not PostCSS)
- MDX (`@astrojs/mdx`)
- Cloudflare Workers, Google Gemini API (chatbot)

## File Location

Blog posts live in `src/content/blog/` with one folder per post:

```
src/content/blog/
└── my-post-title/
    └── index.md
```

- Folder name must be kebab-case — it becomes the URL slug
- Good: `src/content/blog/astro-migration/index.md`
- Bad: `src/content/blog/AstroMigration/index.md`
