import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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
const auth = getAuth(app);

const form = document.getElementById("formUpload");
const fotoAnimal = document.getElementById("inputAnimal");
const fotoCartao = document.getElementById("inputVacina");

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

    const fileAnimal = fotoAnimal.files[0];
    const fileCartao = fotoCartao.files[0];
    if (!fileAnimal || !fileCartao) {
      alert("Envie as duas fotos!");
      return;
    }

    try {
      // 🔹 Converte as imagens para Base64
      const base64Animal = await fileToBase64(fileAnimal);
      const base64Cartao = await fileToBase64(fileCartao);

      // 🔹 Atualiza o nó do animal no Realtime Database
      const animalRef = ref(db, `animal_Cadastrado/${animalId}`);
      await update(animalRef, {
        fotoAnimal: base64Animal,
        fotoCartao: base64Cartao,
      });

      alert("✅ Cadastro concluído com sucesso!");
      localStorage.removeItem("ultimoAnimalId");
      window.location.href = "/Dashboard/dashboard.html";
    } catch (err) {
      console.error("❌ Erro ao enviar fotos:", err);
      alert("Erro ao salvar fotos. Veja o console para mais detalhes.");
    }
  });
});