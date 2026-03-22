import { SELECTORS, STORAGE_KEYS, CONFIG } from './constants';
import { getState, getAbortController, setAbortController } from './state';
import { renderMarkdown } from './markdown';
import { streamChatResponse } from './api';

interface ChatElements {
  chatPanel: HTMLElement;
  toggleBtn: HTMLElement;
  closeBtn: HTMLElement | null;
  chatForm: HTMLElement | null;
  chatInput: HTMLInputElement | null;
  chatMessages: HTMLElement | null;
  chatSubmitBtn: HTMLButtonElement | null;
  disclaimerEl: HTMLElement | null;
  dismissBtn: HTMLElement | null;
  clearChatBtn: HTMLElement | null;
}

function getElements(): ChatElements | null {
  const chatPanel = document.getElementById(SELECTORS.chatPanel);
  const toggleBtn = document.getElementById(SELECTORS.toggleBtn);

  if (!chatPanel || !toggleBtn) return null;

  return {
    chatPanel,
    toggleBtn,
    closeBtn: document.getElementById(SELECTORS.closeBtn),
    chatForm: document.getElementById(SELECTORS.chatForm),
    chatInput: document.getElementById(SELECTORS.chatInput) as HTMLInputElement | null,
    chatMessages: document.getElementById(SELECTORS.chatMessages),
    chatSubmitBtn: document.getElementById(SELECTORS.chatSubmitBtn) as HTMLButtonElement | null,
    disclaimerEl: document.getElementById(SELECTORS.disclaimer),
    dismissBtn: document.getElementById(SELECTORS.dismissBtn),
    clearChatBtn: document.getElementById(SELECTORS.clearChatBtn),
  };
}

