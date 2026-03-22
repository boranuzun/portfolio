import { initChatbot } from './ui';

document.addEventListener('DOMContentLoaded', initChatbot);
document.addEventListener('astro:after-swap', initChatbot);
if (document.readyState !== 'loading') initChatbot();
