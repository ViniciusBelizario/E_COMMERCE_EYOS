document.addEventListener("DOMContentLoaded", () => {
    // Elementos do Carrinho
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartIcon = document.getElementById("cart-icon");
    const cartCount = document.getElementById("cart-count");
    const cartCountModal = document.getElementById("cart-count-modal");
    const cartItemsContainer = document.getElementById("cart-items");
    const emptyCartMessage = document.getElementById("empty-cart");
    const cartTotalValue = document.getElementById("cart-total-value");

    // Pega o carrinho do localStorage ou inicia vazio
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // ==============================
    // Abrir e Fechar o Carrinho
    // ==============================
    window.abrirCarrinho = function () {
        cartModal.classList.add("open");
        atualizarCarrinho();
    };

    window.fecharCarrinho = function () {
        cartModal.classList.remove("open");
    };

    if (closeCart) closeCart.addEventListener("click", fecharCarrinho);
    if (cartIcon) cartIcon.addEventListener("click", abrirCarrinho);

    // ==============================
    // Atualizar Carrinho
    // ==============================
    function atualizarCarrinho() {
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            emptyCartMessage.style.display = "block";
            cartTotalValue.textContent = "R$ 0,00";
            cartCount.textContent = "0";
            cartCountModal.textContent = "0";
            return;
        }

        emptyCartMessage.style.display = "none";
        let total = 0;
        let totalItens = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");

            cartItem.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.nome}</h4>
                    <p>Cor: ${item.cor}</p>
                    <p>Tamanho: ${item.tamanho}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span class="quantity">${item.quantidade}</span>
                        <button class="quantity-btn" onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                    <p class="cart-item-price">R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
                </div>
                <button class="remove-item" onclick="removerItem(${index})">&times;</button>
            `;

            cartItemsContainer.appendChild(cartItem);
            total += item.preco * item.quantidade;
            totalItens += item.quantidade;
        });

        cartTotalValue.textContent = `R$ ${total.toFixed(2)}`;
        cartCount.textContent = totalItens;
        cartCountModal.textContent = totalItens;

        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // ==============================
    // Adicionar Produto ao Carrinho
    // ==============================
    window.adicionarCarrinho = function (produtoId) {
        const produtoNome = document.querySelector(".product-title")?.textContent || "Produto";
        const produtoPreco = parseFloat(document.querySelector(".discount-price")?.textContent.replace("R$ ", "")) || 0;
        const imagemUrl = document.getElementById("main-image")?.src || "/images/default-placeholder.png";
        const quantidade = parseInt(document.querySelector(".quantity-input")?.value, 10) || 1;
        const corSelecionada = document.querySelector(".color-circle.active")?.getAttribute("data-cor") || "Não informado";
        const tamanhoSelecionado = document.querySelector(".size-option.selected")?.textContent || "Não informado";

        const produtoExistente = cart.find(item => 
            item.produtoId === produtoId && 
            item.cor === corSelecionada && 
            item.tamanho === tamanhoSelecionado
        );

        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            cart.push({
                produtoId,
                nome: produtoNome,
                preco: produtoPreco,
                quantidade,
                imagem: imagemUrl,
                cor: corSelecionada,
                tamanho: tamanhoSelecionado
            });
        }

        atualizarCarrinho();
        abrirCarrinho();
    };

    // ==============================
    // Compra Rápida (Carrossel de Produtos)
    // ==============================
    window.compraRapida = function (produtoId, nome, preco, imagemUrl) {
        const quantidade = 1; // Compra rápida sempre adiciona 1 item
        const corSelecionada = "Padrão"; 
        const tamanhoSelecionado = "Único"; 

        const produtoExistente = cart.find(item => item.produtoId === produtoId);

        if (produtoExistente) {
            produtoExistente.quantidade += 1;
        } else {
            cart.push({
                produtoId,
                nome,
                preco: parseFloat(preco),
                quantidade,
                imagem: imagemUrl,
                cor: corSelecionada,
                tamanho: tamanhoSelecionado
            });
        }

        atualizarCarrinho();
        abrirCarrinho();
    };

    // ==============================
    // Alterar Quantidade no Carrinho
    // ==============================
    window.alterarQuantidade = function (index, change) {
        if (cart[index]) {
            cart[index].quantidade += change;
            if (cart[index].quantidade <= 0) {
                cart.splice(index, 1);
            }
        }
        atualizarCarrinho();
    };

    // ==============================
    // Remover Item do Carrinho
    // ==============================
    window.removerItem = function (index) {
        cart.splice(index, 1);
        atualizarCarrinho();
    };

    // ==============================
    // Finalizar Compra (Enviar para /pagamentos)
    // ==============================
    window.finalizarCompra = function () {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/pagamentos";

        cart.forEach((item, index) => {
            ["produtoId", "nome", "preco", "quantidade", "imagem", "cor", "tamanho"].forEach((key) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = `items[${index}][${key}]`;
                input.value = item[key];
                form.appendChild(input);
            });
        });

        document.body.appendChild(form);
        form.submit();
    };

    atualizarCarrinho();
});
