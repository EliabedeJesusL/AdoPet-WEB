// /Perfil do Animal/script.js
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

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const params = new URLSearchParams(location.search);
  const id = (params.get("id") || "").trim();

  if (!id) return renderError("Pet não encontrado. Volte e selecione um pet novamente.");

  setLoading(true);
  try {
    const pet = await buscarPet(id);
    if (!pet) {
      renderError("Não encontramos esse pet. Ele pode ter sido removido.");
      return;
    }
    preencherTela(pet);
    try {
      localStorage.setItem("adopet_selected_pet_id", id);
      localStorage.setItem("adopet_selected_pet_nome", String(resolveNome(pet) || ""));
    } catch {}
  } catch (e) {
    console.error("Erro ao carregar pet:", e);
    renderError("Erro ao carregar o pet. Tente novamente.");
  } finally {
    setLoading(false);
  }
}

/* =================== Realtime DB =================== */
async function buscarPet(id) {
  // Procura nos caminhos usados no projeto
  const paths = ["animal_Cadastrado", "animais"];
  for (const p of paths) {
    const snap = await get(ref(db, `${p}/${id}`));
    if (snap.exists()) return snap.val() || {};
  }
  return null;
}

/* =================== Renderização =================== */
function preencherTela(a) {
  // Nome
  const nome = resolveNome(a) || "Pet sem nome";
  const titleEl = document.querySelector(".pet-detail h1");
  const article = document.querySelector(".pet-detail");
  if (titleEl) titleEl.textContent = nome;
  if (article) article.dataset.petName = nome;

  // Subtítulo: Espécie • Sexo • Porte • Distância
  const especie = labelEspecie(a.especie || a.tipo);
  const sexo = labelSexo(a.sexo || a.genero);
  const porte = labelPorte(a.porte || a.tamanho);
  const distancia = formatDist(a.distancia);
  const subEl = document.querySelector(".pet-detail .text-secondary.small");
  if (subEl) {
    const parts = [especie, sexo, porte, distancia].filter(Boolean);
    subEl.textContent = parts.join(" • ") || "—";
  }

  // Nome do anunciante (se tiver no próprio pet)
  const anunciante = a.anunciante || a.responsavel || a.donoNome;
  if (anunciante) setAnunciante(anunciante);

  // Galeria
  const fotos = resolveFotos(a);
  renderCarousel(fotos);

  // Detalhes (Descrição, peso, idade, local, vacinas)
  const descricao = resolveDescricao(a) || "—";
  const peso = formatPeso(a.peso ?? a.pesoKg);
  const idade = formatIdade(a);
  const local = resolveLocal(a, distancia);
  const vacinas = resolveVacinas(a);

  renderDetalhes({ descricao, peso, idade, local, vacinas });
}

function setAnunciante(nome) {
  const btn = document.querySelector(".card-header .btn.btn-light.btn-sm.rounded-pill");
  const span = btn?.querySelector("span.fw-semibold.small");
  if (span) span.textContent = String(nome);
}

function renderCarousel(fotos) {
  const carousel = document.getElementById("petCarousel");
  if (!carousel) return;
  const indicators = carousel.querySelector(".carousel-indicators");
  const inner = carousel.querySelector(".carousel-inner");

  // Limpa
  if (indicators) indicators.innerHTML = "";
  if (inner) inner.innerHTML = "";

  // Sem foto -> placeholder
  if (!fotos.length) {
    const item = document.createElement("div");
    item.className = "carousel-item active";
    item.innerHTML = `<img src="https://via.placeholder.com/800x600?text=Sem+imagem" class="d-block w-100 object-fit-cover" alt="Sem imagem">`;
    inner?.appendChild(item);

    const ind = document.createElement("button");
    ind.type = "button";
    ind.setAttribute("data-bs-target", "#petCarousel");
    ind.setAttribute("data-bs-slide-to", "0");
    ind.className = "active";
    indicators?.appendChild(ind);
    return;
  }

  fotos.forEach((url, idx) => {
    const item = document.createElement("div");
    item.className = `carousel-item ${idx === 0 ? "active" : ""}`;
    item.innerHTML = `<img src="${escapeAttr(url)}" class="d-block w-100 object-fit-cover" alt="Foto do pet">`;
    inner?.appendChild(item);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-bs-target", "#petCarousel");
    btn.setAttribute("data-bs-slide-to", String(idx));
    if (idx === 0) btn.className = "active";
    indicators?.appendChild(btn);
  });
}

function renderDetalhes({ descricao, peso, idade, local, vacinas }) {
  // Garante que o collapse exista (se está comentado no HTML, cria aqui)
  let collapse = document.getElementById("detalhesAnimal");
  if (!collapse) {
    const item = document.querySelector('#accDetalhes .accordion-item:first-child');
    if (item) {
      collapse = document.createElement("div");
      collapse.id = "detalhesAnimal";
      collapse.className = "accordion-collapse collapse show";
      collapse.setAttribute("data-bs-parent", "#accDetalhes");
      collapse.innerHTML = `
        <div class="accordion-body px-0">
          <p class="mb-3"></p>
          <ul class="list-unstyled vstack gap-1 mb-0"></ul>
        </div>`;
      item.appendChild(collapse);
    }
  }

  const pDesc = document.querySelector("#detalhesAnimal .accordion-body p.mb-3");
  const ul = document.querySelector("#detalhesAnimal .accordion-body ul");
  if (pDesc) pDesc.textContent = descricao || "—";
  if (!ul) return;

  const rows = [];
  if (peso) rows.push(li("bi-bag", "Peso", peso));
  if (idade) rows.push(li("bi-hourglass-split", "Idade", idade));
  if (local) rows.push(li("bi-geo-alt", "Local", local));
  if (vacinas) rows.push(li("bi-shield-check", "Vacinas", vacinas));
  if (!rows.length) rows.push(`<li><span class="text-secondary">—</span></li>`);

  ul.innerHTML = rows.join("");
}

