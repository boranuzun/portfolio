import { getState, setMode, resetForOpen } from "./state";
import { getVisibleActions, renderCommandMode, renderSearchMode } from "./renderer";
import { addMessage, getChatState, handleChatKeydown, sendMessage } from "./chat";
import { icons } from "./icons";
import type { SearchEntry } from "./types";

let currentSearchEntries: SearchEntry[] = [];
let cmdkController: AbortController | null = null;

function getElements() {
	return {
		overlay: document.getElementById("cmd-palette"),
		searchHeader: document.getElementById("cmd-search-header"),
		searchTag: document.getElementById("cmd-search-tag"),
		chatHeader: document.getElementById("cmd-chat-header"),
		input: document.getElementById("cmd-input") as HTMLInputElement | null,
		chatInput: document.getElementById("cmd-chat-input") as HTMLInputElement | null,
		results: document.getElementById("cmd-results"),
		chatMessages: document.getElementById("cmd-chat-messages"),
		askAiFooter: document.getElementById("cmd-ask-ai-footer"),
		chatFooter: document.getElementById("cmd-chat-footer"),
	};
}

function showCommandMode(): void {
	const els = getElements();
	if (!els.overlay) return;

	setMode("command");

	els.searchHeader?.classList.remove("hidden");
	els.searchTag?.classList.add("hidden");
	els.chatHeader?.classList.add("hidden");
	els.results?.classList.remove("hidden");
	els.chatMessages?.classList.add("hidden");
	els.askAiFooter?.classList.remove("hidden");
	els.chatFooter?.classList.add("hidden");

	if (els.input) {
		els.input.value = "";
		els.input.placeholder = "Search commands or ask AI...";
		els.input.focus();
	}

	if (els.results) renderCommandMode(els.results);
}

function showSearchMode(): void {
	const els = getElements();
	if (!els.overlay) return;

	const state = getState();
	const query = state.query;
	setMode("search");

	els.searchHeader?.classList.remove("hidden");
	els.searchTag?.classList.remove("hidden");
	els.chatHeader?.classList.add("hidden");
	els.results?.classList.remove("hidden");
	els.chatMessages?.classList.add("hidden");
	els.askAiFooter?.classList.remove("hidden");
	els.chatFooter?.classList.add("hidden");

	if (els.input) {
		els.input.value = query;
		els.input.placeholder = "Filter posts and projects...";
		els.input.focus();
	}

	if (els.results) {
		renderSearchMode(els.results, query)
			.then((entries) => {
				currentSearchEntries = entries;
			})
			.catch(() => {});
	}
}

function showChatMode(prefillQuery?: string): void {
	const els = getElements();
	if (!els.overlay) return;

	setMode("chat");

	els.searchHeader?.classList.add("hidden");
	els.chatHeader?.classList.remove("hidden");
	els.results?.classList.add("hidden");
	els.chatMessages?.classList.remove("hidden");
	els.askAiFooter?.classList.add("hidden");
	els.chatFooter?.classList.remove("hidden");

	if (els.chatInput) {
		if (prefillQuery) {
			els.chatInput.value = prefillQuery;
		}
		els.chatInput.focus();
	}

	// Auto-send prefilled query or show welcome message
	if (prefillQuery) {
		sendMessage();
	} else if (
		getChatState().apiHistory.length === 0 &&
		els.chatMessages &&
		!els.chatMessages.hasChildNodes()
	) {
		addMessage(
			"Hey! 👋 I know all about Boran's experience, projects, and skills. What would you like to know?",
			false,
		);
	}

	// Scroll chat to bottom
	if (els.chatMessages) {
		requestAnimationFrame(() => {
			els.chatMessages!.scrollTop = els.chatMessages!.scrollHeight;
		});
	}
}

function open(): void {
	const els = getElements();
	if (!els.overlay) return;

	const state = getState();
	state.isOpen = true;
	resetForOpen();

	els.overlay.classList.remove("hidden");
	els.overlay.classList.add("flex");

	// Restore to last mode
	if (state.mode === "chat") {
		showChatMode();
	} else {
		showCommandMode();
	}
}

function close(): void {
	const els = getElements();
	if (!els.overlay) return;

	const state = getState();
	state.isOpen = false;

	els.overlay.classList.add("hidden");
	els.overlay.classList.remove("flex");
}

