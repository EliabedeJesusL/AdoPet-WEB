import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
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

// Elementos do formulário
const form = document.getElementById("formUpload");
const fotoAnimal = document.getElementById("inputAnimal");
const fotoCartao = document.getElementById("inputVacina");

// Recupera o ID do último animal cadastrado
const animalId = localStorage.getItem("ultimoAnimalId");

// Função para converter imagem em Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Verifica se o usuário está logado
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUpload");
  const fotoAnimal = document.getElementById("inputAnimal");
  const fotoCartao = document.getElementById("inputVacina");

   if (!form) return;

  // if (!user) {
  //   alert("Você precisa estar logado para continuar.");
  //   window.location.href = "/Login/login.html";
  //   return;
  // }

  // Envio das fotos
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!animalId) {
      alert("Nenhum animal encontrado. Volte e cadastre o animal primeiro.");
      return;
    }

    const fileAnimal = fotoAnimal.files[0];
    const fileCartao = fotoCartao.files[0];

    if (!fileAnimal && !fileCartao) {
      alert("Envie pelo menos uma foto!");
      return;
    }

    try {
      const updates = {};

      if (fileAnimal) {
        const base64Animal = await fileToBase64(fileAnimal);
        updates.fotoAnimal = base64Animal;
      }

      if (fileCartao) {
        const base64Cartao = await fileToBase64(fileCartao);
        updates.fotoCartao = base64Cartao;
      }

      // Atualiza o nó do animal
      const animalRef = ref(db, `animais_cadastrados/${user.uid}/${animalId}`);
      await update(animalRef, updates);

      alert("✅ Cadastro concluído com sucesso!");
      localStorage.removeItem("ultimoAnimalId");
      window.location.href = "/Dashboard/dashboard.html";
    } catch (err) {
      console.error("❌ Erro ao enviar fotos:", err);
      alert("Erro ao salvar fotos. Veja o console para mais detalhes.");
    }
  });
});