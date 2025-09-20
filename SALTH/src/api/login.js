document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const loginMessage = document.getElementById("login-message");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Impede o recarregamento da página

            const email = document.getElementById("loginEmail").value.trim();
            const senha = document.getElementById("loginPassword").value.trim();

            // Validação: Certifica-se de que todos os campos estão preenchidos
            if (!email || !senha) {
                alert("Preencha todos os campos antes de continuar.");
                return;
            }

            try {
                const response = await fetch("http://localhost:3001/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Exibe mensagem de sucesso
                    loginMessage.textContent = "Login realizado com sucesso! ✅";
                    loginMessage.style.color = "green";

                    // Armazena os dados do usuário no localStorage
                    localStorage.setItem("user", JSON.stringify(data));

                    // Redireciona para a Central do Usuário
                    setTimeout(() => {
                        window.location.href = "/central_usuario";
                    }, 1500);
                } else {
                    // Exibe erro de credenciais inválidas
                    loginMessage.textContent = data.error || "Credenciais inválidas.";
                    loginMessage.style.color = "red";
                }
            } catch (error) {
                // Exibe erro genérico caso haja problema no servidor
                loginMessage.textContent = "Erro no servidor. Tente novamente.";
                loginMessage.style.color = "red";
                console.error("Erro ao tentar logar:", error);
            }
        });
    }
});
