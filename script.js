// =========================================
// SCRIPT.JS - Animations & WhatsApp Logic
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Scroll Reveal Animation
  const reveals = document.querySelectorAll(".reveal");
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add("active");
      }
    });
  };
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // Trigger on load

  // 2. Modal Logic
  const modal = document.getElementById("ctaModal");
  const openBtns = document.querySelectorAll(".open-modal-btn");
  const closeBtn = document.querySelector(".modal-close");

  if (modal) {
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("active");
      });
    });

    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });

    // 3. WhatsApp Form Submit Logic
    const form = document.getElementById("waForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Your WhatsApp Number (International format, no + or 0)
      const waNumber = "972500000000"; // <-- שנה למספר שלך

      const bizName = document.getElementById("bizName").value;
      const bizDesc = document.getElementById("bizDesc").value;
      const designFocus = document.getElementById("designFocus").value;

      // Format the message
      const message = `היי נתיב! הגעתי מהאתר. אשמח שנדבר על פרויקט:\n\n*שם העסק:* ${bizName}\n*תיאור קצר:* ${bizDesc}\n*מה חשוב לי בעיצוב:* ${designFocus}\n\nאשמח לחזור אליי.`;

      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      window.open(waLink, "_blank");
      modal.classList.remove("active");
      form.reset();
    });
  }
});
