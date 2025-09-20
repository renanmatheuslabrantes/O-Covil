
document.addEventListener('DOMContentLoaded', async () => {
  const carousel = document.getElementById("carousel")
  const newsContainer = document.getElementById("news-container")

  const slidesFetch = [
    { path: "/src/injectables/carousel/raids1.html", target: carousel, options: { position: 1 } },
    { path: "/src/injectables/carousel/raids2.html", target: carousel, options: { position: 2 } },
    { path: "/src/injectables/carousel/us.html", target: carousel, options: { position: 3 } }
  ]

  await Promise.all(slidesFetch.map(async (slide) => await injectHTML(slide.path, slide.target, slide.options)))

  const newsFetch = [
    { path: "/src/injectables/articles/nighthaven.html", target: newsContainer, options: { position: 1 } },
    { path: "/src/injectables/articles/steam-nighthaven.html", target: newsContainer, options: { position: 2 } },
    { path: "/src/injectables/articles/nwdb.html", target: newsContainer, options: { position: 3 } },
    { path: "/src/injectables/articles/amigavel-iniciantes.html", target: newsContainer, options: { position: 4 } },
    { path: "/src/injectables/articles/raids.html", target: newsContainer, options: { position: 5 } },
    { path: "/src/injectables/articles/twitch.html", target: newsContainer, options: { position: 6 } },
  ]

  await Promise.all(newsFetch.map(async (slide) => await injectHTML(slide.path, slide.target, slide.options)))


  const slides = document.querySelectorAll(".slide");
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
