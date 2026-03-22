export function renderMarkdown(text: string): string {
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/\[([^\]]+)\]\(((https?:\/\/|mailto:)[^\s)]+)\)/g, (_match, linkText: string, url: string) => {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return linkText;
      } catch { return linkText; }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-black/25 dark:decoration-white/40 hover:text-black dark:hover:text-white transition-colors">${linkText}</a>`;
    })
    .replace(/(?<!href=")(https?:\/\/[^\s<)"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-black/25 dark:decoration-white/40 hover:text-black dark:hover:text-white transition-colors">$1</a>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let inTable = false;
  let tableHeaderDone = false;

  const isTableRow = (line: string) => line.startsWith('|') && line.endsWith('|');
  const isSeparator = (line: string) => /^\|[\s|:\-]+\|$/.test(line);
  const parseCells = (line: string) => line.split('|').slice(1, -1).map(c => c.trim());

  const closeList = () => { if (inList) { result.push('</ul>'); inList = false; } };
  const closeTable = () => {
    if (inTable) {
      result.push(tableHeaderDone ? '</tbody>' : '</thead>');
      result.push('</table></div>');
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
          result.push('</thead><tbody>');
          tableHeaderDone = true;
        }
        continue;
      }
      if (!inTable) {
        result.push('<div class="overflow-x-auto my-2"><table class="w-full text-sm border-collapse">');
        result.push('<thead>');
        inTable = true;
        tableHeaderDone = false;
      }
      const cells = parseCells(trimmed);
      const tag = tableHeaderDone ? 'td' : 'th';
      const tdClass = tableHeaderDone
        ? 'border border-black/20 dark:border-white/20 px-3 py-1.5'
        : 'border border-black/20 dark:border-white/20 px-3 py-1.5 font-semibold text-left bg-black/5 dark:bg-white/5';
      result.push('<tr>' + cells.map(c => `<${tag} class="${tdClass}">${c}</${tag}>`).join('') + '</tr>');
      continue;
    }

    closeTable();
    const bulletMatch = trimmed.match(/^[*•-]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) { result.push('<ul class="list-disc list-inside space-y-1 my-1">'); inList = true; }
      result.push('<li>' + bulletMatch[1] + '</li>');
    } else {
      closeList();
      if (trimmed === '') {
        result.push('<br/>');
      } else {
        result.push('<p class="my-0.5">' + trimmed + '</p>');
      }
    }
  }
  closeList();
  closeTable();
  return result.join('');
}
