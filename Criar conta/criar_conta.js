// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', () => {
  const form = $('#signupForm');
  const username = $('#username');
  const email = $('#email');
  const password = $('#password');
  const emailStatusWrap = $('#group-email .field');
  const toast = $('#toast');

  const btnBack = $('#btnBack');
  const togglePasswordBtn = $('#togglePassword');

  // Voltar (mesma guia)
  btnBack?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = 'index.html';
  });

  // Toggle de senha
  let pwdVisible = false;
  togglePasswordBtn?.addEventListener('click', () => {
    pwdVisible = !pwdVisible;
    password.type = pwdVisible ? 'text' : 'password';
    togglePasswordBtn.setAttribute('aria-pressed', String(pwdVisible));
    togglePasswordBtn.innerHTML = pwdVisible
      ? `<svg class="icon-eye" viewBox="0 0 24 24" aria-hidden="true">
           <path fill="currentColor" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12"/>
           <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"/>
         </svg>`
      : `<svg class="icon-eye" viewBox="0 0 24 24" aria-hidden="true">
           <path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
         </svg>`;
  });

  // Validação de email (tempo real)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const updateEmailStatus = () => {
    const valid = emailRegex.test(email.value.trim());
    emailStatusWrap.classList.toggle('valid', valid);
  };
  email?.addEventListener('input', updateEmailStatus);
  email?.addEventListener('blur', updateEmailStatus);

  // Submit: validação básica + toast + redirecionamento
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = username.value.trim();
    const em = email.value.trim();
    const pw = password.value;

    // Validações simples
    let ok = true;
    $('#group-username').classList.toggle('invalid', u.length < 3);
    $('#group-email').classList.toggle('invalid', !emailRegex.test(em));
    $('#group-password').classList.toggle('invalid', pw.length < 8);
    if (u.length < 3 || !emailRegex.test(em) || pw.length < 8) ok = false;

    if (!ok) {
      showToast('Verifique os campos destacados.');
      return;
    }

    // Simulação de cadastro OK
    showToast('Conta criada com sucesso!');
    // Redireciona sem usar href (mesma guia)
    setTimeout(() => {
      window.location.assign('/Dashboard/dashboard.html'); // ajuste o path se necessário
      // Para evitar voltar ao signup:
      // window.location.replace('/Dashboard/dashboard.html');
    }, 800);
  });

  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
});