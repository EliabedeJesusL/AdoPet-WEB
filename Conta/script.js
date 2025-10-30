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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Seleciona nome e e-mail do topo sem alterar HTML
function getHeaderEls() {
  const root = document.querySelector(".profile-card .card-body .flex-grow-1");
  const nameEl = root?.querySelector("h2.h6.fw-normal");
  const emailEl = root?.querySelector(".text-secondary.small");
  return { nameEl, emailEl };
}
const { nameEl: userNameEl, emailEl: userEmailEl } = getHeaderEls();

// ----- Elementos de avatar (topo) -----
const avatarBox = document.querySelector(".profile-card .profile-avatar");
const avatarIcon = avatarBox?.querySelector("i");

// Utilidades PF/PJ
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

// Estado do auth e cache de perfil
let currentUser = null;
let authResolved = false;
let lastUserProfile = null;

const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;

    // Email do Auth (ou fallback)
    if (userEmailEl) userEmailEl.textContent = user?.email || "—";

    // Preenche nome e foto do topo
    await preencherNomeDoUsuario();
    await preencherFotoPerfil();

    if (!authResolved) { authResolved = true; resolve(user); }
  });
});

// Nome no cabeçalho (prioriza ONG: pessoaJuridica.instituicao)
async function preencherNomeDoUsuario() {
  try {
    let nome = null;

    if (!currentUser) {
      if (userNameEl) userNameEl.textContent = "Usuário";
      return;
    }

    const snap = await get(ref(db, `usuarios/${currentUser.uid}`));
    const u = snap.exists() ? snap.val() : null;
    lastUserProfile = u;

    const cadastro = u?.cadastro;
    const pfNode = cadastro ? findNode(cadastro, PF_KEYS) : null;
    const pjNode = cadastro ? findNode(cadastro, PJ_KEYS) : null;
    const pfData = pfNode ? (pfNode.dados ?? pfNode) : null;
    const pjData = pjNode ? (pjNode.dados ?? pjNode) : null;

    // 1) Prioridade para ONG: instituicao
    if (pjData?.instituicao) nome = String(pjData.instituicao);

    // 2) Nome direto salvo no usuário
    if (!nome && u?.nome) nome = String(u.nome);

    // 3) PF
    if (!nome && pfData) {
      nome = String(pfData.nome || pfData.nomeCompleto || pfData.nome_completo || "");
    }

    // 4) PJ (outras chaves comuns)
    if (!nome && pjData) {
      nome = String(pjData.razaoSocial || pjData.razao_social || pjData.nomeFantasia || pjData.nome_fantasia || "");
    }

    // 5) Fallback Auth
    if (!nome && currentUser.displayName) nome = currentUser.displayName;

    if (userNameEl) userNameEl.textContent = nome || "Usuário";
  } catch (e) {
    console.warn("Não foi possível carregar o nome do usuário:", e);
    if (userNameEl) userNameEl.textContent = "Usuário";
  }
}

// Define a foto no avatar do topo (prioriza PJ.fotoUrl; senão PF.fotoUrl)
async function preencherFotoPerfil() {
  try {
    if (!currentUser || !avatarBox) return;

    let u = lastUserProfile;
    if (!u) {
      const snap = await get(ref(db, `usuarios/${currentUser.uid}`));
      u = snap.exists() ? snap.val() : null;
      lastUserProfile = u;
    }
    if (!u) return;

    const cadastro = u?.cadastro;
    const pfNode = cadastro ? findNode(cadastro, PF_KEYS) : null;
    const pjNode = cadastro ? findNode(cadastro, PJ_KEYS) : null;
    const pfData = pfNode ? (pfNode.dados ?? pfNode) : null;
    const pjData = pjNode ? (pjNode.dados ?? pjNode) : null;

    // Foto: prioriza PJ.fotoUrl; depois PF.fotoUrl; também aceita 'logoUrl' legado só para exibir
    const foto = pjData?.fotoUrl || pfData?.fotoUrl || pjData?.logoUrl || null;

    setAvatarPhoto(foto);
  } catch (e) {
    console.warn("Não foi possível carregar a foto do perfil:", e);
  }
}

function setAvatarPhoto(url) {
  if (!avatarBox) return;
  // Remove img anterior se existir
  const oldImg = avatarBox.querySelector("img.__avatar");
  if (oldImg) oldImg.remove();

  if (url && typeof url === "string") {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Foto de perfil";
    img.className = "__avatar";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    avatarBox.appendChild(img);
    if (avatarIcon) avatarIcon.style.display = "none";
  } else {
    if (avatarIcon) avatarIcon.style.display = "";
  }
}

// ----- Meus Animais -----
const btnMeusAnimais = document.getElementById("btnMeusAnimais");
const conteudoAnimais = document.getElementById("conteudoAnimais");
const animaisConteudo = document.getElementById("animaisConteudo");

btnMeusAnimais?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!conteudoAnimais || !animaisConteudo) return;

  const isHidden = conteudoAnimais.classList.contains("conteudo-oculto");
  if (isHidden) {
    animaisConteudo.innerHTML = `<p class="text-muted mb-0">Carregando...</p>`;
    await authReady;
    await carregarMeusAnimais();
    conteudoAnimais.classList.remove("conteudo-oculto");
  } else {
    conteudoAnimais.classList.add("conteudo-oculto");
  }
});

