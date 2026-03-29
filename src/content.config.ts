import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		date: z.coerce.date(),
		draft: z.boolean().default(false),
		mermaid: z.boolean().default(false),
	}),
});

const work = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
	schema: z.object({
		company: z.string().min(1),
		role: z.string().min(1),
		dateStart: z.coerce.date(),
		dateEnd: z.union([z.coerce.date(), z.literal("Present")]),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(1),
		date: z.coerce.date(),
		draft: z.boolean().default(false),
		repoURL: z.url().optional(),
		websiteURL: z.url().optional(),
		technologies: z.array(z.string().min(1)).optional(),
		mermaid: z.boolean().default(false),
	}),
});

export const collections = { blog, work, projects };
