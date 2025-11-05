// === INTEGRAÇÃO AVANÇADA FIREBASE - PÁGINA DOE ===
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// === CARREGAMENTO EM TEMPO REAL ===
export function configurarCarregamentoTempoReal() {
  const usuariosRef = ref(db, 'usuarios');
  
  // Escuta mudanças em tempo real
  onValue(usuariosRef, (snapshot) => {
    console.log('Dados atualizados em tempo real');
    atualizarGridInstituicoes(snapshot);
  });
}

// === FILTROS AVANÇADOS COM FIREBASE ===
export async function buscarInstituicoesFiltradas(filtros) {
  try {
    const usuariosRef = ref(db, 'usuarios');
    const snapshot = await get(usuariosRef);
    
    if (!snapshot.exists()) return [];
    
    const instituicoesFiltradas = [];
    
    snapshot.forEach((child) => {
      const data = child.val();
      const pj = data?.cadastro?.PessoaJuridica;
      
      if (!pj || !pj.instituicao) return;
      
      // Aplicar filtros
      let passaFiltros = true;
      
      // Filtro por causas
      if (filtros.causes?.length > 0) {
        const causasInstituicao = pj.causasAtendidas || [];
        passaFiltros = passaFiltros && filtros.causes.some(causa => 
          causasInstituicao.includes(causa)
        );
      }
      
      // Filtro por modalidades de doação
      if (filtros.modalities?.length > 0) {
        const modalidadesInstituicao = pj.modalidadesDoacao || [];
        passaFiltros = passaFiltros && filtros.modalities.some(mod => 
          modalidadesInstituicao.includes(mod)
        );
      }
      
      // Filtro por aceita doações
      if (pj.aceitaDoacoes !== 'Sim') {
        passaFiltros = false;
      }
      
      // Filtro por distância
      if (filtros.distance) {
        const distanciaInstituicao = data?.localizacao?.distanciaBase || 999;
        passaFiltros = passaFiltros && distanciaInstituicao <= filtros.distance;
      }
      
      // Filtro por texto (busca)
      if (filtros.searchText) {
        const texto = filtros.searchText.toLowerCase();
        const nomeInstituicao = pj.instituicao.toLowerCase();
        const cidade = data?.localizacao?.cidade?.toLowerCase() || '';
        passaFiltros = passaFiltros && (
          nomeInstituicao.includes(texto) || cidade.includes(texto)
        );
      }
      
      if (passaFiltros) {
        instituicoesFiltradas.push({
          id: child.key,
          ...data
        });
      }
    });
    
    return instituicoesFiltradas;
    
  } catch (error) {
    console.error('Erro ao filtrar instituições:', error);
    return [];
  }
}

// === ESTATÍSTICAS DAS INSTITUIÇÕES ===
export async function obterEstatisticasInstituicao(instituicaoId) {
  try {
    // Buscar total de doações recebidas
    const doacoesRef = ref(db, 'doacoes');
    const snapshot = await get(doacoesRef);
    
    let totalDoacoes = 0;
    let valorTotal = 0;
    let doadoresUnicos = new Set();
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const doacao = child.val();
        if (doacao.instituicao === instituicaoId && doacao.status === 'confirmada') {
          totalDoacoes++;
          valorTotal += doacao.valor || 0;
          doadoresUnicos.add(doacao.doador);
        }
      });
    }
    
    return {
      totalDoacoes,
      valorTotal,
      totalDoadores: doadoresUnicos.size
    };
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return { totalDoacoes: 0, valorTotal: 0, totalDoadores: 0 };
  }
}

// === SISTEMA DE FAVORITOS ===
export async function toggleFavorito(instituicaoId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const favoritosRef = ref(db, `usuarios/${user.uid}/favoritos/${instituicaoId}`);
    const snapshot = await get(favoritosRef);
    
    if (snapshot.exists()) {
      // Remove dos favoritos
      await set(favoritosRef, null);
      return { isFavorito: false };
    } else {
      // Adiciona aos favoritos
      await set(favoritosRef, {
        dataAdicionado: new Date().toISOString()
      });
      return { isFavorito: true };
    }
    
  } catch (error) {
    console.error('Erro ao gerenciar favorito:', error);
    return { error: error.message };
  }
}

// === NOTIFICAÇÕES PUSH (Web Push) ===
export function configurarNotificacoesPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado:', registration);
        // Configurar push notifications aqui
      })
      .catch(error => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  }
}

// === EXEMPLO DE USO INTEGRADO ===
/*
// Configurar carregamento em tempo real
configurarCarregamentoTempoReal();

// Buscar com filtros avançados
const filtros = {
  causes: ['cao', 'gato'],
  modalities: ['pix'],
  distance: 50,
  searchText: 'instituto'
};

const instituicoes = await buscarInstituicoesFiltradas(filtros);

// Obter estatísticas
const stats = await obterEstatisticasInstituicao('userId123');
console.log(`Total arrecadado: R$ ${stats.valorTotal}`);
*/