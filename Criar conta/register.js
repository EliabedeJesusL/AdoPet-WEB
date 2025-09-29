// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.firebasestorage.app",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  measurementId: "G-0HP9DHD1ZF",
  databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/" // 🔥 Realtime DB
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Espera DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      // Cria conta no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salva dados iniciais no Realtime Database
      await set(ref(db, "usuarios/" + user.uid), {
        email: email,
        createdAt: new Date().toISOString()
      });

      // 🔥 Salva UID no localStorage para usar nas próximas telas
      localStorage.setItem("uid", user.uid);

      console.log("Usuário cadastrado:", user.uid);
      alert("Conta criada com sucesso!");

      // Redireciona para a próxima etapa (Localização)
      window.location.assign("/Localização/localizacao.html");

    } catch (error) {
      console.error("Erro:", error.code, error.message);
      alert("Erro ao criar conta: " + error.message);
    }
  });
});
