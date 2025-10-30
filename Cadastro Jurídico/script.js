// /Cadastro Jurídico/script.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// File -> Base64 (DataURL)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result);
    r.onerror = reject;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastroJuridico");
  const uploadLogo = document.getElementById("uploadLogo");
  const btnSubmit = document.getElementById("btnSubmit");
  const logoImg = document.getElementById("logoImg");
  const logoPlaceholder = document.getElementById("logoPlaceholder");

  let logoFile = null;

  // Captura arquivo + preview simples
  uploadLogo?.addEventListener("change", async (e) => {
    logoFile = e.target.files?.[0] || null;
    if (logoFile && logoImg && logoPlaceholder) {
      const preview = await fileToBase64(logoFile);
      logoImg.src = preview;
      logoImg.classList.remove("d-none");
      logoPlaceholder.classList.add("d-none");
    }
  });

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
      updatedAt: Date.now()
    };

    try {
      if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Salvando..."; }

      let fotoBase64 = "";
      if (logoFile) {
        fotoBase64 = await fileToBase64(logoFile);
      }

      // Monta objeto PJ; adiciona fotoUrl se houver
      const dataPJ = { ...dados };
      if (fotoBase64) dataPJ.fotoUrl = fotoBase64;

      // Atualiza diretamente o nó de PessoaJuridica
      const updates = {};
      updates[`usuarios/${uid}/cadastro/PessoaJuridica`] = dataPJ;

      await update(ref(db), updates);

      alert("Cadastro realizado com sucesso!");
      window.location.href = "/Dashboard/dashboard.html";
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      alert("Erro ao salvar cadastro.");
    } finally {
      if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = "Realizar Cadastro"; }
    }
  });
});