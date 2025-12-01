import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

const featuredInner = document.getElementById('featuredInner');
const orgsInner = document.getElementById('orgsInner');

let isLoggedIn = !!localStorage.getItem('uid');
onAuthStateChanged(auth, (user) => { isLoggedIn = !!user; });

// Intercepta cliques:
// - "Adotar" sem login → alerta + redireciona
// - "Doar" (ONGs) → salva ONG no localStorage antes de navegar
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;

  // Bloqueio de adotar sem login (somente carrossel de animais)
  const guardAnimal = a.dataset.guard === 'animal';
  const isAdoptBtn = a.matches('#featuredInner a.btn.btn-sm.btn-accent');
  if ((guardAnimal || isAdoptBtn) && !isLoggedIn) {
    e.preventDefault();
    alert('Você precisa estar logado para ver os detalhes do animal.');
    window.location.href = '/index.html';
    return;
  }

  // Ao clicar em "Doar" no carrossel de ONGs, grava a ONG selecionada no localStorage
  const isDonateBtn = a.matches('#orgsInner a.btn-doar');
  if (isDonateBtn) {
    try {
      const payload = a.dataset.ong; // JSON com uid, nome, fotoUrl
      const uid = a.dataset.uid;
      if (payload) {
        localStorage.setItem('adopet_instituicao_selecionada', payload);
      } else if (uid) {
        localStorage.setItem('adopet_instituicao_selecionada', JSON.stringify({ uid }));
      }
    } catch {}
  }
});

// Carrega destaques + listas completas para busca (live search)
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([carregarDestaquesAnimais(), carregarDestaquesOngs()]);
  await Promise.all([loadAllAnimals(), loadAllOrgs()]);

  window.ADO = window.ADO || {};
  window.ADO.search = searchLive;
});

/* ===== Carrosséis ===== */
async function carregarDestaquesAnimais() {
  if (!featuredInner) return setLoading(featuredInner, "Carregando destaques...");
  setLoading(featuredInner, "Carregando destaques...");

  try {
    const data = await getFirstExisting(["animal_Cadastrado", "animais"]);
    if (!data) return renderEmpty(featuredInner, "Nenhum destaque no momento.");

    const items = Object.entries(data).map(([id, a]) => ({
      id,
      nome: a?.nome || "Sem nome",
      foto: a?.fotoUrl || a?.imagem || "https://via.placeholder.com/600x400?text=Sem+Imagem",
      especie: normalizeSpecies(a?.especie || a?.tipo || a?.categoria || ""),
      criadoEm: a?.criadoEm || a?.createdAt || "",
      tags: asTags(a?.tags),
    }));

    window.__ANIMALS_FEATURED__ = pickFeatured(items, 9);
    renderSlides(featuredInner, window.__ANIMALS_FEATURED__, renderPetCard);
  } catch (err) {
    console.error("Erro ao carregar destaques:", err);
    renderError(featuredInner, "Erro ao carregar destaques.");
  }
}

async function carregarDestaquesOngs() {
  if (!orgsInner) return setLoading(orgsInner, "Carregando ONGs...");
  setLoading(orgsInner, "Carregando ONGs...");

  try {
    const snap = await get(ref(db, "usuarios"));
    if (!snap.exists()) return renderEmpty(orgsInner, "Nenhuma ONG em destaque no momento.");

    const users = snap.val();
    const list = [];

    Object.entries(users).forEach(([uid, u]) => {
      const cad = u?.cadastro;
      const pj = cad?.PessoaJuridica || cad?.pessoaJuridica || cad?.pessoa_juridica || cad?.juridica;
      if (!pj || typeof pj !== "object") return;

      const instituicao =
        pj.instituicao ||
        pj.razaoSocial || pj.razao_social ||
        pj.nomeFantasia || pj.nome_fantasia || "ONG";

      const foto = pj.fotoUrl || pj.logoUrl || "https://via.placeholder.com/600x400?text=ONG";

      list.push({
        id: uid,
        instituicao: String(instituicao),
        foto: String(foto),
        updatedAt: pj.updatedAt || u.updatedAt || "",
        tags: asTags(pj.tags),
      });
    });

    window.__ORGS_FEATURED__ = pickFeatured(list, 9, "ong");
    renderSlides(orgsInner, window.__ORGS_FEATURED__, renderOngCard);
  } catch (err) {
    console.error("Erro ao carregar ONGs:", err);
    renderError(orgsInner, "Erro ao carregar ONGs.");
  }
}

