import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeMermaid from "rehype-mermaid";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Vite 7 clientAlias uses path.posix.join("/@fs/", absolutePath) which drops
// the leading "/" on macOS, causing @vite/env to fail resolution. This plugin
// intercepts it before the broken clientAlias chain runs.
const viteEnvPath = require.resolve("vite/dist/client/env.mjs");

import expressiveCode from "astro-expressive-code";

export default defineConfig({
	site: "https://boranuzun.ch/",
	trailingSlash: "always",
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "viewport",
	},
	integrations: [
		expressiveCode({
			themes: ["vitesse-light", "vitesse-dark"],
			useDarkModeMediaQuery: false,
			themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
		}),
		mdx(),
		sitemap(),
	],
	fonts: [
		{
			name: "Geist",
			cssVariable: "--font-body",
			provider: fontProviders.fontsource(),
			weights: [400, 600],
			styles: ["normal"],
			fallbacks: ["system-ui", "sans-serif"],
		},
		{
			name: "Lora",
			cssVariable: "--font-serif",
			provider: fontProviders.fontsource(),
			weights: [400, 700],
			styles: ["normal", "italic"],
			fallbacks: ["Georgia", "serif"],
		},
		{
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			provider: fontProviders.fontsource(),
			weights: [400, 700],
			styles: ["normal"],
			subsets: ["latin"],
			fallbacks: ["Fira Code", "Consolas", "Monaco", "Ubuntu Mono", "monospace"],
		},
	],
	vite: {
		plugins: [
			tailwindcss(),
			{
				name: "fix-vite-env",
				enforce: "pre",
				resolveId(id) {
					if (id === "@vite/env") return viteEnvPath;
				},
			},
		],
	},
	markdown: {
		remarkPlugins: [remarkModifiedTime],
		rehypePlugins: [[rehypeMermaid, { mermaidConfig: { theme: "neutral" } }]],
		syntaxHighlight: {
			excludeLangs: ["mermaid"],
		},
	},
});
