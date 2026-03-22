export interface ChatbotState {
  isOpen: boolean;
  isThinking: boolean;
  messageHistory: string[];
  historyIndex: number;
  apiHistory: { role: 'user' | 'model'; content: string }[];
}

const state: ChatbotState = {
  isOpen: false,
  isThinking: false,
  messageHistory: [],
  historyIndex: -1,
  apiHistory: [],
};

let abortController: AbortController | undefined;

export function getState(): ChatbotState {
  return state;
}

export function getAbortController(): AbortController | undefined {
  return abortController;
}

export function setAbortController(controller: AbortController | undefined): void {
  abortController = controller;
}

export function clearHistory(): void {
  state.apiHistory = [];
}
