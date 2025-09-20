document.addEventListener("DOMContentLoaded", () => {
    // ============================
    // 1) Abrir / Fechar Modal de Tamanho
    // ============================
    const modalTamanho = document.getElementById("modal-tamanho");
  
    window.abrirModalTamanho = function() {
      if (modalTamanho) modalTamanho.style.display = "block";
    };
  
    window.fecharModalTamanho = function() {
      if (modalTamanho) modalTamanho.style.display = "none";
    };
  
    // Fecha o modal ao clicar fora do conteúdo
    window.addEventListener("click", (e) => {
      if (e.target === modalTamanho) {
        modalTamanho.style.display = "none";
      }
    });
  
    // ============================
    // 2) Ajustar Quantidade (+ / -)
    // ============================
    window.ajustarQuantidade = function(valor) {
      const quantityInput = document.querySelector(".quantity-input");
      if (!quantityInput) return;
  
      let currentValue = parseInt(quantityInput.value, 10);
      if (isNaN(currentValue)) currentValue = 1;
  
      currentValue += valor;
      if (currentValue < 1) currentValue = 1;
  
      quantityInput.value = currentValue;
    };
  
    // ============================
    // 3) Thumbnails: Fade in/out & troca de imagem/vídeo
    // ============================
    const mainImage = document.getElementById("main-image");
    const thumbnails = document.querySelectorAll(".thumbnail");
  
    window.trocarMidia = function(element, type) {
      // Remove 'active' de todas as miniaturas
      thumbnails.forEach(thumb => thumb.classList.remove("active"));
      // Marca a clicada como 'active'
      element.classList.add("active");
  
      // Efeito fade out
      mainImage.classList.add("fade-out");
      setTimeout(() => {
        // Se for imagem
        if (type === "image") {
          mainImage.src = element.src;
          mainImage.alt = element.alt;
        } 
        // Se for vídeo
        else if (type === "video") {
          const videoSource = element.querySelector("source");
          if (videoSource) {
            // Aqui poderia trocar para um <video> real,
            // mas para simplificar, deixamos mainImage vazio.
            mainImage.src = "";
            mainImage.alt = "Vídeo em execução";
          }
        }
  
        // Remove fade-out e aplica fade-in
        mainImage.classList.remove("fade-out");
        mainImage.classList.add("fade-in");
        setTimeout(() => mainImage.classList.remove("fade-in"), 300);
      }, 300);
    };
  
    // ============================
    // 4) Zoom ao passar o mouse na imagem principal
    // ============================
    const zoomContainer = document.querySelector(".zoom-container");
    if (zoomContainer && mainImage) {
      zoomContainer.addEventListener("mousemove", (event) => {
        const rect = zoomContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
  
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
  
        mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        mainImage.style.transform = "scale(2)";
      });
  
      zoomContainer.addEventListener("mouseleave", () => {
        mainImage.style.transform = "scale(1)";
        mainImage.style.transformOrigin = "center center";
      });
    }
  
    // ============================
    // 5) Exemplo de Adicionar ao Carrinho
    // ============================
    window.adicionarCarrinho = function(produtoId) {
      const quantity = document.querySelector(".quantity-input")?.value || 1;
      alert(`Produto ${produtoId} adicionado! Quantidade: ${quantity}`);
      // Aqui você faria a lógica de salvar no carrinho (sessão, localStorage, etc.)
    };
  
    // ============================
    // 6) Selecionar Cor e Tamanho
    // ============================
    window.selecionarCor = function(corHex) {
      // Remove selected de qualquer cor anterior
      document.querySelectorAll(".color-circle").forEach(circle => {
        circle.classList.remove("selected");
      });
      // Marca a cor clicada
      event.target.classList.add("selected");
  
      // Guarda no input hidden (se existir)
      const corHidden = document.getElementById("corSelecionada");
      if (corHidden) corHidden.value = corHex;
    };
  
    window.selecionarTamanho = function(tamanho) {
      // Remove selected de tamanhos anteriores
      document.querySelectorAll(".size-option").forEach(opt => {
        opt.classList.remove("selected");
      });
      // Marca o tamanho clicado
      event.target.classList.add("selected");
  
      // Guarda no input hidden (se existir)
      const tamanhoHidden = document.getElementById("tamanhoSelecionado");
      if (tamanhoHidden) tamanhoHidden.value = tamanho;
    };
  
    // ============================
    // 7) Preparar Compra (para “Comprar Agora”)
    // ============================
    window.prepararCompra = function() {
      // Pegar a quantidade atual
      const quantity = document.querySelector(".quantity-input")?.value || 1;
      const quantidadeFinal = document.getElementById("quantidadeFinal");
      if (quantidadeFinal) quantidadeFinal.value = quantity;
      
      // Se precisar fazer outras validações antes de submeter:
      // ex.: verificar se cor e tamanho foram selecionados.
    };
  });
  