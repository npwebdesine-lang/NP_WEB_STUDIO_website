/* ============================================================
   js/animations.js — GSAP Timelines + ScrollTrigger
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const ANIMATIONS = (() => {

  /* ---- Manual word-split for hero title ---- */
  function splitWords(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = '1';
    el.childNodes.forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node.textContent;
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(word => {
        if (/^\s+$/.test(word)) {
          frag.appendChild(document.createTextNode(word));
        } else {
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom';
          const inner = document.createElement('span');
          inner.className = 'word';
          inner.style.cssText = 'display:inline-block;transform:translateY(110%)';
          inner.textContent = word;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        }
      });
      node.replaceWith(frag);
    });

    /* Also split <span> children that have text */
    el.querySelectorAll('span:not(.word-wrap):not(.word)').forEach(span => {
      const text = span.textContent.trim();
      if (!text) return;
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(word => {
        if (/^\s+$/.test(word)) {
          frag.appendChild(document.createTextNode(word));
        } else {
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom';
          const inner = document.createElement('span');
          inner.className = 'word';
          inner.style.cssText = 'display:inline-block;transform:translateY(110%)';
          inner.textContent = word;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        }
      });
      span.replaceWith(frag);
    });
  }

  /* ---- Site Entry (runs once on cold load) ---- */
  function initSiteEntry() {
    const tl = gsap.timeline({ delay: 0.1 });

    /* Blob scale-in via CSS custom prop wrapper isn't accessible directly —
       we animate the canvas opacity as a proxy for perceived blob intro */
    tl.fromTo('#gl-canvas', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0);

    /* Nav */
    tl.fromTo('.navbar', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.3);

    /* Hero chips */
    tl.fromTo('.chip', { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, 0.55);

    /* Hero H1 words */
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      splitWords(heroTitle);
      tl.to(heroTitle.querySelectorAll('.word'),
        { y: '0%', stagger: 0.07, duration: 0.75, ease: 'power3.out' }, 0.7);
    }

    /* Hero sub + CTAs */
    tl.fromTo('.hero-sub', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.15);
    tl.fromTo('.hero-ctas .btn', { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.1, duration: 0.55, ease: 'back.out(1.7)' }, 1.3);
  }

  /* ---- Nav scroll effect ---- */
  function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    ScrollTrigger.create({
      start: 'top+=80 top',
      onEnter:      () => navbar.classList.add('nav--scrolled'),
      onLeaveBack:  () => navbar.classList.remove('nav--scrolled'),
    });
  }

  /* ---- SVG Divider draw ---- */
  function initDividers() {
    document.querySelectorAll('.divider-line').forEach(div => {
      ScrollTrigger.create({
        trigger: div,
        start: 'top 90%',
        once: true,
        onEnter: () => div.classList.add('drawn'),
      });
    });
  }

  /* ---- Generic reveal ---- */
  function initReveals() {
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });
  }

  /* ---- HOMEPAGE ---- */
  function initIndex() {
    /* Hero parallax */
    gsap.to('.hero-content', {
      y: -70,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', scrub: true, start: 'top top', end: 'bottom top' },
    });

    /* Process cards stagger-in */
    gsap.fromTo('.process-card',
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.14,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.section-process', start: 'top 75%', once: true },
      }
    );
  }

  /* ---- ABOUT — pinned horizontal scroll ---- */
  function initAbout() {
    const outer = document.querySelector('.about-pin-outer');
    const inner = document.querySelector('.about-pin-inner');
    const track = document.querySelector('.steps-track');
    const cards = gsap.utils.toArray('.step-card');
    if (!outer || !cards.length) { initReveals(); return; }

    const isMobile = window.innerWidth <= 900;
    if (isMobile) { initReveals(); return; }

    /* Pin the sticky container for 400vh */
    const totalScroll = (cards.length - 1) * (window.innerWidth * 0.55 + 40);

    gsap.to(track, {
      x: () => -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: outer,
        pin: inner,
        start: 'top top',
        end: () => '+=' + (outer.offsetHeight - window.innerHeight),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* Fade+scale each card as it enters viewport */
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0.2, scale: 0.92 },
        {
          opacity: 1, scale: 1,
          scrollTrigger: {
            trigger: outer,
            start: () => 'top top+=' + (i * (window.innerHeight * 0.9)),
            end:   () => 'top top+=' + ((i + 0.8) * (window.innerHeight * 0.9)),
            scrub: true,
          },
        }
      );
    });
  }

  /* ---- WORKS ---- */
  function initWorks() {
    gsap.fromTo('.portfolio-item',
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        stagger: 0.12,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portfolio-grid', start: 'top 80%', once: true },
      }
    );
  }

  /* ---- PRISE (Pricing) ---- */
  function initPrise() {
    const cards = document.querySelectorAll('.grid-2 > .glass-card');
    if (cards.length >= 2) {
      gsap.fromTo(cards[0], { opacity: 0, x: 80 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: cards[0], start: 'top 82%', once: true } });
      gsap.fromTo(cards[1], { opacity: 0, x: -80 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: cards[1], start: 'top 82%', once: true } });
    }

    /* Price count-up */
    document.querySelectorAll('.price-counter').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const obj    = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString(); },
          });
        },
      });
    });

    initReveals();
  }

  /* ---- INFO ---- */
  function initInfo() {
    const content = document.querySelector('.info-content');
    const visual  = document.querySelector('.info-visual');

    if (content) gsap.fromTo(content, { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: content, start: 'top 80%', once: true } });

    if (visual) gsap.fromTo(visual, { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: visual, start: 'top 80%', once: true } });

    /* FAQ stagger */
    gsap.fromTo('.faq-grid .glass-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.75, ease: 'power2.out',
        scrollTrigger: { trigger: '.faq-grid', start: 'top 82%', once: true },
      }
    );
  }

  /* ---- ADDONS ---- */
  function initAddons() {
    /* Tab filtering logic */
    const tabs     = document.querySelectorAll('.tab-btn');
    const allCards = document.querySelectorAll('.addon-card');
    let currentCat = 'landing';

    function filterCards(cat) {
      allCards.forEach(card => {
        const match = card.dataset.mainCat === cat;
        if (match) {
          card.classList.remove('addon-hidden');
          gsap.fromTo(card, { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' });
        } else {
          card.classList.add('addon-hidden');
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCat = tab.dataset.mainCat;
        filterCards(currentCat);
      });
    });

    filterCards(currentCat);

    /* Stagger visible cards on load */
    const visible = [...allCards].filter(c => c.dataset.mainCat === currentCat);
    gsap.fromTo(visible,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.addon-grid', start: 'top 85%', once: true } }
    );
  }

  /* ---- Page-level dispatcher ---- */
  function initPage(pageName) {
    /* Kill all previous ScrollTriggers before re-init */
    ScrollTrigger.getAll().forEach(st => st.kill());

    initNavScroll();
    initDividers();

    switch (pageName) {
      case 'index':  initIndex();  break;
      case 'about':  initAbout();  break;
      case 'works':  initWorks();  break;
      case 'prise':  initPrise();  break;
      case 'info':   initInfo();   break;
      case 'addons': initAddons(); break;
    }

    /* Reveal any remaining .reveal elements */
    initReveals();

    ScrollTrigger.refresh();
  }

  return {
    initSiteEntry,
    initPage,
  };
})();
