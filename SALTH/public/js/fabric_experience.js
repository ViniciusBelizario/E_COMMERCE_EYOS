// ============================
// Animação ao scroll (benefits-section)
// ============================

const benefitsSection = document.querySelector('.benefits-section');

// Verifica se a seção está visível na tela
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Verifica se a seção saiu do topo da tela
function isElementAboveViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom < 0;
}

// Manipula as classes da seção com base na posição
function handleScroll() {
    if (isElementAboveViewport(benefitsSection)) {
        benefitsSection.classList.add('static');
        benefitsSection.classList.remove('visible', 'hidden');
    } else if (isElementInViewport(benefitsSection)) {
        benefitsSection.classList.add('visible');
        benefitsSection.classList.remove('hidden', 'static');
    } else {
        benefitsSection.classList.add('hidden');
        benefitsSection.classList.remove('visible', 'static');
    }
}

window.addEventListener('scroll', handleScroll);
handleScroll();

// ============================
// Slider da Nossa Fábrica (Factory Slider)
// ============================

// Seleciona os elementos do slider da seção "Nossa Fábrica"
const factorySlider = document.querySelector('.factory-section .slider-container .slider');
const factorySlides = document.querySelectorAll('.factory-section .slider-container .slide');
let isDraggingFactory = false;
let startXFactory = 0;
let currentTranslateFactory = 0;
let previousTranslateFactory = 0;
let currentIndexFactory = 0;

