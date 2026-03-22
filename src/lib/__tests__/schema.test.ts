import { describe, it, expect } from 'vitest';
import { generatePersonSchema, generateBlogPostingSchema, generateProjectSchema } from '../schema';

describe('generatePersonSchema', () => {
  it('returns valid Person schema', () => {
    const url = new URL('https://boranuzun.ch');
    const result = generatePersonSchema(url);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Person');
    expect(result.url).toBe('https://boranuzun.ch');
    expect(result.image).toContain('/avatar.webp');
  });
});

describe('generateBlogPostingSchema', () => {
  it('returns valid BlogPosting schema', () => {
    const post = { title: 'Test Post', description: 'A test', date: new Date('2026-01-01') };
    const url = new URL('https://boranuzun.ch/blog/test');
    const result = generateBlogPostingSchema(post, url);
    expect(result['@type']).toBe('BlogPosting');
    expect(result.headline).toBe('Test Post');
    expect(result.datePublished).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('generateProjectSchema', () => {
  it('returns valid SoftwareSourceCode schema', () => {
    const project = { title: 'My Project', description: 'Desc', date: new Date('2026-01-01'), technologies: ['Rust', 'Go'] };
    const url = new URL('https://boranuzun.ch/projects/my-project');
    const result = generateProjectSchema(project, url);
    expect(result['@type']).toBe('SoftwareSourceCode');
    expect(result.programmingLanguage).toEqual(['Rust', 'Go']);
  });

  it('defaults to TypeScript and JavaScript when no technologies provided', () => {
    const project = { title: 'Proj', description: 'Desc', date: new Date('2026-01-01') };
    const url = new URL('https://boranuzun.ch/projects/proj');
    const result = generateProjectSchema(project, url);
    expect(result.programmingLanguage).toEqual(['TypeScript', 'JavaScript']);
  });
});
