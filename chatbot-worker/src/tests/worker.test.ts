import { describe, it, expect, vi } from 'vitest';
import type { ExecutionContext } from '@cloudflare/workers-types';
import worker from '../index';

// Mock the new @google/genai SDK
vi.mock('@google/genai', () => {
  const sendMessageStream = vi.fn().mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      yield { text: 'Test response' };
    },
  });

  const create = vi.fn().mockReturnValue({
    sendMessageStream,
  });

  class GoogleGenAI {
    chats = {
      create,
    };
    constructor() {}
  }

  return {
    GoogleGenAI,
  };
});

describe('Chatbot Worker Baseline', () => {
  const env = {
    GEMINI_API_KEY: 'test-api-key',
  };

  it('should handle OPTIONS preflight', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'OPTIONS',
      headers: { Origin: 'https://boranuzun.ch' },
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://boranuzun.ch');
  });

  it('should reject non-POST requests', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'GET',
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.status).toBe(405);
  });

  it('should reject requests without a message', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.status).toBe(400);
    const data = await response.json() as { error: string };
    expect(data.error).toBe('Message is required');
  });

  it('should include correct CORS headers for allowed origin', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
      headers: { Origin: 'https://boranuzun.ch', 'Content-Type': 'application/json' },
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://boranuzun.ch');
  });

  it('should default CORS to primary origin for disallowed origins', async () => {
    const request = new Request('https://evil.com', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.com' },
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://boranuzun.ch');
  });

  it('should reject messages over 2000 characters', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'POST',
      body: JSON.stringify({ message: 'a'.repeat(2001) }),
      headers: { 'Content-Type': 'application/json', Origin: 'https://boranuzun.ch' },
    });
    const response = await worker.fetch(request, env, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.status).toBe(400);
    const data = await response.json() as { error: string };
    expect(data.error).toContain('too long');
  });

  it('should return generic error message on internal failure', async () => {
    const request = new Request('https://boranuzun.ch', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
      headers: { 'Content-Type': 'application/json', Origin: 'https://boranuzun.ch' },
    });
    const envNoKey = { GEMINI_API_KEY: '' };
    const response = await worker.fetch(request, envNoKey, { waitUntil: () => {} } as unknown as ExecutionContext);
    expect(response.status).toBe(500);
    const data = await response.json() as { error: string };
    expect(data.error).not.toContain('GEMINI_API_KEY');
    expect(data.error).toBe('Something went wrong. Please try again later.');
  });
});
