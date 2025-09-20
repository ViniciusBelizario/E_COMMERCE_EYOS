// ============================
// Animações e Efeitos de Profundidade
// ============================

// Adiciona sombra dinâmica ao passar o mouse nos cards
const cards = document.querySelectorAll('.mv-item, .team-member');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        card.style.transform = 'translateY(0)';
    });
});

// Animação suave ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');

    sections.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = 1;
            section.style.transform = 'translateY(0)';
        }, index * 300); // Animação em cascata
    });
});

// Animação de aparecer suavemente no scroll
const observer = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2, // Quando 20% do elemento aparece, ativa a animação
    }
);

const elementsToAnimate = document.querySelectorAll('.timeline-item, .mv-item, .team-member, .cta-section');

elementsToAnimate.forEach(el => {
    el.classList.add('hidden'); // Começa escondido
    observer.observe(el);
});
