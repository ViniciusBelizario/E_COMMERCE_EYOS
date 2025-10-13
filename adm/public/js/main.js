// Toggle de submenus na sidebar + persistência no localStorage
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.sidebar-accordion');

  accordions.forEach(btn => {
    const targetSel = btn.getAttribute('data-target');
    const target = document.querySelector(targetSel);
    const chevron = btn.querySelector('.chevron');

    // chave para lembrar estado
    const key = `accordion:${targetSel}`;

    // Se não veio aberto do servidor e houver preferencia salva, aplica
    if (target && !btn.hasAttribute('data-skip-restore')) {
      const saved = localStorage.getItem(key);
      if (saved === 'open') {
        target.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        chevron && chevron.classList.add('rotate-90');
      } else if (saved === 'closed') {
        target.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        chevron && chevron.classList.remove('rotate-90');
      }
    }

    btn.addEventListener('click', () => {
      if (!target) return;
      const isHidden = target.classList.contains('hidden');
      target.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      if (chevron) chevron.classList.toggle('rotate-90', isHidden);

      // salva preferência
      localStorage.setItem(key, isHidden ? 'open' : 'closed');
    });
  });
});
