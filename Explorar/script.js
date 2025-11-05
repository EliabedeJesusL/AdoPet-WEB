// /Explorar/script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Config do seu projeto
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
const db = getDatabase(app);

const gridPets = document.getElementById("gridPets");

document.addEventListener("DOMContentLoaded", carregarAnimais);

async function carregarAnimais() {
  if (!gridPets) return;

  // Estado de carregamento
  gridPets.innerHTML = `
    <div class="text-center text-muted py-5 w-100">
      <div class="spinner-border" role="status" aria-hidden="true"></div>
      <p class="mt-3 mb-0">Carregando pets...</p>
    </div>`;

  try {
    // Tenta nos caminhos mais usados do projeto
    const paths = ["animal_Cadastrado", "animais"];
    let data = null;

    for (const p of paths) {
      const snap = await get(ref(db, p));
      if (snap.exists()) {
        data = snap.val();
        break;
      }
    }

    // Limpa o grid antes de inserir
    gridPets.innerHTML = "";

    if (!data || Object.keys(data).length === 0) {
      gridPets.innerHTML = `
        <div class="text-center text-muted py-5 w-100">
          <i class="bi bi-emoji-frown fs-1"></i>
          <p class="mt-3">Nenhum animal cadastrado ainda.</p>
        </div>`;
      // Notifica UI para recomputar (sem cards)
      window.dispatchEvent(new CustomEvent("explorar:cardsUpdated"));
      return;
    }

    // Monta cards
    const frag = document.createDocumentFragment();

    Object.entries(data).forEach(([id, a]) => {
      const nome = a?.nome || "Animal sem nome";
      const img = a?.fotoUrl || a?.imagem || "https://via.placeholder.com/400x300?text=Sem+Imagem";
      const especie = normalizeSpecies(a?.especie || a?.tipo || a?.categoria || "");
      const sexo = normalizeSex(a?.sexo || a?.genero || "");
      const porte = normalizeSize(a?.porte || a?.tamanho || "");
      const distancia = Number(a?.distancia || 0);

      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `
        <article class="card pet-card shadow-sm h-100"
          data-species="${especie}" data-sex="${sexo}" data-size="${porte}" data-distance="${distancia}">
          <div class="ratio ratio-4x3">
            <img class="object-fit-cover" src="${escapeAttr(img)}" alt="${escapeAttr(nome)}" loading="lazy" />
          </div>
          <div class="card-body">
            <h5 class="card-title mb-2">${escapeHtml(nome)}</h5>
            <a class="btn-cta" href="/Perfil do Animal/perfil_animal.html?id=${encodeURIComponent(id)}" rel="noopener">Adotar</a>
          </div>
        </article>
      `;
      frag.appendChild(col);
    });

    gridPets.appendChild(frag);

    // Avise a UI para recalcular os filtros com os novos cards
    window.dispatchEvent(new CustomEvent("explorar:cardsUpdated"));

  } catch (error) {
    console.error("Erro ao carregar animais:", error);
    gridPets.innerHTML = `
      <div class="text-center text-danger py-5 w-100">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="mt-3">Erro ao carregar os dados. Tente novamente mais tarde.</p>
      </div>`;
    // Notifica UI mesmo em erro (opcional)
    window.dispatchEvent(new CustomEvent("explorar:cardsUpdated"));
  }
}

/* ===== Normalizações e helpers ===== */
function normalizeSpecies(v) {
  const s = String(v || "").toLowerCase();
  if (/(c[aã]o|cachorro|dog|canino)/.test(s)) return "cao";
  if (/(gato|felino|cat)/.test(s)) return "gato";
  return "outro";
}
function normalizeSex(v) {
  const s = String(v || "").toLowerCase();
  if (/f[eê]mea|feminino/.test(s)) return "femea";
  if (/macho|masculino/.test(s)) return "macho";
  return "indefinido";
}
function normalizeSize(v) {
  const s = String(v || "").toLowerCase();
  if (/peq/.test(s)) return "pequeno";
  if (/m[eé]d/.test(s)) return "medio";
  if (/gran/.test(s)) return "grande";
  return "medio";
}
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }