// js/script.js
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.firebasestorage.app",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  measurementId: "G-0HP9DHD1ZF",
  databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Helpers de evento
function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// Validação simples
function sanitizePayload(p) {
  const cep = String(p?.cep || "").replace(/\D/g, "");
  const estado = String(p?.estado || "").trim();
  const cidade = String(p?.cidade || "").trim();

  const ok = /^\d{8}$/.test(cep) && estado.length > 0 && cidade.length > 0;
  return ok ? { cep, estado, cidade } : null;
}

// Aguarda autenticação
onAuthStateChanged(auth, (user) => {
  if (!user) {
    emit("localizacao:error", {
      message: "Usuário não autenticado. Faça login novamente.",
      redirectTo: "/Login/login.html",
    });
    return;
  }

  // Escuta submit da UI
  window.addEventListener("localizacao:submit", async (ev) => {
    const clean = sanitizePayload(ev?.detail);
    if (!clean) {
      emit("localizacao:error", {
        message: "Dados inválidos. Verifique CEP, estado e cidade.",
      });
      return;
    }

    const data = {
      ...clean,
      updatedAt: Date.now()
    };

    try {
      // Grava em usuarios/{uid}/localizacao
      await update(ref(db, `usuarios/${user.uid}/localizacao`), data);
      emit("localizacao:saved", { data });
    } catch (error) {
      console.error("Erro ao salvar localização:", error);
      emit("localizacao:error", {
        message: error?.message || "Erro ao salvar localização. Tente novamente.",
      });
    }
  });
});
