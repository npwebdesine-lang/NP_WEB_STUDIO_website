/* ============================================================
   js/router.js — Custom SPA Router (zero dependencies)
   ============================================================ */

const ROUTER = (() => {
  /* Pages whose file names map to a pageName key */
  const PAGE_MAP = {
    'index.html':  'index',
    '':            'index',
    'about.html':  'about',
    'works.html':  'works',
    'prise.html':  'prise',
    'info.html':   'info',
    'addons.html': 'addons',
  };

  function getPageName(url) {
    const file = url.split('/').pop().split('?')[0];
    return PAGE_MAP[file] || 'index';
  }

  function getFileName(url) {
    return url.split('/').pop().split('?')[0] || 'index.html';
  }

  function updateActiveNav(pageName) {
    document.querySelectorAll('.nav-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      const linkPage = PAGE_MAP[href.split('/').pop()] || 'index';
      a.classList.toggle('active', linkPage === pageName);
    });
  }

  async function navigateTo(url) {
    const pageName = getPageName(url);

    /* 1. Tell the WebGL scene to start color transition */
    if (typeof SCENE !== 'undefined') SCENE.setPage(pageName);

    /* 2. Exit animation — wipe current <main> upward */
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      await gsap.to(mainEl, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.5,
        ease: 'power3.in',
      });
    }

    /* 3. Fetch target page */
    let newMain;
    try {
      const res  = await fetch(url);
      const text = await res.text();
      const doc  = new DOMParser().parseFromString(text, 'text/html');
      newMain    = doc.getElementById('main-content');
    } catch (err) {
      /* On fetch failure fall back to hard navigate */
      window.location.href = url;
      return;
    }

    /* 4. Swap DOM */
    if (mainEl && newMain) {
      mainEl.innerHTML     = newMain.innerHTML;
      mainEl.dataset.page  = newMain.dataset.page || pageName;
    }

    /* 5. Update browser history + title */
    history.pushState({ pageName }, '', url);

    /* 6. Update year in footer */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* 7. Active nav link */
    updateActiveNav(pageName);

    /* 8. Enter animation — wipe new <main> in from bottom */
    if (mainEl) {
      gsap.fromTo(mainEl,
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0% 0)', duration: 0.6, ease: 'power3.out' }
      );
    }

    /* 9. Re-init page animations + cursor + modal */
    if (typeof ANIMATIONS !== 'undefined') ANIMATIONS.initPage(pageName);
    if (typeof CURSOR     !== 'undefined') CURSOR.refresh();
    if (typeof MODAL      !== 'undefined') MODAL.init();

    /* 10. Scroll to top */
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function isInternal(href) {
    if (!href) return false;
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return false;
    if (href.startsWith('#')) return false;
    return true;
  }

  function handleClick(e) {
    const a = e.target.closest('a[href]');
    if (!a) return;

    /* Skip modal/WA triggers */
    if (a.classList.contains('open-modal-btn') ||
        a.classList.contains('float-wa') ||
        a.classList.contains('js-wa')) return;

    const href = a.getAttribute('href');
    if (!isInternal(href)) return;

    /* Same page? Skip */
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const targetFile  = getFileName(href);
    if (currentFile === targetFile) return;

    e.preventDefault();
    navigateTo(href);
  }

  return {
    init() {
      /* Delegated click listener on document */
      document.addEventListener('click', handleClick);

      /* Browser back/forward */
      window.addEventListener('popstate', e => {
        const pageName = (e.state && e.state.pageName) || getPageName(window.location.pathname);
        navigateTo(window.location.pathname + window.location.search);
      });

      /* Set initial page state */
      const currentPage = getPageName(window.location.pathname);
      history.replaceState({ pageName: currentPage }, '', window.location.href);
      updateActiveNav(currentPage);

      /* Mobile menu close on link click */
      document.querySelectorAll('.mobile-link').forEach(a => {
        a.addEventListener('click', () => {
          const menu = document.getElementById('mobileMenu');
          if (menu) menu.classList.remove('is-open');
        });
      });
    },
  };
})();

/* ============================================================
   Bootstrap — runs on every page load
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile menu toggle */
  const burger  = document.getElementById('burgerBtn');
  const menu    = document.getElementById('mobileMenu');
  const mClose  = document.getElementById('mobileClose');

  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.add('is-open'));
  }
  if (mClose && menu) {
    mClose.addEventListener('click', () => menu.classList.remove('is-open'));
  }

  /* Determine current page */
  const pageName = (() => {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    const map  = {
      'index.html': 'index', '': 'index',
      'about.html': 'about', 'works.html': 'works',
      'prise.html': 'prise', 'info.html': 'info', 'addons.html': 'addons',
    };
    return map[file] || 'index';
  })();

  /* Init systems */
  if (typeof SCENE      !== 'undefined') { SCENE.init(); SCENE.setPage(pageName); }
  if (typeof CURSOR     !== 'undefined') CURSOR.init();
  if (typeof ANIMATIONS !== 'undefined') {
    ANIMATIONS.initSiteEntry();
    ANIMATIONS.initPage(pageName);
  }
  if (typeof MODAL      !== 'undefined') MODAL.init();
  if (typeof ROUTER     !== 'undefined') ROUTER.init();
});
