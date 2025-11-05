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

// Inicialização Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Guarda o usuário autenticado
let currentUser = null;
let authResolved = false;
const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    if (!authResolved) { authResolved = true; resolve(user); }
  });
});

// ---- DOM Elements ----
const gridInstituicoes = document.getElementById("gridInst");
const btnCarregarInst = document.getElementById("btnCarregarInstituicoes");

// ---- Funções utilitárias ----
function criarCardInst(data) {
  const pj = data?.cadastro?.PessoaJuridica || {};
  const local = data?.localizacao || {};

  // só renderiza se for PJ com nome
  if (!pj.instituicao) return null;

  const div = document.createElement("div");
  div.className = "col";
  div.innerHTML = `
    <div class="inst-card card shadow-sm"
      data-cidade="${local.cidade || ''}"
      data-estado="${local.estado || ''}"
      data-causes="animais"
      data-modalities="${pj.aceitaDoacoes === 'Sim' ? 'doacao' : ''}"
      data-distance="5">
      <img src="${pj.fotoUrl || './assets/img/default.png'}"
           class="card-img-top"
           alt="${pj.instituicao}">
      <div class="card-body">
        <h5 class="card-title">${pj.instituicao}</h5>
        <p class="card-text text-muted mb-1"><strong>Responsável:</strong> ${pj.responsavel || '-'}</p>
        <p class="card-text text-muted mb-1"><strong>Cidade:</strong> ${local.cidade || '-'}</p>
        <p class="card-text text-muted mb-2"><strong>Telefone:</strong> ${pj.telefone || '-'}</p>
        <a href="../Perfil da ONG/perfil_ong.html" class="btn btn-warning w-100 btn-doar" 
           data-instituicao="${pj.instituicao}" 
           data-responsavel="${pj.responsavel || ''}"
           data-telefone="${pj.telefone || ''}"
           data-cidade="${local.cidade || ''}"
           data-estado="${local.estado || ''}"
           data-cnpj="${pj.cnpj || ''}"
           data-email="${pj.email || ''}"
           data-foto-url="${pj.fotoUrl || ''}"
           rel="noopener">Doar</a>
      </div>
    </div>
  `;
  return div;
}

// ---- Carregamento de Instituições ----
async function carregarInstituicoes() {
  if (!gridInstituicoes) return;
  gridInstituicoes.innerHTML = `
    <div class="text-center my-4" id="loadingMsg">
      <div class="spinner-border text-warning" role="status"></div>
      <p class="mt-2 text-muted">Carregando instituições...</p>
    </div>
  `;

  try {
    const refUsers = ref(db, "usuarios");
    const snapshot = await get(refUsers);

    if (!snapshot.exists()) {
      gridInstituicoes.innerHTML = `
        <div class="text-center text-muted my-5">
          <i class="bi bi-exclamation-circle" style="font-size:2rem;"></i>
          <p class="mt-2">Nenhuma instituição encontrada.</p>
        </div>
      `;
      return;
    }

    gridInstituicoes.innerHTML = "";
    let total = 0;

    snapshot.forEach((child) => {
      const data = child.val();
      const pj = data?.cadastro?.PessoaJuridica || null;
      if (!pj) return; // ignora PF
      const card = criarCardInst(data);
      if (card) {
        gridInstituicoes.appendChild(card);
        total++;
      }
    });

    if (total === 0) {
      gridInstituicoes.innerHTML = `
        <div class="text-center text-muted my-5">
          <i class="bi bi-exclamation-circle" style="font-size:2rem;"></i>
          <p class="mt-2">Nenhuma instituição PJ cadastrada ainda.</p>
        </div>
      `;
    }

    // Reaplica filtros (se existir função applyAll)
    if (typeof applyAll === "function") {
      setTimeout(() => applyAll(), 300);
    }

    // Adiciona event listeners para os botões de doação
    adicionarEventListenersDoacao();

  } catch (err) {
    console.error("Erro ao carregar instituições:", err);
    gridInstituicoes.innerHTML = `
      <div class="text-center text-danger my-5">
        <p>Erro ao carregar as instituições.</p>
      </div>
    `;
  }
}

// ---- Botão de carregamento (ou carregamento automático) ----
btnCarregarInst?.addEventListener("click", async (e) => {
  e.preventDefault();
  await authReady;
  await carregarInstituicoes();
});

// Carrega automaticamente ao abrir a página
document.addEventListener("DOMContentLoaded", async () => {
  await authReady;
  await carregarInstituicoes();
});

// === FUNÇÃO PARA ADICIONAR EVENT LISTENERS NOS BOTÕES DE DOAÇÃO ===
function adicionarEventListenersDoacao() {
  const botoesDoar = document.querySelectorAll('.btn-doar');
  
  botoesDoar.forEach(botao => {
    botao.addEventListener('click', (e) => {
      try {
        const instituicao = botao.dataset.instituicao;
        const responsavel = botao.dataset.responsavel;
        const telefone = botao.dataset.telefone;
        const cidade = botao.dataset.cidade;
        
        // Armazena informações da instituição selecionada
        const dadosInstituicao = {
          nome: instituicao,
          responsavel: responsavel,
          telefone: telefone,
          cidade: cidade,
          estado: botao.dataset.estado || '',
          cnpj: botao.dataset.cnpj || '',
          email: botao.dataset.email || '',
          fotoUrl: botao.dataset.fotoUrl || '',
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('adopet_instituicao_selecionada', JSON.stringify(dadosInstituicao));
        
        console.log('Redirecionando para doação:', instituicao);
      } catch (error) {
        console.error('Erro ao processar doação:', error);
      }
    });
  });
}
