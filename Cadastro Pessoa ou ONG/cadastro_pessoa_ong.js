document.addEventListener('DOMContentLoaded', () => {
  const btnVoltar = document.getElementById('btnVoltar');
  const btnJuridica = document.getElementById('btnJuridica');
  const btnFisica = document.getElementById('btnFisica');

  // Voltar
  btnVoltar?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = '/Conta/conta.html';
  });

  // Redireciona para o cadastro específico
  btnJuridica?.addEventListener('click', () => {
    window.location.href = '/Cadastro Jurídico/cadastro_juridico.html';
  });

  btnFisica?.addEventListener('click', () => {
    window.location.href = '/Cadastro Físico/cadastro_fisico.html';
  });
});