/* ===== Busca instantânea: listas completas ===== */
let ANIMALS_ALL = [];
let ORGS_ALL = [];

async function loadAllAnimals() {
  const data = await getFirstExisting(["animal_Cadastrado", "animais"]);
  if (!data) { ANIMALS_ALL = []; return; }

  ANIMALS_ALL = Object.entries(data).map(([id, a]) => ({
    id,
    nome: a?.nome || "Sem nome",
    foto: a?.fotoUrl || a?.imagem || "https://via.placeholder.com/600x400?text=Sem+Imagem",
    especie: normalizeSpecies(a?.especie || a?.tipo || a?.categoria || ""),
    nomeNorm: normalizeText(a?.nome || ""),
    especieNorm: normalizeText(normalizeSpecies(a?.especie || a?.tipo || a?.categoria || "")),
  }));
}

async function loadAllOrgs() {
  const snap = await get(ref(db, "usuarios"));
  if (!snap.exists()) { ORGS_ALL = []; return; }
  const users = snap.val();

  ORGS_ALL = [];
  Object.entries(users).forEach(([uid, u]) => {
    const pj = u?.cadastro?.PessoaJuridica || u?.cadastro?.pessoaJuridica || u?.cadastro?.pessoa_juridica || u?.cadastro?.juridica;
    if (!pj) return;

    const instituicao =
      pj.instituicao ||
      pj.razaoSocial || pj.razao_social ||
      pj.nomeFantasia || pj.nome_fantasia || "ONG";

    const foto = pj.fotoUrl || pj.logoUrl || "https://via.placeholder.com/600x400?text=ONG";

    ORGS_ALL.push({
      id: uid,
      instituicao: String(instituicao),
      instituicaoNorm: normalizeText(String(instituicao)),
      foto: String(foto),
    });
  });
}

/* ===== Função de busca exposta ===== */
async function searchLive(qRaw) {
  const q = normalizeText(qRaw || "");
  if (!q) return { animals: [], orgs: [] };

  if (q === "animais" || q === "animal") {
    return { animals: (window.__ANIMALS_FEATURED__ || []).slice(0, 9), orgs: [] };
  }
  if (q === "ongs" || q === "ong") {
    return { animals: [], orgs: (window.__ORGS_FEATURED__ || []).slice(0, 9) };
  }

  const animals = ANIMALS_ALL
    .filter(a =>
      a.nomeNorm.includes(q) ||
      a.especieNorm.includes(q) ||
      matchSpeciesQuery(q, a.especieNorm)
    )
    .slice(0, 6);

  const orgs = ORGS_ALL
    .filter(o => o.instituicaoNorm.includes(q))
    .slice(0, 6);

  return { animals, orgs };
}

