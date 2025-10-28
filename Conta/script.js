import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// ----- Meus Animais -----
const btnMeusAnimais = document.getElementById("btnMeusAnimais");
const conteudoAnimais = document.getElementById("conteudoAnimais");
const animaisConteudo = document.getElementById("animaisConteudo");

// ----- Minhas Informações -----
const btnInfo = document.getElementById("btnInfo");
const conteudoInfo = document.getElementById("conteudoInfo");
const pfBlock = document.getElementById("pfBlock");
const pjBlock = document.getElementById("pjBlock");
const pfCampos = document.getElementById("pfCampos");
const pjCampos = document.getElementById("pjCampos");

// ----- Endereço -----
const btnEndereco = document.getElementById("btnEndereco");
const conteudoEndereco = document.getElementById("conteudoEndereco");
const cepEl = document.getElementById("cepUser");
const cidadeEl = document.getElementById("cidadeUser");
const estadoEl = document.getElementById("estadoUser");

// Guarda usuário e garante readiness do Auth
let currentUser = null;
let authResolved = false;
const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    if (!authResolved) { authResolved = true; resolve(user); }
  });
});

// Utilidades (Minhas Informações)
const PF_KEYS = ["pessoa_fisica", "pessoaFisica", "PessoaFisica", "fisica", "pf", "pessoafisica", "pessoa física"];
const PJ_KEYS = ["pessoa_juridica", "pessoaJuridica", "PessoaJuridica", "juridica", "pj", "pessoajuridica", "pessoa jurídica"];

function normalizeKey(k) { return String(k).replace(/\s+/g, "").toLowerCase(); }
function findNode(obj, candidates) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of Object.keys(obj)) {
    const nk = normalizeKey(k);
    if (candidates.some(c => normalizeKey(c) === nk)) return obj[k];
  }
  return null;
}
function humanize(label) {
  const map = { cpf: "CPF", cnpj: "CNPJ", rg: "RG", ie: "Inscrição Estadual", razaosocial: "Razão Social", datanascimento: "Data de Nascimento" };
  const nk = normalizeKey(label);
  if (map[nk]) return map[nk];
  return label.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").replace(/^./, c => c.toUpperCase());
}
function renderFields(container, data) {
  if (!container) return;
  if (!data || typeof data !== "object") { container.innerHTML = `<p>—</p>`; return; }
  const lines = [];
  for (const [k, v] of Object.entries(data)) {
    const value = v == null ? "—" : (typeof v === "object" ? JSON.stringify(v) : String(v));
    lines.push(`<p><strong>${humanize(k)}:</strong> ${value}</p>`);
  }
  container.innerHTML = lines.join("");
}

// Meus Animais
btnMeusAnimais?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoAnimais || !animaisConteudo) return;

  const isHidden = conteudoAnimais.classList.contains("conteudo-oculto");
  if (isHidden) {
    animaisConteudo.innerHTML = `<p class="text-muted mb-0">Carregando...</p>`;
    await authReady; // garante user pronto
    await carregarMeusAnimais();
    conteudoAnimais.classList.remove("conteudo-oculto");
  } else {
    conteudoAnimais.classList.add("conteudo-oculto");
  }
});

async function carregarMeusAnimais() {
  if (!currentUser) { animaisConteudo.innerHTML = `<p class="text-danger mb-0">Usuário não autenticado.</p>`; return; }
  const uid = currentUser.uid;

  // Raiz da coleção de animais
  const ROOTS = ["animal_Cadastrado"];

  // Possíveis caminhos para o campo donoUid (variações e aninhado)
  const DONO_PATHS = [
    "donoUid",
    "DonoUid",
    "ownerUid",
    "uidDono",
    "dados/donoUid",
    "dados/DonoUid",
  ];

  let itens = [];

  try {
    // 1) Tenta consultas com orderByChild + equalTo para cada caminho possível
    for (const root of ROOTS) {
      const rootRef = ref(db, root);
      for (const path of DONO_PATHS) {
        try {
          const q = query(rootRef, orderByChild(path), equalTo(uid));
          const snap = await get(q);
          if (snap.exists()) {
            snap.forEach(child => {
              const id = child.key;
              const data = child.val() || {};
              itens.push({ id, ...data });
            });
          }
        } catch {
          // Se o path não existir como índice, só ignora e tenta o próximo
        }
      }
    }

    // Remove duplicados (caso o mesmo item apareça em mais de uma consulta)
    if (itens.length > 0) {
      const seen = new Set();
      itens = itens.filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
    }

    // 2) Fallback: se nada encontrado via query, carrega a lista e filtra no cliente
    if (itens.length === 0) {
      for (const root of ROOTS) {
        const listRef = ref(db, root);
        const listSnap = await get(listRef);
        if (listSnap.exists()) {
          listSnap.forEach(child => {
            const id = child.key;
            const data = child.val() || {};
            const dono = data?.donoUid;
            if (dono === uid) {
              itens.push({ id, ...data });
            }
          });
        }
      }
    }

    if (itens.length === 0) {
      animaisConteudo.innerHTML = `<p class="mb-0">Você ainda não cadastrou animais para adoção.</p>`;
      return;
    }

    // Renderiza lista
    animaisConteudo.innerHTML = renderAnimaisLista(itens);
  } catch (err) {
    console.error("Meus Animais:", err);
    animaisConteudo.innerHTML = `<p class="text-danger mb-0">Erro ao carregar seus animais.</p>`;
  }
}

