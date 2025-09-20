document.addEventListener("DOMContentLoaded", () => {
    const forms = {
        categoriaForm: "/categorias",
        marcaForm: "/marcas",
        corForm: "/cores",
        produtoForm: "/produtos",
    };

    Object.keys(forms).forEach((formId) => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const jsonData = Object.fromEntries(formData);

                try {
                    const response = await fetch(`http://localhost:3001${forms[formId]}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify(jsonData),
                    });

                    const data = await response.json();
                    document.getElementById("mensagem").innerText = data.message || data.error;
                } catch (error) {
                    console.error("Erro:", error);
                }
            });
        }
    });
});
