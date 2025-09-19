// Verificação global: só entra no dashboard se estiver logado
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.firebasestorage.app",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  measurementId: "G-0HP9DHD1ZF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Checa estado do login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // 🔒 Se não tem usuário autenticado → volta para login
    if (window.location.pathname.includes("/Dashboard/")) {
      alert("Você precisa estar logado para acessar o Dashboard!");
      window.location.href = "/index.html";
    }
  }
});

// Função de logout (se quiser usar no dashboard)
export function logout() {
  signOut(auth).then(() => {
    window.location.href = "/index.html";
  });
}
