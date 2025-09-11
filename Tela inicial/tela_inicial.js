// Atalhos
const $ = (id) => document.getElementById(id);
const toast = document.getElementById('toast');

function notify(text){
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.remove('show'), 1600);
}

// Entrar sem login -> marca modo convidado e vai ao dashboard
$('btnGuest')?.addEventListener('click', (e) => {
  e.preventDefault();
  try { localStorage.setItem('adopet_guest', '1'); } catch {}
  // Se quiser exibir um aviso rápido, descomente a linha abaixo:
  // notify('Entrando como visitante...');
  window.location.href = '/Dashboard/dashboard.html';
});