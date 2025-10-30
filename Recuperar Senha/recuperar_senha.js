// recuperar.ui.js
import { sendReset } from "./recuperar.db.js";

const $ = (sel) => document.querySelector(sel);

const form = $('#recoverForm');
const email = $('#email');
const emailField = document.querySelector('#group-email .field');
const btnSend = $('#btnSend');
const btnBack = $('#btnBack');
const toast = $('#toast');

// Botão voltar
btnBack?.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else window.location.href = 'index.html';
});

// Validação do email (mesmo padrão do login)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
function updateEmailStatus() {
  emailField?.classList.toggle('valid', emailRegex.test(email.value.trim()));
}
email?.addEventListener('input', updateEmailStatus);
email?.addEventListener('blur', updateEmailStatus);

// Utilitários UI
function setInvalid(groupId, invalid) {
  const el = document.getElementById(groupId);
  el?.classList.toggle('invalid', invalid);
  el?.querySelector('input')?.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}
function notify(text, duration = 2400) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.remove('show'), duration);
}

// Submit
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  setInvalid('group-email', false);

  const em = email.value.trim();
  if (!emailRegex.test(em)) {
    setInvalid('group-email', true);
    notify('Informe um email válido.');
    return;
  }

  try {
    btnSend.disabled = true;
    btnSend.textContent = 'Enviando...';

    await sendReset(em);

    notify('Enviamos o link de redefinição para seu email.');
    btnSend.textContent = 'Enviar link';

    // Opcional: voltar ao login após alguns segundos
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1800);
  } catch (error) {
    console.error('Erro ao enviar reset:', error?.code, error?.message);

    let message = 'Não foi possível enviar o link. ';
    if (error?.code === 'auth/user-not-found') message += 'Usuário não encontrado.';
    else if (error?.code === 'auth/invalid-email') message += 'Email inválido.';
    else if (error?.code === 'auth/too-many-requests') message += 'Muitas tentativas. Tente mais tarde.';
    else message += (error?.message || '');

    notify(message, 3000);
  } finally {
    btnSend.disabled = false;
    btnSend.textContent = 'Enviar link';
  }
});

// Estado inicial
updateEmailStatus();