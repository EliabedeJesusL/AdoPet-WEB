import { db, storage } from "JS/firebase-config.js"
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
    authDomain: "adopet-pi.firebaseapp.com",
    projectId: "adopet-pi",
    storageBucket: "adopet-pi.appspot.com",
    messagingSenderId: "797305766384",
    appId: "1:797305766384:web:46beb3e1346878df149d35",
    databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/"
  };
  
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

const STORAGE_KEY = 'adopet_cadastro_animal_step1';
const NEXT_URL = '/Upload Dados do Animal/upload_dados_animal.html';

function getPayloadFromEventOrStorage(ev) {
    if (ev?.detail && ev.detail.nome) return ev.detail;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && parsed.nome) return parsed;
      }
    } catch (err) {
      console.warn('Erro lendo localStorage:', err);
    }
    return null;
  }

  window.addEventListener('animal:submit', async (ev) => {
    const payload = getPayloadFromEventOrStorage(ev);
    if (!payload || !payload.nome || !payload.especie) {
      alert('Dados incompletos. Preencha o formulário antes de avançar.');
      return;
    }
  
    try {
      const uid = localStorage.getItem('uid') || ''; // pode estar vazio se usuário não logado
  
      // caminho: animal_Cadastrado -> push()
      const animaisRef = ref(db, 'animal_Cadastrado');
      const newAnimalRef = push(animaisRef); // gera uma chave única
  
      const dataToSave = {
        especie: payload.especie || '',
        raca: payload.raca || '',
        idade: payload.idade || '',
        nome: payload.nome || '',
        descricao: payload.descricao || '',
        historico: payload.historico || '',
        ownerUid: uid || '',
        createdAt: Date.now()
      };
  
      await set(newAnimalRef, dataToSave);
  
      console.log('Animal salvo com sucesso em:', newAnimalRef.key);
      localStorage.removeItem(STORAGE_KEY);
  
      // redireciona
      window.location.href = NEXT_URL;
  
    } catch (error) {
      console.error('Erro ao salvar animal no Realtime DB:', error);
      alert('Erro ao salvar os dados. Veja o console para detalhes.');
    }
  });