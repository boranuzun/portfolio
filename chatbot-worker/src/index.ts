import { GoogleGenAI, type HttpOptions } from '@google/genai';
import { systemPrompt } from './prompt';

export interface Env {
	GEMINI_API_KEY: string;
	CF_AIG_TOKEN?: string;
	CF_ACCOUNT_ID?: string;
	CF_GATEWAY_ID?: string;
}

const allowedOrigins = ['https://boranuzun.ch', 'http://localhost:4321'];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const getCorsHeaders = (request: Request) => {
	const origin = request.headers.get('Origin') || '';
	return {
		'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: getCorsHeaders(request),
			});
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers: getCorsHeaders(request) });
		}

		const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
		if (isRateLimited(clientIp)) {
			return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
				status: 429,
				headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
			});
		}

		try {
			if (!env.GEMINI_API_KEY) {
				throw new Error("GEMINI_API_KEY is not set in the environment variables.");
			}

			// Initialize the model with custom options for Cloudflare AI Gateway
			let httpOptions: HttpOptions | undefined;
			if (env.CF_ACCOUNT_ID && env.CF_GATEWAY_ID) {
				httpOptions = {
					baseUrl: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_GATEWAY_ID}/google-ai-studio`,
					headers: {
						'cf-aig-cache-ttl': '604800', // Cache responses for 1 week to speed up latency and save costs
					},
				};
				if (env.CF_AIG_TOKEN && httpOptions.headers) {
					httpOptions.headers['cf-aig-authorization'] = `Bearer ${env.CF_AIG_TOKEN}`;
				}
			}

			const ai = new GoogleGenAI({
				apiKey: env.GEMINI_API_KEY,
				httpOptions
			});
			
			// Parse the incoming message
			const body: { message?: string, history?: { role: string, content: string }[] } = await request.json();
			const userMessage = body?.message;
			const history = body?.history || [];

			if (!userMessage) {
				return new Response(JSON.stringify({ error: 'Message is required' }), {
					status: 400,
					headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
				});
			}

			if (userMessage.length > 2000) {
				return new Response(JSON.stringify({ error: 'Message is too long. Maximum 2000 characters.' }), {
					status: 400,
					headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
				});
			}

			const formattedHistory = history.map((msg: { role: string, content: string }) => ({
				role: msg.role,
				parts: [{ text: msg.content }],
			}));

			const chat = ai.chats.create({
				model: 'gemini-3.1-flash-lite-preview',
				history: formattedHistory,
				config: {
					systemInstruction: systemPrompt,
				}
			});
			
			const result = await chat.sendMessageStream({ message: userMessage });

			// Set up a TransformStream to stream the response to the client
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();

			// Process the stream in the background
			ctx.waitUntil((async () => {
				try {
					for await (const chunk of result) {
						const chunkText = chunk.text;
						if (chunkText) {
							await writer.write(new TextEncoder().encode(chunkText));
						}
					}
					await writer.close();
				} catch (e: unknown) {
					console.error('Streaming error:', e);
					await writer.abort(e instanceof Error ? e : new Error(String(e)));
				}
			})());

			return new Response(readable, {
				status: 200,
				headers: { 
					...getCorsHeaders(request), 
					'Content-Type': 'text/plain',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				},
			});

		} catch (error: unknown) {
			console.error('Error in chatbot worker:', error);
			return new Response(JSON.stringify({ error: 'Something went wrong. Please try again later.' }), {
				status: 500,
				headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
			});
		}
	},
};
