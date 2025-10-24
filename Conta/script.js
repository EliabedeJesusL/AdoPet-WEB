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

// ----- Endereço -----
const btnEndereco = document.getElementById("btnEndereco");
const conteudoEndereco = document.getElementById("conteudoEndereco");
const cepEl = document.getElementById("cepUser");
const cidadeEl = document.getElementById("cidadeUser");
const estadoEl = document.getElementById("estadoUser");

// ----- Minhas Informações -----
const btnInfo = document.getElementById("btnInfo");
const conteudoInfo = document.getElementById("conteudoInfo");
const pfBlock = document.getElementById("pfBlock");
const pjBlock = document.getElementById("pjBlock");
const pfCampos = document.getElementById("pfCampos");
const pjCampos = document.getElementById("pjCampos");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  // Redirecionar se necessário:
  if (!currentUser) window.location.href = "/Login/login.html";
});

// Utilidades para “Minhas Informações”
const PF_KEYS = ["pessoa_fisica", "pessoaFisica", "PessoaFisica", "fisica", "pf", "pessoa física"];
const PJ_KEYS = ["pessoa_juridica", "pessoaJuridica", "PessoaJuridica", "juridica", "pj", "pessoa jurídica"];

function normalizeKey(k) {
  return String(k).replace(/\s+/g, "").toLowerCase();
}

function findNode(obj, candidates) {
  if (!obj || typeof obj !== "object") return null;
  const keys = Object.keys(obj);
  for (const k of keys) {
    const nk = normalizeKey(k);
    for (const cand of candidates) {
      if (nk === normalizeKey(cand)) return obj[k];
    }
  }
  return null;
}

function humanize(label) {
  const map = {
    cpf: "CPF", cnpj: "CNPJ",
    rg: "RG", ie: "Inscrição Estadual",
    razaosocial: "Razão Social",
    datanascimento: "Data de Nascimento",
  };
  const nk = normalizeKey(label);
  if (map[nk]) return map[nk];
  return label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function renderFields(container, data) {
  if (!container) return;
  if (!data || typeof data !== "object") {
    container.innerHTML = `<p>—</p>`;
    return;
  }
  const lines = [];
  for (const [k, v] of Object.entries(data)) {
    const value =
      v === null || v === undefined ? "—" :
      typeof v === "object" ? JSON.stringify(v) :
      String(v);
    lines.push(`<p><strong>${humanize(k)}:</strong> ${value}</p>`);
  }
  container.innerHTML = lines.join("");
}

// Clique: Minhas Informações
btnInfo?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoInfo) return;
  const isHidden = conteudoInfo.classList.contains("conteudo-oculto");

  if (isHidden) {
    // Estado de carregamento
    if (pfBlock) { pfBlock.classList.remove("d-none"); pfCampos.innerHTML = `<p>Carregando...</p>`; }
    if (pjBlock) { pjBlock.classList.remove("d-none"); pjCampos.innerHTML = `<p>Carregando...</p>`; }

    await carregarInformacoes();
    conteudoInfo.classList.remove("conteudo-oculto");
  } else {
    conteudoInfo.classList.add("conteudo-oculto");
  }
});

async function carregarInformacoes() {
  if (!currentUser) {
    pfBlock?.classList.add("d-none");
    pjBlock?.classList.add("d-none");
    console.warn("Usuário não autenticado.");
    return;
  }

  try {
    const cadRef = ref(db, `usuarios/${currentUser.uid}/cadastro`);
    const snap = await get(cadRef);

    if (!snap.exists()) {
      pfBlock?.classList.add("d-none");
      pjBlock?.classList.add("d-none");
      return;
    }

    const cadastro = snap.val();

    // Tenta localizar PF e PJ (aceita variações de nome de nó)
    let pfNode = findNode(cadastro, PF_KEYS);
    let pjNode = findNode(cadastro, PJ_KEYS);

    // Se existir um nó "dados" dentro, usa ele; senão usa o próprio
    const pfData = pfNode ? (pfNode.dados ?? pfNode) : null;
    const pjData = pjNode ? (pjNode.dados ?? pjNode) : null;

    // Render PF
    if (pfData) {
      pfBlock?.classList.remove("d-none");
      renderFields(pfCampos, pfData);
    } else {
      pfBlock?.classList.add("d-none");
    }

    // Render PJ
    if (pjData) {
      pjBlock?.classList.remove("d-none");
      renderFields(pjCampos, pjData);
    } else {
      pjBlock?.classList.add("d-none");
    }

    // Se nenhum existir, mostra bloco com mensagem
    if (!pfData && !pjData) {
      pfBlock?.classList.remove("d-none");
      pfCampos.innerHTML = `<p>Nenhum cadastro encontrado.</p>`;
      pjBlock?.classList.add("d-none");
    }
  } catch (err) {
    console.error("Erro ao carregar informações:", err);
    if (pfBlock) { pfBlock.classList.remove("d-none"); pfCampos.innerHTML = `<p class="text-danger">Erro ao carregar.</p>`; }
    if (pjBlock) { pjBlock.classList.add("d-none"); }
  }
}

// Clique: Meu Endereço
btnEndereco?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoEndereco) return;
  const isHidden = conteudoEndereco.classList.contains("conteudo-oculto");

  if (isHidden) {
    if (cepEl) cepEl.textContent = "Carregando...";
    if (cidadeEl) cidadeEl.textContent = "Carregando...";
    if (estadoEl) estadoEl.textContent = "Carregando...";
    await carregarEndereco();
    conteudoEndereco.classList.remove("conteudo-oculto");
  } else {
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