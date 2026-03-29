import type { Section } from "./types";
import { icons } from "./icons";

function navigateTo(url: string): void {
	window.location.href = url;
}

function openExternal(url: string): void {
	window.open(url, "_blank", "noopener,noreferrer");
}

function toggleTheme(): void {
	document.getElementById("theme-button")?.click();
}

export function getSections(): Section[] {
	return [
		{
			name: "Actions",
			actions: [
				{
					name: "Toggle theme",
					icon: icons.moon,
					handler: toggleTheme,
					keepOpen: true,
					keywords: ["dark", "light", "mode"],
				},
			],
		},
		{
			name: "Navigate",
			actions: [
				{ name: "Home", icon: icons.home, handler: () => navigateTo("/") },
				{
					name: "Blog",
					icon: icons.book,
					handler: () => navigateTo("/blog"),
					keywords: ["posts", "articles"],
				},
				{ name: "Projects", icon: icons.folder, handler: () => navigateTo("/projects") },
				{
					name: "Work",
					icon: icons.briefcase,
					handler: () => navigateTo("/work"),
					keywords: ["experience", "career"],
				},
				{
					name: "Keys",
					icon: icons.key,
					handler: () => navigateTo("/keys"),
					keywords: ["gpg", "pgp", "encryption"],
				},
			],
		},
		{
			name: "Links",
			actions: [
				{
					name: "GitHub",
					icon: icons.github,
					handler: () => openExternal("https://github.com/boranuzun/"),
					external: true,
				},
				{
					name: "LinkedIn",
					icon: icons.linkedin,
					handler: () => openExternal("https://www.linkedin.com/in/boranuzun/"),
					external: true,
				},
			],
		},
		{
			name: "Contact",
			actions: [
				{
					name: "Email",
					icon: icons.mail,
					handler: () => {
						window.location.href = "mailto:contact@boranuzun.ch";
					},
				},
				{
					name: "Phone",
					icon: icons.phone,
					handler: () => {
						window.location.href = "tel:+41764427098";
					},
					keywords: ["call", "tel"],
				},
			],
		},
	];
}
