/* =========================================
   GALLERY LIGHTBOX
========================================= */

const galleryLightbox = document.getElementById("galleryLightbox");
const galleryLightboxImage = document.getElementById("galleryLightboxImage");
const galleryLightboxClose = document.getElementById("galleryLightboxClose");

document.querySelectorAll(".gallery-card").forEach((card) => {
  const image = card.querySelector(".gallery-image");
  const expandButton = card.querySelector(".gallery-expand");

  if (!image || !expandButton) return;

  expandButton.addEventListener("click", () => {
    galleryLightboxImage.src = image.src;
    galleryLightboxImage.alt = image.alt;

    galleryLightbox.classList.add("is-active");
    galleryLightbox.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
  });
});

function closeGalleryLightbox() {
  galleryLightbox.classList.remove("is-active");
  galleryLightbox.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  setTimeout(() => {
    galleryLightboxImage.src = "";
  }, 250);
}

if (galleryLightboxClose) {
  galleryLightboxClose.addEventListener("click", closeGalleryLightbox);
}

if (galleryLightbox) {
  galleryLightbox.addEventListener("click", (event) => {
    if (event.target === galleryLightbox) {
      closeGalleryLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    galleryLightbox?.classList.contains("is-active")
  ) {
    closeGalleryLightbox();
  }
});
