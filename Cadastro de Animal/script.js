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

// ===============================
// CONFIGURAÇÕES
// ===============================
const NEXT_URL = "/Upload Dados do Animal/upload_dados_animal.html";

// ===============================
// FUNÇÃO PRINCIPAL
// ===============================
async function salvarAnimal(e) {
  e.preventDefault(); // evita que o <a> siga o link imediatamente

  // 1️⃣ Pegando valores do formulário
  const especie = document.getElementById("especie").value.trim();
  const raca = document.getElementById("raca").value.trim();
  const idade = document.getElementById("idade").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const historico = document.getElementById("historico").value.trim();

  // 2️⃣ Validação básica
  if (!especie || !nome) {
    alert("Por favor, preencha pelo menos o nome e a espécie do animal.");
    return;
  }

  try {
    // 3️⃣ Cria referência no banco
    const animaisRef = ref(db, "animal_Cadastrado");
    const novoAnimalRef = push(animaisRef); // gera ID único automaticamente

    // 4️⃣ Dados a serem salvos
    const uid = localStorage.getItem("uid") || "sem-usuario";
    // const disponivel = true; // novo animal está disponível por padrão
    const dadosAnimal = {
      nome,
      especie,
      raca,
      idade,
      descricao,
      historico,
      donoUid: uid,
      criadoEm: new Date().toISOString(),
      disponivel: true,
      fotoUrl: null
    };

    localStorage.setItem("ultimoAnimalId", novoAnimalRef.key);
    // 5️⃣ Envia para o Firebase
    await set(novoAnimalRef, dadosAnimal);

    console.log("✅ Animal cadastrado com sucesso:", dadosAnimal);
    alert("Animal cadastrado com sucesso!");

    // 6️⃣ Redireciona somente se o envio der certo
    window.location.href = "/Upload Dados do Animal/upload_dados_animal.html";

  } catch (error) {
    console.error("❌ Erro ao salvar animal:", error);
    alert("Erro ao salvar o animal. Veja o console para mais detalhes.");
  }
}

// ===============================
// EVENTO DO BOTÃO "Avançar"
// ===============================
const btnAvancar = document.getElementById("btnAvancar");

if (btnAvancar) {
  // impedimos o comportamento padrão do link e chamamos a função
  btnAvancar.addEventListener("click", salvarAnimal);
} else {
  console.warn("⚠️ Botão Avançar não encontrado!");
}
