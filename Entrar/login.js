// Import Firebase 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.firebasestorage.app",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  measurementId: "G-0HP9DHD1ZF",
  databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/" // 👈 garante que está aqui
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

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
  else window.location.href = 'index.html';
});

// Mostrar/ocultar senha
let pwdVisible = false;
togglePasswordBtn?.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  password.type = pwdVisible ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-label', pwdVisible ? 'Ocultar senha' : 'Mostrar senha');
});

// Validação do email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
function updateEmailStatus() {
  emailField.classList.toggle('valid', emailRegex.test(email.value.trim()));
}
email?.addEventListener('input', updateEmailStatus);
email?.addEventListener('blur', updateEmailStatus);

// Utilitários UI
function setInvalid(groupId, invalid) {
  const el = document.getElementById(groupId);
  el.classList.toggle('invalid', invalid);
  el.querySelector('input')?.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}
function notify(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(notify._t);
  notify._t = setTimeout(() => toast.classList.remove('show'), 2000);
}

// Login Firebase + busca no DB
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  ['group-email', 'group-password'].forEach(id => setInvalid(id, false));

  const em = email.value.trim();
  const pw = password.value;

  let hasError = false;
  if (!emailRegex.test(em)) { setInvalid('group-email', true); hasError = true; }
  if (pw.length < 8) { setInvalid('group-password', true); hasError = true; }

  if (hasError) {
    notify('Verifique os campos destacados.');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, em, pw);
    const user = userCredential.user;

    // 🔥 Salva UID no localStorage (padrão do register.js)
    localStorage.setItem("uid", user.uid);

    // Buscar dados do usuário no Realtime Database
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `usuarios/${user.uid}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Opcional: guardar também os dados completos
      localStorage.setItem("usuario", JSON.stringify(userData));

      console.log("Dados do usuário:", userData);
    } else {
      console.warn("Usuário autenticado, mas sem dados no DB.");
    }

    notify('Login realizado com sucesso!');
    setTimeout(() => {
      window.location.assign("/Dashboard/dashboard.html");
    }, 1000);

  } catch (error) {
    console.error("Erro no login:", error.code, error.message);

    let message = "Erro ao entrar. ";
    if (error.code === "auth/user-not-found") message += "Usuário não encontrado.";
    else if (error.code === "auth/wrong-password") message += "Senha incorreta.";
    else if (error.code === "auth/invalid-email") message += "Email inválido.";
    else message += error.message;

    notify(message);
  }
});

// Estado inicial
updateEmailStatus();
