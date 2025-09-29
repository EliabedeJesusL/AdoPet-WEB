// js/script.js
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// Helpers de evento
function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// Validação simples no lado da implementação
function sanitizePayload(p) {
  const cep = String(p?.cep || "").replace(/\D/g, "");
  const estado = String(p?.estado || "").trim();
  const cidade = String(p?.cidade || "").trim();

  const ok = /^\d{8}$/.test(cep) && estado.length > 0 && cidade.length > 0;
  return ok ? { cep, estado, cidade } : null;
}

// Integração: escuta submit da UI
window.addEventListener("localizacao:submit", async (ev) => {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    emit("localizacao:error", {
      message: "Erro: usuário não identificado. Faça login novamente.",
      redirectTo: "/Entrar/entrar.html",
    });
    return;
  }

  const clean = sanitizePayload(ev?.detail);
  if (!clean) {
    emit("localizacao:error", {
      message: "Dados inválidos. Verifique CEP, estado e cidade.",
    });
    return;
  }

  const data = {
    ...clean,
    updatedAt: Date.now() // número (compatível com regras que comparam com 'now')
  };

  try {
    // Grava diretamente em usuarios/{uid}/localizacao
    await update(ref(db, `usuarios/${uid}/localizacao`), data);
    emit("localizacao:saved", { data });
  } catch (error) {
    console.error("Erro ao salvar localização:", error?.code, error?.message, error);
    emit("localizacao:error", {
      message: error?.code === "PERMISSION_DENIED"
        ? "Sem permissão para salvar. Verifique login e regras do Realtime Database."
        : (error?.message || "Erro ao salvar localização. Tente novamente."),
    });
  }
});