export function initChatbot(): void {
  // Abort any previous listeners
  const prevController = getAbortController();
  if (prevController) prevController.abort();

  const controller = new AbortController();
  setAbortController(controller);
  const signal = controller.signal;

  const els = getElements();
  if (!els) return;

  const {
    chatPanel,
    toggleBtn,
    closeBtn,
    chatForm,
    chatInput,
    chatMessages,
    chatSubmitBtn,
    disclaimerEl,
    dismissBtn,
    clearChatBtn,
  } = els;

  // Cloudflare Worker URL
  const chatbotEl = document.getElementById(SELECTORS.chatbotRoot);
  const API_URL = (chatbotEl ? chatbotEl.getAttribute('data-api-url') : null) ?? CONFIG.fallbackApiUrl;

  const state = getState();

  // Restore visual state after navigation
  if (state.isOpen) {
    toggleBtn.style.display = 'none';
    chatPanel.style.display = 'flex';
    chatPanel.classList.remove('opacity-0', 'scale-95');
    chatPanel.classList.add('opacity-100', 'scale-100');
  }

  function toggleChat() {
    state.isOpen = !state.isOpen;
    if (state.isOpen) {
      toggleBtn.classList.add('opacity-0', 'scale-75');
      toggleBtn.classList.remove('opacity-100', 'scale-100');
      setTimeout(function () {
        toggleBtn.style.display = 'none';
        chatPanel.style.display = 'flex';
        setTimeout(function () {
          chatPanel.classList.remove('opacity-0', 'scale-95');
          chatPanel.classList.add('opacity-100', 'scale-100');
          if (chatInput) chatInput.focus();
        }, 10);
      }, 150);
    } else {
      chatPanel.classList.remove('opacity-100', 'scale-100');
      chatPanel.classList.add('opacity-0', 'scale-95');
      setTimeout(function () {
        chatPanel.style.display = 'none';
        toggleBtn.style.display = '';
        void toggleBtn.offsetHeight; // force reflow
        toggleBtn.classList.remove('opacity-0', 'scale-75');
        toggleBtn.classList.add('opacity-100', 'scale-100');
      }, 150);
    }
  }

  function addMessage(text: string, isUser: boolean) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');

    if (isUser) {
      messageDiv.className = 'flex flex-row-reverse animate-fade-in-up mt-2';
      const innerDiv = document.createElement('div');
      innerDiv.className =
        'max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black dark:bg-white text-white dark:text-black rounded-tr-sm break-words shadow-sm';
      innerDiv.textContent = text;
      messageDiv.appendChild(innerDiv);
    } else {
      // renderMarkdown sanitizes all HTML entities before processing markdown – safe to use innerHTML
      const renderedHtml = renderMarkdown(text);
      messageDiv.className = 'flex flex-row animate-fade-in-up mt-2';
      messageDiv.innerHTML =
        '<div class="max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border-l-2 border-l-black/20 dark:border-l-white/20 wrap-break-word rounded-tl-sm shadow-sm">' +
        renderedHtml +
        '</div>';
    }
    chatMessages.appendChild(messageDiv);
    requestAnimationFrame(function () {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function setLoading(loading: boolean) {
    state.isThinking = loading;
    if (!chatMessages || !chatInput || !chatSubmitBtn) return;
    chatInput.disabled = loading;
    chatSubmitBtn.disabled = loading;

    if (loading) {
      const thinkingDiv = document.createElement('div');
      thinkingDiv.id = SELECTORS.typingIndicator;
      thinkingDiv.className = 'flex flex-row max-w-[85%] mt-2';
      thinkingDiv.innerHTML =
        '<div class="bg-black/5 dark:bg-white/5 border-l-2 border-l-black/20 dark:border-l-white/20 py-3 px-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-11.5"><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div>';
      chatMessages.appendChild(thinkingDiv);
      requestAnimationFrame(function () {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    } else {
      const indicator = document.getElementById(SELECTORS.typingIndicator);
      if (indicator) indicator.remove();
    }
  }

  // Event listeners (all use signal for cleanup)
  toggleBtn.addEventListener('click', toggleChat, { signal });
  if (closeBtn) closeBtn.addEventListener('click', toggleChat, { signal });

  if (chatInput && chatSubmitBtn) {
    chatInput.addEventListener(
      'input',
      function () {
        chatSubmitBtn.disabled = !chatInput.value.trim();
      },
      { signal },
    );
  }

  // Handle disclaimer
  if (disclaimerEl && sessionStorage.getItem(STORAGE_KEYS.disclaimerDismissed)) {
    disclaimerEl.style.display = 'none';
  }

  if (dismissBtn) {
    dismissBtn.addEventListener(
      'click',
      function () {
        if (disclaimerEl) {
          disclaimerEl.style.opacity = '0';
          disclaimerEl.style.transition = 'opacity 0.2s ease';
          setTimeout(function () {
            disclaimerEl.style.display = 'none';
          }, 200);
          sessionStorage.setItem(STORAGE_KEYS.disclaimerDismissed, '1');
        }
      },
      { signal },
    );
  }

  // Handle clear chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener(
      'click',
      function () {
        if (!chatMessages) return;
        state.apiHistory = [];
        const children = Array.from(chatMessages.children);
        for (let i = 1; i < children.length; i++) {
          const child = children[i];
          child.classList.add('opacity-0', 'transition-opacity', 'duration-300');
          setTimeout(function (el: Element) {
            el.remove();
          }, 300, child);
        }
      },
      { signal },
    );
  }

  // Handle form submission with streaming
  if (chatForm) {
    chatForm.addEventListener(
      'submit',
      async function (e) {
        e.preventDefault();
        if (state.isThinking || !chatInput || !chatSubmitBtn) return;

        const userText = chatInput.value.trim();
        if (!userText) return;

        state.messageHistory.push(userText);
        state.historyIndex = state.messageHistory.length;

        if (disclaimerEl && disclaimerEl.style.display !== 'none') {
          disclaimerEl.style.opacity = '0';
          disclaimerEl.style.transition = 'opacity 0.2s ease';
          setTimeout(function () {
            disclaimerEl.style.display = 'none';
          }, 200);
          sessionStorage.setItem(STORAGE_KEYS.disclaimerDismissed, '1');
        }

        addMessage(userText, true);
        chatInput.value = '';
        setLoading(true);

        try {
          const currentHistory = JSON.parse(JSON.stringify(state.apiHistory)) as {
            role: 'user' | 'model';
            content: string;
          }[];
          const response = await streamChatResponse(API_URL, userText, currentHistory);

          // Remove loading indicator immediately when stream begins
          setLoading(false);
          chatInput.disabled = false;
          chatSubmitBtn.disabled = false;

          // Create standard message template
          const messageDiv = document.createElement('div');
          messageDiv.className = 'flex flex-row animate-fade-in-up mt-2';

          // renderMarkdown sanitizes all HTML entities before processing markdown – safe to use innerHTML
          const msgHtml =
            '<div class="max-w-[85%] py-3 px-4 rounded-2xl text-sm leading-relaxed bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border-l-2 border-l-black/20 dark:border-l-white/20 wrap-break-word rounded-tl-sm shadow-sm chatbot-msg-content"></div>';
          messageDiv.innerHTML = msgHtml;
          chatMessages!.appendChild(messageDiv);
          const contentTarget = messageDiv.querySelector('.chatbot-msg-content')!;

          // Stream reading logic
          const reader = response.body!.getReader();
          const decoder = new TextDecoder('utf-8');
          let fullReply = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullReply += chunk;
            // renderMarkdown sanitizes all HTML entities before processing markdown – safe to use innerHTML
            contentTarget.innerHTML = renderMarkdown(fullReply);

            requestAnimationFrame(function () {
              chatMessages!.scrollTop = chatMessages!.scrollHeight;
            });
          }

          if (fullReply.trim()) {
            state.apiHistory.push({ role: 'user', content: userText });
            state.apiHistory.push({ role: 'model', content: fullReply });
          } else {
            contentTarget.textContent = 'Something went wrong, please try again.';
          }

          if (chatInput) chatInput.focus();
        } catch (error) {
          console.error('Chat Error:', error);
          setLoading(false);
          chatInput.disabled = false;
          chatSubmitBtn.disabled = false;
          addMessage((error as Error).message, false);
          if (chatInput) chatInput.focus();
        }
      },
      { signal },
    );
  }

  // Up/Down arrow key to cycle through message history
  if (chatInput) {
    chatInput.addEventListener(
      'keydown',
      function (e) {
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
      },
      { signal },
    );
  }
}
