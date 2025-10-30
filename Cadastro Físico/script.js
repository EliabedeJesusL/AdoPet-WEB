// /Cadastro Físico/script.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// File -> Base64 (DataURL)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result);
    r.onerror = reject;
  });
}

// Disparado pela UI quando o formulário é válido
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

  // Campos do formulário
  const nome = document.getElementById("nome")?.value?.trim() || "";
  const cpf = document.getElementById("cpf")?.value || "";
  const nascimento = document.getElementById("nascimento")?.value || "";
  const sexo = document.getElementById("sexo")?.value || "";
  const telefone = document.getElementById("telefone")?.value || "";
  const fotoFile = document.getElementById("uploadFoto")?.files?.[0];

  try {
    let fotoBase64 = "";
    if (fotoFile) {
      fotoBase64 = await fileToBase64(fotoFile);
    }

    // Dados PF
    const dataPF = {
      nome,
      cpf,
      nascimento,
      sexo,
      telefone,
      updatedAt: Date.now()
    };
    if (fotoBase64) dataPF.fotoUrl = fotoBase64; // somente aqui

    // Atualiza SOMENTE PessoaFisica
    const updates = {};
    updates[`usuarios/${uid}/cadastro/PessoaFisica`] = dataPF;

    await update(ref(db), updates);

    document.dispatchEvent(new CustomEvent('cadastro:saved', { detail: { data: dataPF, redirectTo: '/Dashboard/dashboard.html' } }));
  } catch (error) {
    console.error("Erro ao salvar cadastro:", error);
    document.dispatchEvent(new CustomEvent('cadastro:error', { detail: { message: error?.message || 'Erro ao salvar cadastro.' } }));
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Realizar Cadastro';
    }
  }
});