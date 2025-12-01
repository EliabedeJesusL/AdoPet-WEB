// script.js - BANCO
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

let logged = !!localStorage.getItem("uid");
onAuthStateChanged(auth, (u) => (logged = !!u));

export function isLoggedIn() {
  return logged;
}

export async function getOngByUid(uid) {
  if (!uid) return null;

  const snap = await get(ref(db, `usuarios/${uid}`));
  if (!snap.exists()) return null;

  const u = snap.val();
  const pj =
    u?.cadastro?.PessoaJuridica ||
    u?.cadastro?.pessoaJuridica ||
    u?.cadastro?.pessoa_juridica ||
    u?.cadastro?.juridica;

  if (!pj) return null;

  let cidade = "", estado = "";

  const loc = await get(ref(db, `usuarios/${uid}/localizacao`));
  if (loc.exists()) {
    cidade = loc.val().cidade || "";
    estado = loc.val().estado || "";
  }

  return {
    uid,
    nome: pj.instituicao || pj.nomeFantasia || pj.razaoSocial || "Instituição",
    cnpj: pj.cnpj || "",
    responsavel: pj.responsavel || "",
    email: pj.email || "",
    telefone: pj.telefone || "",
    fotoUrl: pj.fotoUrl || pj.logoUrl || "",
    cidade,
    estado,
    necessidades: pj.necessidades || "",
    timestamp: pj.updatedAt || u.updatedAt || 0
  };
}

export async function findOngByName(nome) {
  const alvo = normalize(nome);
  if (!alvo) return null;

  const snap = await get(ref(db, "usuarios"));
  if (!snap.exists()) return null;

  for (const [uid, u] of Object.entries(snap.val())) {
    const pj =
      u?.cadastro?.PessoaJuridica ||
      u?.cadastro?.pessoaJuridica ||
      u?.cadastro?.pessoa_juridica ||
      u?.cadastro?.juridica;

    if (!pj) continue;

    const inst =
      pj.instituicao ||
      pj.nomeFantasia ||
      pj.razaoSocial ||
      "";

    if (normalize(inst) === alvo) {
      return await getOngByUid(uid);
    }
  }

  return null;
}

function normalize(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
