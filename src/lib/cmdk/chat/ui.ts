import { getChatState } from "./state";
import { streamChatResponse } from "./api";
import { renderMarkdown } from "./markdown";

function getApiUrl(): string {
  const palette = document.getElementById("cmd-palette");
  return palette?.getAttribute("data-api-url") ?? "http://127.0.0.1:8787";
}

export function addMessage(text: string, isUser: boolean): void {
  const messages = document.getElementById("cmd-chat-messages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = isUser ? "cmd-chat-msg-user" : "cmd-chat-msg-ai";

  const label = document.createElement("div");
  label.className = "cmd-chat-msg-label";
  label.textContent = isUser ? "You" : "AI";
  wrapper.appendChild(label);

  const bubble = document.createElement("div");
  bubble.className = isUser ? "cmd-chat-bubble-user" : "cmd-chat-bubble-ai";

  if (isUser) {
    bubble.textContent = text;
  } else {
    // renderMarkdown escapes all HTML entities before processing — safe to use innerHTML
    bubble.innerHTML = renderMarkdown(text);
  }

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);

  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

export function showTypingIndicator(): void {
  const messages = document.getElementById("cmd-chat-messages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.id = "cmd-typing-indicator";
  wrapper.className = "cmd-chat-msg-ai";

  const label = document.createElement("div");
  label.className = "cmd-chat-msg-label";
  label.textContent = "AI";
  wrapper.appendChild(label);

  const dots = document.createElement("div");
  dots.className = "cmd-chat-typing";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "cmd-chat-typing-dot";
    dot.style.animationDelay = `${i * 150}ms`;
    dots.appendChild(dot);
  }
  wrapper.appendChild(dots);
  messages.appendChild(wrapper);

  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

export function hideTypingIndicator(): void {
  document.getElementById("cmd-typing-indicator")?.remove();
}

export async function sendMessage(): Promise<void> {
  const state = getChatState();
  const input = document.getElementById("cmd-chat-input") as HTMLInputElement | null;
  const messages = document.getElementById("cmd-chat-messages");
  if (!input || !messages || state.isThinking) return;

  const text = input.value.trim();
  if (!text) return;

  state.messageHistory.push(text);
  state.historyIndex = state.messageHistory.length;

  addMessage(text, true);
  input.value = "";
  state.isThinking = true;
  showTypingIndicator();

  try {
    const currentHistory = JSON.parse(JSON.stringify(state.apiHistory)) as {
      role: "user" | "model";
      content: string;
    }[];
    const response = await streamChatResponse(getApiUrl(), text, currentHistory);

    hideTypingIndicator();
    state.isThinking = false;

    // Create streaming message wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "cmd-chat-msg-ai";

    const label = document.createElement("div");
    label.className = "cmd-chat-msg-label";
    label.textContent = "AI";
    wrapper.appendChild(label);

    const bubble = document.createElement("div");
    bubble.className = "cmd-chat-bubble-ai cmd-chat-streaming";
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullReply = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullReply += chunk;
      // renderMarkdown escapes all HTML entities before processing — safe to use innerHTML
      bubble.innerHTML = renderMarkdown(fullReply);

      requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
      });
    }

    bubble.classList.remove("cmd-chat-streaming");

    if (fullReply.trim()) {
      state.apiHistory.push({ role: "user", content: text });
      state.apiHistory.push({ role: "model", content: fullReply });
    } else {
      bubble.textContent = "Something went wrong, please try again.";
    }

    input.focus();
  } catch (error) {
    console.error("Chat Error:", error);
    hideTypingIndicator();
    state.isThinking = false;
    addMessage((error as Error).message, false);
    input.focus();
  }
}

export function handleChatKeydown(e: KeyboardEvent): void {
  const state = getChatState();
  const input = document.getElementById("cmd-chat-input") as HTMLInputElement | null;
  if (!input) return;

  if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    sendMessage();
    return;
  }

  if (state.messageHistory.length === 0) return;

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (state.historyIndex > 0) {
      state.historyIndex--;
      input.value = state.messageHistory[state.historyIndex];
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (state.historyIndex < state.messageHistory.length - 1) {
      state.historyIndex++;
      input.value = state.messageHistory[state.historyIndex];
    } else {
      state.historyIndex = state.messageHistory.length;
      input.value = "";
    }
  }
}
