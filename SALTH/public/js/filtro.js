document.addEventListener("DOMContentLoaded", async () => {
    const filterForm = document.getElementById("filter-form");
    const productGrid = document.querySelector(".product-grid");
    const categoriaSection = document.getElementById("categoria-filtro");
    const corSection = document.getElementById("cor-filtro");

    try {
        // Busca categorias e cores na API
        const [categoriasResponse, coresResponse] = await Promise.all([
            fetch("http://localhost:3001/categorias"),
            fetch("http://localhost:3001/cores"),
        ]);

        const categorias = await categoriasResponse.json();
        const cores = await coresResponse.json();

        // Renderiza as categorias no dropdown
        categoriaSection.innerHTML = "";
        categorias.forEach(categoria => {
            const label = document.createElement("label");
            label.innerHTML = `
                <input type="checkbox" name="categoria" value="${categoria.id}" class="filter-checkbox"> 
                ${categoria.nome}`;
            categoriaSection.appendChild(label);
        });

        // Renderiza as cores no dropdown
        corSection.innerHTML = "";
        cores.forEach(cor => {
            const label = document.createElement("label");
            label.innerHTML = `
                <input type="checkbox" name="cor" value="${cor.id}" class="filter-checkbox">
                <span class="color-circle" style="background-color: ${cor.codigo_hex};"></span> ${cor.nome}`;
            corSection.appendChild(label);
        });

    } catch (error) {
        console.error("Erro ao buscar categorias e cores:", error);
        categoriaSection.innerHTML = "<p>Erro ao carregar categorias.</p>";
        corSection.innerHTML = "<p>Erro ao carregar cores.</p>";
    }

    // ==========================
    // Evento para abrir e fechar dropdowns ao clicar no botão
    // ==========================
    document.querySelectorAll(".dropdown-btn").forEach(button => {
        button.addEventListener("click", function () {
            const dropdown = this.nextElementSibling;
            const parent = this.parentElement;

            // Fecha todos os outros dropdowns antes de abrir o atual
            document.querySelectorAll(".dropdown-content").forEach(el => {
                if (el !== dropdown) el.classList.remove("open");
            });

            document.querySelectorAll(".filter-dropdown").forEach(el => {
                if (el !== parent) el.classList.remove("open");
            });

            // Alterna a classe "open" para mostrar/ocultar o dropdown
            dropdown.classList.toggle("open");
            parent.classList.toggle("open");
        });
    });

    // Fecha os dropdowns ao clicar fora deles
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".filter-dropdown")) {
            document.querySelectorAll(".dropdown-content").forEach(el => el.classList.remove("open"));
            document.querySelectorAll(".filter-dropdown").forEach(el => el.classList.remove("open"));
        }
    });

    // ==========================
    // Atualiza o botão ao selecionar um filtro
    // ==========================
    document.querySelectorAll(".filter-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            atualizarTextoBotaoFiltro();
        });
    });

    function atualizarTextoBotaoFiltro() {
        document.querySelectorAll(".filter-dropdown").forEach(dropdown => {
            const button = dropdown.querySelector(".dropdown-btn");
            const content = dropdown.querySelector(".dropdown-content");
            const selectedItems = [...content.querySelectorAll("input[type='checkbox']:checked")]
                .map(cb => cb.nextSibling.textContent.trim());

            button.innerHTML = selectedItems.length > 0 
                ? `${selectedItems.join(", ")}`
                : button.dataset.default;
        });
    }

    // ==========================
    // Evento de submissão do filtro
    // ==========================
    if (filterForm && productGrid) {
        filterForm.addEventListener("submit", async function (e) {
            e.preventDefault(); // Previne o reload da página

            const formData = new FormData(filterForm);
            const params = new URLSearchParams();

            // Captura os valores selecionados nos checkboxes e adiciona à URL
            formData.forEach((value, key) => {
                if (!params.has(key)) {
                    params.append(key, value);
                } else {
                    params.set(key, params.get(key) + "," + value);
                }
            });

            // Atualiza a URL sem recarregar a página
            const newUrl = params.toString() ? `/vitrine?${params.toString()}` : "/vitrine";
            history.pushState({}, "", newUrl);

            // Faz a requisição para a API com os filtros aplicados
            try {
                await carregarProdutos(params.toString());
            } catch (error) {
                console.error("Erro ao buscar produtos filtrados:", error);
            }
        });

        // ==========================
        // Mantém os checkboxes marcados após a pesquisa
        // ==========================
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
            const values = value.split(",");
            values.forEach(val => {
                const checkbox = document.querySelector(`input[name="${key}"][value="${val}"]`);
                if (checkbox) checkbox.checked = true;
            });
        });

        // ==========================
        // Botão de Reset - Remove os filtros e recarrega os produtos
        // ==========================
        const resetButton = filterForm.querySelector(".reset-btn");
        resetButton.addEventListener("click", async (e) => {
            e.preventDefault();
            history.pushState({}, "", "/vitrine"); // Remove os filtros da URL
            await carregarProdutos(""); // Recarrega todos os produtos sem filtros
        });

        // ==========================
        // Carrega os produtos ao entrar na página com filtros aplicados
        // ==========================
        carregarProdutos(urlParams.toString());
    }

    // ==========================
    // Função para Buscar Produtos da API e Renderizar
    // ==========================
    async function carregarProdutos(queryString) {
        productGrid.innerHTML = "<p>Carregando produtos...</p>"; // Placeholder

        const url = queryString ? `http://localhost:3001/produtos?${queryString}` : `http://localhost:3001/produtos`;

        try {
            const response = await fetch(url);
            const produtos = await response.json();
            renderizarProdutos(produtos);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            productGrid.innerHTML = "<p>Erro ao carregar os produtos.</p>";
        }
    }

    // ==========================
    // Função para Renderizar Produtos Dinamicamente
    // ==========================
    function renderizarProdutos(produtos) {
        productGrid.innerHTML = ""; // Limpa os produtos existentes

        if (produtos.length === 0) {
            productGrid.innerHTML = "<p>Nenhum produto encontrado.</p>";
            return;
        }

        produtos.forEach(produto => {
            const produtoHTML = `
                <article class="product-card" onclick="irParaProduto('${produto.id}')">
                    <div class="product-image-container">
                        <img src="http://localhost:3001${produto.imagem_url}" alt="${produto.nome}">
                        <button class="quick-buy-btn" onclick="adicionarCarrinho(${produto.id}); event.stopPropagation();">
                            Compra Rápida
                        </button>
                    </div>
                    <div class="product-info">
                        <h3>${produto.nome}</h3>
                        <p class="rating"><span>★ 4.8</span> 2.225 reviews</p>
                        <p class="price">
                            <span class="original-price">R$ ${(produto.preco * 1.2).toFixed(2)}</span>
                            <span class="discount-price">R$ ${parseFloat(produto.preco).toFixed(2)}</span>
                        </p>
                        <p class="coupon">com cupom ${produto.cupom ? produto.cupom : "EXCLUSIVO"}</p>
                    </div>
                </article>
            `;
            productGrid.innerHTML += produtoHTML;
        });
    }
});
