document.addEventListener('DOMContentLoaded', () => {
  const setActive = (tab) => {
    document.querySelectorAll('.side-tab').forEach(el => {
      const isActive = el.dataset.tab === tab;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  };

  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a.side-tab');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const isHash = href === '' || href === '#';

    if (isHash) {
      // Tratamento SPA apenas para links com "#"
      e.preventDefault();
      setActive(link.dataset.tab);
    } else {
      // Permite a navegação normal
      // Fecha o offcanvas no mobile (se estiver aberto)
      const offcanvasEl = link.closest('.offcanvas.show');
      if (offcanvasEl) {
        const off = bootstrap.Offcanvas.getInstance(offcanvasEl);
        off?.hide();
      }
    }
  });
});