function executeSelected(): void {
	const state = getState();

	if (state.mode === "command") {
		const actions = getVisibleActions();
		// Check if the selected item is the search trigger (after all actions)
		if (state.query && state.selectedIndex === actions.length) {
			showSearchMode();
			return;
		}
		const action = actions[state.selectedIndex];
		if (action) {
			if (!action.keepOpen) close();
			action.handler();
		}
	} else if (state.mode === "search") {
		const entry = currentSearchEntries[state.selectedIndex];
		if (entry) {
			close();
			window.location.href = entry.url;
		}
	}
}

function handleInput(): void {
	const els = getElements();
	const state = getState();
	if (!els.input || !els.results) return;

	state.query = els.input.value;
	state.selectedIndex = 0;

	if (state.mode === "command") {
		renderCommandMode(els.results);
	} else if (state.mode === "search") {
		renderSearchMode(els.results, state.query)
			.then((entries) => {
				currentSearchEntries = entries;
			})
			.catch(() => {});
	}
}

function injectIcons(): void {
	const inject = (id: string, svg: string) => {
		const el = document.getElementById(id);
		if (el && !el.hasChildNodes()) {
			el.innerHTML = svg;
		}
	};
	inject("cmd-search-icon", icons.search);
	inject("cmd-chat-back", icons.chevronLeft);
	inject("cmd-ask-ai-icon", icons.chat);
	inject("cmd-key-command", icons.command);
	inject("cmd-key-enter", icons.enter);
	inject("cmd-key-chat-enter", icons.enter);
}

function initCmdk(): void {
	const els = getElements();
	if (!els.overlay) return;

	// Abort previous listeners to prevent accumulation across Astro navigations
	cmdkController?.abort();
	cmdkController = new AbortController();
	const { signal } = cmdkController;

	injectIcons();

	// Global keyboard shortcut
	document.addEventListener(
		"keydown",
		(e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				if (getState().isOpen) {
					close();
				} else {
					open();
				}
			}
		},
		{ signal },
	);

	// Close on overlay click
	els.overlay.addEventListener(
		"click",
		(e) => {
			if (e.target === els.overlay) close();
		},
		{ signal },
	);

	// Input handler
	els.input?.addEventListener("input", handleInput, { signal });

	// Search trigger click from renderer
	els.results?.addEventListener(
		"cmdk:search-trigger",
		() => {
			showSearchMode();
		},
		{ signal },
	);

	// Keyboard navigation for search input
	els.input?.addEventListener(
		"keydown",
		(e) => {
			const state = getState();

			if (e.key === "Escape") {
				e.preventDefault();
				if (state.mode !== "command") {
					showCommandMode();
				} else {
					close();
				}
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				state.selectedIndex = Math.min(state.selectedIndex + 1, state.visibleCount - 1);
				if (state.mode === "command" && els.results) {
					renderCommandMode(els.results);
				} else if (state.mode === "search" && els.results) {
					renderSearchMode(els.results, state.query)
						.then((entries) => {
							currentSearchEntries = entries;
						})
						.catch(() => {});
				}
				return;
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
				if (state.mode === "command" && els.results) {
					renderCommandMode(els.results);
				} else if (state.mode === "search" && els.results) {
					renderSearchMode(els.results, state.query)
						.then((entries) => {
							currentSearchEntries = entries;
						})
						.catch(() => {});
				}
				return;
			}

			if (e.key === "Enter") {
				e.preventDefault();
				if (e.metaKey || e.ctrlKey) {
					const query = els.input!.value.trim();
					showChatMode(query || undefined);
				} else {
					executeSelected();
				}
				return;
			}

			if (e.key === "Backspace" && !els.input!.value && state.mode === "search") {
				e.preventDefault();
				showCommandMode();
				return;
			}
		},
		{ signal },
	);

	// Chat input keyboard handler
	els.chatInput?.addEventListener(
		"keydown",
		(e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				showCommandMode();
				return;
			}

			if (e.key === "Backspace" && !els.chatInput!.value) {
				showCommandMode();
				return;
			}

			handleChatKeydown(e);
		},
		{ signal },
	);

	// Ask AI footer click
	els.askAiFooter?.addEventListener(
		"click",
		() => {
			showChatMode();
		},
		{ signal },
	);

	// Chat back button
	const chatBackBtn = document.getElementById("cmd-chat-back");
	chatBackBtn?.addEventListener(
		"click",
		() => {
			showCommandMode();
		},
		{ signal },
	);

	// Trigger button
	document.getElementById("cmd-k-trigger")?.addEventListener(
		"click",
		() => {
			if (getState().isOpen) {
				close();
			} else {
				open();
			}
		},
		{ signal },
	);
}

document.addEventListener("DOMContentLoaded", initCmdk);
document.addEventListener("astro:after-swap", initCmdk);
