(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const btnNovo = $('#btnNovo');
  const btnInicio = $('#btnInicio');

  // Limpa rascunhos do fluxo de cadastro (ajuste o prefixo se necessário)
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('adopet_cadastro_')) localStorage.removeItem(k);
    });
  } catch {}

  // Ações
  btnNovo?.addEventListener('click', () => {
    // use o caminho que seu app estiver usando para o cadastro
    window.location.href = '/Cadastro de Animal/cadastro_animal.html';
    // alternativa: window.location.href = '/Cadastrar/cadastrar-animal.html';
  });
  btnInicio?.addEventListener('click', () => {
    window.location.href = '/Dashboard/dashboard.html';
  });

  // Offcanvas: fechar ao clicar em links
  const offcanvasEl = $('#menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    $$('a', offcanvasEl).forEach((a) => a.addEventListener('click', () => off.hide()));
  }

  // Acessibilidade (leitura por screen reader)
  const sr = $('#srStatus');
  if (sr) sr.textContent = 'Cadastro concluído com sucesso.';
})();