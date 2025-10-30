// script.js (module)
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
    let fotoBase64 = "";
    if (fotoFile) {
      fotoBase64 = await fileToBase64(fotoFile);
    }

    // Dados do cadastro (PF)
    const dataPF = {
      nome,
      cpf,
      nascimento,
      sexo,
      telefone,
      // salva somente em fotoUrl (nada de "avatar")
      fotoUrl: fotoBase64 || "",
      updatedAt: Date.now()
    };

    const pfPath = `usuarios/${uid}/cadastro/PessoaFisica`;
    const pjPath = `usuarios/${uid}/cadastro/PessoaJuridica`;

    // Multi-location update:
    // - PF completo
    // - Se houver foto, também grava (ou cria) fotoUrl em PessoaJuridica
    const updates = {};
    updates[pfPath] = dataPF;
    if (fotoBase64) {
      updates[`${pjPath}/fotoUrl`] = fotoBase64; // cria a chave se não existir
    }

    await update(ref(db), updates);

    // Notifica a UI que salvou com sucesso (UI faz redirect)
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