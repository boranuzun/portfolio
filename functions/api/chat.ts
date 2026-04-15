import { GoogleGenAI, type HttpOptions } from "@google/genai";
import { systemPrompt } from "./prompt";

export interface Env {
	GEMINI_API_KEY: string;
	CF_AIG_TOKEN?: string;
	CF_ACCOUNT_ID?: string;
	CF_GATEWAY_ID?: string;
}

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

export const onRequestOptions: PagesFunction<Env> = async () => {
	return new Response(null, { status: 204 });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env, waitUntil } = context;

	const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
	if (isRateLimited(clientIp)) {
		return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
			status: 429,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		if (!env.GEMINI_API_KEY) {
			throw new Error("GEMINI_API_KEY is not set in the environment variables.");
		}

		let httpOptions: HttpOptions | undefined;
		if (env.CF_ACCOUNT_ID && env.CF_GATEWAY_ID) {
			httpOptions = {
				baseUrl: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_GATEWAY_ID}/google-ai-studio`,
				headers: {
					"cf-aig-cache-ttl": "604800",
				},
			};
			if (env.CF_AIG_TOKEN && httpOptions.headers) {
				httpOptions.headers["cf-aig-authorization"] = `Bearer ${env.CF_AIG_TOKEN}`;
			}
		}

		const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions });

		const body: { message?: string; history?: { role: string; content: string }[] } =
			await request.json();
		const userMessage = body?.message;
		const history = body?.history || [];

		if (!userMessage) {
			return new Response(JSON.stringify({ error: "Message is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (userMessage.length > 2000) {
			return new Response(
				JSON.stringify({ error: "Message is too long. Maximum 2000 characters." }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		const formattedHistory = history.map((msg: { role: string; content: string }) => ({
			role: msg.role,
			parts: [{ text: msg.content }],
		}));

		const chat = ai.chats.create({
			model: "gemini-3.1-flash-lite-preview",
			history: formattedHistory,
			config: { systemInstruction: systemPrompt },
		});

		const result = await chat.sendMessageStream({ message: userMessage });

		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();

		waitUntil(
			(async () => {
				try {
					for await (const chunk of result) {
						const chunkText = chunk.text;
						if (chunkText) {
							await writer.write(new TextEncoder().encode(chunkText));
						}
					}
					await writer.close();
				} catch (e: unknown) {
					console.error("Streaming error:", e);
					await writer.abort(e instanceof Error ? e : new Error(String(e)));
				}
			})(),
		);

		return new Response(readable, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error: unknown) {
		console.error("Error in chat function:", error);
		return new Response(
			JSON.stringify({ error: "Something went wrong. Please try again later." }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};
