export const SELECTORS = {
  chatPanel: 'chat-panel',
  toggleBtn: 'toggle-chat-btn',
  closeBtn: 'close-chat-btn',
  chatForm: 'chat-form',
  chatInput: 'chat-input',
  chatMessages: 'chat-messages',
  chatSubmitBtn: 'chat-submit',
  chatbotRoot: 'portfolio-chatbot',
  typingIndicator: 'typing-indicator',
  disclaimer: 'chat-disclaimer',
  dismissBtn: 'dismiss-disclaimer',
  clearChatBtn: 'clear-chat-btn',
} as const;

export const STORAGE_KEYS = {
  disclaimerDismissed: 'chatDisclaimerDismissed',
} as const;

export const CONFIG = {
  fallbackApiUrl: 'http://127.0.0.1:8787',
  fetchTimeoutMs: 30_000,
} as const;
