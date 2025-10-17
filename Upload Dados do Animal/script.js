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

// Função para converter imagem em Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// 🕒 Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUpload");
  const fotoAnimal = document.getElementById("inputAnimal");
  const fotoCartao = document.getElementById("inputVacina");

  // Se o formulário não existir, interrompe
  if (!form || !fotoAnimal) {
    console.error("❌ Formulário ou campo de foto não encontrado!");
    return;
  }

  const animalId = localStorage.getItem("ultimoAnimalId");

  // 🔐 Garante que o usuário está logado antes de permitir o upload
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Você precisa estar logado para continuar.");
      window.location.href = "/Login/login.html";
      return;
    }

    // Envio das fotos
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!animalId) {
        alert("Nenhum animal encontrado. Volte e cadastre o animal primeiro.");
        return;
      }

      const fileAnimal = fotoAnimal?.files?.[0];
      const fileCartao = fotoCartao?.files?.[0] || null;

      // Só a foto do animal é obrigatória
      if (!fileAnimal) {
        alert("Envie pelo menos uma foto do animal!");
        return;
      }

      try {
        // Salva obrigatória
        const base64Animal = await fileToBase64(fileAnimal);
        const updates = { fotoAnimal: base64Animal };

        if (fileCartao) {
          const base64Cartao = await fileToBase64(fileCartao);
          updates.fotoCartao = base64Cartao;
        }

        // Atualiza o nó do animal no Realtime Database
        const path = `animais_cadastrados/${user.uid}/${animalId}`;
        const animalRef = ref(db, path);

        // ✅ Checa se o animal já existe, senão cria
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
