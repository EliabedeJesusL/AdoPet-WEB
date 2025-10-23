import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { app } from "./firebase-config.js"; // seu arquivo de inicialização

const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    carregarDadosUsuario(user.uid);
  } else {
    window.location.href = "login.html"; // redireciona se não estiver logado
  }
});

async function carregarMeusAnimais(uid) {
  const animaisRef = ref(db, "animais");
  const snapshot = await get(animaisRef);
  const container = document.getElementById("meusAnimaisContainer");

  if (snapshot.exists()) {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const animal = child.val();
      if (animal.donoUID === uid) {
        container.innerHTML += `
          <div class="animal-card">
            <img src="${animal.fotoURL}" alt="${animal.nome}" />
            <h4>${animal.nome}</h4>
            <p>${animal.especie} - ${animal.idade}</p>
          </div>
        `;
      }
    });
  } else {
    container.innerHTML = "<p>Nenhum animal cadastrado ainda.</p>";
  }
}

async function carregarMinhasInformacoes(uid) {
  const userRef = ref(db, "usuarios/" + uid);
  const snapshot = await get(userRef);
  const infoContainer = document.getElementById("minhasInformacoesContainer");

  if (snapshot.exists()) {
    const user = snapshot.val();
    infoContainer.innerHTML = `
      <p><strong>Nome:</strong> ${user.nome}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Telefone:</strong> ${user.telefone || "Não informado"}</p>
      <p><strong>Bio:</strong> ${user.bio || "Sem descrição"}</p>
    `;
  }
}

async function carregarMeuEndereco(uid) {
  const enderecoRef = ref(db, "usuarios/" + uid + "/localizacao");
  const snapshot = await get(enderecoRef);
  const endContainer = document.getElementById("meuEnderecoContainer");

  if (snapshot.exists()) {
    const local = snapshot.val();
    endContainer.innerHTML = `
      <p><strong>CEP:</strong> ${local.cep}</p>
      <p><strong>Cidade:</strong> ${local.cidade}</p>
      <p><strong>Estado:</strong> ${local.estado}</p>
    `;
  } else {
    endContainer.innerHTML = "<p>Endereço não cadastrado.</p>";
  }
}

async function carregarDadosUsuario(uid) {
  carregarMinhasInformacoes(uid);
  carregarMeuEndereco(uid);
  carregarMeusAnimais(uid);
//   carregarMinhasDoacoes(uid);
}