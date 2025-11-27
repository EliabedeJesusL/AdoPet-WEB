import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const featuredInner = document.getElementById('featuredInner');
const orgsInner = document.getElementById('orgsInner');

document.addEventListener('DOMContentLoaded', async () => {
  await carregarDestaquesAnimais();
  await carregarDestaquesOngs();
});

/* ===== Animais em destaque ===== */
async function carregarDestaquesAnimais() {
  if (!featuredInner) return;
  setLoading(featuredInner, "Carregando destaques...");

  try {
    const paths = ["animal_Cadastrado", "animais"];
    let data = null;
    for (const p of paths) {
      const snap = await get(ref(db, p));
      if (snap.exists()) { data = snap.val(); break; }
    }

    if (!data) return renderEmpty(featuredInner, "Nenhum destaque no momento.");

    const items = Object.entries(data).map(([id, a]) => ({
      id,
      nome: a?.nome || "Sem nome",
      foto: a?.fotoUrl || a?.imagem || "https://via.placeholder.com/600x400?text=Sem+Imagem",
      criadoEm: a?.criadoEm || a?.createdAt || "",
      tags: asTags(a?.tags),
    }));

    const featured = pickFeatured(items, 9);
    renderSlides(featuredInner, featured, renderPetCard);
  } catch (err) {
    console.error("Erro ao carregar destaques:", err);
    renderError(featuredInner, "Erro ao carregar destaques.");
  }
}

/* ===== ONGs em destaque ===== */
async function carregarDestaquesOngs() {
  if (!orgsInner) return;
  setLoading(orgsInner, "Carregando ONGs...");

  try {
    const snap = await get(ref(db, "usuarios"));
    if (!snap.exists()) return renderEmpty(orgsInner, "Nenhuma ONG em destaque no momento.");

    const users = snap.val();
    const list = [];

    Object.entries(users).forEach(([uid, u]) => {
      const cad = u?.cadastro;
      if (!cad || typeof cad !== "object") return;

      const pj = cad.PessoaJuridica || cad.pessoaJuridica || cad.pessoa_juridica || cad.juridica;
      if (!pj || typeof pj !== "object") return;

      const instituicao =
        pj.instituicao ||
        pj.razaoSocial || pj.razao_social ||
        pj.nomeFantasia || pj.nome_fantasia ||
        "";

      const foto =
        pj.fotoUrl || pj.logoUrl ||
        "https://via.placeholder.com/600x400?text=ONG";

      const item = {
        id: uid,
        instituicao: String(instituicao || "ONG"),
        foto: String(foto),
        updatedAt: pj.updatedAt || u.updatedAt || "",
        tags: asTags(pj.tags),
      };
      list.push(item);
    });

    if (list.length === 0) return renderEmpty(orgsInner, "Nenhuma ONG em destaque no momento.");

    const featured = pickFeatured(list, 9, "ong");
    renderSlides(orgsInner, featured, renderOngCard);
  } catch (err) {
    console.error("Erro ao carregar ONGs:", err);
    renderError(orgsInner, "Erro ao carregar ONGs.");
  }
}

/* ===== Render helpers ===== */
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
  // Agrupa em slides de 3 cards
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

function renderOngCard(o) {
  const nome = escapeHtml(o.instituicao);
  const img = escapeAttr(o.foto);
  // Sem link para detalhes específico (pode apontar para /Explorar?filtro=ong no futuro)
  return `
    <div class="col-12 col-md-4">
      <div class="card org-mini h-100 shadow-sm">
        <img src="${img}" alt="${nome}" loading="lazy">
        <div class="card-body">
          <h3 class="h6 fw-semibold mb-2">${nome}</h3>
          <div class="text-secondary small">Instituição em destaque</div>
        </div>
      </div>
    </div>`;
}

/* ===== Utils ===== */
function asTags(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return val.split(",").map(s => s.trim());
  return [];
}
function pickFeatured(items, limit = 9, type = "pet") {
  // prioriza tags destaque/urgente/novo; fallback: mais recentes
  const hasTag = (it) => it.tags.map(t=>String(t).toLowerCase()).some(t => ['destaque','urgente','novo'].includes(t));
  let selected = items.filter(hasTag);
  if (selected.length < 3) {
    const sorted = [...items].sort((a, b) => String(b.criadoEm || b.updatedAt || "").localeCompare(String(a.criadoEm || a.updatedAt || "")));
    selected = [...new Set([...selected, ...sorted])];
  }
  return selected.slice(0, limit);
}
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }