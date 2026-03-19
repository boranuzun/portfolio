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
});
