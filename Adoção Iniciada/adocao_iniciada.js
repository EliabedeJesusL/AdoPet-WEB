(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Define o nome do pet pela query string (?pet=Nome) ou localStorage
  function getPetName() {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('pet');
    if (fromQuery) return fromQuery;

    try {
      return (
        localStorage.getItem('adopet_pet_nome') ||
        localStorage.getItem('adopet_last_pet') ||
        'Cachorro Orelha Marrom'
      );
    } catch {
      return 'Cachorro Orelha Marrom';
    }
  }

  const petNameEl = $('#petName');
  if (petNameEl) petNameEl.textContent = getPetName();

  // Botão voltar ao início
  $('#btnInicio')?.addEventListener('click', () => {
    window.location.href = '/Dashboard/dashboard.html';
  });

  // Offcanvas: fechar ao clicar nos links
  const offcanvasEl = $('#menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    $$('a', offcanvasEl).forEach((a) => a.addEventListener('click', () => off.hide()));
  }

  // Acessibilidade
  const sr = $('#srStatus');
  if (sr) sr.textContent = 'Processo de adoção iniciado com sucesso.';
})();