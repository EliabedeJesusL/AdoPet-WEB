import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

const btnFisica = document.getElementById("btnFisica");
const btnJuridica = document.getElementById("btnJuridica");

async function salvarTipoCadastro(tipo, redirectPage) {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Erro: usuário não autenticado!");
    return;
  }

  try {
    // Estrutura inicial do cadastro
    const dadosIniciais = tipo === "PessoaFisica" ? {
    nome: "",
    cpf: "",
    nascimento: "",
    sexo: "",
    telefone: ""
    } : {
    instituicao: "",
    cnpj: "",
    aceitaDoacoes: "",
    responsavel: "",
    email: "",
    site: "",
    telefone: "",
    patrocinios: "",
    necessidades: ""
    };


    await update(ref(db, `usuarios/${uid}/cadastro`), {
      [tipo]: dadosIniciais
    });

    window.location.href = redirectPage;

  } catch (error) {
    console.error("Erro ao salvar tipo de cadastro:", error);
    alert("Erro ao salvar escolha.");
  }
}

btnFisica.addEventListener("click", () => salvarTipoCadastro("PessoaFisica", "cadastro_fisico.html"));
btnJuridica.addEventListener("click", () => salvarTipoCadastro("PessoaJuridica", "cadastro_ong.html"));
