/* ============================================================
   js/modal.js — Lead Modal (Circle Reveal + WhatsApp)
   ============================================================ */

const MODAL = (() => {
  const WA_NUMBER = '972547492977';

  let overlay, content, closeBtn;
  let step1, step2, step3;
  let nameInput, bizInput, nameError;
  let progressFill;
  let btnNext1, btnPrev1, btnNext2;
  let serviceOptions;
  let selectedService = '';
  let modalOriginX = '50%', modalOriginY = '50%';

  function getPageName() {
    const p = window.location.pathname.split('/').pop().toLowerCase();
    if (p.includes('info'))           return 'בעמוד המידע';
    if (p.includes('prise'))          return 'בעמוד המחירון';
    if (p.includes('works'))          return 'בתיק העבודות';
    if (p.includes('about'))          return 'בעמוד תהליך העבודה';
    if (p.includes('addons'))         return 'בעמוד התוספים';
    return 'בעמוד הבית';
  }

  function openModal(e) {
    if (!overlay) return;

    /* Calculate click origin for circle reveal */
    const x = e ? (e.clientX / window.innerWidth  * 100).toFixed(1) + '%' : '50%';
    const y = e ? (e.clientY / window.innerHeight * 100).toFixed(1) + '%' : '50%';
    overlay.style.setProperty('--modal-cx', x);
    overlay.style.setProperty('--modal-cy', y);
    modalOriginX = x;
    modalOriginY = y;

    /* Reset form */
    resetForm();

    /* Animate open */
    overlay.classList.add('is-open');
    gsap.fromTo(overlay,
      { clipPath: `circle(0% at ${x} ${y})` },
      { clipPath: `circle(150% at ${x} ${y})`, duration: 0.7, ease: 'power3.inOut' }
    );
  }

  function closeModal() {
    if (!overlay) return;
    gsap.to(overlay, {
      clipPath: `circle(0% at ${modalOriginX} ${modalOriginY})`,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: () => overlay.classList.remove('is-open'),
    });
  }

  function setStep(active) {
    [step1, step2, step3].forEach(s => { if (s) s.classList.remove('active'); });
    if (active) active.classList.add('active');
  }

  function resetForm() {
    setStep(step1);
    progressFill.style.width = '33%';
    if (nameInput)  nameInput.value  = '';
    if (bizInput)   bizInput.value   = '';
    if (nameError)  nameError.style.display = 'none';
    selectedService = '';
    serviceOptions.forEach(o => o.classList.remove('selected'));
    if (btnNext2) btnNext2.disabled = true;
  }

  function bindSelectors() {
    overlay      = document.getElementById('leadModal');
    if (!overlay) return false;

    content      = overlay.querySelector('.modal-content');
    closeBtn     = document.getElementById('closeLeadModal');
    step1        = document.getElementById('step1');
    step2        = document.getElementById('step2');
    step3        = document.getElementById('step3');
    nameInput    = document.getElementById('leadName');
    bizInput     = document.getElementById('leadBusiness');
    nameError    = document.getElementById('nameError');
    progressFill = document.getElementById('progressBar');
    btnNext1     = document.getElementById('btnNext1');
    btnPrev1     = document.getElementById('btnPrev1');
    btnNext2     = document.getElementById('btnNext2');
    serviceOptions = document.querySelectorAll('.service-option');
    return true;
  }

  return {
    init() {
      if (!bindSelectors()) return;

      /* Open triggers */
      document.querySelectorAll('.open-modal-btn, .float-wa').forEach(btn => {
        btn.addEventListener('click', e => { e.preventDefault(); openModal(e); });
      });

      /* Close */
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

      /* Step 1 → 2 */
      if (btnNext1) btnNext1.addEventListener('click', () => {
        if (!nameInput.value.trim()) {
          nameError.style.display = 'block';
          nameInput.style.borderColor = 'var(--chrome-3)';
          return;
        }
        nameError.style.display  = 'none';
        nameInput.style.borderColor = '';
        setStep(step2);
        progressFill.style.width = '66%';
      });

      /* Step 2 → 1 */
      if (btnPrev1) btnPrev1.addEventListener('click', () => {
        setStep(step1);
        progressFill.style.width = '33%';
      });

      /* Service option select */
      serviceOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          serviceOptions.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedService = opt.dataset.value;
          if (btnNext2) btnNext2.disabled = false;
        });
      });

      /* Step 2 → 3 → WhatsApp */
      if (btnNext2) btnNext2.addEventListener('click', () => {
        setStep(step3);
        progressFill.style.width = '100%';

        const name    = nameInput.value.trim();
        const biz     = bizInput ? bizInput.value.trim() : '';
        const page    = getPageName();
        let msg = `היי נתיב, קוראים לי ${name}.\n`;
        if (biz) msg += `מבית העסק: ${biz}.\n`;
        msg += `\nהגעתי מ${page} באתר שלך, ואני מתעניין ב${selectedService}. אשמח לשמוע פרטים.`;

        setTimeout(() => {
          window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
          closeModal();
        }, 2800);
      });
    },
  };
})();
