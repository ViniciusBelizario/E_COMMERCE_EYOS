// Atualiza dinamicamente o texto da seção "Sobre o Algodão Pima"
function updateSobrePimaText(title, description) {
    const textContainer = document.getElementById('sobre-pima-text');
    if (textContainer) {
      textContainer.innerHTML = `
        <h2 class="sobre-pima-title">${title}</h2>
        <p class="sobre-pima-description">${description}</p>
      `;
    } else {
      console.error("Elemento #sobre-pima-text não encontrado.");
    }
  }
  
  // Exemplo de uso da função updateSobrePimaText
  updateSobrePimaText(
    "Produção Ética e Sustentável",
    "O algodão Pima é cultivado de forma ética, respeitando o meio ambiente e as comunidades locais. Um material que reflete qualidade e cuidado."
  );
  
  // Adiciona animações à seção "Impacto em Números" quando ela estiver visível no viewport
  document.addEventListener("DOMContentLoaded", () => {
    const impactoSection = document.querySelector("#impacto-numeros");
    const cards = document.querySelector(".cards");
  
    if (impactoSection && cards) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              cards.classList.add("show"); // Adiciona a classe 'show' para ativar a animação
            }
          });
        },
        { threshold: 0.2 } // Ativa quando 20% da seção estiver visível
      );
  
      observer.observe(impactoSection);
    } else {
      console.error("Seção #impacto-numeros ou elemento .cards não encontrado.");
    }
  });
  