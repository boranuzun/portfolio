export interface ChatState {
  isThinking: boolean;
  messageHistory: string[];
  historyIndex: number;
  apiHistory: { role: "user" | "model"; content: string }[];
}

const state: ChatState = {
  isThinking: false,
  messageHistory: [],
  historyIndex: -1,
  apiHistory: [],
};

export function getChatState(): ChatState {
  return state;
}

export function clearChatHistory(): void {
  state.apiHistory = [];
  state.messageHistory = [];
  state.historyIndex = -1;
}
