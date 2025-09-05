// Atalhos
const $ = (id) => document.getElementById(id);
const toast = document.getElementById('toast');

function notify(text){
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.remove('show'), 1600);
}
