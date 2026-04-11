export type GraphNode = {
	id: string;
	label: string;
	type: "hub" | "leaf";
	href?: string;
	weight?: number;
};

export type GraphLink = {
	source: string;
	target: string;
};

export type GraphData = {
	nodes: GraphNode[];
	links: GraphLink[];
};

type BlogEntry = {
	id: string;
	data: { title: string; tags?: string[] };
};

export function buildBlogGraph(posts: BlogEntry[]): GraphData {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const tagsSeen = new Set<string>();

	for (const post of posts) {
		const leafId = `post-${post.id}`;
		nodes.push({ id: leafId, label: post.data.title, type: "leaf", href: `/blog/${post.id}` });

		for (const tag of post.data.tags ?? []) {
			const hubId = `tag-${tag}`;
			if (!tagsSeen.has(tag)) {
				tagsSeen.add(tag);
				nodes.push({ id: hubId, label: tag, type: "hub" });
			}
			links.push({ source: leafId, target: hubId });
		}
	}

	return { nodes, links };
}
