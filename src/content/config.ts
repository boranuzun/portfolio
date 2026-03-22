import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    mermaid: z.boolean().default(false),
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.literal("Present")]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    repoURL: z.string().url().optional(),
    websiteURL: z.string().url().optional(),
    technologies: z.array(z.string().min(1)).optional(),
    mermaid: z.boolean().default(false),
  }),
});

export const collections = { blog, work, projects };
