// ==========================
// Lógica dos dropdowns
// ==========================
document.querySelectorAll('.dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-btn');
    const menu = dropdown.querySelector('.dropdown-content');

    // Evento para abrir/fechar dropdown ao clicar no gatilho
    trigger.addEventListener('click', (e) => {
        e.preventDefault(); // Previne o comportamento padrão do botão
        e.stopPropagation(); // Previne que o clique feche o menu imediatamente

        const isActive = menu.classList.contains('show');

        // Fecha todos os dropdowns ativos
        document.querySelectorAll('.dropdown-content').forEach(menu => menu.classList.remove('show'));
        document.querySelectorAll('.dropdown-btn').forEach(trigger => trigger.classList.remove('active'));

        // Abre o dropdown clicado se ele não estiver ativo
        if (!isActive) {
            menu.classList.add('show');
            trigger.classList.add('active');
        }
    });

    // Seleção de uma opção no dropdown
    menu.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedColor = option.getAttribute('data-value'); // Captura o valor da cor
            const colorCircle = option.querySelector('.color-circle').style.backgroundColor; // Captura a cor visual

            // Atualiza o texto e a cor no botão
            trigger.innerHTML = `
                <span class="color-circle" style="background-color: ${colorCircle}; margin-right: 10px;"></span>
                ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
            `;

            trigger.setAttribute('data-selected-color', selectedColor); // Armazena a seleção
            menu.classList.remove('show'); // Fecha o dropdown
            trigger.classList.remove('active'); // Remove o estado ativo do botão
        });
    });

    // Fecha o menu dropdown ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            menu.classList.remove('show');
            trigger.classList.remove('active');
        }
    });
});

// ==========================
// Função de Compra Rápida
// ==========================
function adicionarCarrinho(produtoId) {
    // Exibe o alerta personalizado
    exibirAlert(`Produto ${produtoId} adicionado ao carrinho!`);
}

// ==========================
// Alerta Personalizado (Toast Notification)
// ==========================
function exibirAlert(mensagem, tipo = 'success') {
    const alertContainer = document.getElementById('custom-alert');

    // Cria o elemento do alert
    const alertContent = document.createElement('div');
    alertContent.className = `custom-alert-content ${tipo}`; // Adiciona a classe do tipo de alerta
    alertContent.textContent = mensagem; // Define a mensagem

    // Adiciona o alert ao contêiner
    alertContainer.appendChild(alertContent);

    // Remove o alert automaticamente após 3 segundos
    setTimeout(() => {
        alertContent.remove();
    }, 3000);
}

// ==========================
// Função para Carregar Mais Produtos
// ==========================
function carregarMaisProdutos() {
    const currentUrl = new URL(window.location.href);
    let page = currentUrl.searchParams.get('page') || 1; // Pega a página atual
    page = parseInt(page) + 1; // Incrementa para carregar a próxima página

    // Requisição para carregar mais produtos
    fetch(`/vitrine?page=${page}`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newProducts = doc.querySelector('.product-grid').innerHTML;

            // Adiciona os novos produtos ao grid existente
            document.querySelector('.product-grid').innerHTML += newProducts;
        })
        .catch(error => console.error('Erro ao carregar mais produtos:', error));
}

// ==========================
// Redirecionar para a página do produto ao clicar no container
// ==========================
function irParaProduto(produtoId) {
    window.location.href = `/produto/${produtoId}`;
}
