---
name: blog-post-creator
description: Create new Astro blog posts in src/content/blog/<kebab-case-slug>/index.md with valid frontmatter, consistent structure, and natural voice.
---

# Blog Post Creator

Create new blog posts for this Astro portfolio using valid content collection frontmatter and consistent markdown structure.

## Reference Files

Before writing any post, read these files:

- `references/writing-guidelines.md` — voice, tone, and style rules
- `references/examples.md` — complete post example and frontmatter template



Create a new post at:

src/content/blog/<kebab-case-slug>/index.md

Use this frontmatter:

```markdown
---
title: "Your Post Title Here"
description: "A brief summary of the post (1-2 sentences)."
date: "Jan 1 2025"
draft: true
---
```

Rules:

- Keep title and description concise and specific.
- Use a parseable date string (project already uses formats like "Sep 27 2025").
- Use draft: true while writing.
- Set draft: false (or remove draft) when ready to publish.

## Core Structure

Use this flow for all posts:

1. Opening - Hook reader and establish the real problem.
2. Investigation - Show process, dead ends, and trade-offs.
3. Solution - Working, practical, code-first explanation.
4. Results - What changed, what worked, what failed, what is next.

## Voice Essentials

- First-person voice: "I did...", "I found..."
- Self-aware and honest tone: mention mistakes and lessons
- Direct and conversational, no fluff
- Code-first: concrete examples before abstract theory

## File Naming

- Slug folder must be kebab-case.
- Final path format:
  src/content/blog/my-post-title/index.md

## Project Constraints

- Frontmatter must match Astro content schema.
- Keep markdown clean and readable.
- Prefer short sections and clear headings.
- Include only accurate claims and reproducible examples.

## Validation Checklist

Before finalizing:

- Frontmatter fields are valid.
- draft state is intentional.
- Date is parseable.
- Slug path is correct.
- Post reads naturally and matches voice guidelines (see references/writing-guidelines.md).
- If the post contains any Mermaid diagrams, invoke the `mermaid-creator` skill to render them.
- Run the `humanizer` skill on the finished post to remove AI-sounding language before marking draft: false.
