export function renderMarkdown(text: string): string {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /`(.+?)`/g,
      '<code class="cmd-chat-code">$1</code>',
    )
    .replace(
      /\[([^\]]+)\]\(((https?:\/\/|mailto:)[^\s)]+)\)/g,
      (_match, linkText: string, url: string) => {
        try {
          const parsed = new URL(url);
          if (!["http:", "https:", "mailto:"].includes(parsed.protocol))
            return linkText;
        } catch {
          return linkText;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="cmd-chat-link">${linkText}</a>`;
      },
    )
    .replace(
      /(?<!href=")(https?:\/\/[^\s<)"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="cmd-chat-link">$1</a>',
    );

  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;
  let inTable = false;
  let tableHeaderDone = false;

  const isTableRow = (line: string) =>
    line.startsWith("|") && line.endsWith("|");
  const isSeparator = (line: string) => /^\|[\s|:-]+\|$/.test(line);
  const parseCells = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  const closeList = () => {
    if (inList) {
      result.push("</ul>");
      inList = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      result.push(tableHeaderDone ? "</tbody>" : "</thead>");
      result.push("</table></div>");
      inTable = false;
      tableHeaderDone = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (isTableRow(trimmed)) {
      closeList();
      if (isSeparator(trimmed)) {
        if (inTable && !tableHeaderDone) {
          result.push("</thead><tbody>");
          tableHeaderDone = true;
        }
        continue;
      }
      if (!inTable) {
        result.push(
          '<div class="cmd-chat-table-wrap"><table class="cmd-chat-table">',
        );
        result.push("<thead>");
        inTable = true;
        tableHeaderDone = false;
      }
      const cells = parseCells(trimmed);
      const tag = tableHeaderDone ? "td" : "th";
      result.push(
        "<tr>" + cells.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>",
      );
      continue;
    }

    closeTable();
    const bulletMatch = trimmed.match(/^[*\u2022-]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) {
        result.push('<ul class="cmd-chat-list">');
        inList = true;
      }
      result.push("<li>" + bulletMatch[1] + "</li>");
    } else {
      closeList();
      if (trimmed === "") {
        result.push("<br/>");
      } else {
        result.push("<p>" + trimmed + "</p>");
      }
    }
  }
  closeList();
  closeTable();
  return result.join("");
}
