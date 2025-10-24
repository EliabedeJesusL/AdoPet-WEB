import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elementos
const btnEndereco = document.getElementById("btnEndereco");
const conteudoEndereco = document.getElementById("conteudoEndereco");
const cepEl = document.getElementById("cepUser");
const cidadeEl = document.getElementById("cidadeUser");
const estadoEl = document.getElementById("estadoUser");

// Guarda usuário atual
let currentUser = null;

// Habilita o botão quando soubermos o usuário
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  // se quiser redirecionar sem login, descomente:
  // if (!currentUser) window.location.href = "/Login/login.html";
});

// Click no "Meu Endereço"
btnEndereco?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoEndereco) return;

  const isHidden = conteudoEndereco.classList.contains("conteudo-oculto");

  if (isHidden) {
    // Mostrar e carregar
    // Mostra estado de carregamento nos spans
    if (cepEl) cepEl.textContent = "Carregando...";
    if (cidadeEl) cidadeEl.textContent = "Carregando...";
    if (estadoEl) estadoEl.textContent = "Carregando...";

    await carregarEndereco();
    conteudoEndereco.classList.remove("conteudo-oculto");
  } else {
    // Oculta
    conteudoEndereco.classList.add("conteudo-oculto");
  }
});

async function carregarEndereco() {
  if (!currentUser) {
    if (cepEl) cepEl.textContent = "—";
    if (cidadeEl) cidadeEl.textContent = "—";
    if (estadoEl) estadoEl.textContent = "—";
    console.warn("Usuário não autenticado.");
    return;
  }

  try {
    const refUser = ref(db, `usuarios/${currentUser.uid}/localizacao`);
    const snapshot = await get(refUser);

    if (snapshot.exists()) {
      const dados = snapshot.val();
      if (cepEl) cepEl.textContent = dados.cep || "Não informado";
      if (cidadeEl) cidadeEl.textContent = dados.cidade || "Não informado";
      if (estadoEl) estadoEl.textContent = dados.estado || "Não informado";
    } else {
      if (cepEl) cepEl.textContent = "—";
      if (cidadeEl) cidadeEl.textContent = "—";
      if (estadoEl) estadoEl.textContent = "—";
      console.info("Nenhum endereço cadastrado.");
    }
  } catch (err) {
    console.error("Erro ao carregar endereço:", err);
    if (cepEl) cepEl.textContent = "Erro";
    if (cidadeEl) cidadeEl.textContent = "Erro";
    if (estadoEl) estadoEl.textContent = "Erro";
  }
}