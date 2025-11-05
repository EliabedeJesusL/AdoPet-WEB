// === SISTEMA DE DOAÇÕES FIREBASE ===
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// === REGISTRAR DOAÇÃO ===
export async function registrarDoacao(dadosDoacao) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const doacao = {
      doador: user.uid,
      instituicao: dadosDoacao.instituicaoId,
      instituicaoNome: dadosDoacao.instituicaoNome,
      valor: parseFloat(dadosDoacao.valor) || 0,
      modalidade: dadosDoacao.modalidade, // pix, cartao, boleto, itens
      categoria: dadosDoacao.categoria || 'geral', // racao, medicamentos, brinquedos, etc
      mensagem: dadosDoacao.mensagem || '',
      status: 'pendente',
      data: new Date().toISOString(),
      dadosContato: {
        nome: dadosDoacao.nomeDoador,
        telefone: dadosDoacao.telefoneDoador,
        email: user.email
      }
    };

    // Salva no Firebase
    const doacoesRef = ref(db, 'doacoes');
    const novaDoacaoRef = push(doacoesRef);
    await set(novaDoacaoRef, doacao);

    console.log('Doação registrada:', novaDoacaoRef.key);
    return { success: true, doacaoId: novaDoacaoRef.key };

  } catch (error) {
    console.error('Erro ao registrar doação:', error);
    return { success: false, error: error.message };
  }
}

// === BUSCAR DOAÇÕES DO USUÁRIO ===
export async function buscarMinhasDoacoes() {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Não autenticado' };

    const doacoesRef = ref(db, 'doacoes');
    const minhasDoacoesQuery = query(doacoesRef, orderByChild('doador'), equalTo(user.uid));
    const snapshot = await get(minhasDoacoesQuery);

    const doacoes = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        doacoes.push({
          id: child.key,
          ...child.val()
        });
      });
    }

    return { success: true, doacoes };
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    return { success: false, error: error.message };
  }
}

// === BUSCAR DOAÇÕES RECEBIDAS (PARA INSTITUIÇÕES) ===
export async function buscarDoacoesRecebidas() {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'Não autenticado' };

    const doacoesRef = ref(db, 'doacoes');
    const doacoesRecebidasQuery = query(doacoesRef, orderByChild('instituicao'), equalTo(user.uid));
    const snapshot = await get(doacoesRecebidasQuery);

    const doacoes = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        doacoes.push({
          id: child.key,
          ...child.val()
        });
      });
    }

    return { success: true, doacoes };
  } catch (error) {
    console.error('Erro ao buscar doações recebidas:', error);
    return { success: false, error: error.message };
  }
}

// === ATUALIZAR STATUS DA DOAÇÃO ===
export async function atualizarStatusDoacao(doacaoId, novoStatus) {
  try {
    const doacaoRef = ref(db, `doacoes/${doacaoId}`);
    await set(doacaoRef.child('status'), novoStatus);
    await set(doacaoRef.child('dataAtualizacao'), new Date().toISOString());
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error: error.message };
  }
}

// === EXEMPLO DE USO ===
/*
// Registrar uma doação
const dadosDoacao = {
  instituicaoId: 'userId123',
  instituicaoNome: 'Instituto Caramelo',
  valor: 50.00,
  modalidade: 'pix',
  categoria: 'racao',
  mensagem: 'Doação para ajudar os animais',
  nomeDoador: 'João Silva',
  telefoneDoador: '(11) 99999-9999'
};

const resultado = await registrarDoacao(dadosDoacao);
if (resultado.success) {
  alert('Doação registrada com sucesso!');
}
*/