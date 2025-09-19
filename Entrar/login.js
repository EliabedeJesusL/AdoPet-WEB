// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Configuração
const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.firebasestorage.app",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  measurementId: "G-0HP9DHD1ZF"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Espera DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuário logado:", userCredential.user);

      alert("Login realizado com sucesso!");
      window.location.assign("/Dashboard/dashboard.html"); 
    } catch (error) {
      console.error("Erro no login:", error.code, error.message);

      let message = "Erro ao entrar. ";
      if (error.code === "auth/user-not-found") message += "Usuário não encontrado.";
      else if (error.code === "auth/wrong-password") message += "Senha incorreta.";
      else if (error.code === "auth/invalid-email") message += "Email inválido.";
      else message += error.message;

      alert(message);
    }
  });
});
