// "use strict";

// SUPABASE CLIENT //

const SUPABASE_URL = "https://lrsqmkhndooogkjwhtjs.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3Fta2huZG9vb2drandodGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzQwMDIsImV4cCI6MjEwNDgxMDAwMn0.DQcclZR-8ViGf2njb4mBQPK3J-fNz0bSuTw_2fBCAmg";
  
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

console.log("Supabase client:", supabaseClient);

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
