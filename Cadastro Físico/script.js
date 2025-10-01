import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

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
const storage = getStorage(app);

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Erro: usuário não autenticado!");
    return;
  }

  // Captura os dados do formulário
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const nascimento = document.getElementById("nascimento").value;
  const sexo = document.getElementById("sexo").value;
  const telefone = document.getElementById("telefone").value;
  const fotoFile = document.getElementById("uploadFoto").files[0];

  try {
    let fotoUrl = "";

    if (fotoFile) {
      const fotoRef = storageRef(storage, `usuarios/${uid}/avatar.jpg`);
      await uploadBytes(fotoRef, fotoFile);
      fotoUrl = await getDownloadURL(fotoRef);
    }

    await update(ref(db, `usuarios/${uid}/cadastro/PessoaFisica`), {
      nome,
      cpf,
      nascimento,
      sexo,
      telefone,
      fotoUrl: fotoUrl || "",
      updatedAt: Date.now()
    });

    alert("Cadastro de Pessoa Física salvo com sucesso!");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    alert("Erro ao salvar cadastro.");
  }
});
