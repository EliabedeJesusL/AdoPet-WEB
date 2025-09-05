document.addEventListener('DOMContentLoaded', () => {
  const btnEditar = document.getElementById('btnEditarPerfil');
  const btnSair = document.getElementById('btnSair');
  const btnSairMobile = document.getElementById('btnSairMobile');
  const btnVoltar = document.getElementById('btnVoltar');
  const btnBell = document.getElementById('btnBell');
  const btnChat = document.getElementById('btnChat');

  btnEditar?.addEventListener('click', () => {
    alert('Ação de editar perfil (implemente conforme sua necessidade).');
  });

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      window.location.href = '/Tela inicial/tela_inicial.html';
    }
  };
  btnSair?.addEventListener('click', handleLogout);
  btnSairMobile?.addEventListener('click', handleLogout);

  btnVoltar?.addEventListener('click', () => {
    if (document.referrer && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  btnBell?.addEventListener('click', () => alert('Abrir notificações'));
  btnChat?.addEventListener('click', () => alert('Abrir mensagens'));
});