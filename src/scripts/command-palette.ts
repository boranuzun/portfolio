type SearchEntry = {
  title: string;
  description?: string;
  url: string;
  group: string;
};

let searchIndex: SearchEntry[] = [];
let isOpen = false;
let selectedIndex = 0;
let currentEntries: SearchEntry[] = [];

async function loadIndex(): Promise<void> {
  if (searchIndex.length > 0) return;
  const res = await fetch("/search-index.json");
  searchIndex = await res.json();
}

function filterEntries(query: string): SearchEntry[] {
  if (!query.trim()) return searchIndex.slice(0, 10);
  const lower = query.toLowerCase();
  return searchIndex.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lower) ||
      (entry.description && entry.description.toLowerCase().includes(lower))
  );
}

function createGroupElement(groupName: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "cmd-group";
  el.textContent = groupName;
  return el;
}

function createItemElement(entry: SearchEntry, index: number): HTMLAnchorElement {
  const item = document.createElement("a");
  item.href = entry.url;
  item.className = `cmd-item${index === selectedIndex ? " cmd-item-active" : ""}`;
  item.dataset.index = String(index);

  const titleSpan = document.createElement("span");
  titleSpan.className = "cmd-item-title";
  titleSpan.textContent = entry.title;
  item.appendChild(titleSpan);

  if (entry.description) {
    const descSpan = document.createElement("span");
    descSpan.className = "cmd-item-desc";
    descSpan.textContent = entry.description;
    item.appendChild(descSpan);
  }

  return item;
}

function renderResults(entries: SearchEntry[], container: HTMLElement): void {
  container.replaceChildren();
  if (entries.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "cmd-no-results";
    noResults.textContent = "No results found";
    container.appendChild(noResults);
    return;
  }

  let currentGroup = "";
  entries.forEach((entry, i) => {
    if (entry.group !== currentGroup) {
      currentGroup = entry.group;
      container.appendChild(createGroupElement(currentGroup));
    }
    container.appendChild(createItemElement(entry, i));
  });

  // Scroll active item into view
  const active = container.querySelector(".cmd-item-active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function open(): void {
  const overlay = document.getElementById("cmd-palette");
  const input = document.getElementById("cmd-input") as HTMLInputElement | null;
  if (!overlay || !input) return;

  isOpen = true;
  selectedIndex = 0;
  input.value = "";
  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  input.focus();

  loadIndex().then(() => {
    const results = document.getElementById("cmd-results");
    if (results) {
      currentEntries = filterEntries("");
      renderResults(currentEntries, results);
    }
  });
}

function close(): void {
  const overlay = document.getElementById("cmd-palette");
  if (!overlay) return;
  isOpen = false;
  overlay.classList.add("hidden");
  overlay.classList.remove("flex");
}

function navigate(): void {
  if (currentEntries.length === 0) return;
  const entry = currentEntries[selectedIndex];
  if (entry) {
    close();
    window.location.href = entry.url;
  }
}

function initCommandPalette(): void {
  const input = document.getElementById("cmd-input") as HTMLInputElement | null;
  const results = document.getElementById("cmd-results");
  const overlay = document.getElementById("cmd-palette");

  if (!input || !results || !overlay) return;

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (isOpen) { close(); } else { open(); }
    }
    if (e.key === "Escape" && isOpen) {
      close();
    }
  });

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Search input
  input.addEventListener("input", async () => {
    await loadIndex();
    currentEntries = filterEntries(input.value);
    selectedIndex = 0;
    renderResults(currentEntries, results);
  });

  // Keyboard navigation inside input
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentEntries.length - 1);
      renderResults(currentEntries, results);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      renderResults(currentEntries, results);
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate();
    }
  });

  // Trigger buttons
  document.getElementById("cmd-k-trigger")?.addEventListener("click", () => {
    if (isOpen) { close(); } else { open(); }
  });
}

document.addEventListener("DOMContentLoaded", initCommandPalette);
document.addEventListener("astro:after-swap", initCommandPalette);
