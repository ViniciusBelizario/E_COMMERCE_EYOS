document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Evita recarregar a página

            // Captura os valores dos campos
            const nome = document.getElementById("fullName").value.trim();
            const email = document.getElementById("emailRegister").value.trim();
            const senha = document.getElementById("passwordRegister").value.trim();
            const telefone = document.getElementById("phone").value.trim();
            const tipo = "cliente"; // Sempre será cliente

            // Verificação de campos vazios
            if (!nome || !email || !senha || !telefone) {
                alert("❌ Todos os campos são obrigatórios.");
                return;
            }

            try {
                const response = await fetch("http://localhost:3001/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email, senha, telefone, tipo }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ Cadastro realizado com sucesso! 🎉");

                    // 🔄 Removendo qualquer query da URL antes do redirecionamento
                    window.history.replaceState({}, document.title, "/user_screen");

                    // 🔀 Redirecionamento sem expor dados na URL
                    window.location.assign("/user_screen");
                } else {
                    alert(`⚠️ Erro ao cadastrar: ${data.error || "Erro desconhecido"}`);
                }
            } catch (error) {
                console.error("❌ Erro ao tentar registrar:", error);
                alert("❌ Erro no servidor. Tente novamente mais tarde.");
            }
        });
    }
});
