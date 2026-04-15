import { describe, it, expect, vi } from "vitest";
import { onRequestPost, onRequestOptions } from "./chat";

vi.mock("@google/genai", () => {
	const sendMessageStream = vi.fn().mockResolvedValue({
		async *[Symbol.asyncIterator]() {
			yield { text: "Test response" };
		},
	});
	const create = vi.fn().mockReturnValue({ sendMessageStream });
	class GoogleGenAI {
		chats = { create };
		constructor() {}
	}
	return { GoogleGenAI };
});

interface Env {
	GEMINI_API_KEY: string;
	CF_AIG_TOKEN?: string;
	CF_ACCOUNT_ID?: string;
	CF_GATEWAY_ID?: string;
}

const mockContext = (request: Request, env: Partial<Env>) =>
	({
		request,
		env: env as Env,
		waitUntil: (promise: Promise<unknown>) => {
			void promise;
		},
		passThroughOnException: vi.fn(),
		params: {},
		data: {},
		functionPath: "/api/chat",
		next: vi.fn(),
	}) as unknown as Parameters<typeof onRequestPost>[0];

const env = { GEMINI_API_KEY: "test-api-key" };

describe("Chat Pages Function", () => {
	it("should handle OPTIONS preflight", async () => {
		const request = new Request("https://boranuzun.ch/api/chat", { method: "OPTIONS" });
		const ctx = mockContext(request, env);
		const response = await onRequestOptions(ctx);
		expect(response.status).toBe(204);
	});

	it("should reject requests without a message", async () => {
		const request = new Request("https://boranuzun.ch/api/chat", {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		});
		const response = await onRequestPost(mockContext(request, env));
		expect(response.status).toBe(400);
		const data = (await response.json()) as { error: string };
		expect(data.error).toBe("Message is required");
	});

	it("should reject messages over 2000 characters", async () => {
		const request = new Request("https://boranuzun.ch/api/chat", {
			method: "POST",
			body: JSON.stringify({ message: "a".repeat(2001) }),
			headers: { "Content-Type": "application/json" },
		});
		const response = await onRequestPost(mockContext(request, env));
		expect(response.status).toBe(400);
		const data = (await response.json()) as { error: string };
		expect(data.error).toContain("too long");
	});

	it("should return generic error message on internal failure", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const request = new Request("https://boranuzun.ch/api/chat", {
			method: "POST",
			body: JSON.stringify({ message: "Hello" }),
			headers: { "Content-Type": "application/json" },
		});
		const response = await onRequestPost(mockContext(request, { GEMINI_API_KEY: "" }));
		expect(response.status).toBe(500);
		const data = (await response.json()) as { error: string };
		expect(data.error).not.toContain("GEMINI_API_KEY");
		expect(data.error).toBe("Something went wrong. Please try again later.");
		consoleSpy.mockRestore();
	});

	it("should stream response text", async () => {
		const request = new Request("https://boranuzun.ch/api/chat", {
			method: "POST",
			body: JSON.stringify({ message: "Hello" }),
			headers: { "Content-Type": "application/json" },
		});
		const ctx = mockContext(request, env);
		const response = await onRequestPost(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		const text = await response.text();
		expect(text).toBe("Test response");
	});
});
