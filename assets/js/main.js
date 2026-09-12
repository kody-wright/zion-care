"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");

  const backToTop = document.getElementById("backToTop");

  const currentYear = document.getElementById("currentYear");

  /* =====================================================
       CURRENT YEAR
    ===================================================== */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
       HEADER SCROLL STATE
    ===================================================== */

  const handleScroll = () => {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 20);

    if (backToTop) {
      backToTop.classList.toggle("show", window.scrollY > 500);
    }
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  handleScroll();

  /* =====================================================
       BACK TO TOP
    ===================================================== */

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

  const navigationLinks = document.querySelectorAll(
    "#primaryNavigation .nav-link",
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const navigation = document.getElementById("primaryNavigation");

      if (
        navigation &&
        navigation.classList.contains("show") &&
        window.bootstrap
      ) {
        const collapse = bootstrap.Collapse.getOrCreateInstance(navigation);

        collapse.hide();
      }
    });
  });
});
