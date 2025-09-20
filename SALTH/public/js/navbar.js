window.onload = function () {
  // ------------------------------
  // Navbar dinâmica (Transparência ao rolar)
  // ------------------------------
  const navbar = document.querySelector(".navbar");
  const sectionsToWatch = [document.querySelector(".carousel")];

  const handleScroll = () => {
    let isInTransparentSection = false;

    sectionsToWatch.forEach((section) => {
      if (section) {
        const sectionRect = section.getBoundingClientRect();
        const sectionTopVisible = sectionRect.top <= 0 && sectionRect.bottom > 0;
        const sectionMiddleVisible =
          sectionRect.top < window.innerHeight / 2 && sectionRect.bottom > window.innerHeight / 2;

        if (sectionTopVisible || sectionMiddleVisible) {
          isInTransparentSection = true;
        }
      }
    });

    if (isInTransparentSection) {
      navbar.classList.add("transparent");
      navbar.classList.remove("scrolled");
    } else {
      navbar.classList.remove("transparent");
      navbar.classList.add("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Inicializa a lógica ao carregar a página

  // ------------------------------
  // Barra de Pesquisa (Lupa)
  // ------------------------------
  const searchIcon = document.querySelector("#search-icon");
  const searchInput = document.querySelector("#search-input");
  let searchOpen = false;

  const toggleSearchBar = () => {
    if (!searchOpen) {
      searchInput.style.width = "200px";
      searchInput.style.opacity = "1";
      searchInput.style.pointerEvents = "auto";
      searchInput.focus();
      searchOpen = true;
    } else {
      searchInput.style.width = "0";
      searchInput.style.opacity = "0";
      searchInput.style.pointerEvents = "none";
      searchInput.value = "";
      searchOpen = false;
    }
  };

  if (searchIcon && searchInput) {
    searchIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSearchBar();
    });

    document.addEventListener("click", (event) => {
      if (
        searchOpen &&
        !searchInput.contains(event.target) &&
        !searchIcon.contains(event.target)
      ) {
        toggleSearchBar();
      }
    });
  }

  // ------------------------------
  // Menu hambúrguer (Mobile)
  // ------------------------------
  const hamburger = document.querySelector("#hamburger");
  const navbarMenu = document.querySelector("#navbar-menu");

  if (hamburger && navbarMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navbarMenu.classList.toggle("active");

      // Impedir rolagem ao abrir o menu
      if (navbarMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    });

    // Fechar menu ao clicar fora
    document.addEventListener("click", (event) => {
      if (
        navbarMenu.classList.contains("active") &&
        !navbarMenu.contains(event.target) &&
        !hamburger.contains(event.target)
      ) {
        hamburger.classList.remove("active");
        navbarMenu.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });
  }
};
