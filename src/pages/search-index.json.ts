import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
	const blog = (await getCollection("blog")).filter((p) => !p.data.draft);
	const projects = (await getCollection("projects")).filter((p) => !p.data.draft);

	const pages = [
		{ title: "Home", url: "/", group: "Pages" },
		{ title: "Blog", url: "/blog", group: "Pages" },
		{ title: "Projects", url: "/projects", group: "Pages" },
		{ title: "Work", url: "/work", group: "Pages" },
		{ title: "Keys", url: "/keys", group: "Pages" },
	];

	const blogEntries = blog.map((post) => ({
		title: post.data.title,
		description: post.data.description,
		url: `/blog/${post.id}`,
		group: "Blog Posts",
	}));

	const projectEntries = projects.map((project) => ({
		title: project.data.title,
		description: project.data.description,
		url: `/projects/${project.id}`,
		group: "Projects",
	}));

	const index = [...pages, ...blogEntries, ...projectEntries];

	return new Response(JSON.stringify(index), {
		headers: { "Content-Type": "application/json" },
	});
};
