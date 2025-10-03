document.addEventListener('DOMContentLoaded', () => {
  const btnVoltar = document.getElementById('btnVoltar');

  btnVoltar?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = 'Localização/localizacao.html';
  });
});
