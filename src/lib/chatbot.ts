export {};

interface ChatbotState {
  isOpen: boolean;
  isThinking: boolean;
  messageHistory: string[];
  historyIndex: number;
  apiHistory: { role: string; content: string }[];
}

declare global {
  interface Window {
    __chatbotState: ChatbotState;
    __chatbotAbort: AbortController | undefined;
  }
}

// Persistent state across navigations
window.__chatbotState = window.__chatbotState || {
  isOpen: false,
  isThinking: false,
  messageHistory: [], // For up/down arrow cycling
  historyIndex: -1,
  apiHistory: [] // Real conversation history for Gemini context
};

// Track the current AbortController to clean up old listeners
if (window.__chatbotAbort) window.__chatbotAbort.abort();

function initChatbot() {
  // Abort any previous listeners
  if (window.__chatbotAbort) window.__chatbotAbort.abort();
  const controller = new AbortController();
  window.__chatbotAbort = controller;
  const signal = controller.signal;

  // DOM Elements
  const chatPanel = document.getElementById('chat-panel');
  const toggleBtn = document.getElementById('toggle-chat-btn');
  const closeBtn = document.getElementById('close-chat-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
  const chatMessages = document.getElementById('chat-messages');
  const chatSubmitBtn = document.getElementById('chat-submit') as HTMLButtonElement | null;

  if (!chatPanel || !toggleBtn) return;

  // Cloudflare Worker URL
  const chatbotEl = document.getElementById('portfolio-chatbot');
  const API_URL = chatbotEl ? chatbotEl.getAttribute('data-api-url') : 'http://127.0.0.1:8787';

  const state = window.__chatbotState;

  // Restore visual state after navigation
  if (state.isOpen) {
    toggleBtn.style.display = 'none';
    chatPanel.style.display = 'flex';
    chatPanel.classList.remove('opacity-0', 'scale-95');
    chatPanel.classList.add('opacity-100', 'scale-100');
  }

  // Lightweight markdown-to-HTML for bot messages
  function renderMarkdown(text: string): string {
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">$1</code>')
      .replace(/\[([^\]]+)\]\(((https?:\/\/|mailto:)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-black/25 dark:decoration-white/40 hover:text-black dark:hover:text-white transition-colors">$1</a>')
      .replace(/(?<!href=")(https?:\/\/[^\s<)"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 decoration-black/25 dark:decoration-white/40 hover:text-black dark:hover:text-white transition-colors">$1</a>');

    const lines = html.split('\n');
    const result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const bulletMatch = trimmed.match(/^[*•-]\s+(.+)/);
      if (bulletMatch) {
        if (!inList) { result.push('<ul class="list-disc list-inside space-y-1 my-1">'); inList = true; }
        result.push('<li>' + bulletMatch[1] + '</li>');
      } else {
        if (inList) { result.push('</ul>'); inList = false; }
        if (trimmed === '') {
          result.push('<br/>');
        } else {
          result.push('<p class="my-0.5">' + trimmed + '</p>');
        }
      }
    }
    if (inList) result.push('</ul>');
    return result.join('');
  }

  // UI State toggling
  function toggleChat() {
    if (!chatPanel || !toggleBtn) return;
    state.isOpen = !state.isOpen;
    if (state.isOpen) {
      toggleBtn.classList.add('opacity-0', 'scale-75');
      toggleBtn.classList.remove('opacity-100', 'scale-100');
      setTimeout(function() {
        toggleBtn!.style.display = 'none';
        chatPanel!.style.display = 'flex';
        setTimeout(function() {
          chatPanel!.classList.remove('opacity-0', 'scale-95');
          chatPanel!.classList.add('opacity-100', 'scale-100');
          if (chatInput) chatInput.focus();
        }, 10);
      }, 150);
    } else {
      chatPanel.classList.remove('opacity-100', 'scale-100');
      chatPanel.classList.add('opacity-0', 'scale-95');
      setTimeout(function() {
        chatPanel!.style.display = 'none';
        toggleBtn!.style.display = '';
        void toggleBtn!.offsetHeight; // force reflow
        toggleBtn!.classList.remove('opacity-0', 'scale-75');
        toggleBtn!.classList.add('opacity-100', 'scale-100');
      }, 150);
    }
  }

  // Event Listeners (all use signal for cleanup)
  toggleBtn.addEventListener('click', toggleChat, { signal });
  if (closeBtn) closeBtn.addEventListener('click', toggleChat, { signal });

  if (chatInput && chatSubmitBtn) {
    chatInput.addEventListener('input', function() {
      chatSubmitBtn.disabled = !chatInput.value.trim();
    }, { signal });
  }

  // Helper to add messages to the DOM
  function addMessage(text: string, isUser: boolean) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');

    if (isUser) {
      messageDiv.className = 'flex flex-row-reverse animate-fade-in-up mt-2';
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black dark:bg-white text-white dark:text-black rounded-tr-sm break-words shadow-sm';
      innerDiv.textContent = text;
      messageDiv.appendChild(innerDiv);
    } else {
      const renderedHtml = renderMarkdown(text);
      messageDiv.className = 'flex flex-row animate-fade-in-up mt-2';
      // renderMarkdown escapes all HTML entities before processing markdown
      messageDiv.innerHTML = '<div class="max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border-l-2 border-l-black/20 dark:border-l-white/20 wrap-break-word rounded-tl-sm shadow-sm">' + renderedHtml + '</div>';
    }
    chatMessages.appendChild(messageDiv);
    requestAnimationFrame(function() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  // Loading state UI
  function setLoading(loading: boolean) {
    state.isThinking = loading;
    if (!chatMessages || !chatInput || !chatSubmitBtn) return;
    chatInput.disabled = loading;
    chatSubmitBtn.disabled = loading;

    if (loading) {
      const thinkingDiv = document.createElement('div');
      thinkingDiv.id = 'typing-indicator';
      thinkingDiv.className = 'flex flex-row max-w-[85%] mt-2';
      thinkingDiv.innerHTML = '<div class="bg-black/5 dark:bg-white/5 border-l-2 border-l-black/20 dark:border-l-white/20 py-3 px-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-11.5"><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div>';
      chatMessages.appendChild(thinkingDiv);
      requestAnimationFrame(function() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    } else {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
    }
  }

  // Handle disclaimer
  const disclaimerEl = document.getElementById('chat-disclaimer');
  const dismissBtn = document.getElementById('dismiss-disclaimer');

  if (disclaimerEl && sessionStorage.getItem('chatDisclaimerDismissed')) {
    disclaimerEl.style.display = 'none';
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', function() {
      if (disclaimerEl) {
        disclaimerEl.style.opacity = '0';
        disclaimerEl.style.transition = 'opacity 0.2s ease';
        setTimeout(function() { disclaimerEl.style.display = 'none'; }, 200);
        sessionStorage.setItem('chatDisclaimerDismissed', '1');
      }
    }, { signal });
  }

  // Handle clear chat
  const clearChatBtn = document.getElementById('clear-chat-btn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', function() {
      if (!chatMessages) return;
      state.apiHistory = []; // Reset context
      const children = Array.from(chatMessages.children);
      for (let i = 1; i < children.length; i++) {
        const child = children[i];
        child.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(function(el: Element) { el.remove(); }, 300, child);
      }
    }, { signal });
  }

  // Handle Form Submission
  if (chatForm) {
    chatForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (state.isThinking || !chatInput || !chatSubmitBtn) return;

      const userText = chatInput.value.trim();
      if (!userText) return;

      state.messageHistory.push(userText);
      state.historyIndex = state.messageHistory.length;

      if (disclaimerEl && disclaimerEl.style.display !== 'none') {
        disclaimerEl.style.opacity = '0';
        disclaimerEl.style.transition = 'opacity 0.2s ease';
        setTimeout(function() { disclaimerEl.style.display = 'none'; }, 200);
        sessionStorage.setItem('chatDisclaimerDismissed', '1');
      }

      addMessage(userText, true);
      chatInput.value = '';
      setLoading(true);

      try {
        const currentHistory = JSON.parse(JSON.stringify(state.apiHistory));
        const response = await fetch(API_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: currentHistory
          }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        // Remove loading indicator immediately when stream begins
        setLoading(false);
        chatInput.disabled = false;
        chatSubmitBtn.disabled = false;

        // Create standard message template
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex flex-row animate-fade-in-up mt-2';

        // renderMarkdown escapes all HTML entities before processing markdown
        const msgHtml = '<div class="max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border-l-2 border-l-black/20 dark:border-l-white/20 wrap-break-word rounded-tl-sm shadow-sm chatbot-msg-content"></div>';
        messageDiv.innerHTML = msgHtml;
        chatMessages!.appendChild(messageDiv);
        const contentTarget = messageDiv.querySelector('.chatbot-msg-content')!;

        // Stream reading logic
        const reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullReply = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullReply += chunk;
          // renderMarkdown escapes all HTML entities before processing markdown
          contentTarget.innerHTML = renderMarkdown(fullReply);

          requestAnimationFrame(function() {
            chatMessages!.scrollTop = chatMessages!.scrollHeight;
          });
        }

        if (fullReply.trim()) {
          state.apiHistory.push({ role: 'user', content: userText });
          state.apiHistory.push({ role: 'model', content: fullReply });
        } else {
           contentTarget.textContent = "Something went wrong, please try again.";
        }

        if (chatInput) chatInput.focus();
      } catch (error) {
        console.error("Chat Error:", error);
        setLoading(false);
        chatInput.disabled = false;
        chatSubmitBtn.disabled = false;
        addMessage([(error as Error).message, "Sorry, I could not connect to the server. Please try again later."].join(" "), false);
        if (chatInput) chatInput.focus();
      }
    }, { signal });
  }

  // Up/Down arrow key to cycle through message history
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (state.messageHistory.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIndex > 0) {
          state.historyIndex--;
          chatInput.value = state.messageHistory[state.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.messageHistory.length - 1) {
          state.historyIndex++;
          chatInput.value = state.messageHistory[state.historyIndex];
        } else {
          state.historyIndex = state.messageHistory.length;
          chatInput.value = '';
        }
      }
    }, { signal });
  }
}

document.addEventListener('DOMContentLoaded', initChatbot);
document.addEventListener('astro:after-swap', initChatbot);
// Also run immediately in case DOM is already ready (e.g. back-forward cache)
if (document.readyState !== 'loading') initChatbot();
