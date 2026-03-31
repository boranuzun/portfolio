import type { Action, SearchEntry } from "./types";
import { getState } from "./state";
import { getSections } from "./actions";
import { icons } from "./icons";

let searchIndex: SearchEntry[] | null = null;

function createIcon(svg: string): HTMLSpanElement {
	const span = document.createElement("span");
	span.className = "cmd-icon";
	span.innerHTML = svg;
	return span;
}

function createExternalBadge(): HTMLSpanElement {
	const span = document.createElement("span");
	span.className = "cmd-external";
	span.innerHTML = icons.externalLink;
	return span;
}

export function getVisibleActions(): Action[] {
	const state = getState();
	const query = state.query.toLowerCase();
	const result: Action[] = [];

	for (const section of getSections()) {
		for (const action of section.actions) {
			const nameMatch = action.name.toLowerCase().includes(query);
			const keywordMatch = action.keywords?.some((kw) => kw.includes(query));
			if (!query || nameMatch || keywordMatch) {
				result.push(action);
			}
		}
	}

	return result;
}

export function renderCommandMode(container: HTMLElement): void {
	const state = getState();
	const query = state.query.toLowerCase();

	container.replaceChildren();

	let globalIndex = 0;
	const sections = getSections();

	for (const section of sections) {
		const matching = section.actions.filter((action) => {
			if (!query) return true;
			const nameMatch = action.name.toLowerCase().includes(query);
			const keywordMatch = action.keywords?.some((kw) => kw.includes(query));
			return nameMatch || keywordMatch;
		});

		if (matching.length === 0) continue;

		const groupEl = document.createElement("div");
		groupEl.className = "cmd-group";
		groupEl.textContent = section.name;
		container.appendChild(groupEl);

		for (const action of matching) {
			const item = document.createElement("div");
			item.className = `cmd-item${globalIndex === state.selectedIndex ? " cmd-item-active" : ""}`;
			item.dataset.index = String(globalIndex);

			item.appendChild(createIcon(action.icon));

			const nameSpan = document.createElement("span");
			nameSpan.className = "cmd-item-name";
			nameSpan.textContent = action.name;
			item.appendChild(nameSpan);

			if (action.external) {
				item.appendChild(createExternalBadge());
			}

			if (action.badge) {
				const { text, variant } = action.badge();
				const kbd = document.createElement("kbd");
				kbd.className = "cmd-kbd";
				if (variant === "green") {
					kbd.style.color = "#16a34a";
					kbd.style.borderColor = "#16a34a";
				} else if (variant === "red") {
					kbd.style.color = "#dc2626";
					kbd.style.borderColor = "#dc2626";
				}
				kbd.textContent = text;
				item.appendChild(kbd);
			}

			item.addEventListener("click", () => {
				action.handler();
				if (action.keepOpen) renderCommandMode(container);
			});

			container.appendChild(item);
			globalIndex++;
		}
	}

	// Dynamic search section when query is present
	if (query) {
		const groupEl = document.createElement("div");
		groupEl.className = "cmd-group";
		groupEl.textContent = "Search";
		container.appendChild(groupEl);

		const item = document.createElement("div");
		item.className = `cmd-item${globalIndex === state.selectedIndex ? " cmd-item-active" : ""}`;
		item.dataset.index = String(globalIndex);
		item.dataset.searchTrigger = "true";

		item.appendChild(createIcon(icons.search));

		const nameSpan = document.createElement("span");
		nameSpan.className = "cmd-item-name";
		nameSpan.textContent = `Search "${state.query}" in posts and projects`;
		item.appendChild(nameSpan);

		const enterBadge = document.createElement("kbd");
		enterBadge.className = "cmd-kbd";
		enterBadge.innerHTML = icons.enter;
		item.appendChild(enterBadge);

		item.addEventListener("click", () => {
			container.dispatchEvent(new CustomEvent("cmdk:search-trigger"));
		});

		container.appendChild(item);
		globalIndex++;
	}

	state.visibleCount = globalIndex;

	if (globalIndex === 0) {
		const empty = document.createElement("div");
		empty.className = "cmd-no-results";
		empty.textContent = "No results found";
		container.appendChild(empty);
	}

	const active = container.querySelector(".cmd-item-active");
	if (active) active.scrollIntoView({ block: "nearest" });
}

async function loadSearchIndex(): Promise<SearchEntry[]> {
	if (searchIndex) return searchIndex;
	const res = await fetch("/search-index.json");
	if (!res.ok) throw new Error(`Failed to load search index: ${res.status}`);
	searchIndex = await res.json();
	return searchIndex!;
}

export async function renderSearchMode(
	container: HTMLElement,
	query: string,
): Promise<SearchEntry[]> {
	const state = getState();
	container.replaceChildren();

	const index = await loadSearchIndex();
	const contentOnly = index.filter((entry) => entry.group !== "Pages");
	const lower = query.toLowerCase();
	const filtered = lower
		? contentOnly.filter(
				(entry) =>
					entry.title.toLowerCase().includes(lower) ||
					(entry.description && entry.description.toLowerCase().includes(lower)),
			)
		: contentOnly;

	if (filtered.length === 0) {
		const empty = document.createElement("div");
		empty.className = "cmd-no-results";
		empty.textContent = "No results found";
		container.appendChild(empty);
		state.visibleCount = 0;
		return filtered;
	}

	let currentGroup = "";
	let globalIndex = 0;

	for (const entry of filtered) {
		if (entry.group !== currentGroup) {
			currentGroup = entry.group;
			const groupEl = document.createElement("div");
			groupEl.className = "cmd-group";
			groupEl.textContent = currentGroup;
			container.appendChild(groupEl);
		}

		const item = document.createElement("a");
		item.href = entry.url;
		item.className = `cmd-item cmd-item-search${globalIndex === state.selectedIndex ? " cmd-item-active" : ""}`;
		item.dataset.index = String(globalIndex);

		const nameSpan = document.createElement("span");
		nameSpan.className = "cmd-item-name";
		nameSpan.textContent = entry.title;
		item.appendChild(nameSpan);

		if (entry.description) {
			const descSpan = document.createElement("span");
			descSpan.className = "cmd-item-desc";
			descSpan.textContent = entry.description;
			item.appendChild(descSpan);
		}

		container.appendChild(item);
		globalIndex++;
	}

	state.visibleCount = globalIndex;

	const active = container.querySelector(".cmd-item-active");
	if (active) active.scrollIntoView({ block: "nearest" });

	return filtered;
}
