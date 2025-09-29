// Helpers
const $ = (sel) => document.querySelector(sel);

document.addEventListener('DOMContentLoaded', () => {
  const username = $('#username');
  const email = $('#email');
  const password = $('#password');
  const emailStatusWrap = $('#group-email .field');
  const toast = $('#toast');
  const btnBack = $('#btnBack');
  const togglePasswordBtn = $('#togglePassword');

  // Voltar
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
  });

  // Validação de email em tempo real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const updateEmailStatus = () => {
    const valid = emailRegex.test(email.value.trim());
    emailStatusWrap.classList.toggle('valid', valid);
  };
  email?.addEventListener('input', updateEmailStatus);
  email?.addEventListener('blur', updateEmailStatus);

  // Remove o redirecionamento daqui!
  // Quem cuida do cadastro é o register.js
});
