const FETCH_TIMEOUT_MS = 30_000;

export async function streamChatResponse(
	apiUrl: string,
	message: string,
	history: { role: "user" | "model"; content: string }[],
): Promise<Response> {
	const timeoutController = new AbortController();
	const timeoutId = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, history }),
			signal: timeoutController.signal,
		});

		if (!response.ok) {
			const body = await response.json().catch(() => null);
			const message =
				(body as { error?: string } | null)?.error ??
				"Something went wrong. Please try again later.";
			throw new Error(message);
		}
		return response;
	} catch (error) {
		if ((error as Error).name === "AbortError") {
			throw new Error("Request timed out. Please try again.", { cause: error });
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}
