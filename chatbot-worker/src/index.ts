import { GoogleGenAI, type HttpOptions } from '@google/genai';
import { systemPrompt } from './prompt';

export interface Env {
	GEMINI_API_KEY: string;
	CF_AIG_TOKEN?: string;
	CF_ACCOUNT_ID?: string;
	CF_GATEWAY_ID?: string;
}

const allowedOrigins = ['https://boranuzun.ch', 'http://localhost:4321'];

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
				console.log('Using Cloudflare AI Gateway');
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
			const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
			});
		}
	},
};
