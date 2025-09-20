/* ============================
   JS Slider Categorias
   ============================ */
   document.addEventListener("DOMContentLoaded", function () {
    const categoryTrack = document.querySelector(".category-track");
    const categoryPrevBtn = document.querySelector(".category-slider-btn.category-prev-btn");
    const categoryNextBtn = document.querySelector(".category-slider-btn.category-next-btn");
    const categoryItems = document.querySelectorAll(".category-item");

    // Calcula a largura total de cada item da roleta (incluindo espaçamento)
    const categoryItemWidth = categoryItems[0].offsetWidth + 20;
    let categoryCurrentPosition = 0;

    // Atualiza a posição do slider de categorias
    const updateCategoryTrackPosition = () => {
        categoryTrack.style.transform = `translateX(-${categoryCurrentPosition}px)`;
    };

    // Evento para o botão "Próximo" de categorias
    categoryNextBtn.addEventListener("click", () => {
        if (
            categoryCurrentPosition <
            categoryTrack.scrollWidth - categoryTrack.clientWidth
        ) {
            categoryCurrentPosition += categoryItemWidth;
            updateCategoryTrackPosition();
        }
    });

    // Evento para o botão "Anterior" de categorias
    categoryPrevBtn.addEventListener("click", () => {
        if (categoryCurrentPosition > 0) {
            categoryCurrentPosition -= categoryItemWidth;
            updateCategoryTrackPosition();
        }
    });
});


/* ============================
   JS Slider Produtos
   ============================ */
   document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os elementos necessários
    const prevBtn = document.querySelector(".product-prev-btn");
    const nextBtn = document.querySelector(".product-next-btn");
    const carouselTrack = document.querySelector(".product-carousel-track");
    const productCards = document.querySelectorAll(".product-card");
    const quickBuyButtons = document.querySelectorAll(".quick-buy-btn");
  
    // Configurações
    const cardWidth = productCards[0].offsetWidth + 24; // Largura do cartão + gap
    let currentIndex = 0;
  
    // Função para atualizar o deslocamento do carrossel
    const updateCarouselPosition = () => {
      carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    };
  
    // Evento para o botão "Próximo"
    nextBtn.addEventListener("click", () => {
      if (currentIndex < productCards.length - 1) {
        currentIndex++;
        updateCarouselPosition();
      } else {
        currentIndex = 0; // Reinicia o carrossel ao final
        updateCarouselPosition();
      }
    });
  
    // Evento para o botão "Anterior"
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarouselPosition();
      } else {
        currentIndex = productCards.length - 1; // Volta ao último cartão
        updateCarouselPosition();
      }
    });
  
    // Ajuste do carrossel para telas responsivas
    const adjustCarousel = () => {
      carouselTrack.style.transition = "none"; // Remove transições para evitar bugs
      updateCarouselPosition(); // Reaplica o deslocamento baseado no tamanho do cartão
      carouselTrack.style.transition = "transform 0.5s ease-in-out"; // Restaura a transição
    };
  
    // Evento para ajustar ao redimensionar a janela
    window.addEventListener("resize", () => {
      adjustCarousel();
    });
  
    // Função para exibir o alerta estilizado
    const showAlert = (message) => {
      // Cria o container do alerta
      const alertContainer = document.createElement("div");
      alertContainer.classList.add("custom-alert");
      alertContainer.textContent = message;
  
      // Adiciona o alerta ao body
      document.body.appendChild(alertContainer);
  
      // Remove o alerta após 3 segundos
      setTimeout(() => {
        alertContainer.style.opacity = "0";
        setTimeout(() => {
          alertContainer.remove();
        }, 300); // Tempo para a transição de opacidade
      }, 3000);
    };
  
    // Adiciona o evento "click" nos botões "Compra Rápida"
    quickBuyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        showAlert("Produto adicionado ao carrinho!");
      });
    });
  });
  

// ============================
// SALTH IN REAL LIFE
// ============================

// Seleção de elementos do DOM
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalDescription = document.getElementById("modal-description");
const modalRight = document.querySelector(".modal-right .product-options");
const imageCards = document.querySelectorAll(".image-card");
let currentSet = 0; // Conjunto atual (0 = 1 a 6, 1 = 7 a 12)

// Dados dos posts
const postData = {
  person1: {
    image: "person1.jpg",
    name: "Pessoa 1",
    description: "Descrição 1",
    products: [
      { image: "product1.jpg", name: "Produto 1" },
      { image: "product2.jpg", name: "Produto 2" },
    ],
  },
  person2: {
    image: "person2.jpg",
    name: "Pessoa 2",
    description: "Descrição 2",
    products: [
      { image: "product3.jpg", name: "Produto 3" },
      { image: "product4.jpg", name: "Produto 4" },
    ],
  },
  // Outros dados...
};

// Função para exibir imagens do conjunto atual
function showImages(set) {
  imageCards.forEach((card, index) => {
    if (index >= set * 6 && index < (set + 1) * 6) {
      card.style.display = "block"; // Mostra as imagens do conjunto atual
    } else {
      card.style.display = "none"; // Oculta as imagens dos outros conjuntos
    }
  });
}

// Função para navegar para o próximo conjunto de imagens
function nextImages() {
  if (currentSet < Math.ceil(imageCards.length / 6) - 1) {
    currentSet++;
    showImages(currentSet);
  }
}

// Função para navegar para o conjunto anterior de imagens
function prevImages() {
  if (currentSet > 0) {
    currentSet--;
    showImages(currentSet);
  }
}

// Função para abrir o modal com as informações da imagem
function openModal(personKey) {
  const data = postData[personKey];
  if (data) {
    // Atualiza os elementos do modal
    modalImage.src = data.image;
    modalName.textContent = data.name;
    modalDescription.textContent = data.description;

    // Limpa os produtos relacionados antes de adicionar novos
    modalRight.innerHTML = "";

    // Adiciona os produtos relacionados ao modal
    data.products.forEach((product) => {
      const productHTML = `
        <div class="product">
          <img src="${product.image}" alt="${product.name}">
          <p>${product.name}</p>
          <button>Adicionar ao carrinho</button>
        </div>
      `;
      modalRight.insertAdjacentHTML("beforeend", productHTML);
    });

    modal.style.display = "flex"; // Exibe o modal
  }
}

// Função para fechar o modal
function closeModal() {
  modal.style.display = "none"; // Oculta o modal
}

// Fechar modal ao clicar fora do conteúdo
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Garantir que o modal esteja oculto ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  modal.style.display = "none"; // Certifica-se de que o modal está oculto
  showImages(currentSet); // Exibe as primeiras 6 imagens
});


// ============================
// perguntas frequentes
// ============================
document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    faqItem.classList.toggle('open'); // Adiciona ou remove a classe "open"
  });
});
