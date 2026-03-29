import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../cmdk/chat/markdown';

describe('renderMarkdown', () => {
  it('escapes HTML entities to prevent XSS', () => {
    const result = renderMarkdown('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('renders bold text', () => {
    const result = renderMarkdown('This is **bold** text');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('renders inline code', () => {
    const result = renderMarkdown('Use `npm install` to install');
    expect(result).toContain('<code');
    expect(result).toContain('npm install');
  });

  it('renders safe https links', () => {
    const result = renderMarkdown('[Example](https://example.com)');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
  });

  it('renders safe mailto links', () => {
    const result = renderMarkdown('[Email](mailto:test@example.com)');
    expect(result).toContain('href="mailto:test@example.com"');
  });

  it('rejects javascript: URLs in markdown links', () => {
    const result = renderMarkdown('[click](javascript:alert(1))');
    expect(result).not.toContain('href="javascript:');
  });

  it('rejects data: URLs in markdown links', () => {
    const result = renderMarkdown('[click](data:text/html,<h1>hi</h1>)');
    expect(result).not.toContain('href="data:');
  });

  it('renders bullet lists', () => {
    const result = renderMarkdown('- item one\n- item two');
    expect(result).toContain('<ul');
    expect(result).toContain('<li>item one</li>');
    expect(result).toContain('<li>item two</li>');
  });

  it('auto-links bare URLs', () => {
    const result = renderMarkdown('Visit https://example.com for more');
    expect(result).toContain('href="https://example.com"');
  });

  it('renders markdown tables', () => {
    const input = '| Category | Skills |\n| :--- | :--- |\n| **Languages** | TypeScript, Python |';
    const result = renderMarkdown(input);
    expect(result).toContain('<table');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');
    expect(result).toContain('<th');
    expect(result).toContain('<td');
    expect(result).toContain('Category');
    expect(result).toContain('<strong>Languages</strong>');
    expect(result).toContain('TypeScript, Python');
  });
});
