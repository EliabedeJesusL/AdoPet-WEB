// Helpers
const $ = (sel) => document.querySelector(sel);

const form = $('#loginForm');
const email = $('#email');
const password = $('#password');
const emailField = document.querySelector('#group-email .field');
const toast = $('#toast');

const btnBack = $('#btnBack');
const togglePasswordBtn = $('#togglePassword');

// Botão voltar
btnBack?.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else window.location.href = 'index.html'; // ajuste se precisar
});

// Mostrar/ocultar senha
let pwdVisible = false;
togglePasswordBtn?.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  password.type = pwdVisible ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-label', pwdVisible ? 'Ocultar senha' : 'Mostrar senha');
  togglePasswordBtn.innerHTML = pwdVisible
    ? `<svg class="icon-eye" viewBox="0 0 24 24" aria-hidden="true">
         <path fill="currentColor" d="M2.1 3.5l18.4 18.4 1.4-1.4-18.4-18.4-1.4 1.4zM12 7c-7 0-10 7-10 7 1.1 2.2 2.8 4.2 5 5.5l2.1-2.1C7.9 16.3 7 14.3 7 12c0-1.3.4-2.5 1.1-3.5L12 12l2 2 7.9 7.9C23 20.8 24 19.5 24 19.5s-3-7.5-12-7.5c-.7 0-1.3.1-2 .2L12 7z"/>
       </svg>`
    : `<svg class="icon-eye" viewBox="0 0 24 24" aria-hidden="true">
         <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
       </svg>`;
});

// Validação em tempo real do email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
function updateEmailStatus(){
  emailField.classList.toggle('valid', emailRegex.test(email.value.trim()));
}
email?.addEventListener('input', updateEmailStatus);
email?.addEventListener('blur', updateEmailStatus);

// Utilitários
function setInvalid(groupId, invalid){
  const el = document.getElementById(groupId);
  el.classList.toggle('invalid', invalid);
  el.querySelector('input')?.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}
function notify(text){
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.remove('show'), 1700);
}

// Submit
form?.addEventListener('submit', (e) => {
  e.preventDefault();

  ['group-email','group-password'].forEach(id => setInvalid(id, false));

  const em = email.value.trim();
  const pw = password.value;

  let hasError = false;
  if (!emailRegex.test(em)){ setInvalid('group-email', true); hasError = true; }
  if (pw.length < 8){ setInvalid('group-password', true); hasError = true; }

  if (hasError){
    notify('Verifique os campos destacados.');
    return;
  }

  // Login OK — troque pela sua chamada de API se quiser
  notify('Bem-vindo!');
  setTimeout(() => {
    // Abrir dashboard em nova guia (como você pediu antes)
    window.open('/Dashboard/dashboard.html', '_blank', 'noopener');
  }, 700);
});

// Estado inicial
updateEmailStatus();