function li(icon, label, value) {
  return `
    <li>
      <i class="bi ${icon} me-2 text-secondary"></i>
      <span class="text-secondary">${escapeHtml(label)}</span>: ${escapeHtml(value)}
    </li>`;
}

/* =================== Resolvers/Formatters =================== */
function resolveNome(a) {
  return a?.nome || a?.nomeAnimal || a?.titulo || a?.apelido || null;
}
function resolveDescricao(a) {
  return a?.descricao || a?.sobre || a?.bio || a?.observacoes || a?.obs || null;
}
function resolveFotos(a) {
  // Prioridades comuns: fotos (array), galeria (obj), fotoUrl/imagem (string)
  if (Array.isArray(a?.fotos) && a.fotos.length) return a.fotos.filter(Boolean);
  if (a?.galeria && typeof a.galeria === "object") return Object.values(a.galeria).filter(Boolean);
  if (Array.isArray(a?.imagens) && a.imagens.length) return a.imagens.filter(Boolean);
  if (a?.fotoUrl) return [a.fotoUrl];
  if (a?.imagem) return [a.imagem];
  return [];
}
function resolveLocal(a, distLabel) {
  const cidade = a?.cidade || a?.localidade || null;
  const estado = a?.estado || a?.uf || null;
  const base = [cidade, estado].filter(Boolean).join(", ");
  if (distLabel) return base ? `${base} • ${distLabel}` : `Próximo a você (${distLabel})`;
  return base || null;
}
function resolveVacinas(a) {
  if (typeof a?.vacinas === "string" && a.vacinas.trim()) return a.vacinas.trim();
  if (Array.isArray(a?.vacinas) && a.vacinas.length) return a.vacinas.map(String).join(", ");
  if (a?.vacinado === true || a?.vacinas === true) return "Em dia";
  if (a?.vacinado === false || a?.vacinas === false) return "Pendente";
  return null;
}

function labelEspecie(v) {
  const s = String(v || "").toLowerCase();
  if (/(c[aã]o|cachorro|dog|canino)/.test(s)) return "Cão";
  if (/(gato|felino|cat)/.test(s)) return "Gato";
  return s ? capitalize(s) : "—";
}
function labelSexo(v) {
  const s = String(v || "").toLowerCase();
  if (/f[eê]mea|feminino/.test(s)) return "Fêmea";
  if (/macho|masculino/.test(s)) return "Macho";
  return "—";
}
function labelPorte(v) {
  const s = String(v || "").toLowerCase();
  if (/peq/.test(s)) return "Pequeno";
  if (/m[eé]d/.test(s)) return "Médio";
  if (/gran/.test(s)) return "Grande";
  return "—";
}
function formatPeso(v) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  if (!isNaN(n) && n > 0) return `${n} kg`;
  return String(v);
}
function formatIdade(a) {
  // Aceita 'idade' como string pronta ou anos/meses separados
  if (typeof a?.idade === "string" && a.idade.trim()) return a.idade.trim();
  const anos = Number(a?.idadeAnos ?? a?.anos);
  const meses = Number(a?.idadeMeses ?? a?.meses);
  if (!isNaN(anos) && anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}`;
  if (!isNaN(meses) && meses > 0) return `${meses} mês${meses > 1 ? "es" : ""}`;
  return null;
}
function formatDist(v) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  if (!isNaN(n) && n >= 0) return `${n} km`;
  return String(v);
}

/* =================== UI helpers =================== */
function setLoading(loading) {
  const inner = document.querySelector("#petCarousel .carousel-inner");
  if (!inner) return;
  if (loading) {
    inner.innerHTML = `
      <div class="d-flex align-items-center justify-content-center w-100 h-100 bg-light">
        <div class="text-center text-secondary">
          <div class="spinner-border mb-2" role="status" aria-hidden="true"></div>
          <div>Carregando...</div>
        </div>
      </div>`;
  }
}
function renderError(message) {
  const mainCard = document.querySelector(".pet-detail");
  if (!mainCard) return alert(message);
  const body = mainCard.querySelector(".card-body");
  const carouselInner = document.querySelector("#petCarousel .carousel-inner");
  if (carouselInner) {
    carouselInner.innerHTML = `
      <div class="d-flex align-items-center justify-content-center w-100 h-100 bg-light">
        <div class="text-center text-secondary">
          <i class="bi bi-exclamation-triangle fs-1"></i>
          <div class="mt-2">${escapeHtml(message)}</div>
        </div>
      </div>`;
  }
  if (body) {
    const h1 = body.querySelector("h1");
    const sub = body.querySelector(".text-secondary.small");
    if (h1) h1.textContent = "Pet não encontrado";
    if (sub) sub.textContent = "—";
  }
}
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
function capitalize(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }