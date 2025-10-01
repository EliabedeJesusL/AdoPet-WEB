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
const logoImg = document.getElementById("logoImg");
const logoPlaceholder = document.getElementById("logoPlaceholder");

let logoFile = null;

// Pré-visualização da logo
uploadLogo.addEventListener("change", (e) => {
  logoFile = e.target.files[0];
  if (logoFile) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      logoImg.src = ev.target.result;
      logoImg.classList.remove("d-none");
      logoPlaceholder.classList.add("d-none");
    };
    reader.readAsDataURL(logoFile);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Erro: usuário não autenticado!");
    return;
  }

  // Pega os dados do form
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
      // Faz upload da logo
      const storagePath = `logos/${uid}/${logoFile.name}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, logoFile);
      logoUrl = await getDownloadURL(fileRef);
    }

    // Salva no banco
    await update(ref(db, `usuarios/${uid}/cadastro`), {
      PessoaJuridica: {
        ...dados,
        logoUrl: logoUrl || ""
      }
    });

    alert("Cadastro realizado com sucesso!");
    window.location.href = "home.html"; // redireciona se quiser

  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    alert("Erro ao salvar cadastro.");
  }
});
