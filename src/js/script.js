
import { loadRemoteContent } from "./content.js";

document.addEventListener('DOMContentLoaded', async () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    function closeMenu() {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      navLinks.classList.remove("is-open");
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("header")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const carousel = document.getElementById("carousel")
  const newsContainer = document.getElementById("news-container")

  await loadRemoteContent(newsContainer, carousel)

  const slides = [...carousel.querySelectorAll(".slide")];
  if (!slides.length) {
    carousel.closest(".carousel-section").hidden = true;
    return;
  }

  const dots = [...carousel.querySelectorAll(".carousel-indicator")];
  let current = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let autoSlideInterval = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      if ("inert" in slide) slide.inert = !active;
    });
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === current));
    });
  }

  function stopAutoSlide() {
    window.clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (
      reducedMotion ||
      slides.length < 2 ||
      document.hidden ||
      carousel.matches(":hover") ||
      carousel.contains(document.activeElement)
    ) return;
    autoSlideInterval = window.setInterval(() => showSlide(current + 1), 6000);
  }

  function goToSlide(index) {
    showSlide(index);
    startAutoSlide();
  }

  showSlide(0);
  document.getElementById("next").addEventListener("click", () => goToSlide(current + 1));
  document.getElementById("prev").addEventListener("click", () => goToSlide(current - 1));
  dots.forEach(dot => {
    dot.addEventListener("click", () => goToSlide(Number(dot.dataset.slide)));
  });

  startAutoSlide();
  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", startAutoSlide);
  carousel.addEventListener("focusin", stopAutoSlide);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoSlide();
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(current - 1);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoSlide();
    else startAutoSlide();
  });
});

// // Função que exibe o slide correto
// function showSlide(index) {
//   slides.forEach(s => s.classList.remove("active"));
//   dots.forEach(d => d.classList.remove("active"));

//   slides[index].classList.add("active");
//   dots[index].classList.add("active");
//   current = index;
// }

// // Botão "próximo"
// document.getElementById("next").addEventListener("click", () => {
//   let nextIndex = (current + 1) % slides.length;
//   showSlide(nextIndex);
// });

// // Botão "anterior"
// document.getElementById("prev").addEventListener("click", () => {
//   let prevIndex = (current - 1 + slides.length) % slides.length;
//   showSlide(prevIndex);
// });

// // Clicar nas bolinhas (indicadores)
// dots.forEach(dot => {
//   dot.addEventListener("click", () => {
//     let index = parseInt(dot.getAttribute("data-slide"));
//     showSlide(index);
//   });
// });

// // Troca automática a cada 6s
// let autoSlideInterval = null;
// function startAutoSlide() {
//   if (autoSlideInterval) clearInterval(autoSlideInterval);
//   autoSlideInterval = setInterval(() => {
//     let nextIndex = (current + 1) % slides.length;
//     showSlide(nextIndex);
//   }, 5000);
// }
// function stopAutoSlide() {
//   if (autoSlideInterval) clearInterval(autoSlideInterval);
//   autoSlideInterval = null;
// }
// startAutoSlide();

// // Clicar na imagem ou vídeo do slide foca o slide correspondente
// slides.forEach((slide, idx) => {
//   const media = slide.querySelector('img, video');
//   if (media) {
//     media.style.cursor = 'pointer';
//     media.addEventListener('mouseenter', () => {
//       stopAutoSlide();
//       showSlide(idx);
//     });
//     media.addEventListener('mouseleave', () => {
//       startAutoSlide();
//     });
//   }
// });
