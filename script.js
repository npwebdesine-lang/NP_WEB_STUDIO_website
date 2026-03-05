// =========================================
// SCRIPT.JS - NP Web Studios Logic
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. מעברי עמודים (Page Transitions)
  const transitionEl = document.querySelector(".page-transition");
  if (transitionEl) {
    // הסרת המסך השחור בטעינה
    setTimeout(() => transitionEl.classList.add("loaded"), 100);
  }

  // הפעלת מעבר כשלוחצים על קישורים פנימיים (שאינם טופס לידים)
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = this.getAttribute("href");
      // סינון קישורים חיצוניים, עוגנים או כפתורים שפותחים מודל
      if (
        target.startsWith("#") ||
        target.startsWith("http") ||
        this.classList.contains("js-wa") ||
        this.classList.contains("open-modal-btn")
      )
        return;

      e.preventDefault();
      if (transitionEl) transitionEl.classList.remove("loaded");
      setTimeout(() => {
        window.location.href = target;
      }, 400);
    });
  });

  // 2. שנת זכויות יוצרים בפוטר
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 3. תפריט מובייל
  const burgerBtn = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeMobileMenu");

  if (burgerBtn && mobileMenu && closeBtn) {
    burgerBtn.addEventListener("click", () =>
      mobileMenu.classList.add("active"),
    );
    closeBtn.addEventListener("click", () =>
      mobileMenu.classList.remove("active"),
    );
  }

  // 4. אנימציות חשיפה בגלילה (Scroll Reveal)
  const reveals = document.querySelectorAll(".reveal");
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach((reveal) => {
      if (reveal.getBoundingClientRect().top < windowHeight - 100) {
        reveal.classList.add("active");
      }
    });
  };
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

  // 5. סמן עכבר גלובלי (Custom Cursor)
  const cursor = document.getElementById("customCursor");
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    const hoverElements = document.querySelectorAll(
      "a, button, .glass-card, .service-option",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () =>
        cursor.classList.add("cursor-hover"),
      );
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("cursor-hover"),
      );
    });
  }

  // 6. אפקט תלת מימד לכרטיסיות
  const glassCards = document.querySelectorAll(
    ".glass-card:not(.lead-modal-content)",
  );
  glassCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transition = "none";
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transition = "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)";
      card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
  });

  // ==========================================
  // 7. טופס לידים רב-שלבי (WhatsApp System)
  // ==========================================
  const waNumber = "972547492977";

  const leadModal = document.getElementById("leadModal");
  const closeLeadModal = document.getElementById("closeLeadModal");
  const btnNext1 = document.getElementById("btnNext1");
  const btnPrev1 = document.getElementById("btnPrev1");
  const btnNext2 = document.getElementById("btnNext2");

  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const progressBar = document.getElementById("progressBar");

  const leadNameInput = document.getElementById("leadName");
  const leadBusinessInput = document.getElementById("leadBusiness");
  const nameError = document.getElementById("nameError");
  const serviceOptions = document.querySelectorAll(".service-option");

  let selectedService = "";

  // זיהוי העמוד הנוכחי לבניית ההודעה
  function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split("/").pop().toLowerCase();
    if (page.includes("info")) return "בעמוד המידע";
    if (page.includes("prise") || page.includes("pricing"))
      return "בעמוד המחירון";
    if (page.includes("works")) return "בתיק העבודות";
    if (page.includes("about")) return "בעמוד תהליך העבודה";
    if (page.includes("addons")) return "בעמוד התוספים";
    return "בעמוד הבית";
  }

  if (leadModal) {
    // כל כפתור יפתח את המודל המרכזי הזה (js-wa, open-modal-btn, float-wa)
    document
      .querySelectorAll(".js-wa, .open-modal-btn, .float-wa")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          leadModal.classList.add("active");
          // איפוס הטופס בכל פתיחה
          step1.classList.add("active");
          step2.classList.remove("active");
          step3.classList.remove("active");
          progressBar.style.width = "33%";
          leadNameInput.value = "";
          leadBusinessInput.value = "";
          nameError.style.display = "none";
          serviceOptions.forEach((opt) => opt.classList.remove("selected"));
          btnNext2.setAttribute("disabled", "true");
        });
      });

    closeLeadModal.addEventListener("click", () =>
      leadModal.classList.remove("active"),
    );
    window.addEventListener("click", (e) => {
      if (e.target === leadModal) leadModal.classList.remove("active");
    });

    // מעבר לשלב 2
    btnNext1.addEventListener("click", () => {
      if (leadNameInput.value.trim() === "") {
        nameError.style.display = "block";
        leadNameInput.style.borderColor = "#ff4757";
      } else {
        nameError.style.display = "none";
        leadNameInput.style.borderColor = "rgba(255,255,255,0.1)";
        step1.classList.remove("active");
        step2.classList.add("active");
        progressBar.style.width = "66%";
      }
    });

    // חזרה לשלב 1
    btnPrev1.addEventListener("click", () => {
      step2.classList.remove("active");
      step1.classList.add("active");
      progressBar.style.width = "33%";
    });

    // בחירת אופציה
    serviceOptions.forEach((option) => {
      option.addEventListener("click", () => {
        serviceOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
        selectedService = option.getAttribute("data-value");
        btnNext2.removeAttribute("disabled");
      });
    });

    // סיום ושליחה לוואטסאפ
    btnNext2.addEventListener("click", () => {
      step2.classList.remove("active");
      step3.classList.add("active");
      progressBar.style.width = "100%";

      const clientName = leadNameInput.value.trim();
      const bizName = leadBusinessInput.value.trim();
      const pageName = getCurrentPageName();

      let message = `היי נתיב, קוראים לי ${clientName}.\n`;
      if (bizName) message += `מבית העסק: ${bizName}.\n`;
      message += `\nהגעתי מ${pageName} באתר שלך, ואני מתעניין ב${selectedService}. אשמח לשמוע פרטים.`;

      const finalUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      // טעינה של 3 שניות לאפקט טכנולוגי ואז פתיחת וואטסאפ
      setTimeout(() => {
        window.open(finalUrl, "_blank");
        leadModal.classList.remove("active");
      }, 3000);
    });
  }
});
