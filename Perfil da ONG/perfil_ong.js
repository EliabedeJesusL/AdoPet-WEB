document.addEventListener('DOMContentLoaded', () => {
  // Botão voltar
  const btnBack = document.getElementById('btnBack');
  btnBack?.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else window.location.href = '/Doe/doe.html';
  });

  // Enviar mensagem automática: preenche e abre chat
  const btnMensagem = document.getElementById('btnMensagem');
  btnMensagem?.addEventListener('click', () => {
    try {
      const nome = 'Instituto Caramelo';
      const mensagem = `Olá, ${nome}! Gostaria de apoiar a instituição (doações/itens). Podemos conversar?`;
      localStorage.setItem('adopet_prefill_chat', JSON.stringify({ to: nome, message: mensagem }));
    } catch {}
    window.location.href = '/Chat/chat.html';
  });

  // Offcanvas (mobile): fechar ao clicar em algum link
  const offcanvasEl = document.getElementById('menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    offcanvasEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => off.hide()));
  }
});