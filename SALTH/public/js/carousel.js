document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector("#carousel");
    const items = carousel.querySelectorAll(".carousel-item");
    let currentIndex = 0;
  
    function showNextSlide() {
      items[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % items.length;
      items[currentIndex].classList.add("active");
    }
  
    // Alterne entre slides a cada 5 segundos
    setInterval(showNextSlide, 5000);
  });
  