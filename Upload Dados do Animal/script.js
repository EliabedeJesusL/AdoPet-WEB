import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update, set, get, child } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
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

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Converte arquivo em Base64 (DataURL)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUpload");

  if (!form) {
    console.error("❌ Formulário não encontrado (#formUpload).");
    return;
  }

  const animalId = localStorage.getItem("ultimoAnimalId");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Você precisa estar logado para continuar.");
      window.location.href = "/Login/login.html";
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!animalId) {
        alert("Nenhum animal encontrado. Volte e cadastre o animal primeiro.");
        return;
      }

      try {
        // Lê arquivos selecionados pela UI (expostos globalmente)
        const uploads = window.__adopetUploads || { animal: [], vacina: [] };
        const animalFiles = Array.isArray(uploads.animal) ? uploads.animal : [];
        const vacinaFiles = Array.isArray(uploads.vacina) ? uploads.vacina : [];

        if (animalFiles.length === 0) {
          alert("Envie pelo menos uma foto do animal!");
          return;
        }

        // Converte o primeiro arquivo de cada grupo (mínimo para funcionar)
        const base64Animal = await fileToBase64(animalFiles[0].file);
        const updates = { fotoAnimal: base64Animal };

        if (vacinaFiles.length > 0) {
          const base64Cartao = await fileToBase64(vacinaFiles[0].file);
          updates.fotoCartao = base64Cartao;
        }

        // Caminho do nó do animal
        const path = `animais_cadastrados/${user.uid}/${animalId}`;
        const animalRef = ref(db, path);

        // Checa se já existe; atualiza ou cria
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
          await update(animalRef, updates);
        } else {
          await set(animalRef, updates);
        }

        alert("✅ Cadastro concluído com sucesso!");
        localStorage.removeItem("ultimoAnimalId");
        window.location.href = "/Dashboard/dashboard.html";
      } catch (err) {
        console.error("❌ Erro ao enviar fotos:", err);
        alert("Erro ao salvar fotos. Veja o console para mais detalhes.");
      }
    });
  });
});