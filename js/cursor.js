/* ============================================================
   js/cursor.js — Dual-Layer Custom Cursor + Magnetic Buttons
   ============================================================ */

const CURSOR = (() => {
  let dot, ring;
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function moveDot(x, y) {
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    moveDot(mouseX, mouseY);
  }

  function onMouseDown() { document.body.classList.add('cursor-click'); }
  function onMouseUp()   { document.body.classList.remove('cursor-click'); }

  function attachHoverListeners() {
    document.querySelectorAll('a, button, .glass-card, .service-option, .tab-btn, .portfolio-item').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---- Spotlight on glass cards ---- */
  function attachSpotlight() {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--spotlight-x', x + '%');
        card.style.setProperty('--spotlight-y', y + '%');
      });
    });
  }

  /* ---- 3D Tilt on glass cards ---- */
  function attachTilt() {
    document.querySelectorAll('.glass-card:not(.modal-content)').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect    = card.getBoundingClientRect();
        const cx      = rect.width / 2;
        const cy      = rect.height / 2;
        const dx      = e.clientX - rect.left - cx;
        const dy      = e.clientY - rect.top  - cy;
        const rotX    = (dy / cy) * -7;
        const rotY    = (dx / cx) * 7;
        card.style.transition  = 'none';
        card.style.transform   = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.25,0.8,0.25,1)';
        card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ---- Magnetic Buttons ---- */
  function attachMagnetic() {
    if (isTouch) return;
    const FIELD = 80;

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      let isInField = false;

      document.addEventListener('mousemove', e => {
        const rect   = btn.getBoundingClientRect();
        const bx     = rect.left + rect.width  / 2;
        const by     = rect.top  + rect.height / 2;
        const dx     = e.clientX - bx;
        const dy     = e.clientY - by;
        const dist   = Math.sqrt(dx * dx + dy * dy);

        if (dist < FIELD) {
          isInField = true;
          const px = dx * 0.35;
          const py = dy * 0.35;
          gsap.to(btn, { x: px, y: py, duration: 0.35, ease: 'power2.out' });

          const inner = btn.querySelector('.btn-inner');
          if (inner) gsap.to(inner, { x: dx * 0.12, y: dy * 0.12, duration: 0.35, ease: 'power2.out' });
        } else if (isInField) {
          isInField = false;
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' });
          const inner = btn.querySelector('.btn-inner');
          if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' });
        }
      });
    });
  }

  return {
    init() {
      if (isTouch) return;
      dot  = document.getElementById('cursor-dot');
      ring = document.getElementById('cursor-ring');
      if (!dot || !ring) return;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup',   onMouseUp);

      loop();
      attachHoverListeners();
      attachSpotlight();
      attachTilt();
      attachMagnetic();
    },

    /* Call after DOM swap to rebind new elements */
    refresh() {
      document.body.classList.remove('cursor-hover', 'cursor-click');
      attachHoverListeners();
      attachSpotlight();
      attachTilt();
      attachMagnetic();
    },
  };
})();
