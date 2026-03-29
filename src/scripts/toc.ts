let tocController: AbortController | null = null;

function initTOC() {
  const article = document.querySelector('article');
  const tocNav = document.querySelector('#toc-nav');

  if (!article || !tocNav) return;

  tocController?.abort();
  tocController = new AbortController();
  const { signal } = tocController;

  const tocLinks = tocNav.querySelectorAll<HTMLAnchorElement>('a');
  if (tocLinks.length === 0) return;

  const headingEls = Array.from(article.querySelectorAll('h2, h3'));

  // Click handler — smooth scroll via JS
  function handleClick(e: Event) {
    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;

    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    const targetY = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    history.pushState(null, '', href);
  }

  tocNav.addEventListener('click', handleClick, { signal });

  const mobileToc = document.querySelector('.md\\:hidden details');
  if (mobileToc) {
    mobileToc.addEventListener('click', handleClick, { signal });
  }

  // Scroll-based active heading detection — compute positions fresh each time
  function updateActive() {
    const scrollY = window.scrollY;
    const atBottom = (window.innerHeight + scrollY) >= (document.body.scrollHeight - 50);

    let currentId: string | null = null;

    if (atBottom && headingEls.length > 0) {
      currentId = headingEls[headingEls.length - 1].id;
    } else {
      for (let i = headingEls.length - 1; i >= 0; i--) {
        const top = headingEls[i].getBoundingClientRect().top + window.scrollY - 97;
        if (scrollY >= top) {
          currentId = headingEls[i].id;
          break;
        }
      }
    }

    if (!currentId) return;

    tocLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('toc-active');
      } else {
        link.classList.remove('toc-active');
      }
    });
  }

  let scrollRaf: number;
  window.addEventListener('scroll', () => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(updateActive);
  }, { passive: true, signal });

  updateActive();
}

document.addEventListener('DOMContentLoaded', initTOC);
document.addEventListener('astro:after-swap', initTOC);
