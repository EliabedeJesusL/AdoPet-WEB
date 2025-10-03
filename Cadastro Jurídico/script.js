import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRVmQSKkQ2uyM-wqhHwQTcZVreNRk3u9w",
  authDomain: "adopet-pi.firebaseapp.com",
  projectId: "adopet-pi",
  storageBucket: "adopet-pi.appspot.com",
  messagingSenderId: "797305766384",
  appId: "1:797305766384:web:46beb3e1346878df149d35",
  databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const form = document.getElementById("formCadastroJuridico");
const uploadLogo = document.getElementById("uploadLogo");
let logoFile = null;

// Captura arquivo selecionado
uploadLogo?.addEventListener("change", (e) => {
  logoFile = e.target.files[0] || null;
});

// Envio do cadastro
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Erro: usuário não autenticado!");
    return;
  }

  // Dados do form
  const dados = {
    instituicao: form.instituicao.value.trim(),
    cnpj: form.cnpj.value.trim(),
    aceitaDoacoes: form.aceita.value,
    responsavel: form.responsavel.value.trim(),
    email: form.email.value.trim(),
    site: form.site.value.trim(),
    telefone: form.telefone.value.trim(),
    patrocinios: form.patrocinios.value,
    necessidades: form.necessidades.value.trim(),
  };

  try {
    let logoUrl = "";
    if (logoFile) {
      // Upload da logo no Storage
      const storagePath = `logos/${uid}/${logoFile.name}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, logoFile);
      logoUrl = await getDownloadURL(fileRef);
    }

    // Atualiza no Realtime Database
    await update(ref(db, `usuarios/${uid}/cadastro`), {
      PessoaJuridica: {
        ...dados,
        logoUrl: logoUrl || ""
      }
    });

    alert("Cadastro realizado com sucesso!");
    window.location.href = "/Dashboard/dashboard.html";

  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    alert("Erro ao salvar cadastro.");
  }
});