function renderAnimaisLista(animais) {
  // Ordena opcionalmente por criadoEm (mais recente primeiro, se for ISO)
  animais.sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));

  const items = animais.map(a => {
    const nome = a.nome || "(Sem nome)";
    const especie = a.especie || "";
    const raca = a.raca || "";
    const idade = a.idade || "";
    const status = a.disponivel === false ? "Indisponível" : "Disponível";
    const foto = a.fotoUrl || "";

    return `
      <li class="list-group-item d-flex gap-3 align-items-start">
        ${foto ? `<img src="${foto}" alt="Foto de ${nome}" class="rounded" style="width:64px;height:64px;object-fit:cover;">`
               : `<div class="rounded bg-body-secondary d-flex align-items-center justify-content-center" style="width:64px;height:64px;"><i class="bi bi-image text-secondary"></i></div>`}
        <div class="flex-grow-1">
          <div class="fw-semibold">${nome}</div>
          <div class="text-secondary small">
            ${[especie, raca, idade].filter(Boolean).join(" • ")}
          </div>
          <span class="badge ${status === "Disponível" ? "bg-success" : "bg-secondary"} mt-1">${status}</span>
        </div>
        <div class="text-secondary small">#${a.id || ""}</div>
      </li>
    `;
  }).join("");

  return `<ul class="list-group">${items}</ul>`;
}

// Minhas Informações
btnInfo?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoInfo) return;
  const isHidden = conteudoInfo.classList.contains("conteudo-oculto");
  if (isHidden) {
    if (pfBlock) { pfBlock.classList.remove("d-none"); pfCampos.innerHTML = `<p>Carregando...</p>`; }
    if (pjBlock) { pjBlock.classList.remove("d-none"); pjCampos.innerHTML = `<p>Carregando...</p>`; }
    await carregarInformacoes();
    conteudoInfo.classList.remove("conteudo-oculto");
  } else {
    conteudoInfo.classList.add("conteudo-oculto");
  }
});

async function carregarInformacoes() {
  if (!currentUser) { pfBlock?.classList.add("d-none"); pjBlock?.classList.add("d-none"); return; }
  try {
    const cadRef = ref(db, `usuarios/${currentUser.uid}/cadastro`);
    const snap = await get(cadRef);
    if (!snap.exists()) { pfBlock?.classList.add("d-none"); pjBlock?.classList.add("d-none"); return; }
    const cadastro = snap.val();
    const pfNode = findNode(cadastro, PF_KEYS);
    const pjNode = findNode(cadastro, PJ_KEYS);
    const pfData = pfNode ? (pfNode.dados ?? pfNode) : null;
    const pjData = pjNode ? (pjNode.dados ?? pjNode) : null;
    if (pfData) { pfBlock?.classList.remove("d-none"); renderFields(pfCampos, pfData); } else { pfBlock?.classList.add("d-none"); }
    if (pjData) { pjBlock?.classList.remove("d-none"); renderFields(pjCampos, pjData); } else { pjBlock?.classList.add("d-none"); }
    if (!pfData && !pjData) { pfBlock?.classList.remove("d-none"); pfCampos.innerHTML = `<p>Nenhum cadastro encontrado.</p>`; pjBlock?.classList.add("d-none"); }
  } catch (err) {
    console.error("Info:", err);
    if (pfBlock) { pfBlock.classList.remove("d-none"); pfCampos.innerHTML = `<p class="text-danger">Erro ao carregar.</p>`; }
    pjBlock?.classList.add("d-none");
  }
}

// Endereço
btnEndereco?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoEndereco) return;
  const isHidden = conteudoEndereco.classList.contains("conteudo-oculto");
  if (isHidden) {
    if (cepEl) cepEl.textContent = "Carregando...";
    if (cidadeEl) cidadeEl.textContent = "Carregando...";
    if (estadoEl) estadoEl.textContent = "Carregando...";
    await authReady;
    await carregarEndereco();
    conteudoEndereco.classList.remove("conteudo-oculto");
  } else {
    conteudoEndereco.classList.add("conteudo-oculto");
  }
});

async function carregarEndereco() {
  if (!currentUser) { if (cepEl) cepEl.textContent = "—"; if (cidadeEl) cidadeEl.textContent = "—"; if (estadoEl) estadoEl.textContent = "—"; return; }
  try {
    const refUser = ref(db, `usuarios/${currentUser.uid}/localizacao`);
    const snapshot = await get(refUser);
    if (snapshot.exists()) {
      const d = snapshot.val();
      if (cepEl) cepEl.textContent = d.cep || "Não informado";
      if (cidadeEl) cidadeEl.textContent = d.cidade || "Não informado";
      if (estadoEl) estadoEl.textContent = d.estado || "Não informado";
    } else {
      if (cepEl) cepEl.textContent = "—"; if (cidadeEl) cidadeEl.textContent = "—"; if (estadoEl) estadoEl.textContent = "—";
    }
  } catch (err) {
    console.error("Endereco:", err);
    if (cepEl) cepEl.textContent = "Erro"; if (cidadeEl) cidadeEl.textContent = "Erro"; if (estadoEl) estadoEl.textContent = "Erro";
  }
}