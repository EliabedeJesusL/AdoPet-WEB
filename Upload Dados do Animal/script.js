import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref as dbRef, update, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
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

// Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Se você quiser usar outro caminho secundário, troque aqui.
// Deixe string vazia ("") para desativar totalmente o nó secundário.
const SECONDARY_ROOT = "animais_cadastrados";

// Converte arquivo em Base64 (DataURL)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result);
    r.onerror = reject;
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
        // Lê arquivos selecionados pela UI
        const uploads = window.__adopetUploads || { animal: [], vacina: [] };
        let animalFiles = Array.isArray(uploads.animal) ? uploads.animal : [];
        let vacinaFiles = Array.isArray(uploads.vacina) ? uploads.vacina : [];

        // Fallback: tenta pegar do input se o global não existir
        if (animalFiles.length === 0) {
          const inputAnimal = document.getElementById("inputAnimal");
          if (inputAnimal?.files?.[0]) animalFiles = [{ file: inputAnimal.files[0] }];
        }
        if (vacinaFiles.length === 0) {
          const inputVacina = document.getElementById("inputVacina");
          if (inputVacina?.files?.[0]) vacinaFiles = [{ file: inputVacina.files[0] }];
        }

        if (animalFiles.length === 0) {
          alert("Envie pelo menos uma foto do animal!");
          return;
        }

        // Converte a principal do animal para base64
        const base64Animal = await fileToBase64(animalFiles[0].file);

        // Opcional: cartão de vacinação
        let base64Cartao = null;
        if (vacinaFiles.length > 0) {
          base64Cartao = await fileToBase64(vacinaFiles[0].file);
        }

        // Monta updates
        const updates = {};
        const primaryPath = `animal_Cadastrado/${animalId}`;
        updates[`${primaryPath}/fotoUrl`] = base64Animal;
        if (base64Cartao) updates[`${primaryPath}/cartaoUrl`] = base64Cartao;

        // Só atualiza o nó secundário se ele já existir
        if (SECONDARY_ROOT) {
          const secondaryPath = `${SECONDARY_ROOT}/${user.uid}/${animalId}`;
          const secSnap = await get(dbRef(db, secondaryPath));
          if (secSnap.exists()) {
            updates[`${secondaryPath}/fotoUrl`] = base64Animal;
            if (base64Cartao) updates[`${secondaryPath}/cartaoUrl`] = base64Cartao;
          } else {
            console.info(`ℹ️ Nó secundário não existe, não será criado: /${secondaryPath}`);
          }
        }

        console.log("Updates:", updates);
        await update(dbRef(db), updates);

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