// Função para obter a posição X do evento (mouse ou toque)
function getPositionXFactory(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

// Inicia o arraste no slider da seção "Nossa Fábrica"
function startDragFactory(e) {
    isDraggingFactory = true;
    startXFactory = getPositionXFactory(e);
    factorySlider.style.transition = 'none';
}

// Arrasta o slider da seção "Nossa Fábrica"
function draggingFactory(e) {
    if (!isDraggingFactory) return;
    const currentPosition = getPositionXFactory(e);
    currentTranslateFactory = previousTranslateFactory + (currentPosition - startXFactory);
    factorySlider.style.transform = `translateX(${currentTranslateFactory}px)`;
}

// Finaliza o arraste no slider da seção "Nossa Fábrica"
function endDragFactory(e) {
    if (!isDraggingFactory) return;
    isDraggingFactory = false;

    const movedBy = currentTranslateFactory - previousTranslateFactory;

    if (movedBy < -100 && currentIndexFactory < factorySlides.length - 1) {
        currentIndexFactory++;
    } else if (movedBy > 100 && currentIndexFactory > 0) {
        currentIndexFactory--;
    }

    setPositionByIndexFactory();
}

// Define a posição do slider baseado no índice atual
function setPositionByIndexFactory() {
    currentTranslateFactory = currentIndexFactory * -factorySlides[0].clientWidth;
    previousTranslateFactory = currentTranslateFactory;
    factorySlider.style.transition = 'transform 0.4s ease-in-out';
    factorySlider.style.transform = `translateX(${currentTranslateFactory}px)`;
}

// Eventos de arraste para mouse
factorySlider.addEventListener('mousedown', startDragFactory);
factorySlider.addEventListener('mousemove', draggingFactory);
factorySlider.addEventListener('mouseup', endDragFactory);
factorySlider.addEventListener('mouseleave', endDragFactory);

// Eventos de arraste para toque
factorySlider.addEventListener('touchstart', startDragFactory);
factorySlider.addEventListener('touchmove', draggingFactory);
factorySlider.addEventListener('touchend', endDragFactory);

// Responsividade: ajusta a posição ao redimensionar
window.addEventListener('resize', () => {
    currentTranslateFactory = currentIndexFactory * -factorySlides[0].clientWidth;
    previousTranslateFactory = currentTranslateFactory;
    factorySlider.style.transform = `translateX(${currentTranslateFactory}px)`;
});



// ============================
// Slider de Comparação (Ajustado para Alinhamento Correto)
// ============================

const comparisonSlider = document.querySelector('.comparison-slider');
const comparisonSlides = document.querySelectorAll('.comparison-slide');
const comparisonPrevButton = document.querySelector('.comparison-section .prev-slide');
const comparisonNextButton = document.querySelector('.comparison-section .next-slide');
let isDraggingComparison = false;
let startXComparison = 0;
let currentTranslateComparison = 0;
let previousTranslateComparison = 0;
let currentIndexComparison = 0;

// Obtém o valor necessário para mover exatamente 1 slide
function getSlideWidthComparison() {
    return comparisonSlides[0].getBoundingClientRect().width;
}

// Função para obter a posição X do evento (mouse ou toque)
function getPositionXComparison(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

// Inicia o arraste no slider de comparação
function startDragComparison(e) {
    isDraggingComparison = true;
    startXComparison = getPositionXComparison(e);
    comparisonSlider.style.transition = 'none';
}

// Arrasta o slider de comparação
function draggingComparison(e) {
    if (!isDraggingComparison) return;
    const currentPosition = getPositionXComparison(e);
    currentTranslateComparison = previousTranslateComparison + (currentPosition - startXComparison);
    comparisonSlider.style.transform = `translateX(${currentTranslateComparison}px)`;
}

// Finaliza o arraste no slider de comparação
function endDragComparison(e) {
    if (!isDraggingComparison) return;
    isDraggingComparison = false;

    const movedBy = currentTranslateComparison - previousTranslateComparison;
    const slideWidth = getSlideWidthComparison();

    // Define o índice do slide com base no deslocamento
    if (movedBy < -slideWidth / 3 && currentIndexComparison < comparisonSlides.length - 1) {
        currentIndexComparison++;
    } else if (movedBy > slideWidth / 3 && currentIndexComparison > 0) {
        currentIndexComparison--;
    }

    setPositionByIndexComparison();
}

// Define a posição do slider baseado no índice atual
function setPositionByIndexComparison() {
    const slideWidth = getSlideWidthComparison();
    currentTranslateComparison = currentIndexComparison * -slideWidth;
    previousTranslateComparison = currentTranslateComparison;
    comparisonSlider.style.transition = 'transform 0.4s ease-in-out';
    comparisonSlider.style.transform = `translateX(${currentTranslateComparison}px)`;
}

// Botões de navegação
comparisonPrevButton.addEventListener('click', () => {
    if (currentIndexComparison > 0) {
        currentIndexComparison--;
        setPositionByIndexComparison();
    }
});

comparisonNextButton.addEventListener('click', () => {
    if (currentIndexComparison < comparisonSlides.length - 1) {
        currentIndexComparison++;
        setPositionByIndexComparison();
    }
});

// Eventos de arraste para mouse
comparisonSlider.addEventListener('mousedown', startDragComparison);
comparisonSlider.addEventListener('mousemove', draggingComparison);
comparisonSlider.addEventListener('mouseup', endDragComparison);
comparisonSlider.addEventListener('mouseleave', endDragComparison);

// Eventos de arraste para toque
comparisonSlider.addEventListener('touchstart', startDragComparison);
comparisonSlider.addEventListener('touchmove', draggingComparison);
comparisonSlider.addEventListener('touchend', endDragComparison);

// Ajusta a posição ao redimensionar
window.addEventListener('resize', () => {
    setPositionByIndexComparison();
});



// ============================
// JavaScript para "Tecidos do Futuro"
// ============================

// Seleciona os elementos necessários
const materialItems = document.querySelectorAll('.material-item'); // Cada material
const modal = document.getElementById('material-modal'); // Modal principal
const modalTitle = document.getElementById('modal-title'); // Título do modal
const modalDescription = document.getElementById('modal-description'); // Descrição do modal
const closeModalButton = document.querySelector('.close-modal'); // Botão para fechar o modal

// Informações dos materiais (dados fictícios para exemplo)
const materialsInfo = {
    "pcm-outlast": {
        title: "PCM/Outlast",
        description: "Tecnologia avançada de gerenciamento térmico, projetada para manter a temperatura corporal equilibrada em qualquer situação."
    },
    "biodegradable": {
        title: "Biodegradável",
        description: "Feito com materiais que se decompõem naturalmente, promovendo a sustentabilidade ambiental."
    },
    "antimicrobial": {
        title: "Antimicrobiano",
        description: "Proteção contra bactérias e microrganismos, garantindo tecidos mais higiênicos e duráveis."
    },
    "thermal-regulation": {
        title: "Regulação Térmica",
        description: "Mantém o corpo na temperatura ideal, proporcionando conforto mesmo em condições extremas."
    },
    "water-repellent": {
        title: "Hidrorepelente",
        description: "Repele líquidos e protege contra manchas, mantendo o tecido sempre limpo e seco."
    },
    "infrared": {
        title: "Infravermelho",
        description: "Estimula a circulação sanguínea e promove benefícios terapêuticos para o corpo."
    },
    "ultraflexible": {
        title: "Ultraflexível",
        description: "Tecido extremamente elástico, garantindo total liberdade de movimento."
    },
    "uv-protection": {
        title: "Proteção UV",
        description: "Barreira contra raios ultravioleta, protegendo a pele em ambientes externos."
    },
    "anti-humidity": {
        title: "Antiumidade",
        description: "Absorve a umidade e mantém o tecido seco, ideal para atividades físicas."
    },
    "ultrasoft": {
        title: "Ultramacio",
        description: "Textura suave e confortável, oferecendo a melhor experiência de uso."
    }
};

// Função para abrir o modal com as informações do material
function openModal(materialKey) {
    const material = materialsInfo[materialKey];

    // Preenche o modal com as informações
    modalTitle.textContent = material.title;
    modalDescription.textContent = material.description;

    // Exibe o modal
    modal.style.display = 'flex';
}

// Função para fechar o modal
function closeModal() {
    modal.style.display = 'none';
}

// Adiciona evento de clique em cada material
materialItems.forEach(item => {
    item.addEventListener('click', () => {
        const materialKey = item.getAttribute('data-material');
        openModal(materialKey);
    });
});

// Adiciona evento para fechar o modal ao clicar no botão "X"
closeModalButton.addEventListener('click', closeModal);

// Adiciona evento para fechar o modal ao clicar fora da área de conteúdo
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
