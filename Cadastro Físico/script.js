// script.js (module)
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
  measurementId: "G-0HP9DHD1ZF",
  databaseURL: "https://adopet-pi-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Escuta o evento disparado pela UI quando o formulário é válido
document.addEventListener('cadastro:submit', async () => {
  const btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Salvando...';
  }

  const uid = localStorage.getItem("uid");
  if (!uid) {
    document.dispatchEvent(new CustomEvent('cadastro:error', { detail: { message: 'Usuário não identificado. Faça login novamente.' } }));
    return;
  }

  // Lê os campos (o UI já validou)
  const nome = document.getElementById("nome")?.value?.trim() || "";
  const cpf = document.getElementById("cpf")?.value || "";
  const nascimento = document.getElementById("nascimento")?.value || "";
  const sexo = document.getElementById("sexo")?.value || "";
  const telefone = document.getElementById("telefone")?.value || "";
  const fotoFile = document.getElementById("uploadFoto")?.files?.[0];

  try {
    let fotoUrl = "";

    if (fotoFile) {
      const extension = (fotoFile.name.match(/\.(\w+)$/) || [])[1] || 'jpg';
      const storagePath = `usuarios/${uid}/avatar.${extension}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, fotoFile);
      fotoUrl = await getDownloadURL(fileRef);
    }

    // Atualiza/insere os dados sob usuarios/{uid}/cadastro/PessoaFisica
    const data = {
      nome,
      cpf,
      nascimento,
      sexo,
      telefone,
      fotoUrl: fotoUrl || "",
      updatedAt: Date.now()
    };

    await update(ref(db, `usuarios/${uid}/cadastro/PessoaFisica`), data);

    // Notifica a UI que salvou com sucesso (UI faz redirect)
    document.dispatchEvent(new CustomEvent('cadastro:saved', { detail: { data, redirectTo: '/Dashboard/dashboard.html' } }));

  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    document.dispatchEvent(new CustomEvent('cadastro:error', { detail: { message: error?.message || 'Erro ao salvar cadastro.' } }));
  }
});