async function carregarMeusAnimais() {
  if (!currentUser) { animaisConteudo.innerHTML = `<p class="text-danger mb-0">Usuário não autenticado.</p>`; return; }
  const uid = currentUser.uid;

  const ROOTS = ["animal_Cadastrado"];
  const DONO_PATHS = ["donoUid", "DonoUid", "ownerUid", "uidDono", "dados/donoUid", "dados/DonoUid"];

  let itens = [];
  try {
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
        } catch { /* ignora path sem índice */ }
      }
    }

    if (itens.length > 0) {
      const seen = new Set();
      itens = itens.filter(a => !seen.has(a.id) && (seen.add(a.id), true));
    }

    if (itens.length === 0) {
      for (const root of ROOTS) {
        const listRef = ref(db, root);
        const listSnap = await get(listRef);
        if (listSnap.exists()) {
          listSnap.forEach(child => {
            const id = child.key;
            const data = child.val() || {};
            if (data?.donoUid === uid) itens.push({ id, ...data });
          });
        }
      }
    }

    if (itens.length === 0) {
      animaisConteudo.innerHTML = `<p class="mb-0">Você ainda não cadastrou animais para adoção.</p>`;
      return;
    }

    animaisConteudo.innerHTML = renderAnimaisLista(itens);
  } catch (err) {
    console.error("Meus Animais:", err);
    animaisConteudo.innerHTML = `<p class="text-danger mb-0">Erro ao carregar seus animais.</p>`;
  }
}

function renderAnimaisLista(animais) {
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

// ----- Minhas Informações -----
const btnInfo = document.getElementById("btnInfo");
const conteudoInfo = document.getElementById("conteudoInfo");
const pfBlock = document.getElementById("pfBlock");
const pjBlock = document.getElementById("pjBlock");
const pfCampos = document.getElementById("pfCampos");
const pjCampos = document.getElementById("pjCampos");

// renderiza campos, mostrando imagem nos campos de fotoUrl/logoUrl
function renderFields(container, data) {
  if (!container) return;
  if (!data || typeof data !== "object") {
    container.innerHTML = `<p>—</p>`;
    return;
  }

  const rows = [];
  for (const [k, v] of Object.entries(data)) {
    const nk = normalizeKey(k);

    // Se for foto, renderiza a imagem
    if ((nk === "fotourl" || nk === "logourl") && typeof v === "string" && v) {
      rows.push(`
        <div class="mb-2">
          <strong>${nk === "logourl" ? "Logo" : "Foto"}:</strong><br>
          <img src="${v}" alt="Imagem" style="max-width:160px; max-height:160px; width:auto; height:auto; object-fit:cover; border-radius:8px; border:1px solid #e5e6e8;">
        </div>
      `);
      continue; // não imprime o URL como texto
    }

    // Valor padrão
    const value =
      v == null ? "—" :
      typeof v === "object" ? JSON.stringify(v) :
      String(v);

    rows.push(`<p><strong>${humanize(k)}:</strong> ${value}</p>`);
  }
  container.innerHTML = rows.join("");
}

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
    // Usa o cache se já existir; senão busca
    let u = lastUserProfile;
    if (!u) {
      const snap = await get(ref(db, `usuarios/${currentUser.uid}/cadastro`));
      if (!snap.exists()) { pfBlock?.classList.add("d-none"); pjBlock?.classList.add("d-none"); return; }
      u = { cadastro: snap.val() };
    }

    const cadastro = u?.cadastro;
    if (!cadastro) { pfBlock?.classList.add("d-none"); pjBlock?.classList.add("d-none"); return; }

    const pfNode = findNode(cadastro, PF_KEYS);
    const pjNode = findNode(cadastro, PJ_KEYS);
    const pfData = pfNode ? (pfNode.dados ?? pfNode) : null;
    const pjData = pjNode ? (pjNode.dados ?? pjNode) : null;

    if (pfData) { pfBlock?.classList.remove("d-none"); renderFields(pfCampos, pfData); } else { pfBlock?.classList.add("d-none"); }
    if (pjData) { pjBlock?.classList.remove("d-none"); renderFields(pjCampos, pjData); } else { pjBlock?.classList.add("d-none"); }

    if (!pfData && !pjData) {
      pfBlock?.classList.remove("d-none");
      pfCampos.innerHTML = `<p>Nenhum cadastro encontrado.</p>`;
      pjBlock?.classList.add("d-none");
    }
  } catch (err) {
    console.error("Info:", err);
    if (pfBlock) { pfBlock.classList.remove("d-none"); pfCampos.innerHTML = `<p class="text-danger">Erro ao carregar.</p>`; }
    pjBlock?.classList.add("d-none");
  }
}

// ----- Endereço -----
const btnEndereco = document.getElementById("btnEndereco");
const conteudoEndereco = document.getElementById("conteudoEndereco");
const cepEl = document.getElementById("cepUser");
const cidadeEl = document.getElementById("cidadeUser");
const estadoEl = document.getElementById("estadoUser");

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

// ----- Sobre -----
const btnSobre = document.getElementById("btnSobre");
const conteudoSobre = document.getElementById("conteudoSobre");

btnSobre?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!conteudoSobre) return;
  const isHidden = conteudoSobre.classList.contains("conteudo-oculto");
  if (isHidden) {
    conteudoSobre.classList.remove("conteudo-oculto");
  } else {
    conteudoSobre.classList.add("conteudo-oculto");
  }
});