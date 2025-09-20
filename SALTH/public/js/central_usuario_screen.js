document.addEventListener("DOMContentLoaded", async () => {
  const menuLinks = document.querySelectorAll(".menu ul li a");
  const sections = document.querySelectorAll(".dashboard-content");
  const internalLinks = document.querySelectorAll(".btn-view"); // Links internos da Home
  const logoutLink = document.querySelector(".logout");

  // ========================
  // 🔹 Buscar Dados do Usuário
  // ========================
  try {
      const response = await fetch("http://localhost:3001/auth/user", {
          method: "GET",
          credentials: "include", // Mantém a sessão ativa
          headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
          throw new Error("Erro ao obter os dados do usuário.");
      }

      const userData = await response.json();

      // Atualiza as informações do usuário na interface
      document.getElementById("user-name").textContent = userData.nome;
      document.getElementById("user-email").textContent = userData.email;

      // Atualizar o primeiro nome no título
      const firstName = userData.nome.split(" ")[0];
      document.getElementById("user-first-name").textContent = firstName;

      // Criar avatar baseado nas 2 primeiras letras do e-mail
      const avatarDiv = document.getElementById("user-avatar");
      const initials = userData.email.slice(0, 2).toUpperCase();
      avatarDiv.textContent = initials;
      avatarDiv.style.width = "50px";
      avatarDiv.style.height = "50px";
      avatarDiv.style.backgroundColor = "#007BFF";
      avatarDiv.style.color = "white";
      avatarDiv.style.fontSize = "1.2rem";
      avatarDiv.style.display = "flex";
      avatarDiv.style.alignItems = "center";
      avatarDiv.style.justifyContent = "center";
      avatarDiv.style.borderRadius = "50%";
      avatarDiv.style.fontWeight = "bold";

      // ========================
      // 🔹 Buscar Pedidos do Usuário
      // ========================
      const pedidosResponse = await fetch(`http://localhost:3001/pedidos/${userData.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
      });

      if (pedidosResponse.ok) {
          const pedidos = await pedidosResponse.json();
          const orderList = document.querySelector(".order-list");
          orderList.innerHTML = ""; // Limpa a lista antes de adicionar os pedidos

          pedidos.forEach((pedido) => {
              const pedidoElement = `
                  <li class="order-item">
                      <div class="order-info">
                          <p><strong>Pedido #${pedido.id}:</strong> ${pedido.produto}</p>
                          <p>Status: <span class="order-status ${pedido.status.toLowerCase()}">${pedido.status}</span></p>
                          <p>Data: ${new Date(pedido.data).toLocaleDateString()}</p>
                      </div>
                      <button class="btn-details" data-order-id="${pedido.id}">Ver Detalhes</button>
                  </li>
              `;
              orderList.innerHTML += pedidoElement;
          });

          // Adiciona evento para abrir o modal de pedidos
          configurarModalPedidos();
      }
  } catch (error) {
      console.error("Erro ao carregar informações do usuário:", error);
  }

  // ========================
  // 🔹 Alternar Seções do Painel
  // ========================
  const showSection = (id) => {
      sections.forEach((section) => {
          section.classList.remove("active");
          if (section.id === id) {
              section.classList.add("active");
          }
      });
  };

  // Evento para alternar entre as seções
  menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("href").replace("/", "");
          if (targetId !== "logout") {
              showSection(targetId);
          }
      });
  });

  // Redirecionamento ao clicar em logout
  logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/user_screen";
  });
});

// ========================
// 🔹 Modal de Pedidos
// ========================
function configurarModalPedidos() {
  const modal = document.getElementById("modal-entrega");
  const closeModal = document.querySelector(".close-modal-entrega");
  const orderDetails = document.getElementById("order-details");

  document.querySelectorAll(".btn-details").forEach((button) => {
      button.addEventListener("click", async () => {
          const orderId = button.getAttribute("data-order-id");

          try {
              const pedidoResponse = await fetch(`http://localhost:3001/pedidos/detalhes/${orderId}`, {
                  method: "GET",
                  headers: { "Content-Type": "application/json" }
              });

              if (!pedidoResponse.ok) {
                  throw new Error("Erro ao obter detalhes do pedido.");
              }

              const pedido = await pedidoResponse.json();

              orderDetails.innerHTML = `
                  <p><strong>ID do Pedido:</strong> ${pedido.id}</p>
                  <p><strong>Produto:</strong> ${pedido.produto}</p>
                  <p><strong>Status:</strong> ${pedido.status}</p>
                  <p><strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString()}</p>
                  <p><strong>Detalhes:</strong> ${pedido.detalhes}</p>
              `;

              modal.style.display = "flex";
          } catch (error) {
              console.error("Erro ao carregar detalhes do pedido:", error);
          }
      });
  });

  // Fechar Modal
  closeModal.addEventListener("click", () => {
      modal.style.display = "none";
  });

  // Fechar Modal ao clicar fora do conteúdo
  window.addEventListener("click", (e) => {
      if (e.target === modal) {
          modal.style.display = "none";
      }
  });
}
