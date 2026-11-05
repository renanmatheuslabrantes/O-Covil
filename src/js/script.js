
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

  const slides = document.querySelectorAll(".slide");
  if (!slides.length) {
    carousel.closest(".carousel-section").hidden = true;
    return;
  }

  const dots = document.querySelectorAll(".dot");
  let current = 0;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    slides[index].classList.add("active");
    dots[index].classList.add("active");
    current = index;
  }

  showSlide(0);

  // Botão "próximo"
  document.getElementById("next").addEventListener("click", () => {
    let nextIndex = (current + 1) % slides.length;
    showSlide(nextIndex);
  });

  // Botão "anterior"
  document.getElementById("prev").addEventListener("click", () => {
    let prevIndex = (current - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  });

  // Clicar nas bolinhas (indicadores)
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      let index = parseInt(dot.getAttribute("data-slide"));
      showSlide(index);
    });
  });

  // Troca automática a cada 5s
  let autoSlideInterval = null;
  function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      let nextIndex = (current + 1) % slides.length;
      showSlide(nextIndex);
    }, 5000);
  }
  function stopAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
  startAutoSlide();

  // Clicar na imagem ou vídeo do slide foca o slide correspondente
  slides.forEach((slide, idx) => {
    const media = slide.querySelector('img, video');
    if (media) {
      media.style.cursor = 'pointer';
      media.addEventListener('mouseenter', () => {
        stopAutoSlide();
        showSlide(idx);
      });
      media.addEventListener('mouseleave', () => {
        startAutoSlide();
      });
    }
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
