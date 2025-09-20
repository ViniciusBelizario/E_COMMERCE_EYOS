// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos Inputs de método de pagamento
    const radioCartao = document.querySelector('input[value="cartaoCredito"]');
    const radioPix = document.querySelector('input[value="pix"]');
    const radioBoleto = document.querySelector('input[value="boleto"]');
  
    // Seção de campos adicionais para cartão de crédito
    const cartaoInfoSection = document.querySelector('.cartao-info');
  
    // Campos que podem receber máscaras (CPF, CEP)
    const inputCPF = document.getElementById('cpf');
    const inputCEP = document.getElementById('cep');
  
    // Seleciona o formulário para validações finais
    const checkoutForm = document.querySelector('.checkout-form');
  
    // ===============================
    // 1. FUNÇÃO PARA MOSTRAR/OCULTAR CAMPOS DO CARTÃO
    // ===============================
    function toggleCartaoFields() {
      if (radioCartao && radioCartao.checked) {
        cartaoInfoSection.style.display = 'block';
      } else {
        cartaoInfoSection.style.display = 'none';
      }
    }
  
    // Toda vez que mudar o método de pagamento, executa
    [radioCartao, radioPix, radioBoleto].forEach(radio => {
      if (radio) {
        radio.addEventListener('change', toggleCartaoFields);
      }
    });
  
    // Chama ao iniciar (para o caso de um rádio já estar selecionado)
    toggleCartaoFields();
  
    // ===============================
    // 2. APLICAÇÃO DE MÁSCARAS SIMPLES (OPCIONAL)
    // ===============================
    // Exemplo de máscara para CPF: 123.456.789-00
    if (inputCPF) {
      inputCPF.addEventListener('input', () => {
        let valor = inputCPF.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        // Monta a máscara progressivamente
        if (valor.length > 3 && valor.length <= 6) {
          // 123.456
          valor = valor.replace(/^(\d{3})(\d+)/, '$1.$2');
        } else if (valor.length > 6 && valor.length <= 9) {
          // 123.456.789
          valor = valor.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
        } else if (valor.length > 9) {
          // 123.456.789-00
          valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        }
        inputCPF.value = valor;
      });
    }
  
    // Exemplo de máscara para CEP: 12345-678
    if (inputCEP) {
      inputCEP.addEventListener('input', () => {
        let valor = inputCEP.value.replace(/\D/g, ''); // Remove tudo que não for dígito
        if (valor.length > 5) {
          valor = valor.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
        }
        inputCEP.value = valor;
      });
    }
  
    // ===============================
    // 3. VALIDAÇÃO BÁSICA NO SUBMIT (OPCIONAL)
    // ===============================
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (event) => {
        // Exemplo de verificação: se método for cartão de crédito,
        // checar se os campos do cartão estão preenchidos
        if (radioCartao.checked) {
          const numeroCartao = document.getElementById('numeroCartao');
          const validadeCartao = document.getElementById('validadeCartao');
          const cvvCartao = document.getElementById('cvvCartao');
  
          if (!numeroCartao.value || !validadeCartao.value || !cvvCartao.value) {
            alert('Por favor, preencha todos os campos do cartão de crédito.');
            // Impede o envio do formulário
            event.preventDefault();
            return;
          }
        }
  
        // Você pode adicionar outras validações (e-mail, CPF, etc.)
        // Se tudo estiver ok, o formulário é enviado normalmente
      });
    }
  
  });
  