/* ===== Helpers ===== */
async function getFirstExisting(paths) {
  for (const p of paths) {
    const snap = await get(ref(db, p));
    if (snap.exists()) return snap.val();
  }
  return null;
}
function setLoading(container, text) {
  container.innerHTML = `
    <div class="carousel-item active">
      <div class="row g-3">
        <div class="col-12">
          <div class="text-center text-muted py-4">
            <div class="spinner-border" role="status" aria-hidden="true"></div>
            <p class="mt-2 mb-0">${escapeHtml(text)}</p>
          </div>
        </div>
      </div>
    </div>`;
}
function renderEmpty(container, text) {
  container.innerHTML = `
    <div class="carousel-item active">
      <div class="row g-3">
        <div class="col-12">
          <div class="text-center text-muted py-4">
            <i class="bi bi-emoji-frown fs-1"></i>
            <p class="mt-2 mb-0">${escapeHtml(text)}</p>
          </div>
        </div>
      </div>
    </div>`;
}
function renderError(container, text) {
  container.innerHTML = `
    <div class="carousel-item active">
      <div class="row g-3">
        <div class="col-12">
          <div class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle fs-1"></i>
            <p class="mt-2 mb-0">${escapeHtml(text)}</p>
          </div>
        </div>
      </div>
    </div>`;
}
function renderSlides(container, list, renderFn) {
  const chunks = [];
  for (let i = 0; i < list.length; i += 3) chunks.push(list.slice(i, i + 3));
  container.innerHTML = chunks.map((chunk, idx) => `
    <div class="carousel-item ${idx === 0 ? 'active' : ''}">
      <div class="row g-3">
        ${chunk.map(renderFn).join('')}
      </div>
    </div>
  `).join('');
}

function renderPetCard(a) {
  const nome = escapeHtml(a.nome);
  const img = escapeAttr(a.foto);
  const href = `/Perfil do Animal/perfil_animal.html?id=${encodeURIComponent(a.id)}`;
  return `
    <div class="col-12 col-md-4">
      <div class="card pet-mini h-100 shadow-sm">
        <img src="${img}" alt="${nome}" loading="lazy">
        <div class="card-body">
          <h3 class="h6 fw-semibold mb-2">${nome}</h3>
          <a class="btn btn-sm btn-accent" href="${href}">Adotar</a>
        </div>
      </div>
    </div>`;
}

// ALTERADO: agora tem botão "Doar" que direciona ao perfil da ONG e grava no localStorage
function renderOngCard(o) {
  const nome = escapeHtml(o.instituicao);
  const img = escapeAttr(o.foto);
  const href = `/Perfil da ONG/perfil_ong.html?uid=${encodeURIComponent(o.id)}`;

  // payload para salvar no localStorage ao clicar
  const payload = escapeAttr(JSON.stringify({
    uid: o.id,
    nome: o.instituicao,
    fotoUrl: o.foto
  }));

  return `
    <div class="col-12 col-md-4">
      <div class="card org-mini h-100 shadow-sm">
        <img src="${img}" alt="${nome}" loading="lazy">
        <div class="card-body">
          <h3 class="h6 fw-semibold mb-2">${nome}</h3>
          <a class="btn btn-sm btn-accent btn-doar"
             href="${href}"
             data-uid="${escapeAttr(o.id)}"
             data-ong="${payload}">Doar</a>
        </div>
      </div>
    </div>`;
}

function asTags(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",").map(s => s.trim());
  return [];
}
function pickFeatured(items, limit = 9, type = "pet") {
  const hasTag = (it) => it.tags.map(t=>String(t).toLowerCase()).some(t => ['destaque','urgente','novo'].includes(t));
  let selected = items.filter(hasTag);
  if (selected.length < 3) {
    const sorted = [...items].sort((a, b) => String(b.criadoEm || b.updatedAt || "").localeCompare(String(a.criadoEm || a.updatedAt || "")));
    selected = [...new Set([...selected, ...sorted])];
  }
  return selected.slice(0, limit);
}

// Normalizações p/ busca
function normalizeText(s) {
  return String(s || "")
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim();
}
function normalizeSpecies(v) {
  const s = normalizeText(v);
  if (/(c[aã]o|cao|cachorro|dog|canino)/.test(s)) return "cao";
  if (/(gato|felino|cat)/.test(s)) return "gato";
  return s || "outro";
}
function matchSpeciesQuery(q, especieNorm) {
  if (/(c[aã]o|cao|cachorro|dog)/.test(q)) return especieNorm.includes("cao");
  if (/(gato|cat|felino)/.test(q)) return especieNorm.includes("gato");
  return false;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }